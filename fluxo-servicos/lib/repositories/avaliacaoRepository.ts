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

  // RF16: Nova função para buscar a média
  get_media_by_usuario(usuarioId: string) {
    return prisma.avaliacao.aggregate({
      where: {
        contratacao: {
          servico: {
            contratadoId: usuarioId,
          },
        },
        // Exclui auto-avaliação para não corromper a nota do prestador
        autorId: { not: usuarioId },
      },
      _avg: { nota: true },
      _count: { nota: true },
    });
  },

  get_avaliacoes_recebidas(usuarioId: string) {
    return prisma.avaliacao.findMany({
      where: {
        contratacao: { servico: { contratadoId: usuarioId } },
        autorId: { not: usuarioId },
      },
      select: {
        id: true,
        nota: true,
        comentario: true,
        criadoEm: true,
        autor: { select: { id: true, nome: true } },
        contratacao: { select: { servico: { select: { titulo: true } } } },
      },
      orderBy: { criadoEm: "desc" },
    });
  },
};