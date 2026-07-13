"use client";

import type { Project } from "@/types";
import Link from "next/link";

type ProjectCardProps = {
  project: Project;
};

function formatDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.slug}/war-room`}
      className="group block rounded-2xl soft-glow bg-surface p-5 transition hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-white">{project.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted">{project.description}</p>
        </div>
        <span className="rounded-full bg-white/[0.06] px-2 py-1 text-xs text-muted">/{project.slug}</span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted">
        <span className="badge">Actualizado: {formatDate(project.updatedAt)}</span>
        <span className="badge">{new Date(project.createdAt).getFullYear()}</span>
      </div>
    </Link>
  );
}
