import { NextRequest, NextResponse } from "next/server";
import { authService, ContaBloqueadaError, TokenInvalidoError } from "@/lib/services/authService";

export async function POST(req: NextRequest) {
  const { token } = await req.json();

  try {
    const usuario = await authService.sincronizarUsuario(token);
    return NextResponse.json({ usuario });
  } catch (err) {
    if (err instanceof ContaBloqueadaError) {
      return NextResponse.json({ error: "Conta bloqueada" }, { status: 403 });
    }
    if (err instanceof TokenInvalidoError) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
