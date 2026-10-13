"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api/client";
import type { Contratacao, StatusContratacao } from "@/lib/api/types";
import { ContratacaoCard } from "@/components/ContratacaoCard";

const EM_ANDAMENTO: StatusContratacao[] = ["PENDENTE", "ACEITA", "EM_ANDAMENTO"];
const HISTORICO: StatusContratacao[] = ["CONCLUIDA", "CANCELADA"];

// Painel do contratante: serviços que eu contratei
export default function ContratacoesPage() {
  const [contratacoes, setContratacoes] = useState<Contratacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [cancelandoId, setCancelandoId] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ contratacoes: Contratacao[] }>("/api/contratacoes?papel=contratante")
      .then((d) => setContratacoes(d.contratacoes))
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  async function cancelar(c: Contratacao) {
    if (!confirm("Cancelar essa solicitação?")) return;
    setErro(null);
    setCancelandoId(c.id);
    try {
      const data = await apiFetch<{ contratacao: Contratacao }>(`/api/contratacoes/${c.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "CANCELADA" }),
      });
      setContratacoes((prev) => prev.map((x) => (x.id === c.id ? data.contratacao : x)));
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao cancelar");
    } finally {
      setCancelandoId(null);
    }
  }

  const emAndamento = contratacoes.filter((c) => EM_ANDAMENTO.includes(c.status));
  const historico = contratacoes.filter((c) => HISTORICO.includes(c.status));

  return (
    <main className="mx-auto max-w-4xl px-8 py-10">
      <header>
        <h1 className="text-2xl font-medium text-[#010300]">Contratações</h1>
        <p className="mt-1 text-sm text-[#314c53]/70">Serviços que você contratou</p>
      </header>

      {erro && <p className="mt-6 text-sm text-[#314c53]">{erro}</p>}

      {carregando ? (
        <p className="mt-10 text-sm text-[#314c53]/60">Carregando...</p>
      ) : (
        <>
          <section className="mt-8">
            <h2 className="text-sm font-medium uppercase tracking-wide text-[#314c53]/60">
              Em andamento
            </h2>
            <div className="mt-4 flex flex-col gap-4">
              {emAndamento.length === 0 ? (
                <p className="text-sm text-[#314c53]/60">
                  Nenhum serviço em andamento.{" "}
                  <Link href="/discover" className="underline underline-offset-2 hover:text-[#010300]">
                    Explorar serviços
                  </Link>
                </p>
              ) : (
                emAndamento.map((c) => (
                  <ContratacaoCard
                    key={c.id}
                    contratacao={c}
                    onCancelar={() => cancelar(c)}
                    cancelando={cancelandoId === c.id}
                  />
                ))
              )}
            </div>
          </section>

          {historico.length > 0 && (
            <section className="mt-12">
              <h2 className="text-sm font-medium uppercase tracking-wide text-[#314c53]/60">
                Histórico
              </h2>
              <div className="mt-4 flex flex-col gap-4">
                {historico.map((c) => (
                  <ContratacaoCard key={c.id} contratacao={c} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}