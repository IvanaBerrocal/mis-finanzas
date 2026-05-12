import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Mis Finanzas",
  description: "Gestiona tu salud financiera personal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="flex min-h-screen bg-gray-50">
        <Sidebar />
        {/*
          En móvil: pt-12 (top bar ~48px) + pb-16 (bottom nav ~64px)
          En desktop: sin padding extra, el sidebar ocupa el lado izquierdo
        */}
        <main className="flex-1 overflow-auto pt-12 pb-16 md:pt-0 md:pb-0">
          {children}
        </main>
      </body>
    </html>
  );
}
