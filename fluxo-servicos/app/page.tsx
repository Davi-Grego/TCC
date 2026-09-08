"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/AuthProvider";

export default function Home() {
  const { usuario, carregando, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!carregando && !usuario) {
      router.push("/login");
    }
  }, [carregando, usuario, router]);

  if (carregando || !usuario) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f7f8fc] p-8 font-mono">
      <h1 className="text-2xl font-medium text-[#010300]">Fluxo Serviços</h1>
      <p className="text-sm text-[#314c53]">
        Logado como {usuario.nome} <span className="text-[#5a7f78]">· {usuario.papel.toLowerCase()}</span>
      </p>
      <button
        onClick={logout}
        className="mt-2 rounded-md border border-[#314c53]/20 px-4 py-2 text-sm text-[#010300] transition hover:border-[#5a7f78] hover:bg-[#bbdec6]/15"
      >
        Sair
      </button>
    </main>
  );
}