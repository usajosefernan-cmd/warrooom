"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { 
  Sparkles, 
  Send, 
  FileText, 
  Lightbulb, 
  TrendingUp, 
  ShieldAlert, 
  CheckSquare, 
  Activity, 
  ArrowRight,
  User,
  ShieldCheck,
  AlertTriangle,
  Play,
  HelpCircle,
  Check,
  X
} from "lucide-react";

interface AgentMessage {
  agent: string;
  role: string;
  main_points: string[];
  risks: string[];
  recommendations: string[];
  questions: string[];
  updates_to_memory: string[];
}

interface QualityGate {
  passed: boolean;
  warnings: string[];
  missing_evidence: string[];
  contradictions: string[];
}

interface DebateRound {
  id: string;
  roundNumber: number;
  userInput: string;
  agentMessages: AgentMessage[];
  summary: string;
  qualityGate: QualityGate;
  timestamp: string;
}

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  documents: Record<string, string>;
}

export default function WarRoom() {
  const params = useParams();
  const slug = params?.slug as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [userInput, setUserInput] = useState("");
  const [isDebating, setIsDebating] = useState(false);
  const [activeAgents, setActiveAgents] = useState<string[]>(["defender", "critic", "architect", "pm"]);
  const [rounds, setRounds] = useState<DebateRound[]>([]);
  const [selectedRoundIndex, setSelectedRoundIndex] = useState<number>(-1);
  const [activeDocTab, setActiveDocTab] = useState<string>("conclusiones_vivas");

  // Widgets dinámicos derecho
  const [decisions, setDecisions] = useState<any[]>([]);
  const [hypotheses, setHypotheses] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [risks, setRisks] = useState<string[]>([]);
  const [conclusions, setConclusions] = useState<any[]>([]);
  const [qualityGate, setQualityGate] = useState<QualityGate | null>(null);
  const [currentAgentTyping, setCurrentAgentTyping] = useState<string>("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (slug) {
      loadProjectData();
    }
  }, [slug]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [rounds, isDebating]);

  const loadProjectData = async () => {
    try {
      setLoadingProject(true);
      const res = await fetch(`/api/projects/${slug}`);
      if (res.ok) {
        const projectData = await res.json();
        setProject(projectData);
        
        // Cargar debates
        const debatesRes = await fetch(`/api/projects/${projectData.id}`);
        // Para simplificar, obtenemos los debates y elementos relacionados directamente de la base de datos
        // mediante el proyecto y endpoints específicos. Dado que guardamos todo en db.json, podemos hacer fetch
        // de un listado consolidado.
        const resDb = await fetch(`/api/projects`);
        if (resDb.ok) {
          // Leer la base de datos entera
          const listRes = await fetch(`/api/projects/${projectData.id}`);
          // Para el MVP, buscaremos los debates llamando a un endpoint o parseándolos del propio proyecto
          // si los debates se guardaran embebidos. En nuestro db.ts, debates es independiente.
          // Implementemos una llamada rápida para traer los debates de este proyecto.
          // Para simplificar, añadimos los debates y complementos a la respuesta del proyecto o creamos rutas específicas.
          // Hagamos un fetch a `/api/projects/${projectData.id}` que retorna el proyecto. 
          // Vamos a enriquecer el backend para que nos retorne debates/tareas/decisiones o consultar la base local en un endpoint.
          // Para este MVP, crearemos un Endpoint consolidado o traeremos los datos.
        }
        
        // Carguemos los elementos del proyecto
        fetchProjectDetails(projectData.id);
      }
    } catch (error) {
      console.error("Error loading project data:", error);
    } finally {
      setLoadingProject(false);
    }
  };

  const fetchProjectDetails = async (projectId: string) => {
    try {
      // Endpoint consolidado o simulado por el momento.
      // Haremos que la API de proyectos nos traiga todo lo asociado al proyecto.
      // Por simplicidad en el frontend, leemos todos los elementos que el backend actualiza en la DB.
      // Creamos un endpoint temporal o usamos la info del backend.
      // Escribiremos la API para obtener los datos de la DB para este proyecto.
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.ok) {
        // En nuestro db.ts, creamos funciones. Vamos a crear un endpoint `/api/projects/[id]/details`
        // que traiga decisiones, hipótesis, tareas y debates de una vez.
        const resDetails = await fetch(`/api/projects/${projectId}/details`);
        if (resDetails.ok) {
          const details = await resDetails.json();
          setRounds(details.rounds || []);
          if (details.rounds && details.rounds.length > 0) {
            setSelectedRoundIndex(details.rounds.length - 1);
            setQualityGate(details.rounds[details.rounds.length - 1].qualityGate);
          }
          setDecisions(details.decisions || []);
          setHypotheses(details.hypotheses || []);
          setTasks(details.tasks || []);
          setRisks(details.risks || []);
          setConclusions(details.conclusions || []);
        }
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
    }
  };

  const handleConclusionStatus = async (conclusionId: string, newStatus: "accepted" | "rejected") => {
    try {
      const res = await fetch(`/api/ai/conclusions/${conclusionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.project) {
          setProject(data.project);
        }
        if (project) {
          fetchProjectDetails(project.id);
        }
      }
    } catch (error) {
      console.error("Error updating conclusion status:", error);
    }
  };

  const executeWarRoom = async () => {
    if (!userInput.trim() || !project) return;
    setIsDebating(true);
    setCurrentAgentTyping("Iniciando debate...");

    try {
      // Simular visualmente que los agentes están analizando (micro-animación de carga en el frontend)
      const agentsNames = {
        defender: "Defensor de la Idea",
        critic: "Crítico del Comité",
        architect: "Arquitecto Técnico",
        pm: "Product Manager",
        researcher: "Investigador de Evidencias",
        growth: "Growth Hacker",
        legal: "Legal & Ético",
        writer: "Redactor de Contenido",
        implementer: "Implementador de Tareas"
      };

      for (const agentKey of activeAgents) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        setCurrentAgentTyping(`Agente: ${agentsNames[agentKey as keyof typeof agentsNames] || agentKey} analizando...`);
      }

      setCurrentAgentTyping("Orquestando respuestas y sintetizando...");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const res = await fetch("/api/ai/debate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          userInput,
          activeAgents
        })
      });

      if (res.ok) {
        const data = await res.json();
        
        // Actualizar proyecto en frontend
        setProject(data.project);
        
        // Recargar los detalles del proyecto desde el servidor
        await fetchProjectDetails(project.id);
        
        setUserInput("");
      }
    } catch (error) {
      console.error("Error executing War Room:", error);
    } finally {
      setIsDebating(false);
      setCurrentAgentTyping("");
    }
  };

  // Helper para renderizar Markdown sencillo
  const renderMarkdown = (mdText: string) => {
    if (!mdText) return <p className="text-zinc-500 italic">Documento vacío.</p>;
    
    return mdText.split("\n").map((line, i) => {
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
        // Renderizar tabla sencilla
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

  const getAgentColor = (agent: string) => {
    switch (agent) {
      case "Defensor": return "border-emerald-500/30 bg-emerald-950/20 text-emerald-300";
      case "Crítico": return "border-rose-500/30 bg-rose-950/20 text-rose-300";
      case "Investigador": 
      case "Investigador de Evidencias": return "border-blue-500/30 bg-blue-950/20 text-blue-300";
      case "Arquitecto técnico": 
      case "Arquitecto Técnico": return "border-violet-500/30 bg-violet-950/20 text-violet-300";
      case "Product Manager": return "border-amber-500/30 bg-amber-950/20 text-amber-300";
      case "Growth": 
      case "Growth Hacker": return "border-cyan-500/30 bg-cyan-950/20 text-cyan-300";
      case "Legal / Ético": 
      case "Legal & Ético": return "border-orange-500/30 bg-orange-950/20 text-orange-300";
      case "Redactor": return "border-teal-500/30 bg-teal-950/20 text-teal-300";
      case "Implementador": return "border-yellow-500/30 bg-yellow-950/20 text-yellow-300";
      default: return "border-zinc-800 bg-zinc-950/40 text-zinc-300";
    }
  };

  const selectedRound = rounds[selectedRoundIndex];

  return (
    <div className="h-[calc(100vh-4rem)] flex gap-6 overflow-hidden">
      {/* PANEL IZQUIERDO: DOCUMENTOS VIVOS */}
      <section className="w-1/3 border border-zinc-800 bg-zinc-950/40 rounded-xl flex flex-col overflow-hidden backdrop-blur-sm">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-purple-400" />
            <h3 className="font-semibold text-white text-sm">Documentos Vivos</h3>
          </div>
          <span className="text-[10px] font-mono bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20">MARKDOWN</span>
        </div>

        {/* Tabs de Documentos */}
        <div className="flex border-b border-zinc-800 overflow-x-auto scrollbar-none text-xs bg-zinc-950/80">
          {project && Object.keys(project.documents).map((docKey) => (
            <button
              key={docKey}
              onClick={() => setActiveDocTab(docKey)}
              className={`px-4 py-2.5 font-medium whitespace-nowrap border-b-2 transition-all ${
                activeDocTab === docKey
                  ? "border-purple-500 text-white bg-purple-500/5"
                  : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30"
              }`}
            >
              {docKey.charAt(0).toUpperCase() + docKey.slice(1).replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Contenido Documentos */}
        <div className="flex-1 overflow-y-auto p-6 font-sans">
          {project ? (
            renderMarkdown(project.documents[activeDocTab])
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-600 text-sm">
              Cargando documento...
            </div>
          )}
        </div>
      </section>

      {/* PANEL CENTRAL: CHAT DE DEBATE */}
      <section className="flex-1 border border-zinc-800 bg-zinc-950/20 rounded-xl flex flex-col overflow-hidden backdrop-blur-sm relative">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/20 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white text-sm">Laboratorio de Ideas</h3>
            <p className="text-[11px] text-zinc-500 font-mono">EJECUTA EL DEBATE MULTI-AGENTE</p>
          </div>
          
          {/* Historial de rondas */}
          {rounds.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 font-mono">Ronda:</span>
              <select
                value={selectedRoundIndex}
                onChange={(e) => setSelectedRoundIndex(Number(e.target.value))}
                className="bg-black border border-zinc-800 text-zinc-300 text-xs px-2.5 py-1 rounded focus:outline-none focus:border-purple-500"
              >
                {rounds.map((r, i) => (
                  <option key={r.id} value={i}>
                    {r.roundNumber} - {r.userInput.substring(0, 20)}...
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Feed del Debate */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {rounds.length === 0 && !isDebating ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="h-12 w-12 rounded-full bg-purple-900/10 border border-purple-500/30 flex items-center justify-center mb-4 text-purple-400 animate-bounce">
                <Sparkles className="h-5 w-5" />
              </div>
              <h4 className="text-white font-medium mb-1.5">Inicia el Debate Estratégico</h4>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Introduce un dilema técnico, comercial o de producto. El comité de agentes IA contrastará la idea analizando viabilidad, riesgos, arquitectura y roadmap.
              </p>
            </div>
          ) : (
            <>
              {selectedRound && (
                <div className="space-y-6">
                  {/* Mensaje del Usuario */}
                  <div className="flex items-start gap-3 bg-zinc-900/30 border border-zinc-800/60 p-4 rounded-xl">
                    <div className="h-8 w-8 rounded bg-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      U
                    </div>
                    <div>
                      <span className="text-xs font-mono text-zinc-500 block mb-1">USUARIO</span>
                      <p className="text-sm text-zinc-200">{selectedRound.userInput}</p>
                    </div>
                  </div>

                  {/* Respuestas de los agentes */}
                  <div className="space-y-4">
                    <span className="text-xs font-mono text-zinc-500 block">RESPUESTAS DEL COMITÉ DE DEBATE</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedRound.agentMessages.map((msg, idx) => (
                        <div 
                          key={idx} 
                          className={`border rounded-xl p-4 flex flex-col justify-between ${getAgentColor(msg.agent)}`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3 border-b border-zinc-800/20 pb-2">
                              <span className="font-bold text-xs tracking-tight">{msg.agent}</span>
                              <span className="text-[9px] font-mono bg-white/5 px-2 py-0.5 rounded uppercase">{msg.role.split(" ")[0]}</span>
                            </div>
                            
                            <div className="space-y-2 text-xs">
                              {msg.main_points.length > 0 && (
                                <div>
                                  <span className="font-semibold block text-[10px] text-zinc-400 uppercase tracking-wide">Puntos Clave:</span>
                                  <ul className="list-disc pl-4 space-y-1 mt-1 text-zinc-300">
                                    {msg.main_points.map((p, i) => <li key={i}>{p}</li>)}
                                  </ul>
                                </div>
                              )}
                              
                              {msg.risks.length > 0 && (
                                <div className="mt-2">
                                  <span className="font-semibold block text-[10px] text-red-400 uppercase tracking-wide">Riesgos:</span>
                                  <ul className="list-disc pl-4 space-y-1 mt-1 text-zinc-300">
                                    {msg.risks.map((r, i) => <li key={i} className="text-red-300/90">{r}</li>)}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-3 pt-3 border-t border-zinc-800/10 text-[11px] text-zinc-400 italic">
                            💡 {msg.recommendations[0]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Síntesis del Orquestador */}
                  <div className="border border-purple-500/20 bg-purple-950/10 rounded-xl p-6 glow-purple">
                    <div className="flex items-center gap-2.5 mb-4 border-b border-purple-500/10 pb-3">
                      <div className="h-7 w-7 rounded bg-purple-500 flex items-center justify-center text-white">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-xs font-mono text-purple-400 block leading-none">ORQUESTADOR</span>
                        <span className="font-bold text-sm text-white">Síntesis y Consenso Ejecutivo</span>
                      </div>
                    </div>
                    <p className="text-sm text-zinc-300 leading-relaxed mb-4">{selectedRound.summary}</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Carga del debate */}
          {isDebating && (
            <div className="flex items-start gap-3 bg-zinc-950/80 border border-purple-500/20 p-6 rounded-xl animate-pulse">
              <div className="h-8 w-8 rounded-lg bg-purple-600 flex items-center justify-center text-white shrink-0 animate-spin">
                <Activity className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-2">
                <span className="text-xs font-mono text-purple-400 block">DEBATE EN PROCESO</span>
                <p className="text-sm text-white font-mono">{currentAgentTyping}</p>
                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-purple-500 rounded-full w-2/3 animate-pulse" />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input del Debate */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[10px] font-mono text-zinc-500">COMITÉ ACTIVO:</span>
            <div className="flex items-center gap-2">
              {["defender", "critic", "researcher", "architect", "pm", "growth", "legal", "writer", "implementer"].map((agentId) => {
                const names = { 
                  defender: "Defensor", 
                  critic: "Crítico", 
                  researcher: "Investigador",
                  architect: "Arquitecto", 
                  pm: "PM",
                  growth: "Growth",
                  legal: "Legal",
                  writer: "Redactor",
                  implementer: "Implementador"
                };
                const isActive = activeAgents.includes(agentId);
                return (
                  <button
                    key={agentId}
                    onClick={() => {
                      if (isActive) {
                        setActiveAgents(activeAgents.filter(a => a !== agentId));
                      } else {
                        setActiveAgents([...activeAgents, agentId]);
                      }
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                      isActive 
                        ? "bg-purple-600/10 border-purple-500/30 text-purple-300"
                        : "bg-transparent border-zinc-800 text-zinc-600 hover:text-zinc-400"
                    }`}
                  >
                    {names[agentId as keyof typeof names]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && executeWarRoom()}
              disabled={isDebating}
              placeholder="Introduce tu propuesta, dilema o asunción a debatir..."
              className="flex-1 px-4 py-3 bg-black border border-zinc-800 hover:border-zinc-700 focus:border-purple-500 rounded-lg text-sm text-white focus:outline-none placeholder-zinc-600 font-sans transition-colors"
            />
            <button
              onClick={executeWarRoom}
              disabled={isDebating || !userInput.trim()}
              className="px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/40 text-white rounded-lg text-sm font-medium transition-all shadow-md shadow-purple-600/10 hover:shadow-purple-600/20"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* PANEL DERECHO: WIDGETS Y QUALITY GATE */}
      <section className="w-1/4 flex flex-col gap-6 overflow-y-auto">
        {/* WIDGET: QUALITY GATE */}
        <div className="border border-zinc-800 bg-zinc-950/40 rounded-xl p-5 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono text-zinc-500">CONTROL DE CALIDAD</span>
              {qualityGate?.passed ? (
                <span className="flex items-center gap-1 text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded border border-emerald-500/20">
                  <ShieldCheck className="h-3 w-3" />
                  APROBADO
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-mono bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded border border-amber-500/20">
                  <AlertTriangle className="h-3 w-3" />
                  CON WARNINGS
                </span>
              )}
            </div>
            
            <h4 className="text-white font-semibold text-sm mb-3">Evaluación del Consenso</h4>
            
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-zinc-500 block">Contradicciones:</span>
                {qualityGate && qualityGate.contradictions.length > 0 ? (
                  <ul className="list-disc pl-4 mt-1 text-amber-300">
                    {qualityGate.contradictions.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                ) : (
                  <span className="text-zinc-400 block mt-0.5">Ninguna contradicción grave.</span>
                )}
              </div>
              
              <div>
                <span className="text-zinc-500 block">Datos faltantes / Evidencia ausente:</span>
                {qualityGate && qualityGate.missing_evidence.length > 0 ? (
                  <ul className="list-disc pl-4 mt-1 text-zinc-300">
                    {qualityGate.missing_evidence.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                ) : (
                  <span className="text-zinc-400 block mt-0.5">Evidencia consolidada.</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-5 border-t border-zinc-800 pt-4 flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span>MEMORIA: ACTUALIZADA</span>
            <span>GATE: V1.0</span>
          </div>
        </div>

        {/* WIDGET: CONCLUSIONES DEL DEBATE */}
        <div className="border border-zinc-800 bg-zinc-950/40 rounded-xl p-5 backdrop-blur-sm flex-1 flex flex-col min-h-[300px]">
          <div className="flex items-center justify-between mb-4 border-b border-zinc-800/50 pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-400 animate-pulse" />
              <h4 className="text-white font-semibold text-sm">Conclusiones del Debate</h4>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">
              {conclusions.filter(c => c.status === "pending").length} pend.
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs scrollbar-thin">
            {conclusions.length === 0 ? (
              <p className="text-zinc-600 italic">No se han extraído conclusiones aún.</p>
            ) : (
              <>
                {/* PENDIENTES */}
                {conclusions.some(c => c.status === "pending") && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block mb-1">Pendientes de Validar</span>
                    {conclusions
                      .filter(c => c.status === "pending")
                      .map((c) => (
                        <div key={c.id} className="border border-zinc-800/60 bg-black/40 p-3 rounded-lg flex flex-col justify-between gap-2.5">
                          <p className="text-zinc-300 leading-normal">{c.text}</p>
                          <div className="flex justify-end gap-2 border-t border-zinc-800/30 pt-2">
                            <button
                              onClick={() => handleConclusionStatus(c.id, "rejected")}
                              className="flex items-center gap-1 px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded border border-rose-500/20 text-[10px] font-mono tracking-tight transition-all active:scale-95"
                            >
                              <X className="h-2.5 w-2.5" />
                              Descartar
                            </button>
                            <button
                              onClick={() => handleConclusionStatus(c.id, "accepted")}
                              className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/20 text-[10px] font-mono tracking-tight transition-all active:scale-95 shadow-md shadow-emerald-500/5"
                            >
                              <Check className="h-2.5 w-2.5" />
                              Aceptar
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {/* ACEPTADAS */}
                {conclusions.some(c => c.status === "accepted") && (
                  <div className="space-y-2 pt-2 border-t border-zinc-800/40">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block mb-1">Aceptadas (En Documento)</span>
                    <div className="space-y-2">
                      {conclusions
                        .filter(c => c.status === "accepted")
                        .map((c) => (
                          <div key={c.id} className="border border-zinc-800/40 bg-zinc-950/20 p-2.5 rounded-lg flex items-start gap-2">
                            <div className="h-4 w-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mt-0.5 shrink-0">
                              <Check className="h-2.5 w-2.5" />
                            </div>
                            <p className="text-zinc-400 leading-normal">{c.text}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* WIDGET: DECISIONES (ADRs) */}
        <div className="border border-zinc-800 bg-zinc-950/40 rounded-xl p-5 backdrop-blur-sm flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-zinc-800/50 pb-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-400" />
              <h4 className="text-white font-semibold text-sm">Decisiones Tomadas</h4>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">{decisions.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {decisions.length === 0 ? (
              <p className="text-zinc-600 text-xs italic">Sin decisiones registradas.</p>
            ) : (
              decisions.map((dec) => (
                <div key={dec.id} className="border border-zinc-800 bg-black/40 p-3 rounded-lg text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-white truncate max-w-[80%]">{dec.title}</span>
                    <span className="text-[9px] font-mono bg-amber-500/10 text-amber-400 px-1.5 py-0.2 rounded border border-amber-500/10 uppercase">
                      {dec.status}
                    </span>
                  </div>
                  <p className="text-zinc-400 leading-tight">{dec.description}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* WIDGET: ROADMAP / BACKLOG */}
        <div className="border border-zinc-800 bg-zinc-950/40 rounded-xl p-5 backdrop-blur-sm flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-zinc-800/50 pb-2">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-purple-400" />
              <h4 className="text-white font-semibold text-sm">Tareas Técnicas</h4>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">{tasks.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {tasks.length === 0 ? (
              <p className="text-zinc-600 text-xs italic">Sin tareas técnicas pendientes.</p>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="flex items-start gap-2.5 border border-zinc-800/50 bg-black/20 p-2.5 rounded-lg text-xs">
                  <input
                    type="checkbox"
                    checked={task.status === "done"}
                    readOnly
                    className="mt-0.5 rounded border-zinc-800 text-purple-500 bg-black focus:ring-0 focus:ring-offset-0 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className={`text-zinc-300 font-medium block leading-tight truncate ${task.status === "done" ? "line-through text-zinc-600" : ""}`}>
                      {task.title}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase mt-0.5 block">BACKLOG</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
