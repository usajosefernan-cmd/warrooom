"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addProject } from "@/storage/store";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const store = addProject({ name, description });
    const project = store.projects[store.projects.length - 1];
    if (!project) return;
    router.push(`/projects/${project.slug}/war-room`);
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <div className="rounded-2xl bg-surface p-6 soft-glow sm:p-8">
        <h1 className="text-xl font-semibold text-white">Nuevo proyecto</h1>
        <p className="mt-1 text-sm text-muted">Nombre y descripción inicial.</p>

        <form className="mt-6 space-y-4" onSubmit={submit}>
          <div>
            <label className="block text-sm text-white">Nombre</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-2 w-full rounded-xl bg-surface-2 px-3 py-2 text-sm text-white placeholder-muted focus:border-accent/60 focus:outline-none"
              placeholder="Proyecto War Room"
            />
          </div>
          <div>
            <label className="block text-sm text-white">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2 w-full rounded-xl bg-surface-2 px-3 py-2 text-sm text-white placeholder-muted focus:border-accent/60 focus:outline-none"
              placeholder="Objetivo, contexto y preguntas iniciales."
              rows={4}
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <a href="/dashboard" className="rounded-xl px-3 py-2 text-sm text-muted hover:text-white">Cancelar</a>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 py-2 text-sm font-medium text-white"
            >
              Crear proyecto
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
