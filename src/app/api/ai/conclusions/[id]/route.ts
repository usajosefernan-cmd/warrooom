import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!id || !status || (status !== "accepted" && status !== "rejected")) {
      return NextResponse.json({ error: "Missing or invalid status. Expected 'accepted' or 'rejected'." }, { status: 400 });
    }

    const db = readDB();
    if (!db.conclusions) {
      db.conclusions = [];
    }

    const conclusionIndex = db.conclusions.findIndex((c) => c.id === id);
    if (conclusionIndex === -1) {
      return NextResponse.json({ error: "Conclusion not found" }, { status: 404 });
    }

    const conclusion = db.conclusions[conclusionIndex];
    conclusion.status = status;
    db.conclusions[conclusionIndex] = conclusion;

    // Si se acepta, agregarlo al documento conclusiones_vivas del proyecto
    let project = db.projects.find((p) => p.id === conclusion.projectId);
    if (status === "accepted" && project) {
      const dateStr = new Date().toLocaleDateString("es-ES");
      
      // Asegurarse de que el documento no esté vacío
      if (!project.documents.conclusiones_vivas) {
        project.documents.conclusiones_vivas = "# Conclusiones Vivas del Debate\n";
      }
      
      // Inyectar en formato limpio
      project.documents.conclusiones_vivas += `\n- [Aceptada Ronda ${conclusion.roundNumber} - ${dateStr}]: ${conclusion.text}`;
      
      const projectIndex = db.projects.findIndex((p) => p.id === project!.id);
      db.projects[projectIndex] = project;
    }

    writeDB(db);

    return NextResponse.json({ conclusion, project });
  } catch (error: any) {
    console.error("Error updating conclusion:", error);
    return NextResponse.json({ error: "Error updating conclusion", details: error.message }, { status: 500 });
  }
}
