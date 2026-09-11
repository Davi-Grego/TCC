import { NextRequest } from "next/server";
import { authService } from "@/lib/services/authService";

export class SemTokenError extends Error {}

// Usa em qualquer rota protegida: pega o token do header Authorization,
// valida no Firebase e devolve o Usuario correspondente no banco
export async function getUsuarioAutenticado(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    throw new SemTokenError();
  }

  return authService.sincronizarUsuario(token);
}