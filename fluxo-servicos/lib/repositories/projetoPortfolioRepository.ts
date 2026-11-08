import { prisma } from "@/lib/prisma";

export const projetoPortfolioRepository = {
  criar(dados: {
    usuarioId: string;
    titulo: string;
    descricao: string;
    imagem?: Uint8Array<ArrayBuffer>;
    imagemMimeType?: string;
  }) {
    return prisma.projetoPortfolio.create({
      data: dados,
      select: { id: true, titulo: true, descricao: true, criadoEm: true, imagemMimeType: true },
    });
  },

  listarPorUsuario(usuarioId: string) {
    return prisma.projetoPortfolio.findMany({
      where: { usuarioId },
      select: { id: true, titulo: true, descricao: true, criadoEm: true, imagemMimeType: true },
      orderBy: { criadoEm: "desc" },
    });
  },

  obterImagem(usuarioId: string, projetoId: string) {
    return prisma.projetoPortfolio.findFirst({
      where: { id: projetoId, usuarioId },
      select: { imagem: true, imagemMimeType: true },
    });
  },

  remover(usuarioId: string, projetoId: string) {
    return prisma.projetoPortfolio.deleteMany({
      where: { id: projetoId, usuarioId },
    });
  },
};
