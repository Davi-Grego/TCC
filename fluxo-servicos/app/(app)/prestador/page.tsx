"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import type { Contratacao } from "@/lib/api/types";
import ContratacaoActions from "@/components/ContratacaoActions";
import { useAuth } from "@/lib/firebase/AuthProvider";

const TAMANHO_PAGINA = 20;

function mesAtual() {
  const agora = new Date();
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}`;
}

function formatarMesSelecionado(valor: string) {
  const [ano, mes] = valor.split("-").map(Number);
  if (!ano || !mes) return "";
  const data = new Date(ano, mes - 1, 1);
  const mesFormatado = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(data);
  return mesFormatado.charAt(0).toLocaleUpperCase("pt-BR") + mesFormatado.slice(1);
}

const NOMES_MESES = Array.from({ length: 12 }, (_, indice) =>
  new Intl.DateTimeFormat("pt-BR", { month: "long" })
    .format(new Date(2026, indice, 1))
    .replace(/^./, (letra) => letra.toLocaleUpperCase("pt-BR")),
);

function mesDaData(valor: string | null) {
  if (!valor) return "";
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return "";
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
}

function formatarData(valor: string | null) {
  if (!valor) return "Data não informada";
  const data = new Date(valor);
  return Number.isNaN(data.getTime())
    ? "Data não informada"
    : data.toLocaleDateString("pt-BR");
}

function formatarPreco(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function PrestadorPage() {
  const { usuario } = useAuth();
  const [contratacoes, setContratacoes] = useState<Contratacao[]>([]);
  const [mesSelecionado, setMesSelecionado] = useState(mesAtual);
  const [seletorMesAberto, setSeletorMesAberto] = useState(false);
  const [anoExibido, setAnoExibido] = useState(() => new Date().getFullYear());
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const todas: Contratacao[] = [];
      let pagina = 1;
      let paginaAtual: Contratacao[];

      do {
        const resposta = await apiFetch<{ contratacoes: Contratacao[] }>(
          `/api/contratacoes?papel=contratado&page=${pagina}`,
        );
        paginaAtual = resposta.contratacoes;
        todas.push(...paginaAtual);
        pagina += 1;
      } while (paginaAtual.length === TAMANHO_PAGINA);

      setContratacoes(todas);
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Não foi possível carregar os serviços.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(carregarDados);
  }, [carregarDados]);

  const dadosDoMes = useMemo(
    () =>
      contratacoes.filter((contratacao) => {
        const data = contratacao.status === "CONCLUIDA"
          ? contratacao.concluidoEm ?? contratacao.criadoEm
          : contratacao.criadoEm;
        return mesDaData(data) === mesSelecionado;
      }),
    [contratacoes, mesSelecionado],
  );
  const concluidasDoMes = dadosDoMes.filter((contratacao) => contratacao.status === "CONCLUIDA");
  const canceladasDoMes = dadosDoMes.filter((contratacao) => contratacao.status === "CANCELADA");
  const canceladas = contratacoes.filter((contratacao) => contratacao.status === "CANCELADA");
  const emAndamento = contratacoes.filter((contratacao) =>
    ["PENDENTE", "ACEITA", "EM_ANDAMENTO"].includes(contratacao.status),
  );
  const nomeMesSelecionado = formatarMesSelecionado(mesSelecionado);
  const faturamentoDoMes = concluidasDoMes.reduce(
    (total, contratacao) => total + contratacao.servico.preco,
    0,
  );

  if (!usuario) return null;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium text-[#010300]">Painel do prestador</h1>
          <p className="mt-1 text-sm text-[#314c53]/70">
            Acompanhe seus serviços, resultados e avaliações.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="relative flex flex-col gap-1 text-xs font-medium text-[#314c53]/70">
            Mês de referência
            <button
              type="button"
              aria-label={`Selecionar mês de referência: ${nomeMesSelecionado}`}
              aria-expanded={seletorMesAberto}
              aria-haspopup="dialog"
              aria-controls="seletor-mes"
              onClick={() => {
                const [ano] = mesSelecionado.split("-").map(Number);
                setAnoExibido(ano);
                setSeletorMesAberto((aberto) => !aberto);
              }}
              className="flex h-10 min-w-56 items-center justify-between rounded-md border border-[#314c53]/20 bg-white px-3 text-left text-sm font-normal text-[#010300] shadow-sm transition hover:bg-[#f2f7f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#314c53]/30"
            >
              <span>{nomeMesSelecionado}</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="h-4 w-4 text-[#314c53]"
              >
                <rect x="3.5" y="5" width="17" height="15.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M7.5 3.5v3M16.5 3.5v3M4 9h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            {seletorMesAberto && (
              <div
                id="seletor-mes"
                role="dialog"
                aria-label="Selecionar mês"
                className="absolute right-0 top-full z-10 mt-2 w-64 rounded-lg border border-[#314c53]/15 bg-white p-3 text-[#010300] shadow-lg"
              >
                <div className="mb-3 flex items-center justify-between">
                  <button
                    type="button"
                    aria-label="Ano anterior"
                    onClick={() => setAnoExibido((ano) => ano - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-lg text-[#314c53] hover:bg-[#f2f7f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#314c53]/30"
                  >
                    ‹
                  </button>
                  <span className="text-sm font-semibold">{anoExibido}</span>
                  <button
                    type="button"
                    aria-label="Próximo ano"
                    onClick={() => setAnoExibido((ano) => ano + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-lg text-[#314c53] hover:bg-[#f2f7f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#314c53]/30"
                  >
                    ›
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {NOMES_MESES.map((nomeMes, indice) => {
                    const valorMes = `${anoExibido}-${String(indice + 1).padStart(2, "0")}`;
                    const selecionado = valorMes === mesSelecionado;

                    return (
                      <button
                        key={nomeMes}
                        type="button"
                        aria-pressed={selecionado}
                        onClick={() => {
                          setMesSelecionado(valorMes);
                          setSeletorMesAberto(false);
                        }}
                        className={`rounded-md px-2 py-2 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#314c53]/30 ${
                          selecionado
                            ? "bg-[#314c53] font-medium text-white"
                            : "text-[#314c53] hover:bg-[#f2f7f5]"
                        }`}
                      >
                        {nomeMes}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {erro && <p role="alert" className="mt-6 text-sm text-red-700">{erro}</p>}

      {carregando ? (
        <p className="mt-8 text-sm text-[#314c53]/60">Carregando painel...</p>
      ) : (
        <>
          <section aria-label="Resumo do mês" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <article className="rounded-xl border border-[#314c53]/10 bg-white p-5">
              <p className="text-xs uppercase tracking-wide text-[#314c53]/60">Serviços concluídos</p>
              <p className="mt-2 text-2xl font-semibold text-[#010300]">{concluidasDoMes.length}</p>
            </article>
            <article className="rounded-xl border border-[#314c53]/10 bg-white p-5">
              <p className="text-xs uppercase tracking-wide text-[#314c53]/60">Valor dos serviços</p>
              <p className="mt-2 text-2xl font-semibold text-[#010300]">{formatarPreco(faturamentoDoMes)}</p>
            </article>
            <article className="rounded-xl border border-[#314c53]/10 bg-white p-5">
              <p className="text-xs uppercase tracking-wide text-[#314c53]/60">Solicitações canceladas</p>
              <p className="mt-2 text-2xl font-semibold text-[#010300]">{canceladasDoMes.length}</p>
            </article>
            <article className="rounded-xl border border-[#314c53]/10 bg-white p-5">
              <p className="text-xs uppercase tracking-wide text-[#314c53]/60">Solicitações ativas</p>
              <p className="mt-2 text-2xl font-semibold text-[#010300]">{emAndamento.length}</p>
            </article>
          </section>

          <section className="mt-10">
            <h2 className="text-lg font-medium text-[#010300]">Serviços prestados no mês</h2>
            <div className="mt-4 flex flex-col gap-4">
              {concluidasDoMes.length === 0 ? (
                <p className="text-sm text-[#314c53]/60">Nenhum serviço concluído neste mês.</p>
              ) : (
                concluidasDoMes.map((contratacao) => (
                  <article key={contratacao.id} className="rounded-xl border border-[#314c53]/10 bg-white p-5">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row">
                      <div>
                        <h3 className="font-medium text-[#010300]">{contratacao.servico.titulo}</h3>
                        <p className="mt-1 text-sm text-[#314c53]/70">
                          Contratante: {contratacao.contratante.nome}
                        </p>
                        <p className="mt-1 text-xs text-[#314c53]/55">
                          Concluído em {formatarData(contratacao.concluidoEm)} · {formatarPreco(contratacao.servico.preco)}
                        </p>
                      </div>
                      <span className="h-fit rounded-full bg-[#bbdec6]/50 px-3 py-1 text-xs font-medium text-[#314c53]">
                        Concluído
                      </span>
                    </div>

                    <div className="mt-5 border-t border-[#314c53]/10 pt-4">
                      <h4 className="text-xs font-bold uppercase tracking-wide text-[#314c53]">
                        Avaliações recebidas
                      </h4>
                      {contratacao.avaliacoes.length === 0 ? (
                        <p className="mt-2 text-sm text-[#314c53]/60">
                          Este serviço ainda não recebeu avaliações.
                        </p>
                      ) : (
                        <ul className="mt-3 space-y-3">
                          {contratacao.avaliacoes.map((avaliacao) => (
                            <li key={avaliacao.id} className="rounded-lg bg-[#f7f8fc] p-3">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-sm font-medium text-[#010300]">
                                  {avaliacao.autor.nome}
                                </span>
                                <span className="text-sm text-amber-600" aria-label={`${avaliacao.nota} de 5 estrelas`}>
                                  {"★".repeat(avaliacao.nota)}{"☆".repeat(Math.max(0, 5 - avaliacao.nota))}
                                  <span className="ml-1 text-xs text-[#314c53]/60">{avaliacao.nota}/5</span>
                                </span>
                              </div>
                              {avaliacao.comentario && (
                                <p className="mt-2 text-sm text-[#314c53]/80">{avaliacao.comentario}</p>
                              )}
                              <p className="mt-2 text-xs text-[#314c53]/50">
                                {formatarData(avaliacao.criadoEm)}
                              </p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-lg font-medium text-[#010300]">Solicitações em andamento</h2>
            <div className="mt-4 flex flex-col gap-4">
              {emAndamento.length === 0 ? (
                <p className="text-sm text-[#314c53]/60">Nenhuma solicitação ativa no momento.</p>
              ) : (
                emAndamento.map((contratacao) => (
                  <article key={contratacao.id} className="rounded-xl border border-[#314c53]/10 bg-white p-5">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row">
                      <div>
                        <h3 className="font-medium text-[#010300]">{contratacao.servico.titulo}</h3>
                        <p className="mt-1 text-sm text-[#314c53]/70">
                          Contratante: {contratacao.contratante.nome} · {formatarPreco(contratacao.servico.preco)}
                        </p>
                        <p className="mt-1 text-xs text-[#314c53]/55">
                          Solicitado em {formatarData(contratacao.criadoEm)}
                        </p>
                      </div>
                    </div>
                    <ContratacaoActions
                      contratacao={contratacao}
                      usuarioAtualId={usuario.id}
                      onUpdate={() => void carregarDados()}
                    />
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-lg font-medium text-[#010300]">Solicitações canceladas</h2>
            <div className="mt-4 flex flex-col gap-3">
              {canceladas.length === 0 ? (
                <p className="text-sm text-[#314c53]/60">Nenhuma solicitação cancelada.</p>
              ) : (
                canceladas.map((contratacao) => (
                  <article key={contratacao.id} className="rounded-xl border border-red-900/10 bg-white p-4">
                    <h3 className="font-medium text-[#010300]">{contratacao.servico.titulo}</h3>
                    <p className="mt-1 text-sm text-[#314c53]/70">
                      Contratante: {contratacao.contratante.nome} · {formatarPreco(contratacao.servico.preco)}
                    </p>
                    <p className="mt-1 text-xs text-[#314c53]/55">
                      Solicitado em {formatarData(contratacao.criadoEm)}
                    </p>
                    <p className="mt-2 text-xs font-medium text-red-700">Cancelada</p>
                  </article>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
