import { prisma } from "@/lib/prisma";

export const denunciaRepository = {
  create_denuncia(dados: {
    denuncianteId: string;
    alvoTipo: string;
    alvoId: string;
    motivo: string;
  }) {
    return prisma.denuncia.create({
      data: {
        ...dados,
        status: "PENDENTE",
      },
    });
  },
};