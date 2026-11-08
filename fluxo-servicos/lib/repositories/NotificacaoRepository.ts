import { prisma } from "@/lib/prisma";

export const notificacaoRepository = {
  create_notificacao(dados: { usuarioId: string; mensagem: string }) {
    return prisma.notificacao.create({
      data: {
        ...dados,
        lida: false,
      },
    });
  },

  get_notificacoes_nao_lidas(usuarioId: string) {
    return prisma.notificacao.findMany({
      where: { usuarioId, lida: false },
      orderBy: { criadoEm: "desc" },
    });
  },

  marcar_como_lida(id: string, usuarioId: string) {
    return prisma.notificacao.updateMany({
      where: { id, usuarioId },
      data: { lida: true },
    });
  },
};