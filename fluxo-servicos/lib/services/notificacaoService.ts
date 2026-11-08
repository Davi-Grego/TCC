import { notificacaoRepository } from "@/lib/repositories/notificacaoRepository";

export const notificacaoService = {
  async criar(usuarioId: string, mensagem: string) {
    if (!usuarioId || !mensagem) return null;
    return notificacaoRepository.create_notificacao({ usuarioId, mensagem });
  },

  async listarPendentes(usuarioId: string) {
    return notificacaoRepository.get_notificacoes_nao_lidas(usuarioId);
  },

  async visualizar(id: string, usuarioId: string) {
    return notificacaoRepository.marcar_como_lida(id, usuarioId);
  },
};