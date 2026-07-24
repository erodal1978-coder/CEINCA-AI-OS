import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "IG Viral Tracker",
  description: "Detecta posts virales y recrealos con IA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={cn("dark font-sans", geist.variable)}>
      <body className="min-h-screen">
        <nav className="border-b border-gray-800 px-6 py-4">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <h1 className="text-xl font-bold text-brand-500">IG Viral Tracker</h1>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="/" className="hover:text-white">Dashboard</a>
              <a href="/accounts" className="hover:text-white">Cuentas</a>
              <a href="/virals" className="hover:text-white">Virales</a>
              <a href="/recreations" className="hover:text-white">Recreaciones</a>
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
