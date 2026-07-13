"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { FileText, Save, Eye, Edit2 } from "lucide-react";

interface Project {
  id: string;
  name: string;
  slug: string;
  documents: Record<string, string>;
}

export default function DocumentsPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [project, setProject] = useState<Project | null>(null);
  const [activeDoc, setActiveDoc] = useState<string>("conclusiones_vivas");
  const [content, setContent] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchProject();
    }
  }, [slug]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data);
        setContent(data.documents[activeDoc] || "");
      }
    } catch (error) {
      console.error("Error fetching project:", error);
    }
  };

  const handleDocChange = (docKey: string) => {
    setActiveDoc(docKey);
    if (project) {
      setContent(project.documents[docKey] || "");
    }
  };

  const handleSave = async () => {
    if (!project) return;
    setSaving(true);
    try {
      const updatedDocs = {
        ...project.documents,
        [activeDoc]: content,
      };

      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documents: updatedDocs }),
      });

      if (res.ok) {
        setProject({
          ...project,
          documents: updatedDocs,
        });
        alert("Documento guardado con éxito.");
      }
    } catch (error) {
      console.error("Error saving document:", error);
    } finally {
      setSaving(false);
    }
  };

  const renderMarkdownPreview = (text: string) => {
    if (!text) return <p className="text-zinc-500 italic">Documento vacío.</p>;
    
    return text.split("\n").map((line, i) => {
      if (line.startsWith("# ")) {
        return <h1 key={i} className="text-2xl font-bold text-white mt-6 mb-4 border-b border-zinc-800 pb-2">{line.replace("# ", "")}</h1>;
      }
      if (line.startsWith("## ")) {
        return <h2 key={i} className="text-xl font-semibold text-purple-400 mt-5 mb-3">{line.replace("## ", "")}</h2>;
      }
      if (line.startsWith("### ")) {
        return <h3 key={i} className="text-lg font-medium text-zinc-200 mt-4 mb-2">{line.replace("### ", "")}</h3>;
      }
      if (line.startsWith("- ")) {
        return <li key={i} className="text-sm text-zinc-300 ml-4 list-disc mb-1.5">{line.replace("- ", "")}</li>;
      }
      if (line.startsWith("|")) {
        const cells = line.split("|").map(c => c.trim()).filter(Boolean);
        if (cells.length > 0) {
          return (
            <div key={i} className="overflow-x-auto my-2">
              <table className="min-w-full border-collapse border border-zinc-800 text-xs">
                <tbody>
                  <tr className="border-b border-zinc-800 bg-zinc-900/50">
                    {cells.map((cell, idx) => (
                      <td key={idx} className="border border-zinc-800 px-3 py-2 text-zinc-300">{cell}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          );
        }
      }
      return line.trim() === "" ? <div key={i} className="h-2" /> : <p key={i} className="text-sm text-zinc-400 leading-relaxed mb-2">{line}</p>;
    });
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Documentación Viva</h1>
          <p className="text-sm text-zinc-400">Edita y audita la base de conocimientos consolidada de tu proyecto.</p>
        </div>
        
        {project && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditMode(!editMode)}
              className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
            >
              {editMode ? (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  Previsualizar
                </>
              ) : (
                <>
                  <Edit2 className="h-3.5 w-3.5" />
                  Editar
                </>
              )}
            </button>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white rounded-lg text-xs font-medium transition-all shadow-md shadow-purple-600/10"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden min-h-[500px]">
        {/* Lista documentos lateral */}
        <div className="w-56 border border-zinc-800 bg-zinc-950/40 rounded-xl p-3 flex flex-col gap-1.5 shrink-0 overflow-y-auto">
          <span className="text-[10px] font-mono text-zinc-500 px-3 mb-2 block">DOCUMENTOS</span>
          {project && Object.keys(project.documents).map((docKey) => (
            <button
              key={docKey}
              onClick={() => handleDocChange(docKey)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                activeDoc === docKey
                  ? "bg-purple-600/10 text-purple-300 border border-purple-500/20"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 border border-transparent"
              }`}
            >
              <FileText className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{docKey.charAt(0).toUpperCase() + docKey.slice(1).replace("_", " ")}</span>
            </button>
          ))}
        </div>

        {/* Workspace de edición */}
        <div className="flex-1 border border-zinc-800 bg-zinc-950/20 rounded-xl overflow-hidden flex flex-col backdrop-blur-sm">
          {editMode ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 w-full p-6 bg-transparent text-zinc-300 font-mono text-sm leading-relaxed focus:outline-none resize-none overflow-y-auto"
              placeholder="Escribe en formato Markdown..."
            />
          ) : (
            <div className="flex-1 p-6 overflow-y-auto prose prose-invert max-w-none">
              {renderMarkdownPreview(content)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
