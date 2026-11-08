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
  avaliacoes: {
    select: {
      id: true,
      autorId: true,
      nota: true,
      comentario: true,
      criadoEm: true,
      autor: { select: { id: true, nome: true } },
    },
  },
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

  async update_contratacao_se_status(
    id: string,
    statusEsperado: StatusContratacao,
    dados: { status: StatusContratacao; concluidoEm?: Date },
    exigirComprovantes = false,
  ) {
    const { count } = await prisma.contratacao.updateMany({
      where: {
        id,
        status: statusEsperado,
        ...(exigirComprovantes
          ? {
              comprovantePagamentoTipo: { not: null },
              comprovanteConclusaoTipo: { not: null },
            }
          : {}),
      },
      data: dados,
    });
    return count === 1;
  },

  salvarComprovantePagamento(id: string, contratanteId: string, conteudo: Uint8Array<ArrayBuffer>, mimeType: string) {
    return prisma.contratacao.updateMany({
      where: {
        id,
        contratanteId,
        status: { in: [StatusContratacao.ACEITA, StatusContratacao.EM_ANDAMENTO] },
      },
      data: { comprovantePagamento: conteudo, comprovantePagamentoTipo: mimeType },
    });
  },

  salvarComprovanteConclusao(
    id: string,
    contratadoId: string,
    conteudo: Uint8Array<ArrayBuffer>,
    mimeType: string,
  ) {
    return prisma.contratacao.updateMany({
      where: {
        id,
        servico: { contratadoId },
        status: StatusContratacao.EM_ANDAMENTO,
      },
      data: { comprovanteConclusao: conteudo, comprovanteConclusaoTipo: mimeType },
    });
  },

  async get_comprovante(id: string, tipo: "pagamento" | "conclusao") {
    const contratacao = await prisma.contratacao.findUnique({ where: { id } });

    if (!contratacao) return null;

    const comprovantes = contratacao as typeof contratacao & {
      comprovantePagamento: Uint8Array | null;
      comprovantePagamentoTipo: string | null;
      comprovanteConclusao: Uint8Array | null;
      comprovanteConclusaoTipo: string | null;
    };

    if (tipo === "pagamento") {
      return {
        conteudo: comprovantes.comprovantePagamento,
        mimeType: comprovantes.comprovantePagamentoTipo,
      };
    }

    return {
      conteudo: comprovantes.comprovanteConclusao,
      mimeType: comprovantes.comprovanteConclusaoTipo,
    };
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
