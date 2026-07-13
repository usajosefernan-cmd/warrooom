"use client";

import { useState, useEffect } from "react";
import { Sparkles, ArrowLeft, ShieldAlert, Cpu, Check, AlertCircle } from "lucide-react";
import Link from "next/link";

interface ProviderInfo {
  active: boolean;
  model: string;
}

interface ProviderStatus {
  providers: Record<string, ProviderInfo>;
  defaultProvider: string;
}

export default function SettingsPage() {
  const [status, setStatus] = useState<ProviderStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/providers/status");
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (error) {
      console.error("Error loading API status:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-zinc-800 bg-black/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            VOLVER AL DASHBOARD
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="font-semibold text-white text-sm">CONFIGURACIÓN DEL SISTEMA</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Configuración e Integraciones</h1>
          <p className="text-zinc-400 text-sm">Audita las variables de entorno de tu servidor y comprueba la conectividad de los modelos de lenguaje.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="h-8 w-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            <p className="text-zinc-500 text-xs font-mono">Verificando conectores API...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Seguridad alerta */}
            <div className="border border-amber-500/20 bg-amber-950/10 rounded-xl p-5 flex items-start gap-4">
              <ShieldAlert className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-amber-300 font-semibold text-sm mb-1">Notas de Seguridad Críticas</h4>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Las claves de API están configuradas de forma segura a nivel de servidor utilizando variables de entorno. Las peticiones a los modelos se procesan en el backend (Next.js Server Side), impidiendo filtraciones o acceso público desde el frontend.
                </p>
              </div>
            </div>

            {/* Proveedores status */}
            <div className="border border-zinc-800 bg-zinc-950/40 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-6">
                <Cpu className="h-5 w-5 text-purple-400" />
                <h3 className="font-semibold text-white text-base">Estado de Proveedores de IA</h3>
              </div>

              <div className="space-y-4">
                {status && Object.entries(status.providers).map(([providerKey, info]) => (
                  <div 
                    key={providerKey} 
                    className="border border-zinc-800/60 bg-black/30 rounded-lg p-4 flex items-center justify-between text-sm"
                  >
                    <div>
                      <span className="font-bold text-white capitalize block mb-0.5">{providerKey}</span>
                      <span className="text-xs text-zinc-500 font-mono">Modelo por defecto: {info.model}</span>
                    </div>

                    <div>
                      {info.active ? (
                        <span className="flex items-center gap-1.5 text-xs font-mono bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded border border-emerald-500/20">
                          <Check className="h-3.5 w-3.5" />
                          ACTIVO
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-mono bg-zinc-900 text-zinc-500 px-3 py-1 rounded border border-zinc-800">
                          <AlertCircle className="h-3.5 w-3.5" />
                          INACTIVO
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-zinc-800 mt-6 pt-6 flex items-center justify-between text-xs text-zinc-500 font-mono">
                <span>PROVEEDOR PREDETERMINADO:</span>
                <span className="text-purple-400 font-bold uppercase">{status?.defaultProvider}</span>
              </div>
            </div>

            {/* Documentacion variables */}
            <div className="border border-zinc-800 bg-zinc-950/20 rounded-xl p-6">
              <h4 className="text-white font-semibold text-sm mb-3">Variables de Entorno Admitidas (.env.local)</h4>
              <div className="bg-black border border-zinc-800 p-4 rounded-lg font-mono text-xs text-zinc-400 space-y-1.5 overflow-x-auto">
                <p><span className="text-purple-400">OPENROUTER_API_KEY</span>=tu_clave_aquí</p>
                <p><span className="text-purple-400">ANTHROPIC_API_KEY</span>=tu_clave_aquí</p>
                <p><span className="text-purple-400">GEMINI_API_KEY</span>=tu_clave_aquí</p>
                <p><span className="text-purple-400">AI_DEFAULT_PROVIDER</span>=openrouter <span className="text-zinc-600"># openrouter | anthropic | mock</span></p>
                <p><span className="text-purple-400">AI_MODEL_ORCHESTRATOR</span>=meta-llama/llama-3-8b-instruct:free</p>
                <p><span className="text-purple-400">AI_MODEL_FAST</span>=google/gemma-2-9b-it:free</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
