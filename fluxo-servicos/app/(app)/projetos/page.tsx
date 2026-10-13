"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import type { Categoria, Servico } from "@/lib/api/types";
import { formatarData, formatarPreco } from "@/lib/format";
import { ServicoForm } from "@/components/ServicoForm";

type Modo = { tipo: "novo" } | { tipo: "editar"; servico: Servico } | null;

export default function ProjetosPage() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modo, setModo] = useState<Modo>(null);

  useEffect(() => {
    Promise.all([
      apiFetch<{ servicos: Servico[] }>("/api/servicos?meus=1"),
      apiFetch<{ categorias: Categoria[] }>("/api/categorias"),
    ])
      .then(([s, c]) => {
        setServicos(s.servicos);
        setCategorias(c.categorias);
      })
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  function aoSalvar(servico: Servico) {
    setServicos((prev) =>
      modo?.tipo === "editar"
        ? prev.map((s) => (s.id === servico.id ? servico : s))
        : [servico, ...prev]
    );
    setModo(null);
  }

  async function excluir(servico: Servico) {
    if (!confirm(`Excluir "${servico.titulo}"? Essa ação não pode ser desfeita.`)) return;
    setErro(null);
    try {
      await apiFetch(`/api/servicos/${servico.id}`, { method: "DELETE" });
      setServicos((prev) => prev.filter((s) => s.id !== servico.id));
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao excluir");
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-8 py-10">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-[#010300]">Projetos</h1>
          <p className="mt-1 text-sm text-[#314c53]/70">Serviços que você oferece</p>
        </div>
        {!modo && (
          <button
            onClick={() => setModo({ tipo: "novo" })}
            className="rounded-md bg-[#314c53] px-4 py-2 text-sm font-medium text-[#f7f8fc] transition hover:bg-[#010300]"
          >
            + Novo serviço
          </button>
        )}
      </header>

      {modo && (
        <div className="mt-8">
          <ServicoForm
            key={modo.tipo === "editar" ? modo.servico.id : "novo"}
            categorias={categorias}
            inicial={modo.tipo === "editar" ? modo.servico : undefined}
            onSalvo={aoSalvar}
            onCancelar={() => setModo(null)}
          />
        </div>
      )}

      {erro && <p className="mt-6 text-sm text-[#314c53]">{erro}</p>}

      <section className="mt-8 flex flex-col gap-4">
        {carregando ? (
          <p className="text-sm text-[#314c53]/60">Carregando...</p>
        ) : servicos.length === 0 ? (
          <p className="text-sm text-[#314c53]/60">
            Você ainda não tem serviços. Crie o primeiro acima.
          </p>
        ) : (
          servicos.map((s) => (
            <article
              key={s.id}
              className="flex items-center justify-between gap-6 rounded-xl border border-[#314c53]/10 bg-white p-5 shadow-sm"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#bbdec6]/40 px-2.5 py-0.5 text-[11px] text-[#314c53]">
                    {s.categoria.nome}
                  </span>
                  <span className="text-xs text-[#314c53]/50">{formatarData(s.criadoEm)}</span>
                </div>
                <h3 className="mt-2 truncate text-base font-medium text-[#010300]">{s.titulo}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-[#314c53]/70">{s.descricao}</p>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-3">
                <p className="text-base font-medium text-[#010300]">{formatarPreco(s.preco)}</p>
                <div className="flex gap-4 text-sm">
                  <button
                    onClick={() => setModo({ tipo: "editar", servico: s })}
                    className="text-[#314c53] underline underline-offset-2 hover:text-[#010300]"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => excluir(s)}
                    className="text-[#314c53]/60 underline underline-offset-2 hover:text-[#010300]"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}