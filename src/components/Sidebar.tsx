"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ArrowLeftRight, PiggyBank, Settings } from "lucide-react";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transacciones", label: "Transacciones", icon: ArrowLeftRight },
  { href: "/ajustes", label: "Ajustes", icon: Settings },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <>
      {/* ── DESKTOP: sidebar izquierdo (oculto en móvil) ── */}
      <aside className="hidden md:flex w-56 min-h-screen bg-gray-900 text-white flex-col shrink-0">
        <div className="flex items-center gap-2 px-5 py-6 border-b border-gray-700">
          <PiggyBank size={24} className="text-emerald-400" />
          <span className="font-bold text-lg">Mis Finanzas</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                path === href
                  ? "bg-emerald-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="px-5 py-4 text-xs text-gray-500 border-t border-gray-700">
          Sincronizado con GitHub
        </div>
      </aside>

      {/* ── MÓVIL: barra superior con título + nav inferior ── */}
      {/* Top bar con nombre de la app */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900 text-white flex items-center gap-2 px-4 py-3 border-b border-gray-700">
        <PiggyBank size={20} className="text-emerald-400" />
        <span className="font-bold text-base">Mis Finanzas</span>
      </header>

      {/* Bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-900 border-t border-gray-700 flex">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors ${
              path === href
                ? "text-emerald-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
