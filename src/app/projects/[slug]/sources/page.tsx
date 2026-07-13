"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { BookOpen, Plus, Globe, Book, FileText, UserCheck, X } from "lucide-react";

interface Source {
  id: string;
  title: string;
  url?: string;
  description?: string;
  type: "url" | "book" | "expert" | "document" | "other";
  createdAt: string;
}

export default function SourcesPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [projectId, setProjectId] = useState<string>("");
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<Source["type"]>("url");

  useEffect(() => {
    if (slug) {
      fetchProject();
    }
  }, [slug]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${slug}`);
      if (res.ok) {
        const projectData = await res.json();
        setProjectId(projectData.id);
        fetchSources(projectData.id);
      }
    } catch (error) {
      console.error("Error loading project:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSources = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}/details`);
      if (res.ok) {
        const data = await res.json();
        setSources(data.sources || []);
      }
    } catch (error) {
      console.error("Error loading sources:", error);
    }
  };

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newSource: Source = {
      id: Math.random().toString(36).substring(2, 11),
      title,
      url: url.trim() || undefined,
      description: description.trim() || undefined,
      type,
      createdAt: new Date().toISOString()
    };

    const updatedSources = [...sources, newSource];

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sources: updatedSources })
      });

      if (res.ok) {
        setSources(updatedSources);
        setTitle("");
        setUrl("");
        setDescription("");
        setType("url");
        setIsFormOpen(false);
      }
    } catch (error) {
      console.error("Error adding source:", error);
    }
  };

  const handleDeleteSource = async (sourceId: string) => {
    const updatedSources = sources.filter((s) => s.id !== sourceId);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sources: updatedSources })
      });

      if (res.ok) {
        setSources(updatedSources);
      }
    } catch (error) {
      console.error("Error deleting source:", error);
    }
  };

  const getSourceIcon = (sourceType: Source["type"]) => {
    switch (sourceType) {
      case "url": return Globe;
      case "book": return Book;
      case "document": return FileText;
      case "expert": return UserCheck;
      default: return BookOpen;
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-400" />
            Fuentes y Evidencias
          </h1>
          <p className="text-sm text-zinc-400">Bibliografía, enlaces, opiniones de expertos y documentos verificados del proyecto.</p>
        </div>

        {!loading && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition-all shadow-md shadow-purple-600/10"
          >
            <Plus className="h-3.5 w-3.5" />
            Añadir Fuente
          </button>
        )}
      </div>

      {isFormOpen && (
        <form 
          onSubmit={handleAddSource}
          className="border border-zinc-800 bg-zinc-950/40 rounded-xl p-5 space-y-4 animate-in slide-in-from-top-2 duration-250"
        >
          <div className="flex items-center justify-between border-b border-zinc-850 pb-2 mb-2">
            <span className="text-xs font-bold text-white">Registrar Nueva Fuente</span>
            <button 
              type="button" 
              onClick={() => setIsFormOpen(false)}
              className="text-zinc-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Título de la Fuente</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Estudio de Mercado Gartner 2025"
                className="w-full px-3 py-2 bg-black border border-zinc-800 hover:border-zinc-700 focus:border-purple-500 rounded-lg text-xs text-white focus:outline-none transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Tipo de Fuente</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as Source["type"])}
                className="w-full px-3 py-2 bg-black border border-zinc-800 hover:border-zinc-700 focus:border-purple-500 rounded-lg text-xs text-zinc-300 focus:outline-none transition-colors"
              >
                <option value="url">Enlace / Sitio Web</option>
                <option value="book">Libro / Publicación</option>
                <option value="document">Documento técnico / PDF</option>
                <option value="expert">Entrevista / Experto</option>
                <option value="other">Otro</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">URL (Opcional)</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/estudio"
                className="w-full px-3 py-2 bg-black border border-zinc-800 hover:border-zinc-700 focus:border-purple-500 rounded-lg text-xs text-white focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Descripción breve</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Resumen del contenido de la fuente..."
                className="w-full px-3 py-2 bg-black border border-zinc-800 hover:border-zinc-700 focus:border-purple-500 rounded-lg text-xs text-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-850">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-3.5 py-1.5 bg-transparent border border-zinc-850 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-lg text-xs font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition-all shadow-md"
            >
              Guardar Fuente
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="h-8 w-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-zinc-500 text-xs font-mono">Cargando fuentes...</p>
        </div>
      ) : sources.length === 0 ? (
        <div className="text-center py-20 text-zinc-500 text-sm italic border border-dashed border-zinc-800 rounded-xl bg-zinc-950/20">
          No hay fuentes registradas. Haz clic en "Añadir Fuente" para registrar la primera.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sources.map((source) => {
            const Icon = getSourceIcon(source.type);
            return (
              <div 
                key={source.id}
                className="border border-zinc-800 bg-zinc-950/30 backdrop-blur-sm rounded-xl p-5 flex items-start gap-4 relative group"
              >
                <button
                  onClick={() => handleDeleteSource(source.id)}
                  className="absolute top-3 right-3 text-zinc-650 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="h-10 w-10 bg-indigo-600/10 text-indigo-400 rounded-lg flex items-center justify-center border border-indigo-500/20 shrink-0">
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0 space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-500 px-2 py-0.5 rounded uppercase">
                      {source.type}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-600">ID: {source.id}</span>
                  </div>
                  
                  <h3 className="font-bold text-white text-base leading-snug truncate pr-6">{source.title}</h3>
                  
                  {source.description && (
                    <p className="text-zinc-400 text-xs leading-relaxed">{source.description}</p>
                  )}

                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline inline-block font-mono truncate max-w-full"
                    >
                      {source.url}
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
