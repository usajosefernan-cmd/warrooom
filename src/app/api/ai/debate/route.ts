import { NextResponse } from "next/server";
import { readDB, writeDB, Debate, DebateRound, AgentMessage, Decision, Hypothesis, Task, Source } from "@/lib/db";
import { callAI } from "@/lib/ai-router";
import { AGENTS_PROMPTS, JSON_SCHEMA_INSTRUCTION } from "@/lib/agents-prompt";

export async function POST(request: Request) {
  try {
    const { projectId, userInput, activeAgents = ["defender", "critic", "architect", "pm"] } = await request.json();

    if (!projectId || !userInput) {
      return NextResponse.json({ error: "Missing projectId or userInput" }, { status: 400 });
    }

    const db = readDB();
    const project = db.projects.find((p) => p.id === projectId || p.slug === projectId);
    
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const agentMessages: AgentMessage[] = [];
    const contextPrompt = `
Contexto actual del proyecto "${project.name}":
Descripción inicial: ${project.description}

Documentos vivos actuales del proyecto:
---
${Object.entries(project.documents)
  .map(([key, content]) => `### Documento [${key}]\n${content.substring(0, 1000)}${content.length > 1000 ? "\n... (truncado)" : ""}`)
  .join("\n\n")}
---
`;

    for (const agentKey of activeAgents) {
      const config = AGENTS_PROMPTS[agentKey];
      if (!config) continue;

      const systemPrompt = `${config.systemPrompt}\n${JSON_SCHEMA_INSTRUCTION}`;
      const userPrompt = `
${contextPrompt}

PREGUNTA / PROPUESTA A DEBATIR:
"${userInput}"

Por favor, genera tu análisis especializado en base a tu rol.`;

      try {
        const responseText = await callAI([
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ], "fast");

        const parsedMessage = JSON.parse(responseText);
        agentMessages.push(parsedMessage);
      } catch (err) {
        console.error(`Error running agent ${agentKey}:`, err);
        agentMessages.push({
          agent: config.name,
          role: config.role,
          main_points: [`Fallo en la llamada al agente ${config.name}.`],
          risks: ["Error de comunicación o de cuota con la API."],
          recommendations: ["Verificar conexión de red y claves de API."],
          questions: ["¿Reintentar debate?"],
          updates_to_memory: []
        });
      }
    }

    const orchestratorPrompt = `${AGENTS_PROMPTS.orchestrator.systemPrompt}
Debes generar un resumen y fusionar las conclusiones, decisiones, hipótesis, riesgos, tareas y fuentes del debate.
El formato de salida debe ser un JSON que cumpla exactamente con el siguiente esquema:

{
  "summary": "Resumen ejecutivo del debate...",
  "new_conclusions": [
    "Conclusión 1...",
    "Conclusión 2..."
  ],
  "proposed_decisions": [
    "Decisión propuesta 1...",
    "Decisión propuesta 2..."
  ],
  "new_hypotheses": [
    "Hipótesis a validar 1..."
  ],
  "risks": [
    "Riesgo crítico 1..."
  ],
  "tasks": [
    "Tarea técnica 1...",
    "Tarea técnica 2..."
  ],
  "sources": [
    "Fuente/referencia sugerida 1..."
  ],
  "quality_gate": {
    "passed": true,
    "warnings": [],
    "missing_evidence": [],
    "contradictions": []
  }
}
`;

    const orchestratorUserPrompt = `
${contextPrompt}

INPUT DEL USUARIO:
"${userInput}"

OPINIONES DEL COMITÉ DE AGENTES:
${JSON.stringify(agentMessages, null, 2)}

Por favor, realiza la síntesis ejecutiva, extrae los elementos clave y evalúa la consistencia de los datos (Quality Gate).`;

    let synthesisText = "";
    let synthesisData: any = null;

    try {
      synthesisText = await callAI([
        { role: "system", content: orchestratorPrompt },
        { role: "user", content: orchestratorUserPrompt }
      ], "orchestrator");

      synthesisData = JSON.parse(synthesisText);
    } catch (err) {
      console.error("Error running orchestrator synthesis:", err);
      synthesisData = {
        summary: `Debate completado sobre: "${userInput}". Ocurrió un error al procesar la síntesis del orquestador. Las opiniones individuales están registradas.`,
        new_conclusions: ["El debate se completó con fallos de síntesis."],
        proposed_decisions: [],
        new_hypotheses: [],
        risks: ["Error en la capa de síntesis."],
        tasks: [],
        sources: [],
        quality_gate: {
          passed: false,
          warnings: ["No se pudo completar el análisis de calidad automático."],
          missing_evidence: [],
          contradictions: []
        }
      };
    }

    const debateRoundId = Math.random().toString(36).substring(2, 11);
    
    let debates = db.debates.filter((d) => d.projectId === project.id);
    let debate: Debate;

    if (debates.length === 0) {
      debate = {
        id: Math.random().toString(36).substring(2, 11),
        projectId: project.id,
        title: `Debate: ${userInput.substring(0, 40)}${userInput.length > 40 ? "..." : ""}`,
        createdAt: new Date().toISOString(),
        rounds: []
      };
      db.debates.push(debate);
    } else {
      debate = debates[0];
    }

    const newRound: DebateRound = {
      id: debateRoundId,
      debateId: debate.id,
      roundNumber: debate.rounds.length + 1,
      userInput,
      agentMessages,
      summary: synthesisData.summary,
      qualityGate: synthesisData.quality_gate,
      timestamp: new Date().toISOString()
    };

    debate.rounds.push(newRound);

    synthesisData.proposed_decisions.forEach((title: string) => {
      const decision: Decision = {
        id: Math.random().toString(36).substring(2, 11),
        projectId: project.id,
        title,
        description: `Propuesta durante el debate sobre: "${userInput}"`,
        status: "proposed",
        debateRoundId,
        createdAt: new Date().toISOString()
      };
      db.decisions.push(decision);
    });

    synthesisData.new_hypotheses.forEach((statement: string) => {
      const hypothesis: Hypothesis = {
        id: Math.random().toString(36).substring(2, 11),
        projectId: project.id,
        statement,
        evidence: "Pendiente de validación empírica.",
        status: "unverified",
        debateRoundId,
        createdAt: new Date().toISOString()
      };
      db.hypotheses.push(hypothesis);
    });

    synthesisData.tasks.forEach((title: string) => {
      const task: Task = {
        id: Math.random().toString(36).substring(2, 11),
        projectId: project.id,
        title,
        status: "todo",
        priority: "medium",
        debateRoundId,
        createdAt: new Date().toISOString()
      };
      db.tasks.push(task);
    });

    synthesisData.sources.forEach((title: string) => {
      const source: Source = {
        id: Math.random().toString(36).substring(2, 11),
        projectId: project.id,
        title,
        type: "other",
        createdAt: new Date().toISOString()
      };
      db.sources.push(source);
    });

    // Guardar conclusiones estructuradas como "pending"
    if (!db.conclusions) {
      db.conclusions = [];
    }
    synthesisData.new_conclusions.forEach((text: string) => {
      db.conclusions!.push({
        id: Math.random().toString(36).substring(2, 11),
        projectId: project.id,
        roundNumber: newRound.roundNumber,
        text,
        status: "pending",
        createdAt: new Date().toISOString()
      });
    });

    const currentDateStr = new Date().toLocaleDateString("es-ES");
    
    if (synthesisData.new_hypotheses.length > 0) {
      project.documents.hipotesis += `\n\n### Nuevas Hipótesis (${currentDateStr})\n` +
        synthesisData.new_hypotheses.map((h: string) => `- **${h}**: Sin verificar.`).join("\n");
    }

    if (synthesisData.proposed_decisions.length > 0) {
      synthesisData.proposed_decisions.forEach((d: string) => {
        project.documents.decisiones += `\n| ${newRound.id} | ${d} | Propuesta | Debate: ${userInput.substring(0, 30)}... |`;
      });
    }

    if (synthesisData.risks.length > 0) {
      project.documents.riesgos += `\n\n### Nuevos Riesgos Identificados (${currentDateStr})\n` +
        synthesisData.risks.map((r: string) => `- **${r}**\n  - *Impacto*: Por evaluar\n  - *Mitigación*: Pendiente de diseño`).join("\n");
    }

    if (synthesisData.tasks.length > 0) {
      project.documents.tareas_tecnicas += `\n\n### Tareas de Debate (${currentDateStr})\n` +
        synthesisData.tasks.map((t: string) => `- [ ] ${t}`).join("\n");
    }

    project.documents.changelog += `\n- **${currentDateStr}**: Ejecutó ronda de debate nº ${newRound.roundNumber} con aporte de: ${activeAgents.join(", ")}.`;

    project.updatedAt = new Date().toISOString();

    const projectIndex = db.projects.findIndex((p) => p.id === project.id);
    db.projects[projectIndex] = project;
    
    const debateIndex = db.debates.findIndex((d) => d.id === debate.id);
    db.debates[debateIndex] = debate;

    writeDB(db);

    return NextResponse.json({
      round: newRound,
      synthesis: synthesisData,
      project
    });
  } catch (error: any) {
    console.error("Error processing debate:", error);
    return NextResponse.json({ error: "Error processing debate", details: error.message }, { status: 500 });
  }
}
