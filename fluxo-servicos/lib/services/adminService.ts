import { prisma } from "@/lib/prisma";
import { NaoAutorizadoError } from "@/lib/errors";

export const adminService = {
  /**
   * Valida se o usuário logado tem o papel de administrador.
   * Chame essa função no início de qualquer rota que precise de privilégios elevados (ex: GET /api/denuncias).
   */
  async verificarPrivilegios(usuarioId: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { papel: true },
    });

    if (!usuario || usuario.papel !== "ADMIN") {
      throw new NaoAutorizadoError("Acesso negado. Requer privilégios de administrador.");
    }

    return true;
  },
};