import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";

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

    const debates = db.debates.filter((d) => d.projectId === projectId);
    const rounds = debates.flatMap((d) => d.rounds).sort(
      (a, b) => a.roundNumber - b.roundNumber
    );

    const decisions = db.decisions.filter((d) => d.projectId === projectId);
    const hypotheses = db.hypotheses.filter((h) => h.projectId === projectId);
    const tasks = db.tasks.filter((t) => t.projectId === projectId);
    const sources = db.sources.filter((s) => s.projectId === projectId);
    const conclusions = db.conclusions ? db.conclusions.filter((c) => c.projectId === projectId) : [];

    const risks = rounds.flatMap((r) => r.agentMessages.flatMap((m) => m.risks));
    const uniqueRisks = Array.from(new Set(risks)).slice(0, 10);

    return NextResponse.json({
      rounds,
      decisions,
      hypotheses,
      tasks,
      sources,
      risks: uniqueRisks,
      conclusions
    });
  } catch (error: any) {
    console.error("Error fetching project details:", error);
    return NextResponse.json({ error: "Error fetching project details", details: error.message }, { status: 500 });
  }
}
