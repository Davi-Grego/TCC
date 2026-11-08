"use client";

import { type FormEvent, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import { apiFetchArquivo } from "@/lib/api/download";
import type { Contratacao } from "@/lib/api/types";
import AvaliacaoModal from "./AvaliacaoModal";

interface Props {
  contratacao: Contratacao;
  usuarioAtualId: string;
  onUpdate: () => void;
}

type TipoComprovante = "pagamento" | "conclusao";

const extensaoPorTipo: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export default function ContratacaoActions({ contratacao, usuarioAtualId, onUpdate }: Props) {
  const [modalAberto, setModalAberto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const isContratado = contratacao.servico.contratadoId === usuarioAtualId;
  const podeAnexarPagamento =
    !isContratado && ["ACEITA", "EM_ANDAMENTO"].includes(contratacao.status);
  const podeAnexarConclusao = isContratado && contratacao.status === "EM_ANDAMENTO";
  const podeFinalizar =
    isContratado &&
    contratacao.status === "EM_ANDAMENTO" &&
    Boolean(contratacao.comprovantePagamentoUrl && contratacao.comprovanteConclusaoUrl);

  async function anexarComprovante(event: FormEvent<HTMLFormElement>, tipo: TipoComprovante) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (!formData.get("comprovante")) {
      setErro("Selecione um arquivo para anexar.");
      return;
    }

    setLoading(true);
    setErro("");
    try {
      await apiFetch(`/api/contratacoes/${contratacao.id}/comprovantes/${tipo}`, {
        method: "POST",
        body: formData,
      });
      onUpdate();
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Não foi possível anexar o comprovante.");
    } finally {
      setLoading(false);
    }
  }

  async function baixarComprovante(tipo: TipoComprovante, url: string) {
    setLoading(true);
    setErro("");
    try {
      const arquivo = await apiFetchArquivo(url);
      const objectUrl = URL.createObjectURL(arquivo);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `comprovante-${tipo}-${contratacao.id}.${extensaoPorTipo[arquivo.type] ?? "bin"}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Não foi possível baixar o comprovante.");
    } finally {
      setLoading(false);
    }
  }

  async function alterarStatus(novoStatus: string) {
    if (!confirm(`Deseja alterar o status para ${novoStatus}?`)) return;

    setLoading(true);
    setErro("");
    try {
      await apiFetch(`/api/contratacoes/${contratacao.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: novoStatus }),
      });
      onUpdate();
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Não foi possível atualizar o status.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      {contratacao.status === "PENDENTE" && (
        <div className="flex flex-wrap gap-2">
          {isContratado ? (
            <>
              <button
                onClick={() => alterarStatus("CANCELADA")}
                disabled={loading}
                className="rounded-sm border border-red-600/30 px-4 py-2 text-xs font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                Recusar
              </button>
              <button
                onClick={() => alterarStatus("ACEITA")}
                disabled={loading}
                className="rounded-sm bg-[#5a7f78] px-4 py-2 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#314c53] disabled:opacity-50"
              >
                Aceitar solicitação
              </button>
            </>
          ) : (
            <button
              onClick={() => alterarStatus("CANCELADA")}
              disabled={loading}
              className="rounded-sm border border-red-600/30 px-4 py-2 text-xs font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              Cancelar solicitação
            </button>
          )}
        </div>
      )}

      {contratacao.status === "ACEITA" && (
        <div className="flex flex-wrap items-center gap-3">
          {isContratado && (
            <button
              onClick={() => alterarStatus("EM_ANDAMENTO")}
              disabled={loading}
              className="rounded-sm bg-[#bbdec6] px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#010300] hover:bg-[#5a7f78] hover:text-white disabled:opacity-50"
            >
              Iniciar serviço
            </button>
          )}
          <button
            onClick={() => alterarStatus("CANCELADA")}
            disabled={loading}
            className="rounded-sm border border-red-600/30 px-4 py-2 text-xs font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Cancelar contratação
          </button>
        </div>
      )}

      {(contratacao.status === "ACEITA" || contratacao.status === "EM_ANDAMENTO") && (
        <section className="grid gap-4 rounded-xl border border-[#314c53]/10 bg-[#f7f8fc] p-4 sm:grid-cols-2">
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#314c53]">Comprovante de pagamento</h4>
            {contratacao.comprovantePagamentoUrl ? (
              <button
                type="button"
                onClick={() => baixarComprovante("pagamento", contratacao.comprovantePagamentoUrl!)}
                disabled={loading}
                className="text-sm font-bold text-[#5a7f78] underline disabled:opacity-50"
              >
                Baixar comprovante anexado
              </button>
            ) : podeAnexarPagamento ? (
              <form onSubmit={(event) => anexarComprovante(event, "pagamento")} className="space-y-2">
                <input
                  type="file"
                  name="comprovante"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  required
                  className="block w-full text-xs text-[#314c53] file:mr-2 file:rounded-full file:border-0 file:bg-white file:px-3 file:py-2 file:text-xs file:font-bold"
                />
                <button disabled={loading} className="rounded-sm bg-[#314c53] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">
                  {loading ? "Enviando..." : "Anexar pagamento"}
                </button>
              </form>
            ) : (
              <p className="text-xs text-[#314c53]/60">Aguardando comprovante do contratante.</p>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#314c53]">Comprovante de conclusão</h4>
            {contratacao.comprovanteConclusaoUrl ? (
              <button
                type="button"
                onClick={() => baixarComprovante("conclusao", contratacao.comprovanteConclusaoUrl!)}
                disabled={loading}
                className="text-sm font-bold text-[#5a7f78] underline disabled:opacity-50"
              >
                Baixar comprovante anexado
              </button>
            ) : podeAnexarConclusao ? (
              <form onSubmit={(event) => anexarComprovante(event, "conclusao")} className="space-y-2">
                <input
                  type="file"
                  name="comprovante"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  required
                  className="block w-full text-xs text-[#314c53] file:mr-2 file:rounded-full file:border-0 file:bg-white file:px-3 file:py-2 file:text-xs file:font-bold"
                />
                <button disabled={loading} className="rounded-sm bg-[#314c53] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">
                  {loading ? "Enviando..." : "Anexar conclusão"}
                </button>
              </form>
            ) : (
              <p className="text-xs text-[#314c53]/60">Aguardando comprovante de conclusão do prestador.</p>
            )}
          </div>
        </section>
      )}

      {contratacao.status === "EM_ANDAMENTO" && isContratado && (
        <div>
          <button
            onClick={() => alterarStatus("CONCLUIDA")}
            disabled={loading || !podeFinalizar}
            className="rounded-sm bg-[#010300] px-4 py-2 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#314c53] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Finalizar contratação
          </button>
          {!podeFinalizar && (
            <p className="mt-2 text-xs text-[#314c53]/70">
              Para finalizar, anexe os comprovantes de pagamento e de conclusão.
            </p>
          )}
        </div>
      )}

      {contratacao.status === "CONCLUIDA" &&
        !isContratado &&
        !contratacao.avaliacaoFeitaPeloUsuario && (
          <button
            onClick={() => setModalAberto(true)}
            className="w-fit rounded-sm bg-[#bbdec6] px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#010300] hover:bg-[#5a7f78] hover:text-white"
          >
            Avaliar serviço
          </button>
        )}

      {contratacao.status === "CONCLUIDA" && (
        <div className="flex flex-wrap gap-4">
          {contratacao.comprovantePagamentoUrl && (
            <button
              type="button"
              onClick={() => baixarComprovante("pagamento", contratacao.comprovantePagamentoUrl!)}
              disabled={loading}
              className="text-xs font-bold text-[#5a7f78] underline"
            >
              Baixar pagamento
            </button>
          )}
          {contratacao.comprovanteConclusaoUrl && (
            <button
              type="button"
              onClick={() => baixarComprovante("conclusao", contratacao.comprovanteConclusaoUrl!)}
              disabled={loading}
              className="text-xs font-bold text-[#5a7f78] underline"
            >
              Baixar conclusão
            </button>
          )}
        </div>
      )}

      {erro && <p className="text-sm font-bold text-red-600" role="alert">{erro}</p>}

      {modalAberto && (
        <AvaliacaoModal
          contratacaoId={contratacao.id}
          onClose={() => setModalAberto(false)}
          onSuccess={onUpdate}
        />
      )}
    </div>
  );
}
