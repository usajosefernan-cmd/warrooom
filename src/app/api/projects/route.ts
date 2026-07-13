import { NextResponse } from "next/server";
import { readDB, writeDB, Project } from "@/lib/db";

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export async function GET() {
  try {
    const db = readDB();
    const sorted = [...db.projects].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return NextResponse.json(sorted);
  } catch (error) {
    console.error("Error reading projects:", error);
    return NextResponse.json({ error: "Error reading projects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, description } = await request.json();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const db = readDB();
    const slug = slugify(name);

    const exists = db.projects.some((p) => p.slug === slug);
    const finalSlug = exists ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

    const newProject: Project = {
      id: Math.random().toString(36).substring(2, 11),
      name,
      slug: finalSlug,
      description: description || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "active",
      documents: {
        vision: `# Visión del Proyecto: ${name}\n\n${description || "Describe la visión general de la idea."}\n\n## Objetivos\n- Objetivo 1\n- Objetivo 2\n\n## Alcance\n- Alcance 1`,
        hipotesis: `# Hipótesis de Partida\n\n¿Qué asunciones tenemos sobre el problema y la solución?\n\n- **Hipótesis 1**: [Descripción de la hipótesis]\n  - *Evidencia*: [Qué datos soportan o niegan esta hipótesis]\n  - *Estado*: Pendiente de validación`,
        decisiones: `# Registro de Decisiones de Arquitectura (ADR)\n\nRegistro de las decisiones tomadas durante los debates.\n\n| ID | Decisión | Estado | Contexto / Justificación |\n|---|---|---|---|`,
        conclusiones_vivas: `# Conclusiones Vivas\n\nEste documento se actualiza dinámicamente con las conclusiones más importantes del comité de debate IA.`,
        fuentes: `# Fuentes y Evidencia Científica / de Mercado\n\nLista de referencias, URLs y evidencias que respaldan las decisiones y el desarrollo.\n\n- [ ] Sin fuentes registradas.`,
        riesgos: `# Matriz de Riesgos y Mitigación\n\nEvaluación de riesgos técnicos, financieros y operativos.\n\n- **Riesgo 1**: [Riesgo]\n  - *Impacto*: [Alto/Medio/Bajo]\n  - *Mitigación*: [Plan de acción]`,
        roadmap: `# Roadmap de Lanzamiento\n\nFases planificadas para el desarrollo del proyecto.\n\n- **Fase 1**: MVP / Validación inicial\n- **Fase 2**: Iteración basada en feedback\n- **Fase 3**: Escalamiento`,
        tareas_tecnicas: `# Tareas Técnicas / Backlog\n\nTareas técnicas generadas por los agentes para el desarrollo.\n\n- [ ] Tarea 1: Configurar el esqueleto base.`,
        prompts_para_codex: `# Prompts de Implementación para Codex/Claude/Hermes\n\nPrompts listos para copiar y pegar en herramientas de código basadas en IA para implementar el backlog.\n\n## Prompt 1: Inicializar backend\n\`\`\`text\nImplementa el esqueleto base con Next.js...\n\`\`\``,
        changelog: `# Historial de Cambios (Changelog)\n\nHistorial de modificaciones del proyecto.\n\n- **${new Date().toLocaleDateString("es-ES")}**: Inicialización del proyecto "${name}".`
      }
    };

    db.projects.push(newProject);
    writeDB(db);

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json({ error: "Error creating project" }, { status: 500 });
  }
}
