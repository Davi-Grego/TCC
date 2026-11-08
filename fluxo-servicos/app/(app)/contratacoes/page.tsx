"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api/client";
import type { Contratacao, StatusContratacao } from "@/lib/api/types";
import { ContratacaoCard } from "@/components/ContratacaoCard";
import ContratacaoActions from "@/components/ContratacaoActions";
import { useAuth } from "@/lib/firebase/AuthProvider";

const EM_ANDAMENTO: StatusContratacao[] = ["PENDENTE", "ACEITA", "EM_ANDAMENTO"];
const HISTORICO: StatusContratacao[] = ["CONCLUIDA", "CANCELADA"];
const TAMANHO_PAGINA = 20;

export default function ContratacoesPage() {
  const { usuario, carregando: carregandoAuth } = useAuth();
  const [contratacoes, setContratacoes] = useState<Contratacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      const todas: Contratacao[] = [];
      let pagina = 1;
      let itensDaPagina: Contratacao[];

      do {
        const resposta = await apiFetch<{ contratacoes: Contratacao[] }>(
          `/api/contratacoes?papel=contratante&page=${pagina}`,
        );
        itensDaPagina = resposta.contratacoes;
        todas.push(...itensDaPagina);
        pagina += 1;
      } while (itensDaPagina.length === TAMANHO_PAGINA);

      setContratacoes(todas);
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Não foi possível carregar suas contratações.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (!carregandoAuth && usuario) {
      void Promise.resolve().then(carregarDados);
    }
  }, [carregandoAuth, usuario, carregarDados]);

  const emAndamento = contratacoes.filter((c) => EM_ANDAMENTO.includes(c.status));
  const historico = contratacoes.filter((c) => HISTORICO.includes(c.status));

  if (carregandoAuth) {
    return <main className="mx-auto max-w-4xl px-8 py-10 text-sm text-[#314c53]/60">Carregando...</main>;
  }
  if (!usuario) return null;

  return (
    <main className="mx-auto max-w-4xl px-8 py-10">
      <header>
        <h1 className="text-2xl font-medium text-[#010300]">Contratações</h1>
        <p className="mt-1 text-sm text-[#314c53]/70">Serviços que você contratou</p>
      </header>

      {erro && <p role="alert" className="mt-6 text-sm text-red-700">{erro}</p>}

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
                  <Link
                    href="/discover"
                    className="underline underline-offset-2 hover:text-[#010300]"
                  >
                    Explorar serviços
                  </Link>
                </p>
              ) : (
                emAndamento.map((c) => (
                  <div key={c.id} className="rounded-md border border-[#314c53]/10 bg-white p-4">
                    <ContratacaoCard contratacao={c} />
                    <ContratacaoActions
                      contratacao={c}
                      usuarioAtualId={usuario.id}
                      onUpdate={() => void carregarDados()}
                    />
                  </div>
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
                  <div key={c.id} className="rounded-md border border-[#314c53]/10 bg-white p-4">
                    <ContratacaoCard contratacao={c} />
                    <ContratacaoActions
                      contratacao={c}
                      usuarioAtualId={usuario.id}
                      onUpdate={() => void carregarDados()}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}