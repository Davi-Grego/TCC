import type { Servico } from "@/lib/api/types";
import { formatarPreco } from "@/lib/format";

type Props = {
  servico: Servico;
  ehMeu: boolean;
  contratando: boolean;
  onContratar: () => void;
};

export function ServicoCard({ servico, ehMeu, contratando, onContratar }: Props) {
  return (
    <article className="flex flex-col justify-between rounded-xl border border-[#314c53]/10 bg-white p-6 shadow-sm transition hover:border-[#5a7f78]/50">
      <div>
        <span className="rounded-full bg-[#bbdec6]/40 px-2.5 py-0.5 text-[11px] text-[#314c53]">
          {servico.categoria.nome}
        </span>
        <h3 className="mt-3 text-lg font-medium text-[#010300]">{servico.titulo}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-[#314c53]/75">{servico.descricao}</p>
      </div>

      <div className="mt-6 flex items-end justify-between gap-4 border-t border-[#314c53]/10 pt-4">
        <div className="min-w-0">
          <p className="truncate text-xs text-[#314c53]/60">por {servico.contratado.nome}</p>
          <p className="mt-1 text-base font-medium text-[#010300]">{formatarPreco(servico.preco)}</p>
        </div>

        {ehMeu ? (
          <span className="text-xs text-[#314c53]/50">seu serviço</span>
        ) : (
          <button
            onClick={onContratar}
            disabled={contratando}
            className="shrink-0 rounded-md bg-[#314c53] px-4 py-2 text-sm font-medium text-[#f7f8fc] transition hover:bg-[#010300] disabled:opacity-60"
          >
            {contratando ? "Enviando..." : "Contratar"}
          </button>
        )}
      </div>
    </article>
  );
}