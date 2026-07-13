"use client";

import { useEffect, useState } from "react";
import type { AgentMessage } from "@/types";

function safeJson(value: string) {
  try { return JSON.parse(value); } catch { return null; }
}

export default function ProgressClient() {
  const [items, setItems] = useState<AgentMessage[]>([]);

  useEffect(() => {
    const handler = (event: StorageEvent) => {
      if (event.key !== "war-room-store-v1") return;
      const payload = event.newValue ? safeJson(event.newValue) : null;
      if (!payload) return;
      setItems(payload.messages ?? []);
    };

    const init = () => {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem("war-room-store-v1") : null;
      if (!raw) return;
      const payload = safeJson(raw);
      if (!payload) return;
      setItems(payload.messages ?? []);
    };

    init();
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  if (items.length === 0) return null;

  const latest = items[items.length - 1];

  return (
    <div className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 pt-3 sm:px-6">
        <div className="rounded-2xl bg-surface px-4 py-3 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-xs text-muted">
                <span className="text-white">{latest.agent ?? "Sistema"}</span>
                <span className="ml-2 text-muted">{new Date(latest.createdAt).toLocaleTimeString("es-ES")}</span>
              </p>
              <p className="mt-1 truncate text-sm text-white">{latest.content}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
