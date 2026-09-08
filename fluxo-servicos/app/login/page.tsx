"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { LoginButton } from "@/components/LoginButton";


export default function LoginPage() {
  const { usuario, carregando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!carregando && usuario) {
      router.push("/");
    }
  }, [carregando, usuario, router]);

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#010300] to-[#314c53] p-10 md:flex md:flex-col md:justify-between">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(#f7f8fc 1px, transparent 1px), linear-gradient(90deg, #f7f8fc 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <span className="relative font-mono text-sm text-[#f7f8fc]">Fluxo</span>

        <div className="relative max-w-sm">
          <h1 className="font-mono text-4xl font-medium leading-tight text-[#f7f8fc]">
            Encontre quem resolve.
            <br />
            Ofereça o que você faz melhor.
          </h1>
          <p className="mt-4 font-mono text-sm text-[#bbdec6]">
            Contratantes e prestadores, no mesmo lugar.
          </p>
        </div>

        <span className="relative font-mono text-xs text-[#f7f8fc]/40">
          © 2026 Fluxo Serviços
        </span>
      </div>

      <div className="flex items-center justify-center bg-[#f7f8fc] p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 h-0.5 w-10 bg-[#5a7f78]" />
          <h2 className="font-mono text-2xl font-medium text-[#010300]">
            Entrar na sua conta
          </h2>
          <p className="mt-2 font-mono text-sm text-[#314c53]/70">
            Use sua conta Google pra continuar.
          </p>

          <div className="mt-8">
            <LoginButton />
          </div>

          <p className="mt-6 font-mono text-xs text-[#314c53]/60">
            Ainda não tem conta? Criamos uma automaticamente no seu primeiro
            acesso.
          </p>
        </div>
      </div>
    </div>
  );
}