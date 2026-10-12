"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { Sidebar } from "@/components/Sidebar";

// Todas as páginas dentro de (app) passam por aqui: sem sessão, volta pro login.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { usuario, carregando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!carregando && !usuario) router.replace("/login");
  }, [carregando, usuario, router]);

  if (carregando || !usuario) return null;

  return (
    <div className="flex min-h-screen bg-[#f7f8fc] font-mono">
      <Sidebar usuario={usuario} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}