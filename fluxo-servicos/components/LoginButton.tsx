"use client";

import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase/client";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.68-3.87 2.68-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.95 10.7a5.4 5.4 0 0 1 0-3.4V4.97H.98a9 9 0 0 0 0 8.06l2.97-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.42 0 9 0A9 9 0 0 0 .98 4.97l2.97 2.33C4.66 5.17 6.65 3.58 9 3.58Z" />
    </svg>
  );
}

export function LoginButton() {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleLogin() {
    setLoading(true);
    setErro(null);
    try {
      await signInWithPopup(auth, googleProvider);
      // O AuthProvider escuta onAuthStateChanged e sincroniza sozinho.
      // (deixa loading=true até o redirect acontecer)
    } catch (err) {
      console.error(err);
      setErro("Não deu pra entrar. Tenta de novo.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleLogin}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-md border border-[#314c53]/20 bg-white px-4 py-3 font-mono text-sm font-medium text-[#010300] transition hover:border-[#5a7f78] hover:bg-[#bbdec6]/15 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <GoogleIcon />
        {loading ? "Entrando..." : "Entrar com Google"}
      </button>
      {erro && <p className="mt-2 font-mono text-sm text-[#314c53]">{erro}</p>}
    </div>
  );
}