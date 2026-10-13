import type { StatusContratacao } from "@/lib/api/types";
import { STATUS_LABEL } from "@/lib/format";

const estilos: Record<StatusContratacao, string> = {
  PENDENTE: "border-[#5a7f78]/40 bg-[#bbdec6]/30 text-[#314c53]",
  ACEITA: "border-[#5a7f78]/40 bg-[#5a7f78]/15 text-[#010300]",
  EM_ANDAMENTO: "border-[#314c53] bg-[#314c53] text-[#f7f8fc]",
  CONCLUIDA: "border-[#314c53]/20 bg-[#f7f8fc] text-[#314c53]",
  CANCELADA: "border-[#010300]/10 bg-[#010300]/5 text-[#314c53]/60",
};

export function StatusBadge({ status }: { status: StatusContratacao }) {
  return (
    <span className={`shrink-0 rounded-full border px-3 py-1 text-xs ${estilos[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}