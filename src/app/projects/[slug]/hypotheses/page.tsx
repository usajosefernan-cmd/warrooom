"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { TrendingUp, AlertCircle, CheckCircle, HelpCircle } from "lucide-react";

interface Hypothesis {
  id: string;
  statement: string;
  evidence: string;
  status: "unverified" | "validated" | "refuted";
  createdAt: string;
}

export default function HypothesesPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [projectId, setProjectId] = useState<string>("");
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
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
        fetchHypotheses(projectData.id);
      }
    } catch (error) {
      console.error("Error loading project:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHypotheses = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}/details`);
      if (res.ok) {
        const data = await res.json();
        setHypotheses(data.hypotheses || []);
      }
    } catch (error) {
      console.error("Error loading hypotheses:", error);
    }
  };

  const handleStatusChange = async (hypothesisId: string, newStatus: "unverified" | "validated" | "refuted") => {
    try {
      const updatedHypotheses = hypotheses.map((h) => 
        h.id === hypothesisId ? { ...h, status: newStatus } : h
      );

      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hypotheses: updatedHypotheses })
      });

      if (res.ok) {
        setHypotheses(updatedHypotheses);
      }
    } catch (error) {
      console.error("Error updating hypothesis status:", error);
    }
  };

  const handleEvidenceChange = async (hypothesisId: string, evidenceText: string) => {
    try {
      const updatedHypotheses = hypotheses.map((h) => 
        h.id === hypothesisId ? { ...h, evidence: evidenceText } : h
      );

      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hypotheses: updatedHypotheses })
      });

      if (res.ok) {
        setHypotheses(updatedHypotheses);
      }
    } catch (error) {
      console.error("Error updating hypothesis evidence:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-purple-400" />
          Validación de Hipótesis
        </h1>
        <p className="text-sm text-zinc-400">Formula asunciones clave sobre tu negocio y registra evidencias empíricas para validarlas o refutarlas.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="h-8 w-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-zinc-500 text-xs font-mono">Cargando hipótesis...</p>
        </div>
      ) : hypotheses.length === 0 ? (
        <div className="text-center py-20 text-zinc-500 text-sm italic border border-dashed border-zinc-800 rounded-xl bg-zinc-950/20">
          No hay hipótesis registradas aún. Ejecuta un debate en el War Room para formular nuevas asunciones.
        </div>
      ) : (
        <div className="space-y-4">
          {hypotheses.map((hyp) => (
            <div 
              key={hyp.id} 
              className="border border-zinc-800 bg-zinc-950/30 backdrop-blur-sm rounded-xl p-5 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-zinc-500">ID: {hyp.id}</span>
                  <h3 className="font-bold text-white text-base leading-snug">{hyp.statement}</h3>
                </div>
                
                <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded border shrink-0 ${
                  hyp.status === "validated" 
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : hyp.status === "refuted"
                    ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                    : "bg-zinc-900 border-zinc-850 text-zinc-400"
                } uppercase`}>
                  {hyp.status === "validated" ? "Validada" : hyp.status === "refuted" ? "Refutada" : "Sin verificar"}
                </span>
              </div>

              {/* Input de Evidencia */}
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Evidencia de Soporte</label>
                <textarea
                  value={hyp.evidence}
                  onChange={(e) => handleEvidenceChange(hyp.id, e.target.value)}
                  placeholder="Registra datos, encuestas o experimentos que validen o refuten esta hipótesis..."
                  className="w-full px-3 py-2 bg-black border border-zinc-800 hover:border-zinc-700 focus:border-purple-500 rounded-lg text-xs text-zinc-300 placeholder-zinc-700 focus:outline-none font-sans transition-colors resize-none"
                  rows={2}
                />
              </div>

              <div className="border-t border-zinc-900 pt-4 flex items-center justify-between text-xs text-zinc-500">
                <span>Creada: {new Date(hyp.createdAt).toLocaleDateString("es-ES")}</span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStatusChange(hyp.id, "validated")}
                    className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 hover:border-emerald-500/30 hover:text-emerald-400 rounded transition-colors text-[11px] font-medium"
                  >
                    <CheckCircle className="h-3 w-3" />
                    Validar
                  </button>
                  <button
                    onClick={() => handleStatusChange(hyp.id, "refuted")}
                    className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 hover:border-rose-500/30 hover:text-rose-400 rounded transition-colors text-[11px] font-medium"
                  >
                    <AlertCircle className="h-3 w-3" />
                    Refutar
                  </button>
                  <button
                    onClick={() => handleStatusChange(hyp.id, "unverified")}
                    className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 hover:border-zinc-500/30 hover:text-zinc-300 rounded transition-colors text-[11px] font-medium"
                  >
                    <HelpCircle className="h-3 w-3" />
                    Resetear
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
