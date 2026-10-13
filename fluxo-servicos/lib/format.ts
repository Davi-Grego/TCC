import type { StatusContratacao } from "@/lib/api/types";

export const formatarPreco = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const formatarData = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

export const STATUS_LABEL: Record<StatusContratacao, string> = {
  PENDENTE: "Aguardando resposta",
  ACEITA: "Aceita",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDA: "Concluída",
  CANCELADA: "Recusada / cancelada",
};