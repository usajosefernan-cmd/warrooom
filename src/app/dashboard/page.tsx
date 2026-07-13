"use client";

import { useState, useEffect } from "react";
import { Plus, Briefcase, Calendar, ShieldAlert, Sparkles, FolderOpen, ArrowRight, X } from "lucide-react";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
  status: string;
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      if (res.ok) {
        setName("");
        setDescription("");
        setIsModalOpen(false);
        fetchProjects();
      }
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-zinc-800 bg-black/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-white text-lg">AI WAR ROOM</span>
              <span className="text-xs block text-zinc-400 font-mono">LABORATORIO DE DECISIONES VIVAS</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/settings"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Configuración API
            </Link>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm transition-all duration-200 shadow-md shadow-purple-600/10 hover:shadow-purple-600/20 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="h-4 w-4" />
              Nuevo Proyecto
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Proyectos de Debate</h1>
            <p className="text-zinc-400 text-sm">Gestiona y analiza tus ideas estratégicas con un comité de expertos en IA.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="h-10 w-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            <p className="text-zinc-500 text-sm font-mono">Cargando proyectos...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="border border-dashed border-zinc-800 rounded-2xl p-16 flex flex-col items-center justify-center text-center max-w-xl mx-auto bg-zinc-950/20 backdrop-blur-sm">
            <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
              <Briefcase className="h-6 w-6 text-zinc-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No hay proyectos activos</h3>
            <p className="text-zinc-400 text-sm mb-8">Comienza debatiendo una idea para construir la visión, hipótesis, decisiones y roadmaps de desarrollo correspondientes.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm transition-all shadow-md shadow-purple-600/15"
            >
              <Plus className="h-4 w-4" />
              Crear primer proyecto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.slug}/war-room`}
                className="group relative border border-zinc-800 hover:border-purple-500/50 rounded-xl p-6 bg-zinc-950/40 hover:bg-zinc-950/80 backdrop-blur-sm transition-all duration-300 flex flex-col justify-between h-56 shadow-sm hover:shadow-purple-500/5 hover:-translate-y-1"
              >
                <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FolderOpen className="h-4 w-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
                    <h3 className="font-semibold text-white text-base group-hover:text-purple-300 transition-colors">{project.name}</h3>
                  </div>
                  <p className="text-zinc-400 text-sm line-clamp-3 mb-4">{project.description || "Sin descripción proporcionada."}</p>
                </div>

                <div className="border-t border-zinc-800 pt-4 flex items-center justify-between text-xs text-zinc-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(project.createdAt).toLocaleDateString("es-ES")}
                  </span>
                  <span className="flex items-center gap-1 text-purple-400 font-medium group-hover:translate-x-1 transition-transform">
                    Abrir War Room
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Modal Crear Proyecto */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="border border-zinc-800 bg-zinc-950 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                <h3 className="font-semibold text-white">Nuevo Proyecto de Debate</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreate}>
              <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">Nombre del Proyecto</label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Fuente Clara, AIDAILY, Monetización"
                    className="w-full px-4 py-2.5 bg-black border border-zinc-800 hover:border-zinc-700 focus:border-purple-500 rounded-lg text-white placeholder-zinc-600 focus:outline-none font-sans transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">Descripción / Idea Inicial</label>
                  <textarea
                    id="description"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Escribe brevemente cuál es tu idea inicial, hipótesis de partida o el debate principal."
                    className="w-full px-4 py-2.5 bg-black border border-zinc-800 hover:border-zinc-700 focus:border-purple-500 rounded-lg text-white placeholder-zinc-600 focus:outline-none font-sans transition-colors resize-none"
                  />
                </div>
              </div>
              
              <div className="border-t border-zinc-800 px-6 py-4 flex items-center justify-end gap-3 bg-zinc-950/50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-transparent hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || !name.trim()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white rounded-lg text-sm font-medium transition-all shadow-md shadow-purple-600/10"
                >
                  {submitting ? "Creando..." : "Crear Proyecto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
