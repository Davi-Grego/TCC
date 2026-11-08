"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

type Usuario = {
  id: string;
  nome: string;
  email: string;
  papel: string;
};

type AuthContextType = {
  usuario: Usuario | null;
  carregando: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  usuario: null,
  carregando: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // MÁGICA DO SIMULADOR
    const simuladorId = localStorage.getItem("simulador_id");
    const simuladorData = localStorage.getItem("simulador_usuario");

    if (simuladorId && simuladorData) {
    // Pula o Firebase e injeta o usuário falso direto no estado global!
    setUsuario(JSON.parse(simuladorData));
    setCarregando(false);
    return;
    }
    // Roda toda vez que o Firebase confirma login/logout, inclusive
    // ao recarregar a página (ele restaura a sessão salva localmente).
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUsuario(null);
        setCarregando(false);
        return;
      }

      try {
        const token = await firebaseUser.getIdToken();
        const res = await fetch("/api/auth/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        setUsuario(res.ok ? data.usuario : null);
      } catch (err) {
        console.error(err);
        setUsuario(null);
      } finally {
        setCarregando(false);
      }
    });

    return () => unsubscribe();
  }, []);

  async function logout() {
    localStorage.removeItem("simulador_id");
    localStorage.removeItem("simulador_usuario");
    setUsuario(null);
    await signOut(auth);
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}