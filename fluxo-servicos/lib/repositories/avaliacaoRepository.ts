import { prisma } from "@/lib/prisma";

export const avaliacaoRepository = {
  create_avaliacao(dados: {
    contratacaoId: string;
    autorId: string;
    nota: number;
    comentario: string | null;
  }) {
    return prisma.avaliacao.create({ data: dados });
  },

  get_avaliacao_by_autor(contratacaoId: string, autorId: string) {
    return prisma.avaliacao.findUnique({
      where: { contratacaoId_autorId: { contratacaoId, autorId } },
    });
  },

  get_avaliacoes_by_contratacao(contratacaoId: string) {
    return prisma.avaliacao.findMany({
      where: { contratacaoId },
      include: { autor: { select: { id: true, nome: true } } },
      orderBy: { criadoEm: "desc" },
    });
  },
};
