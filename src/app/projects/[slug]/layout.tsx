"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { 
  Sparkles, 
  MessageSquare, 
  FileText, 
  CheckSquare, 
  Lightbulb, 
  BookOpen, 
  Download, 
  Settings, 
  ArrowLeft,
  ChevronRight,
  TrendingUp
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const slug = params?.slug as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

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
      }
    } catch (error) {
      console.error("Error fetching project metadata:", error);
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { name: "War Room / Debate", href: `/projects/${slug}/war-room`, icon: MessageSquare },
    { name: "Documentos Vivos", href: `/projects/${slug}/documents`, icon: FileText },
    { name: "Decisiones (ADRs)", href: `/projects/${slug}/decisions`, icon: Lightbulb },
    { name: "Hipótesis", href: `/projects/${slug}/hypotheses`, icon: TrendingUp },
    { name: "Fuentes / Evidencias", href: `/projects/${slug}/sources`, icon: BookOpen },
    { name: "Tareas y Roadmap", href: `/projects/${slug}/tasks`, icon: CheckSquare },
    { name: "Exportar Proyecto", href: `/projects/${slug}/exports`, icon: Download },
  ];

  return (
    <div className="flex min-h-screen bg-black text-zinc-100 relative overflow-hidden">
      {/* Background radial overlay */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-purple-950/5 blur-[120px] pointer-events-none" />
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-950/60 backdrop-blur-md flex flex-col justify-between sticky top-0 h-screen z-30">
        <div>
          {/* Logo y back */}
          <div className="p-6 border-b border-zinc-800 flex flex-col gap-4">
            <Link 
              href="/dashboard"
              className="flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              VOLVER AL DASHBOARD
            </Link>
            
            {loading ? (
              <div className="h-6 w-32 bg-zinc-900 rounded animate-pulse" />
            ) : project ? (
              <div>
                <h2 className="font-bold text-white text-lg tracking-tight truncate">{project.name}</h2>
                <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest">PROYECTO ACTIVO</span>
              </div>
            ) : (
              <div className="text-red-400 text-xs">Error de carga</div>
            )}
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                    isActive 
                      ? "bg-purple-600/10 border border-purple-500/20 text-purple-300"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? "text-purple-400" : "text-zinc-500 group-hover:text-zinc-400"}`} />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className={`h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? "opacity-100 text-purple-400" : "text-zinc-600"}`} />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-zinc-800 space-y-3">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 transition-colors w-full"
          >
            <Settings className="h-4 w-4 text-zinc-500" />
            <span>Configuración API</span>
          </Link>
          <div className="px-3 py-1 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono text-zinc-500">CONECTADO AL MOTOR</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
