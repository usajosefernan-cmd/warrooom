import { addMessage, addRound, appendDocumentSection, ensureProjectDocument, loadStore, saveStore, Store } from "@/storage/store";

export type AgentName =
  | "orchestrator"
  | "defender"
  | "critic"
  | "researcher"
  | "architect"
  | "pm"
  | "growth"
  | "legal"
  | "writer"
  | "implementer";

export type EndingStatus = "ok" | "warn";

export interface AgentInput {
  projectId: string;
  prompt: string;
}

export interface AgentContext {
  projectName?: string;
  previousDecisions?: string[];
  previousHypotheses?: string[];
  previousRisks?: string[];
}

export interface AgentResult {
  agent: AgentName;
  role: string;
  main_points: string[];
  risks: string[];
  recommendations: string[];
  questions: string[];
  updates_to_memory: { section: keyof import("@/types").LiveDocument; content: string }[];
}

const AGENTS = {
  orchestrator: {
    role: "Orquestador",
    run: ({ prompt, context }: AgentInput & { context?: AgentContext }): AgentResult => ({
      agent: "orchestrator" as AgentName,
      role: "Orquestador",
      main_points: [
        `Entrada recibida: ${prompt}`,
        context?.projectName ? `Proyecto: ${context.projectName}` : "Proyecto sin nombre",
      ],
      risks: ["Falta de foco o alcance abierto si no se acota la pregunta."],
      recommendations: [
        "Definir criterios de aceptación de la ronda antes de seguir.",
        "Limitar el debate a una decisión accionable por ahora.",
      ],
      questions: ["¿Queremos una tarea, una hipótesis o una decisión como salida prioritaria?"],
      updates_to_memory: [
        { section: "conclusions" as keyof import("@/types").LiveDocument, content: `- Ronda warpending: el orquestador recibe ` + prompt },
      ],
    }),
  },
  defender: {
    role: "Defensor",
    run: ({ prompt }: AgentInput): AgentResult => ({
      agent: "defender" as AgentName,
      role: "Defensor",
      main_points: [
        "La idea tiene recorrido si hay usuario real y problema medible.",
        "Puede validarse con una version reducida en semanas.",
      ],
      risks: ["Sesgo de confirmación si solo buscamos motivos para seguir."],
      recommendations: [
        "Definir señal primaria de éxito antes de invertir más.",
        "Elegir un segmento reducido y medir respuesta.",
      ],
      questions: [
        "¿Qué evidencia mínima necesitamos para dejarlo seguir adelante?",
        "¿Hay un early adopter real comprometido?",
      ],
      updates_to_memory: [],
    }),
  },
  critic: {
    role: "Crítico",
    run: ({ prompt }: AgentInput): AgentResult => ({
      agent: "critic" as AgentName,
      role: "Crítico",
      main_points: [
        "Riesgo de costes ocultos en mantenimiento y operación.",
        "El problema puede ser más débil de lo que parece.",
      ],
      risks: [
        "Coste operativo creciente sin modelo claro de ingresos.",
        "Sobrecarga por mantener una versión completa demasiado pronto.",
      ],
      recommendations: [
        "Prueba de carga real del modelo económico.",
        "Definir criterios de parada si la métrica principal no mejora.",
      ],
      questions: ["¿Qué fallaría primero si lo lanzamos sin protección?"],
      updates_to_memory: [
        { section: "risks" as keyof import("@/types").LiveDocument, content: `- Riesgo detectado por crítico: coste operativo/carga temprana derivado de: ${prompt}` },
      ],
    }),
  },
  researcher: {
    role: "Investigador",
    run: ({ prompt }: AgentInput): AgentResult => ({
      agent: "researcher" as AgentName,
      role: "Investigador",
      main_points: [
        "Sin acceso a fuentes externas en este modo.",
        "Queda pendiente buscar referencias de producto, mercado y técnica.",
      ],
      risks: ["Conclusiones basadas solo en suposiciones."],
      recommendations: [
        "Incluir fuentes y datos en próximas rondas.",
        "Mencionar fuentes oficiales o papers si existen.",
      ],
      questions: ["¿Hay estudios o datos públicos que validen o refuten la idea?"],
      updates_to_memory: [
        { section: "sources" as keyof import("@/types").LiveDocument, content: "- Pendiente investigación: caring." },
      ],
    }),
  },
  architect: {
    role: "Arquitecto técnico",
    run: ({ prompt }: AgentInput): AgentResult => ({
      agent: "architect" as AgentName,
      role: "Arquitecto técnico",
      main_points: [
        "Diseñar módulos pequeños con interfaces claras.",
        "Empezar por backend estable y API versionada.",
      ],
      risks: ["Acoplamiento excesivo por construir bloques grandes."],
      recommendations: [
        "Separar dominio, casos de uso e infra.",
        "Definir etapas de implementación y pruebas.",
      ],
      questions: ["¿Qué módulos tienen que ser MVP y cuáles pueden esperar?"],
      updates_to_memory: [{ section: "technicalTasks" as keyof import("@/types").LiveDocument, content: "- Separar domain/usecase/infra y priorizar API." }],
    }),
  },
  pm: {
    role: "Product Manager",
    run: ({ prompt }: AgentInput): AgentResult => ({
      agent: "pm" as AgentName,
      role: "Product Manager",
      main_points: [
        "Definir problema, usuario objetivo y éxito.",
        "Crear una historia de usuario accionable por sprint.",
      ],
      risks: ["MVP muy amplio sin criterio de descarte."],
      recommendations: ["Reducir a la métrica única de éxito.", "Priorizar una historia principal."],
      questions: ["¿Qué usuario usará el producto en la primera semana?"],
      updates_to_memory: [],
    }),
  },
  growth: {
    role: "Growth",
    run: ({ prompt }: AgentInput): AgentResult => ({
      agent: "growth" as AgentName,
      role: "Growth",
      main_points: ["Canal principal probable: comunidad/segmento técnico.", "SEO y distribución desde contenido útil."],
      risks: ["Crecimiento prematuro antes de product-market-fit."],
      recommendations: ["Elegir un canal y medir CAC/activación.", "Validar retención antes de escalar."],
      questions: ["¿Dónde ya se reúnen los usuarios potenciales?"],
      updates_to_memory: [],
    }),
  },
  legal: {
    role: "Legal / Ético",
    run: ({ prompt }: AgentInput): AgentResult => ({
      agent: "legal" as AgentName,
      role: "Legal / Ético",
      main_points: ["Revisar privacidad, datos y términos.", "Comprobar sesgos y compliance básico."],
      risks: ["Problemas legales por datos sensibles o contenido dudoso."],
      recommendations: ["Documentar tratamiento de datos.", "Incluir disclaimer si aplica."],
      questions: ["¿Maneja datos sensibles o menores?"],
      updates_to_memory: [{ section: "risks" as keyof import("@/types").LiveDocument, content: "- Legal: verificar privacidad y compliance." }],
    }),
  },
  writer: {
    role: "Redactor",
    run: ({ prompt }: AgentInput): AgentResult => ({
      agent: "writer" as AgentName,
      role: "Redactor",
      main_points: ["Convertir conclusiones en documentos claros.", "Preparar resumen ejecutivo y opciones."],
      risks: ["Documento muy técnico o muy vago para la audiencia."],
      recommendations: ["Un resumen ejecutivo y una lista de acciones.", "Mantener hechos separados de opiniones."],
      questions: ["¿Quién leerá primero el documento?"],
      updates_to_memory: [],
    }),
  },
  implementer: {
    role: "Implementador",
    run: ({ prompt }: AgentInput): AgentResult => ({
      agent: "implementer" as AgentName,
      role: "Implementador",
      main_points: ["Convertir la síntesis en tareas ejecutables.", "Evitar tareas sin criterio de completado."],
      risks: ["Tareas grandes sin acceptance criteria."],
      recommendations: ["Agrupar por módulo.", "Definir definition of done explícita."],
      questions: ["¿Qué pieza puede completarse esta semana?"],
      updates_to_memory: [{ section: "technicalTasks" as keyof import("@/types").LiveDocument, content: "- Tareas por módulo con acceptance criteria." }],
    }),
  },
};

const SUPERVISORS: Record<AgentName, AgentName> = {
  orchestrator: "orchestrator",
  defender: "critic",
  critic: "critic",
  researcher: "architect",
  architect: "implementer",
  pm: "orchestrator",
  growth: "pm",
  legal: "orchestrator",
  writer: "pm",
  implementer: "orchestrator",
};

function appendDocumentMarkdown(store: Store, projectId: string) {
  const chunks: string[] = [];
  for (const agent of Object.keys(AGENTS) as AgentName[]) {
    const result = ensureDocumentForAgent(store, agent);
    chunks.push(...Object.values(result).flatMap((value) => value));
  }
  return chunks;
}

function ensureDocumentForAgent(store: Store, agent: AgentName) {
  const current = store.documents[store.projects[0]?.id || ""];
  if (!current) {
    return {
      conclusions: "",
      risks: "",
      technicalTasks: "",
      sources: "",
    };
  }
  return {
    conclusions: current.conclusions || "",
    risks: current.risks || "",
    technicalTasks: current.technicalTasks || "",
    sources: current.sources || "",
  };
}

function supervisorFor(agent: AgentName) {
  return SUPERVISORS[agent] ?? "orchestrator";
}

function summarize(results: AgentResult[]) {
  const newConclusions = results.flatMap((item) => item.main_points.slice(0, 3));
  const newHypotheses = results.flatMap((item) => item.questions.slice(0, 3));
  const risks = results.flatMap((item) => item.risks);
  const tasks = results.flatMap((item) => item.recommendations.slice(0, 2));

  const contradictions = results.flatMap((item) =>
    item.questions.map((q) => `Contradicción potencial: ${q}`)
  );
  const missingEvidence = results.some((item) => item.agent === "researcher")
    ? ["Faltan referencias externas para respaldar la idea."]
    : [];
  const warnings = [
    "Ejecución en modo mock: sin llamadas a modelo real.",
    "Añade APIs en .env para sintetizar con modelos reales.",
  ];

  return {
    summary: "Síntesis del debate con agentes internos.",
    new_conclusions: newConclusions,
    proposed_decisions: [],
    new_hypotheses: newHypotheses,
    risks,
    tasks,
    sources: [],
    quality_gate: {
      passed: warnings.length === 0 && missingEvidence.length === 0,
      warnings,
      missingEvidence,
      contradictions,
    } as import("@/types").DebateRound["qualityGate"],
  };
}

export async function runDebate(input: AgentInput) {
  const store = loadStore();
  const project = store.projects.find((item) => item.id === input.projectId || item.slug === input.projectId);
  const context: AgentContext = {
    projectName: project?.name,
    previousDecisions: [],
    previousHypotheses: [],
    previousRisks: [],
  };

  const agentOrder: AgentName[] = [
    "researcher",
    "defender",
    "critic",
    "architect",
    "pm",
    "growth",
    "legal",
    "writer",
    "implementer",
    "orchestrator",
  ];

  const results: AgentResult[] = [];

  for (const agent of agentOrder) {
    const runner = AGENTS[agent];
    if (!runner) continue;
    const result = runner.run({ ...input, context });
    results.push(result);

    addMessage(store, {
      projectId: input.projectId,
      role: "assistant",
      agent: result.agent,
      content: JSON.stringify(result),
    });

    for (const update of result.updates_to_memory) {
      appendDocumentSection(store, input.projectId, update.section, update.content);
    }
  }

  const synthesis = summarize(results);

  addMessage(store, {
    projectId: input.projectId,
    role: "assistant",
    agent: "orchestrator",
    content: JSON.stringify(synthesis),
  });

  addRound(store, {
    projectId: input.projectId,
    prompt: input.prompt,
    summary: synthesis.summary,
    qualityGate: synthesis.quality_gate,
  });

  return {
    ok: "ok" as EndingStatus,
    projectId: input.projectId,
    agents: results,
    synthesis,
  };
}
