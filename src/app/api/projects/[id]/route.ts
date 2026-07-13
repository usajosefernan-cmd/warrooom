import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";

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

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json({ error: "Error fetching project" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await request.json();
    const db = readDB();
    const index = db.projects.findIndex((p) => p.id === id || p.slug === id);

    if (index === -1) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const projectId = db.projects[index].id;

    if (updates.decisions) {
      db.decisions = [
        ...db.decisions.filter((d) => d.projectId !== projectId),
        ...updates.decisions
      ];
      delete updates.decisions;
    }

    if (updates.hypotheses) {
      db.hypotheses = [
        ...db.hypotheses.filter((h) => h.projectId !== projectId),
        ...updates.hypotheses
      ];
      delete updates.hypotheses;
    }

    if (updates.tasks) {
      db.tasks = [
        ...db.tasks.filter((t) => t.projectId !== projectId),
        ...updates.tasks
      ];
      delete updates.tasks;
    }

    if (updates.sources) {
      db.sources = [
        ...db.sources.filter((s) => s.projectId !== projectId),
        ...updates.sources
      ];
      delete updates.sources;
    }

    db.projects[index] = {
      ...db.projects[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    writeDB(db);
    return NextResponse.json(db.projects[index]);
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json({ error: "Error updating project" }, { status: 500 });
  }
}
