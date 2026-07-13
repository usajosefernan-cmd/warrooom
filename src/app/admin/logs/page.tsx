"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Clock, DollarSign, Activity, FileText } from "lucide-react";
import Link from "next/link";

interface AILog {
  id: string;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  estimatedCost: number;
  latencyMs: number;
  timestamp: string;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AILog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (error) {
      console.error("Error loading logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalCost = logs.reduce((acc, log) => acc + log.estimatedCost, 0);
  const avgLatency = logs.length > 0 
    ? Math.round(logs.reduce((acc, log) => acc + log.latencyMs, 0) / logs.length)
    : 0;

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-zinc-800 bg-black/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            VOLVER AL DASHBOARD
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white text-sm font-mono text-zinc-400">ADMIN CONTROL / LOGS</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 z-10 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Auditoría de Llamadas IA</h1>
          <p className="text-zinc-400 text-sm">Monitorea el consumo, latencias y coste estimado de las ejecuciones del comité.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="border border-zinc-800 bg-zinc-950/40 rounded-xl p-5 backdrop-blur-sm flex items-center gap-4">
            <div className="h-10 w-10 bg-purple-600/10 text-purple-400 rounded-lg flex items-center justify-center border border-purple-500/20">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Total Consultas</span>
              <span className="text-xl font-bold text-white mt-0.5 block">{logs.length}</span>
            </div>
          </div>

          <div className="border border-zinc-800 bg-zinc-950/40 rounded-xl p-5 backdrop-blur-sm flex items-center gap-4">
            <div className="h-10 w-10 bg-emerald-600/10 text-emerald-400 rounded-lg flex items-center justify-center border border-emerald-500/20">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Coste Acumulado</span>
              <span className="text-xl font-bold text-emerald-400 mt-0.5 block">${totalCost.toFixed(5)}</span>
            </div>
          </div>

          <div className="border border-zinc-800 bg-zinc-950/40 rounded-xl p-5 backdrop-blur-sm flex items-center gap-4">
            <div className="h-10 w-10 bg-blue-600/10 text-blue-400 rounded-lg flex items-center justify-center border border-blue-500/20">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Latencia Media</span>
              <span className="text-xl font-bold text-white mt-0.5 block">{avgLatency} ms</span>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="border border-zinc-800 bg-zinc-950/20 rounded-xl overflow-hidden backdrop-blur-sm">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="h-8 w-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              <p className="text-zinc-500 text-xs font-mono">Cargando registros...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-20 text-center text-zinc-500 text-sm italic">
              No hay logs registrados en este entorno.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-800 text-left text-xs text-zinc-400">
                <thead className="bg-zinc-950 text-[10px] uppercase font-mono text-zinc-500 tracking-wider">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Proveedor</th>
                    <th className="px-6 py-4">Modelo</th>
                    <th className="px-6 py-4">Tokens (I/O)</th>
                    <th className="px-6 py-4">Latencia</th>
                    <th className="px-6 py-4">Coste Est.</th>
                    <th className="px-6 py-4 text-right">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 bg-transparent">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-zinc-500">{log.id}</td>
                      <td className="px-6 py-4 capitalize font-semibold text-white">{log.provider}</td>
                      <td className="px-6 py-4 font-mono">{log.model}</td>
                      <td className="px-6 py-4 font-mono">
                        {log.promptTokens} / {log.completionTokens}
                      </td>
                      <td className="px-6 py-4 font-mono">{log.latencyMs} ms</td>
                      <td className="px-6 py-4 font-mono text-emerald-400">
                        {log.estimatedCost > 0 ? `$${log.estimatedCost.toFixed(5)}` : "$0.00"}
                      </td>
                      <td className="px-6 py-4 text-right text-zinc-500">
                        {new Date(log.timestamp).toLocaleString("es-ES")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
