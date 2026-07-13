import { readDB, writeDB, AILog } from "./db";

// Prioridades de modelos para OpenRouter
const OPENROUTER_MODELS = {
  orchestrator: process.env.AI_MODEL_ORCHESTRATOR || "meta-llama/llama-3-8b-instruct:free",
  fast: process.env.AI_MODEL_FAST || "google/gemma-2-9b-it:free",
  reviewer: process.env.AI_MODEL_REVIEWER || "meta-llama/llama-3-8b-instruct:free",
  research: process.env.AI_MODEL_RESEARCH || "google/gemma-2-9b-it:free",
};

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function callAI(
  messages: ChatMessage[],
  taskType: "orchestrator" | "fast" | "reviewer" | "research" = "fast"
): Promise<string> {
  const startTime = Date.now();
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  
  const defaultProvider = process.env.AI_DEFAULT_PROVIDER || (geminiKey ? "gemini" : openRouterKey ? "openrouter" : anthropicKey ? "anthropic" : "mock");

  let provider = "mock";
  let modelUsed = "mock-model";
  let promptTokens = 0;
  let completionTokens = 0;
  let estimatedCost = 0;
  let responseText = "";

  // Determinar orden de prioridad
  const providersToTry: string[] = [defaultProvider];
  if (geminiKey && !providersToTry.includes("gemini")) providersToTry.push("gemini");
  if (openRouterKey && !providersToTry.includes("openrouter")) providersToTry.push("openrouter");
  if (anthropicKey && !providersToTry.includes("anthropic")) providersToTry.push("anthropic");
  if (!providersToTry.includes("mock")) providersToTry.push("mock");

  for (const currentProvider of providersToTry) {
    if (responseText) break;

    // --- GEMINI ---
    if (currentProvider === "gemini" && geminiKey) {
      try {
        provider = "gemini";
        modelUsed = process.env.AI_MODEL_FAST || "gemini-2.5-flash";
        
        const systemMessage = messages.find(m => m.role === "system")?.content;
        const geminiContents = messages
          .filter(m => m.role !== "system")
          .map(m => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }]
          }));

        const body: any = {
          contents: geminiContents,
          generationConfig: {
            temperature: 0.3,
            responseMimeType: "application/json"
          }
        };

        if (systemMessage) {
          body.systemInstruction = {
            parts: [{ text: systemMessage }]
          };
        }

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelUsed}:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
          }
        );

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const candidate = data.candidates?.[0];
        responseText = candidate?.content?.parts?.[0]?.text || "";
        
        if (responseText) {
          promptTokens = messages.reduce((acc, m) => acc + m.content.length, 0) / 4;
          completionTokens = responseText.length / 4;
          estimatedCost = 0.0;
        }
      } catch (error) {
        console.error("Gemini call failed, trying next provider...", error);
        responseText = ""; // Asegurar fallback
      }
    }

    // --- OPENROUTER ---
    if (currentProvider === "openrouter" && openRouterKey) {
      try {
        provider = "openrouter";
        modelUsed = OPENROUTER_MODELS[taskType];
        
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openRouterKey}`,
            "HTTP-Referer": "https://ai-war-room.vercel.app",
            "X-Title": "AI War Room",
          },
          body: JSON.stringify({
            model: modelUsed,
            messages,
            temperature: 0.3,
            response_format: { type: "json_object" }
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        responseText = data.choices[0].message.content;
        promptTokens = data.usage?.prompt_tokens || 0;
        completionTokens = data.usage?.completion_tokens || 0;
        
        const costPerInput = modelUsed.includes("free") ? 0 : 0.0000005;
        const costPerOutput = modelUsed.includes("free") ? 0 : 0.0000015;
        estimatedCost = (promptTokens * costPerInput) + (completionTokens * costPerOutput);
      } catch (error) {
        console.error("OpenRouter call failed, trying next provider...", error);
        responseText = "";
      }
    }

    // --- ANTHROPIC ---
    if (currentProvider === "anthropic" && anthropicKey) {
      try {
        provider = "anthropic";
        modelUsed = "claude-3-5-haiku-20241022";
        
        const systemMessage = messages.find(m => m.role === "system")?.content || "";
        const userMessages = messages.filter(m => m.role !== "system").map(m => ({
          role: m.role as "user" | "assistant",
          content: m.content
        }));

        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": anthropicKey,
            "anthropic-version": "2023-06-01"
          },
          body: JSON.stringify({
            model: modelUsed,
            system: systemMessage,
            messages: userMessages,
            max_tokens: 2000,
            temperature: 0.3
          })
        });

        if (!response.ok) {
          throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        responseText = data.content[0].text;
        promptTokens = data.usage?.input_tokens || 0;
        completionTokens = data.usage?.output_tokens || 0;
        
        estimatedCost = (promptTokens * 0.0000008) + (completionTokens * 0.000004);
      } catch (error) {
        console.error("Anthropic call failed, trying next provider...", error);
        responseText = "";
      }
    }

    // --- MOCK ---
    if (currentProvider === "mock") {
      provider = "mock";
      modelUsed = "mock-logic-v1";
      
      const userPrompt = messages.find(m => m.role === "user")?.content || "";
      responseText = generateMockResponse(messages, userPrompt);
      promptTokens = userPrompt.length / 4;
      completionTokens = responseText.length / 4;
      estimatedCost = 0.0;
    }
  }

  const latencyMs = Date.now() - startTime;

  // Registrar el log
  const newLog: AILog = {
    id: Math.random().toString(36).substring(2, 11),
    provider,
    model: modelUsed,
    promptTokens,
    completionTokens,
    estimatedCost,
    latencyMs,
    timestamp: new Date().toISOString()
  };

  const db = readDB();
  db.ai_logs.push(newLog);
  writeDB(db);

  return responseText;
}

// Generador de respuestas inteligentes simuladas si fallan todas las APIs reales
function generateMockResponse(messages: ChatMessage[], userPrompt: string): string {
  const systemPrompt = messages.find(m => m.role === "system")?.content || "";
  
  let agentName = "Orquestador";
  let agentRole = "Moderador";

  if (systemPrompt.includes("Defensor")) {
    agentName = "Defensor";
    agentRole = "Focalizado en la viabilidad y optimismo";
  } else if (systemPrompt.includes("Crítico")) {
    agentName = "Crítico";
    agentRole = "Focalizado en los riesgos y fallos";
  } else if (systemPrompt.includes("Investigador")) {
    agentName = "Investigador";
    agentRole = "Focalizado en datos e investigación";
  } else if (systemPrompt.includes("Arquitecto")) {
    agentName = "Arquitecto Técnico";
    agentRole = "Focalizado en el stack y base de datos";
  } else if (systemPrompt.includes("Product Manager")) {
    agentName = "Product Manager";
    agentRole = "Focalizado en MVP y roadmap";
  } else if (systemPrompt.includes("Growth")) {
    agentName = "Growth Hacker";
    agentRole = "Focalizado en distribución y monetización";
  } else if (systemPrompt.includes("Legal")) {
    agentName = "Legal & Ético";
    agentRole = "Focalizado en cumplimiento y privacidad";
  } else if (systemPrompt.includes("Redactor")) {
    agentName = "Redactor";
    agentRole = "Especialista en documentación";
  } else if (systemPrompt.includes("Implementador")) {
    agentName = "Implementador";
    agentRole = "Especialista en prompts instruccionales";
  }

  let extractedPrompt = userPrompt;
  
  if (userPrompt.includes("PREGUNTA / PROPUESTA A DEBATIR:")) {
    const parts = userPrompt.split("PREGUNTA / PROPUESTA A DEBATIR:");
    if (parts[1]) {
      const remaining = parts[1].trim();
      const firstQuote = remaining.indexOf('"');
      const lastQuote = remaining.lastIndexOf('"');
      if (firstQuote !== -1 && lastQuote !== -1 && lastQuote > firstQuote) {
        extractedPrompt = remaining.substring(firstQuote + 1, lastQuote);
      } else {
        extractedPrompt = remaining.replace(/Por favor, genera tu análisis especializado.*/i, "").trim();
      }
    }
  } else if (userPrompt.includes("INPUT DEL USUARIO:")) {
    const parts = userPrompt.split("INPUT DEL USUARIO:");
    if (parts[1]) {
      const remaining = parts[1].trim();
      const firstQuote = remaining.indexOf('"');
      const lastQuote = remaining.lastIndexOf('"');
      if (firstQuote !== -1 && lastQuote !== -1 && lastQuote > firstQuote) {
        extractedPrompt = remaining.substring(firstQuote + 1, lastQuote);
      } else {
        extractedPrompt = remaining.replace(/Por favor, realiza la síntesis ejecutiva.*/i, "").trim();
      }
    }
  }

  // Acotar el prompt a un tamaño legible para los templates del mock
  const shortPrompt = extractedPrompt.length > 60 ? extractedPrompt.substring(0, 60) + "..." : extractedPrompt;
  const cleanPrompt = shortPrompt.replace(/\r?\n/g, " ").trim();


  if (agentName === "Orquestador") {
    return JSON.stringify({
      summary: `El comité debatió: "${cleanPrompt}". Consenso: proceder de forma incremental mitigando riesgos y priorizando la validación inicial.`,
      new_conclusions: [
        `Es necesario validar "${cleanPrompt}" de manera incremental.`,
        "El equipo debe coordinar el alcance mínimo viable."
      ],
      proposed_decisions: [
        `Iniciar fase de descubrimiento de "${cleanPrompt}".`
      ],
      new_hypotheses: [
        `La propuesta de "${cleanPrompt}" responde a un problema real.`
      ],
      risks: [
        "Incertidumbre sobre la adopción inicial por el usuario."
      ],
      tasks: [
        `Definir requerimientos mínimos de "${cleanPrompt}".`
      ],
      sources: [
        "Referencias generales del sector de estudio."
      ],
      quality_gate: {
        passed: true,
        warnings: [],
        missing_evidence: ["Datos empíricos de validación directa."],
        contradictions: []
      }
    }, null, 2);
  }

  const templates: Record<string, any> = {
    "Defensor": {
      agent: "Defensor",
      role: agentRole,
      main_points: [
        `La idea de "${cleanPrompt}" aborda un problema real y de valor.`,
        "Permite iniciar con un desarrollo simple y escalable."
      ],
      risks: [
        "Riesgo de perder foco si el alcance no es cerrado."
      ],
      recommendations: [
        `Lanzar un prototipo ultra-simple de "${cleanPrompt}" para medir interés.`
      ],
      questions: [
        "¿Cuál es el beneficio más obvio y rápido del usuario?"
      ],
      updates_to_memory: [
        `Identificada alta viabilidad inicial de "${cleanPrompt}".`
      ]
    },
    "Crítico": {
      agent: "Crítico",
      role: agentRole,
      main_points: [
        `La viabilidad a largo plazo de "${cleanPrompt}" requiere validación.`,
        "Una ejecución compleja elevará los costes de forma imprevista."
      ],
      risks: [
        "Complejidad en la adopción por parte del usuario final."
      ],
      recommendations: [
        "Acotar los costes y el esfuerzo máximo antes de comenzar."
      ],
      questions: [
        "¿Qué alternativas tiene el usuario si esta propuesta no prospera?"
      ],
      updates_to_memory: [
        `Riesgo detectado: subestimar esfuerzo para "${cleanPrompt}".`
      ]
    },
    "Investigador": {
      agent: "Investigador",
      role: agentRole,
      main_points: [
        `Falta evidencia objetiva para respaldar las hipótesis de "${cleanPrompt}".`,
        "Existen soluciones alternativas indirectas en el mercado actual."
      ],
      risks: [
        "Carencia de datos empíricos directos en este nicho."
      ],
      recommendations: [
        "Realizar encuestas rápidas a potenciales usuarios."
      ],
      questions: [
        "¿Qué métricas demostrarían que la idea tiene demanda real?"
      ],
      updates_to_memory: [
        `Se requiere buscar referentes directos para "${cleanPrompt}".`
      ]
    },
    "Arquitecto Técnico": {
      agent: "Arquitecto Técnico",
      role: agentRole,
      main_points: [
        `Técnicamente "${cleanPrompt}" se puede estructurar de forma modular.`,
        "Es prioritario simplificar la infraestructura en la fase de MVP."
      ],
      risks: [
        "Dependencia técnica compleja de integraciones de terceros."
      ],
      recommendations: [
        "Diseñar una base de datos simple y desacoplada."
      ],
      questions: [
        "¿Qué limitaciones de rendimiento o costes tenemos?"
      ],
      updates_to_memory: [
        `Arquitectura sugerida para "${cleanPrompt}": modular y desacoplada.`
      ]
    },
    "Product Manager": {
      agent: "Product Manager",
      role: agentRole,
      main_points: [
        `El MVP de "${cleanPrompt}" debe incluir solo el flujo central.`,
        "El roadmap de entregas debe estructurarse en sprints semanales."
      ],
      risks: [
        "Retrasar el lanzamiento intentando agregar demasiadas funciones."
      ],
      recommendations: [
        "Definir e historias de usuario prioritarias esta semana."
      ],
      questions: [
        "¿Qué característica podemos descartar para acelerar el desarrollo?"
      ],
      updates_to_memory: [
        `PM focus: congelar el alcance mínimo de "${cleanPrompt}".`
      ]
    },
    "Growth Hacker": {
      agent: "Growth Hacker",
      role: agentRole,
      main_points: [
        `La distribución de "${cleanPrompt}" requerirá canales orgánicos.`,
        "Es clave incentivar la recomendación orgánica desde el inicio."
      ],
      risks: [
        "Baja tracción inicial si el valor no es autoexplicativo."
      ],
      recommendations: [
        "Optimizar el flujo de registro y bienvenida del usuario."
      ],
      questions: [
        "¿Dónde podemos encontrar concentrado a nuestro cliente ideal?"
      ],
      updates_to_memory: [
        `Growth: priorizar la retención antes que la publicidad para "${cleanPrompt}".`
      ]
    },
    "Legal & Ético": {
      agent: "Legal & Ético",
      role: agentRole,
      main_points: [
        `La propuesta de "${cleanPrompt}" debe proteger la privacidad del usuario.`,
        "Es obligatorio cumplir con normativas locales de datos."
      ],
      risks: [
        "Fugas de información o almacenamiento no autorizado de PII."
      ],
      recommendations: [
        "Implementar políticas de privacidad transparentes por diseño."
      ],
      questions: [
        "¿Qué datos confidenciales del usuario serán almacenados?"
      ],
      updates_to_memory: [
        `Legal: asegurar cumplimiento regulatorio para "${cleanPrompt}".`
      ]
    },
    "Redactor": {
      agent: "Redactor",
      role: agentRole,
      main_points: [
        `Es clave documentar los hitos acordados sobre "${cleanPrompt}".`,
        "Se mantendrá una bitácora ágil para rastrear el progreso."
      ],
      risks: [
        "Pérdida de foco si las especificaciones cambian sin registro."
      ],
      recommendations: [
        "Mantener un log estructurado y conciso en Markdown."
      ],
      questions: [
        "¿Dónde se centralizará la especificación definitiva?"
      ],
      updates_to_memory: [
        `Trazabilidad: log de cambios de "${cleanPrompt}" activo.`
      ]
    },
    "Implementador": {
      agent: "Implementador",
      role: agentRole,
      main_points: [
        `Las especificaciones para "${cleanPrompt}" deben ser accionables.`,
        "Se crearán prompts estructurados para el asistente de código."
      ],
      risks: [
        "Uso de prompts ambiguos que confundan a la IA."
      ],
      recommendations: [
        "Definir claramente las entradas y salidas de cada módulo."
      ],
      questions: [
        "¿Qué stack tecnológico es el de mayor dominio del equipo?"
      ],
      updates_to_memory: [
        `Codex ready: prompts modulares y testeables para "${cleanPrompt}".`
      ]
    }
  };

  const selectedData = templates[agentName] || templates["Defensor"];
  return JSON.stringify(selectedData, null, 2);
}
