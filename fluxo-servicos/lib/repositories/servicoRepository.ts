import { prisma } from "@/lib/prisma"

export const servicoRepository = {
  create_servico(dados: {
    titulo: string;
    descricao: string;
    preco: number;
    contratadoId: string;
    categoriaId: string;
  }) {
    return prisma.servico.create({
      data: dados,
    });
  },

  get_servicos(page = 1, pageSize = 20) {
  const skip = (page - 1) * pageSize;

  return prisma.servico.findMany({
    select: {
      id: true,
      titulo: true,
      descricao: true,
      preco: true,
      criadoEm: true,
      categoria: {
        select: {
          id: true,
          nome: true,
        },
      },
      contratado: {
        select: {
          id: true,
          nome: true,
        },
      },
    },
    orderBy: {
      criadoEm: "desc",
    },
    skip,
    take: pageSize,
  });
},

  get_contratadoid_by_id(id: string) {
    return prisma.servico.findUnique({
      where: {id: id}, 
      select: {contratadoId: true}
    });
  },

  get_servicosPorCategoria(categoriaId: string, page = 1, pageSize = 20) {
  const skip = (page - 1) * pageSize;
  return prisma.servico.findMany({
    where: { categoriaId },
    select: {
      id: true,
      titulo: true,
      descricao: true,
      preco: true,
      criadoEm: true,
    },
    orderBy: { criadoEm: "desc" },
    skip,
    take: pageSize,
  });
},

  // get_titulo_servico_by_id(id: string) {
  //   return prisma.servico.findUnique({
  //     where: { id },
  //     select: { titulo: true },
  //   });
  // },

  // get_servico_by_id(id: string) {
  //   return prisma.servico.findUnique({
  //     where: {
  //       id,
  //     },
  //   });
  // },

  update_servico(id: string, dados: {
    titulo?: string;
    descricao?: string;
    preco?: number;
  }) {
    return prisma.servico.update({
      where: {
        id,
      },
      data: dados,
    });
  },

  delete_servico(id: string) {
    return prisma.servico.delete({
      where: {
        id,
      },
    });
  },


};