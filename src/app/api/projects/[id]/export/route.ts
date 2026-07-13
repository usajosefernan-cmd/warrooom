import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";
import JSZip from "jszip";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = readDB();
    const project = db.projects.find((p) => p.id === id || p.slug === id);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const projectId = project.id;
    const zip = new JSZip();

    const docsFolder = zip.folder("docs");
    if (docsFolder) {
      Object.entries(project.documents).forEach(([key, content]) => {
        docsFolder.file(`${key}.md`, content);
      });
    }

    const debatesFolder = zip.folder("debates");
    if (debatesFolder) {
      const projectDebates = db.debates.filter((d) => d.projectId === projectId);
      
      projectDebates.forEach((debate, idx) => {
        let content = `# Debate: ${debate.title}\n\n`;
        content += `Creado el: ${new Date(debate.createdAt).toLocaleString("es-ES")}\n\n`;
        
        debate.rounds.forEach((round) => {
          content += `## Ronda ${round.roundNumber} - ${new Date(round.timestamp).toLocaleString("es-ES")}\n\n`;
          content += `### Pregunta del Usuario:\n${round.userInput}\n\n`;
          
          round.agentMessages.forEach((msg) => {
            content += `#### Opinión de ${msg.agent} (${msg.role}):\n`;
            content += `- **Puntos Clave**:\n${msg.main_points.map((p) => `  - ${p}`).join("\n")}\n`;
            if (msg.risks.length > 0) {
              content += `- **Riesgos**:\n${msg.risks.map((r) => `  - ${r}`).join("\n")}\n`;
            }
            content += `- **Recomendación**:\n  - ${msg.recommendations.join("\n  - ")}\n\n`;
          });

          content += `### Síntesis del Orquestador:\n${round.summary}\n\n`;
          content += `---\n\n`;
        });

        debatesFolder.file(`debate-${(idx + 1).toString().padStart(3, "0")}.md`, content);
      });
    }

    const projectData = {
      project,
      debates: db.debates.filter((d) => d.projectId === projectId),
      decisions: db.decisions.filter((d) => d.projectId === projectId),
      hypotheses: db.hypotheses.filter((h) => h.projectId === projectId),
      tasks: db.tasks.filter((t) => t.projectId === projectId),
      sources: db.sources.filter((s) => s.projectId === projectId)
    };

    zip.file("project.json", JSON.stringify(projectData, null, 2));

    const blob = await zip.generateAsync({ type: "blob" });

    return new Response(blob, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${project.slug}-export.zip"`
      }
    });
  } catch (error: any) {
    console.error("Error generating export ZIP:", error);
    return NextResponse.json({ error: "Error generating export ZIP", details: error.message }, { status: 500 });
  }
}
