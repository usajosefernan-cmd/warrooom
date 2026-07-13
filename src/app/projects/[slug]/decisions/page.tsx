"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Lightbulb, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface Decision {
  id: string;
  title: string;
  description: string;
  status: "proposed" | "approved" | "rejected";
  createdAt: string;
}

export default function DecisionsPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [projectId, setProjectId] = useState<string>("");
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);

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
        fetchDecisions(projectData.id);
      }
    } catch (error) {
      console.error("Error loading project:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDecisions = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}/details`);
      if (res.ok) {
        const data = await res.json();
        setDecisions(data.decisions || []);
      }
    } catch (error) {
      console.error("Error loading decisions:", error);
    }
  };

  const handleStatusChange = async (decisionId: string, newStatus: "proposed" | "approved" | "rejected") => {
    try {
      // Modificar el arreglo de decisiones en el backend
      const updatedDecisions = decisions.map((d) => 
        d.id === decisionId ? { ...d, status: newStatus } : d
      );

      // Guardar el proyecto en el backend (actualiza la lista de la DB)
      // Para ello, creamos una llamada que actualice las decisiones directamente
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        // En nuestro db.ts, decisions se guarda en db.decisions. Actualizaremos la base con una ruta PUT genérica.
        // Pero para simplificar en el MVP, podemos actualizar a través de un endpoint PUT de proyectos que admita actualizaciones genéricas en la DB,
        // o implementamos una API simple.
        // Vamos a enriquecer el endpoint de la API `/api/projects/[id]` para que si se le pasa decisions, hypotheses o tasks, actualice la colección en la DB entera.
        body: JSON.stringify({ decisions: updatedDecisions })
      });

      if (res.ok) {
        setDecisions(updatedDecisions);
      }
    } catch (error) {
      console.error("Error updating decision status:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-amber-400" />
          Registro de Decisiones (ADRs)
        </h1>
        <p className="text-sm text-zinc-400">Controla, valida o descarta las decisiones clave propuestas durante los debates del comité.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="h-8 w-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-zinc-500 text-xs font-mono">Cargando decisiones...</p>
        </div>
      ) : decisions.length === 0 ? (
        <div className="text-center py-20 text-zinc-500 text-sm italic border border-dashed border-zinc-800 rounded-xl bg-zinc-950/20">
          No hay decisiones registradas aún. Ejecuta un debate en el War Room para generar propuestas.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {decisions.map((dec) => (
            <div 
              key={dec.id} 
              className="border border-zinc-800 bg-zinc-950/30 backdrop-blur-sm rounded-xl p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono text-zinc-500">ID: {dec.id}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    dec.status === "approved" 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : dec.status === "rejected"
                      ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                      : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                  } uppercase`}>
                    {dec.status}
                  </span>
                </div>
                <h3 className="font-bold text-white text-base mb-2">{dec.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-4">{dec.description}</p>
              </div>

              <div className="border-t border-zinc-800/60 pt-4 flex items-center justify-between text-xs text-zinc-500">
                <span>Registrado: {new Date(dec.createdAt).toLocaleDateString("es-ES")}</span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStatusChange(dec.id, "approved")}
                    className="flex items-center gap-1 px-2.5 py-1 bg-zinc-900 border border-zinc-800 hover:border-emerald-500/30 hover:text-emerald-400 rounded transition-colors text-[11px]"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Aprobar
                  </button>
                  <button
                    onClick={() => handleStatusChange(dec.id, "rejected")}
                    className="flex items-center gap-1 px-2.5 py-1 bg-zinc-900 border border-zinc-800 hover:border-rose-500/30 hover:text-rose-400 rounded transition-colors text-[11px]"
                  >
                    <XCircle className="h-3 w-3" />
                    Rechazar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
