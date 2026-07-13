"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects/new", label: "Nuevo proyecto" },
  { href: "/settings", label: "Ajustes" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40">
      <div className="glass">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white">AI</span>
              <div>
                <p className="text-sm font-semibold text-white">War Room</p>
                <p className="text-xs text-muted">Laboratorio de ideas y debate IA</p>
              </div>
            </div>

            <nav className="hidden items-center gap-1 md:flex">
              {items.map((item) => {
                const isActive = pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-lg px-3 py-1.5 text-sm transition ${
                      isActive
                        ? "bg-white/[0.07] text-white"
                        : "text-muted hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <span className="badge">
                <span className="inline-flex h-2 w-2 rounded-full bg-success" />
                Mock mode
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
