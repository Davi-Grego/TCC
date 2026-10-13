import { prisma } from "@/lib/prisma";
import { StatusContratacao } from "@prisma/client";

const includeResumo = {
  servico: {
    select: {
      id: true,
      titulo: true,
      preco: true,
      contratadoId: true,
      contratado: { select: { id: true, nome: true } },
    },
  },
  contratante: { select: { id: true, nome: true } },
} as const;

export const contratacaoRepository = {
  create_contratacao(dados: { servicoId: string; contratanteId: string }) {
    return prisma.contratacao.create({ data: dados, include: includeResumo });
  },

  get_contratacao_by_id(id: string) {
    return prisma.contratacao.findUnique({ where: { id }, include: includeResumo });
  },

  update_contratacao(id: string, dados: { status: StatusContratacao; concluidoEm?: Date }) {
    return prisma.contratacao.update({ where: { id }, data: dados, include: includeResumo });
  },

  // papel "contratante": eu contratei | "contratado": pedidos nos meus serviços | sem papel: os dois
  listar_por_usuario(
    usuarioId: string,
    opcoes: {
      status?: StatusContratacao;
      papel?: "contratante" | "contratado";
      page?: number;
      pageSize?: number;
    }
  ) {
    const { status, papel, page = 1, pageSize = 20 } = opcoes;

    const vinculo =
      papel === "contratante"
        ? { contratanteId: usuarioId }
        : papel === "contratado"
          ? { servico: { contratadoId: usuarioId } }
          : {
              OR: [{ contratanteId: usuarioId }, { servico: { contratadoId: usuarioId } }],
            };

    return prisma.contratacao.findMany({
      where: { ...(status ? { status } : {}), ...vinculo },
      include: includeResumo,
      orderBy: { criadoEm: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  },
};
