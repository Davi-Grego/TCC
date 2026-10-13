import type { Contratacao } from "@/lib/api/types";
import { formatarData, formatarPreco } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";

type Props = {
  contratacao: Contratacao;
  onCancelar?: () => void;
  cancelando?: boolean;
};

export function ContratacaoCard({ contratacao, onCancelar, cancelando = false }: Props) {
  const { servico, status, criadoEm, concluidoEm } = contratacao;
  const podeCancelar = status === "PENDENTE" && !!onCancelar;

  return (
    <article className="flex items-center justify-between gap-6 rounded-xl border border-[#314c53]/10 bg-white p-5 shadow-sm">
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-base font-medium text-[#010300]">{servico.titulo}</h3>
        <p className="mt-1 text-sm text-[#314c53]/70">
          com {servico.contratado?.nome ?? "prestador"} · {formatarPreco(servico.preco)}
        </p>
        <p className="mt-1 text-xs text-[#314c53]/50">
          solicitado em {formatarData(criadoEm)}
          {concluidoEm && ` · concluído em ${formatarData(concluidoEm)}`}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-3">
        <StatusBadge status={status} />
        {podeCancelar && (
          <button
            onClick={onCancelar}
            disabled={cancelando}
            className="text-xs text-[#314c53]/60 underline underline-offset-2 hover:text-[#010300] disabled:opacity-60"
          >
            {cancelando ? "Cancelando..." : "Cancelar solicitação"}
          </button>
        )}
      </div>
    </article>
  );
}