"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api/client";
import type { Categoria, Servico } from "@/lib/api/types";

type Props = {
  categorias: Categoria[];
  inicial?: Servico;
  onSalvo: (servico: Servico) => void;
  onCancelar: () => void;
};

const inputClasse =
  "rounded-md border border-[#314c53]/20 bg-[#f7f8fc] p-3 text-[#010300] outline-none focus:border-[#5a7f78] focus:bg-white";

export function ServicoForm({ categorias, inicial, onSalvo, onCancelar }: Props) {
  const [titulo, setTitulo] = useState(inicial?.titulo ?? "");
  const [descricao, setDescricao] = useState(inicial?.descricao ?? "");
  const [preco, setPreco] = useState(inicial ? String(inicial.preco) : "");
  const [categoriaId, setCategoriaId] = useState(inicial?.categoria.id ?? categorias[0]?.id ?? "");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);

    const corpo = JSON.stringify({ titulo, descricao, preco: Number(preco), categoriaId });

    try {
      const data = inicial
        ? await apiFetch<{ servico: Servico }>(`/api/servicos/${inicial.id}`, { method: "PUT", body: corpo })
        : await apiFetch<{ servico: Servico }>("/api/servicos", { method: "POST", body: corpo });
      onSalvo(data.servico);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-xl border border-[#314c53]/10 bg-white p-8 shadow-sm"
    >
      <h2 className="text-sm font-medium uppercase tracking-wide text-[#314c53]/60">
        {inicial ? "Editar serviço" : "Novo serviço"}
      </h2>

      <label className="flex flex-col gap-1 text-sm text-[#314c53]">
        Título
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
          maxLength={80}
          className={inputClasse}
          placeholder="Ex.: Montagem de móveis"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-[#314c53]">
        Descrição
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          required
          rows={4}
          className={inputClasse}
          placeholder="O que está incluso, prazos, materiais..."
        />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-[#314c53]">
          Preço (R$)
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            required
            className={inputClasse}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-[#314c53]">
          Categoria
          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            required
            className={inputClasse}
          >
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
          {categorias.length === 0 && (
            <span className="text-xs text-[#314c53]/60">Nenhuma categoria cadastrada ainda.</span>
          )}
        </label>
      </div>

      {erro && <p className="text-sm text-[#314c53]">{erro}</p>}

      <div className="flex items-center gap-3 border-t border-[#314c53]/10 pt-6">
        <button
          type="submit"
          disabled={salvando || categorias.length === 0}
          className="rounded-md bg-[#314c53] px-5 py-2.5 text-sm font-medium text-[#f7f8fc] transition hover:bg-[#010300] disabled:opacity-60"
        >
          {salvando ? "Salvando..." : "Salvar"}
        </button>
        <button
          type="button"
          onClick={onCancelar}
          className="px-4 py-2.5 text-sm text-[#314c53] hover:text-[#010300]"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}