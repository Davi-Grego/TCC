import { prisma } from "@/lib/prisma";

export const categoriaRepository = {
  listar() {
    return prisma.categoria.findMany({ orderBy: { nome: "asc" } });
  },
};