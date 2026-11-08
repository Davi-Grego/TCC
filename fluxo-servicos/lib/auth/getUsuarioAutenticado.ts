import { NextRequest } from "next/server";
import { authService } from "@/lib/services/authService";
import { NaoAutorizadoError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

export class SemTokenError extends Error {}

// Usa em qualquer rota protegida: pega o token do header Authorization,
// valida no Firebase e devolve o Usuario correspondente no banco
export async function getUsuarioAutenticado(req: NextRequest) {

  if (process.env.NODE_ENV === "development") {
    const simuladorId = req.headers.get("x-simulador-id");
    if (simuladorId) {
      const usuarioSimulado = await prisma.usuario.findUnique({
        where: { id: simuladorId },
      });
      if (usuarioSimulado) return usuarioSimulado;
    }
  }

  
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new NaoAutorizadoError("Token não fornecido.");
  }
  
  const token = authHeader.split("Bearer ")[1];
  if (!token) {
    throw new SemTokenError();
  }

  return authService.sincronizarUsuario(token);
}