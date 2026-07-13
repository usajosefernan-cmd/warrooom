import ProjectCard from "@/components/ProjectCard";
import { loadStore } from "@/storage/store";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const store = loadStore();

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Proyectos</h1>
          <p className="mt-1 text-sm text-muted">Tus debates vivos y conclusiones.</p>
        </div>
        <a
          href="/projects/new"
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 py-2 text-sm font-medium text-white accent-glow"
        >
          Nuevo proyecto
        </a>
      </div>

      <div className="mt-8">
        {store.projects.length === 0 ? (
          <div className="rounded-2xl bg-surface p-10 text-center soft-glow">
            <p className="text-white">No tienes proyectos aún.</p>
            <p className="mt-2 text-sm text-muted">Crea uno para empezar el War Room.</p>
            <a
              href="/projects/new"
              className="mt-6 inline-flex rounded-xl bg-white/[0.06] px-4 py-2 text-sm text-white hover:bg-white/[0.12]"
            >
              Crear proyecto
            </a>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {store.projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
