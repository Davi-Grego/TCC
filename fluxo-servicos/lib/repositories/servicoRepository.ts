import { prisma } from "@/lib/prisma";

// Formato único de serviço devolvido pelo repository (create, update e leituras)
const selectServico = {
  id: true,
  titulo: true,
  descricao: true,
  preco: true,
  criadoEm: true,
  contratadoId: true,
  categoria: { select: { id: true, nome: true } },
  contratado: { select: { id: true, nome: true } },
} as const;

export const servicoRepository = {
  create_servico(dados: {
    titulo: string;
    descricao: string;
    preco: number;
    contratadoId: string;
    categoriaId: string;
  }) {
    return prisma.servico.create({ data: dados, select: selectServico });
  },

  // sem contratadoId: todos (Discover). Com contratadoId: só os do usuário (Projetos).
  get_servicos(opts: { contratadoId?: string; page?: number; pageSize?: number } = {}) {
    const { contratadoId, page = 1, pageSize = 20 } = opts;
    return prisma.servico.findMany({
      where: contratadoId ? { contratadoId } : undefined,
      select: selectServico,
      orderBy: { criadoEm: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  },

  get_servicosPorCategoria(categoriaId: string, page = 1, pageSize = 20) {
    return prisma.servico.findMany({
      where: { categoriaId },
      select: selectServico,
      orderBy: { criadoEm: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  },

  get_contratadoid_by_id(id: string) {
    return prisma.servico.findUnique({ where: { id }, select: { contratadoId: true } });
  },

  update_servico(
    id: string,
    dados: { titulo?: string; descricao?: string; preco?: number; categoriaId?: string }
  ) {
    return prisma.servico.update({ where: { id }, data: dados, select: selectServico });
  },

  delete_servico(id: string) {
    return prisma.servico.delete({ where: { id } });
  },

  contar_contratacoes(servicoId: string) {
    return prisma.contratacao.count({ where: { servicoId } });
  },
};