import { auth } from "@/lib/firebase/client";

// Chama a API já com o token do Firebase no header.
export async function apiFetch<T = unknown>(
  path: string,
  init: { method?: string; body?: string } = {}
): Promise<T> {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token ?? ""}`,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `Erro ${res.status}`);
  return data as T;
}