import { auth } from "@/lib/firebase/client";

export async function apiFetchArquivo(path: string): Promise<Blob> {
  const headers = new Headers();

  if (typeof window !== "undefined") {
    const simuladorId = localStorage.getItem("simulador_id");
    if (simuladorId) {
      headers.set("x-simulador-id", simuladorId);
      headers.set("Authorization", "Bearer simulador");
    } else {
      const token = await auth.currentUser?.getIdToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const res = await fetch(path, { headers });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? data.mensagem ?? `Erro ${res.status}`);
  }
  return res.blob();
}
