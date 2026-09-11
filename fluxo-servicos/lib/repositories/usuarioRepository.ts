import { prisma } from "@/lib/prisma";

export const usuarioRepository = {
  buscarPorFirebaseUid(firebaseUid: string) {
    return prisma.usuario.findUnique({ where: { firebaseUid } });
  },

  criar(dados: { firebaseUid: string; email: string; nome: string }) {
    return prisma.usuario.create({
      data: {
        ...dados,
        papel: "CONTRATANTE",
        perfil: { create: {} },
      },
    });
  },

  get_user_by_id(id: string) {
    return prisma.usuario.findUnique({ where: { id } });
  },

  bloquear(id: string) {
    return prisma.usuario.update({
      where: { id },
      data: { bloqueado: true, bloqueadoEm: new Date() },
    });
  },

  desbloquear(id: string) {
    return prisma.usuario.update({
      where: { id },
      data: { bloqueado: false, bloqueadoEm: null },
    });
  },
};