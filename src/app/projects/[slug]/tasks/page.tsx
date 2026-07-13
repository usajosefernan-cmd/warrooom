"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { CheckSquare, ListTodo, Plus, Calendar, Compass, ArrowRight, X } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  createdAt: string;
}

export default function TasksPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [projectId, setProjectId] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");

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
        fetchTasks(projectData.id);
      }
    } catch (error) {
      console.error("Error loading project:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}/details`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  const handleToggleTaskStatus = async (taskId: string, currentStatus: Task["status"]) => {
    const newStatus: Task["status"] = currentStatus === "done" ? "todo" : "done";
    const updatedTasks = tasks.map((t) => 
      t.id === taskId ? { ...t, status: newStatus } : t
    );

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: updatedTasks })
      });

      if (res.ok) {
        setTasks(updatedTasks);
      }
    } catch (error) {
      console.error("Error toggling task status:", error);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask: Task = {
      id: Math.random().toString(36).substring(2, 11),
      title,
      status: "todo",
      priority,
      createdAt: new Date().toISOString()
    };

    const updatedTasks = [...tasks, newTask];

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: updatedTasks })
      });

      if (res.ok) {
        setTasks(updatedTasks);
        setTitle("");
        setPriority("medium");
        setIsFormOpen(false);
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const updatedTasks = tasks.filter((t) => t.id !== taskId);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: updatedTasks })
      });

      if (res.ok) {
        setTasks(updatedTasks);
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Agrupar tareas en fases simuladas del roadmap
  const doneTasks = tasks.filter(t => t.status === "done");
  const todoTasks = tasks.filter(t => t.status !== "done");

  return (
    <div className="space-y-8">
      <div className="border-b border-zinc-800 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-purple-400" />
            Tareas Técnicas y Backlog
          </h1>
          <p className="text-sm text-zinc-400">Implementa y sigue el avance de las tareas técnicas formuladas por los agentes.</p>
        </div>

        {!loading && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition-all shadow-md shadow-purple-600/10"
          >
            <Plus className="h-3.5 w-3.5" />
            Crear Tarea
          </button>
        )}
      </div>

      {isFormOpen && (
        <form 
          onSubmit={handleAddTask}
          className="border border-zinc-800 bg-zinc-950/40 rounded-xl p-5 space-y-4 animate-in slide-in-from-top-2 duration-250"
        >
          <div className="flex items-center justify-between border-b border-zinc-850 pb-2 mb-2">
            <span className="text-xs font-bold text-white">Nueva Tarea en Backlog</span>
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
              <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Título de la Tarea</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Configurar base de datos en Supabase"
                className="w-full px-3 py-2 bg-black border border-zinc-800 hover:border-zinc-700 focus:border-purple-500 rounded-lg text-xs text-white focus:outline-none transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Prioridad</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Task["priority"])}
                className="w-full px-3 py-2 bg-black border border-zinc-800 hover:border-zinc-700 focus:border-purple-500 rounded-lg text-xs text-zinc-300 focus:outline-none transition-colors"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
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
              Crear Tarea
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="h-8 w-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-zinc-500 text-xs font-mono">Cargando backlog...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Backlog Pendiente */}
          <div className="lg:col-span-2 border border-zinc-800 bg-zinc-950/20 rounded-xl p-5 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3 mb-2">
              <span className="font-semibold text-white text-sm flex items-center gap-2">
                <ListTodo className="h-4.5 w-4.5 text-purple-400" />
                Backlog Activo
              </span>
              <span className="text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-500 px-2 py-0.5 rounded">
                {todoTasks.length} Tareas
              </span>
            </div>

            {todoTasks.length === 0 ? (
              <p className="text-zinc-500 text-xs italic py-6 text-center">Sin tareas pendientes en el backlog.</p>
            ) : (
              <div className="space-y-2">
                {todoTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="border border-zinc-800/60 bg-black/40 p-3 rounded-lg flex items-center justify-between group relative"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={task.status === "done"}
                        onChange={() => handleToggleTaskStatus(task.id, task.status)}
                        className="rounded border-zinc-800 text-purple-500 bg-black focus:ring-0 focus:ring-offset-0 h-4 w-4 shrink-0 cursor-pointer"
                      />
                      <div className="min-w-0">
                        <span className="text-xs text-zinc-200 font-medium block truncate pr-8">{task.title}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-mono text-zinc-500 uppercase">ID: {task.id}</span>
                          <span className={`text-[8px] font-mono uppercase px-1 rounded ${
                            task.priority === "high"
                              ? "bg-rose-500/10 text-rose-400"
                              : task.priority === "medium"
                              ? "bg-purple-500/10 text-purple-400"
                              : "bg-zinc-800 text-zinc-400"
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-zinc-650 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historial y Fases del Roadmap */}
          <div className="space-y-6">
            {/* Tareas Completadas */}
            <div className="border border-zinc-800 bg-zinc-950/20 rounded-xl p-5 backdrop-blur-sm space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3 mb-2">
                <span className="font-semibold text-white text-sm">Completadas</span>
                <span className="text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-500 px-2 py-0.5 rounded">
                  {doneTasks.length} Tareas
                </span>
              </div>

              {doneTasks.length === 0 ? (
                <p className="text-zinc-500 text-xs italic py-6 text-center">No hay tareas completadas todavía.</p>
              ) : (
                <div className="space-y-2">
                  {doneTasks.map((task) => (
                    <div 
                      key={task.id} 
                      className="border border-zinc-900 bg-zinc-950/30 p-2.5 rounded-lg flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={task.status === "done"}
                          onChange={() => handleToggleTaskStatus(task.id, task.status)}
                          className="rounded border-zinc-900 text-zinc-550 bg-black focus:ring-0 focus:ring-offset-0 h-3.5 w-3.5 shrink-0 cursor-pointer"
                        />
                        <span className="text-xs text-zinc-500 line-through truncate pr-6">{task.title}</span>
                      </div>
                      
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-zinc-700 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Roadmap Conceptual */}
            <div className="border border-zinc-800 bg-zinc-950/20 rounded-xl p-5 backdrop-blur-sm space-y-4">
              <span className="font-semibold text-white text-sm flex items-center gap-2 border-b border-zinc-800/60 pb-3 mb-2">
                <Compass className="h-4.5 w-4.5 text-indigo-400" />
                Fases de Desarrollo
              </span>

              <div className="space-y-4 text-xs font-sans">
                <div className="relative pl-6 border-l border-zinc-800 pb-2">
                  <div className="absolute left-[-4.5px] top-1.5 h-2 w-2 rounded-full bg-purple-500 glow-purple" />
                  <h4 className="font-bold text-white mb-0.5">Fase 1: MVP</h4>
                  <p className="text-zinc-500 leading-tight">Configuración del esqueleto, diseño de la base y validación inicial de los agentes.</p>
                </div>
                
                <div className="relative pl-6 border-l border-zinc-800 pb-2">
                  <div className="absolute left-[-4.5px] top-1.5 h-2 w-2 rounded-full bg-indigo-500" />
                  <h4 className="font-bold text-white mb-0.5">Fase 2: Conectividad</h4>
                  <p className="text-zinc-500 leading-tight">Integración de APIs reales de IA, auditoría de logs y sincronización con storage.</p>
                </div>

                <div className="relative pl-6">
                  <div className="absolute left-[-4.5px] top-1.5 h-2 w-2 rounded-full bg-zinc-800" />
                  <h4 className="font-bold text-zinc-500 mb-0.5">Fase 3: Escalamiento</h4>
                  <p className="text-zinc-650 leading-tight">Autenticación, persistencia en Supabase/PostgreSQL y despliegue a producción.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
