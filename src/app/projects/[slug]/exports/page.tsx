"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Download, Copy, Check, FileText, Sparkles, Terminal } from "lucide-react";

interface Project {
  id: string;
  name: string;
  slug: string;
}

export default function ExportsPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

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
        const data = await res.json();
        setProject(data);
      }
    } catch (error) {
      console.error("Error loading project:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, tabName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabName);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const prompts = {
    codex: `[PROMPT CODEX / COPILOT]
Eres un asistente experto en programación. Por favor, lee el backlog del proyecto y la arquitectura decidida para implementar las siguientes tareas:
${project ? `- Proyecto: ${project.name}` : ""}
- Stack Técnico: Next.js, React, TailwindCSS, TypeScript.
Escribe código limpio, modular, tipado y aplicando buenas prácticas de diseño de componentes.`,
    
    claude: `[PROMPT CLAUDE CODE / ANTHROPIC]
Por favor, analiza el contexto del proyecto y la base técnica que hemos consensuado. Tu tarea es generar la estructura de backend y las utilidades del servidor asegurando que cumplan con la seguridad de claves y las asunciones del negocio.`,
    
    antigravity: `[PROMPT ANTIGRAVITY]
Actúa como Antigravity, el agente de codificación de Google Deepmind. Ayúdame a implementar las tareas técnicas priorizadas en el backlog. Revisa los ADRs del proyecto para no violar ninguna decisión arquitectónica clave.`,
    
    hermes: `[PROMPT HERMES AGENT]
Eres Hermes, un agente autónomo de desarrollo en bucle cerrado. Ejecuta secuencialmente la creación de servicios y tests para el backend. Asegura el typecheck verde y realiza auditoría de dependencias antes del build.`,
    
    deepResearch: `[PROMPT DEEP RESEARCH]
Realiza un estudio profundo de mercado e investigación de patentes para las hipótesis críticas que hemos planteado sobre este producto. Busca competidores directos en España/Europa y cuantifica el CAC promedio para este sector.`
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Download className="h-6 w-6 text-purple-400" />
          Exportación y Prompts de Código
        </h1>
        <p className="text-sm text-zinc-400">Descarga el código del debate, documentación estructurada y copia prompts optimizados para asistentes IA.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="h-8 w-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-zinc-500 text-xs font-mono">Preparando descargas...</p>
        </div>
      ) : project ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Izquierda: ZIP y JSON */}
          <div className="border border-zinc-800 bg-zinc-950/20 rounded-xl p-6 backdrop-blur-sm space-y-6 lg:col-span-1">
            <h3 className="font-semibold text-white text-base">Descargar Archivos</h3>
            
            <div className="space-y-3">
              <a
                href={`/api/projects/${project.id}/export`}
                className="flex items-center justify-center gap-2.5 w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-all shadow-md shadow-purple-600/10 hover:shadow-purple-600/20"
              >
                <Download className="h-4 w-4" />
                Descargar ZIP del Proyecto
              </a>
              <p className="text-[11px] text-zinc-500 leading-tight text-center">
                Contiene carpetas /docs (Markdown individuales), /debates (historiales de rondas) y project.json.
              </p>
            </div>

            <div className="border-t border-zinc-800/60 pt-6 space-y-4">
              <h4 className="text-zinc-300 font-medium text-xs uppercase tracking-wider font-mono">Estructura del ZIP</h4>
              <div className="bg-black/40 border border-zinc-900 p-4 rounded-lg font-mono text-[11px] text-zinc-500 space-y-1">
                <p className="text-white">/{project.slug}</p>
                <p>  /docs</p>
                <p className="text-zinc-400">    vision.md</p>
                <p className="text-zinc-400">    hipotesis.md</p>
                <p className="text-zinc-400">    decisiones.md</p>
                <p className="text-zinc-400">    conclusiones_vivas.md</p>
                <p>  /debates</p>
                <p className="text-zinc-400">    debate-001.md</p>
                <p className="text-white">  project.json</p>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Prompts optimizados */}
          <div className="lg:col-span-2 border border-zinc-800 bg-zinc-950/20 rounded-xl p-6 backdrop-blur-sm space-y-6">
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-purple-400" />
              <h3 className="font-semibold text-white text-base">Prompts Generadores de Código</h3>
            </div>

            <div className="space-y-4">
              {Object.entries(prompts).map(([key, promptText]) => {
                const names = {
                  codex: "Codex / Copilot",
                  claude: "Claude Code",
                  antigravity: "Antigravity",
                  hermes: "Hermes Agent",
                  deepResearch: "Deep Research"
                };
                
                const isCopied = copiedTab === key;

                return (
                  <div key={key} className="border border-zinc-800 bg-black/40 rounded-lg p-4 space-y-2 relative group">
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-2">
                      <span className="font-bold text-xs text-white uppercase tracking-wider font-mono">
                        {names[key as keyof typeof names]}
                      </span>
                      <button
                        onClick={() => handleCopy(promptText, key)}
                        className="text-zinc-500 hover:text-white transition-colors"
                      >
                        {isCopied ? (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                            <Check className="h-3.5 w-3.5" />
                            Copiado!
                          </span>
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                    
                    <pre className="text-xs text-zinc-400 font-mono leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {promptText}
                    </pre>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-red-400 text-xs">Error de carga de metadatos de proyecto.</div>
      )}
    </div>
  );
}
