import { auth } from "@/lib/firebase/client";

export async function apiFetch<T = unknown>(
  path: string,
  init: { method?: string; body?: BodyInit | null; headers?: HeadersInit } = {}
): Promise<T> {
  const headers = new Headers(init.headers || {});
  
  if (typeof window !== "undefined") {
    // 1. Verifica se o simulador está ativo
    const simuladorId = localStorage.getItem("simulador_id");
    
    if (simuladorId) {
      headers.set("x-simulador-id", simuladorId);
      // Se quiser passar um token falso só por precaução de alguma biblioteca:
      headers.set("Authorization", "Bearer simulador-token"); 
    } else {
      // 2. Fluxo Normal: Pega o token real do Firebase
      const token = await auth.currentUser?.getIdToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    // Configura o Content-Type se tiver body
    if (
      typeof init.body === "string" &&
      !headers.has("Content-Type") &&
      init.method &&
      init.method !== "GET"
    ) {
      headers.set("Content-Type", "application/json");
    }
  }

  // AGORA SIM: Passa a variável 'headers' construída acima, sem sobrescrever
  const res = await fetch(path, {
    ...init,
    headers, 
  });
  
  const data = await res.json().catch(() => ({}));
  
  if (!res.ok) {
    throw new Error(data.error ?? data.mensagem ?? `Erro ${res.status}`);
  }
  
  return data as T;
}