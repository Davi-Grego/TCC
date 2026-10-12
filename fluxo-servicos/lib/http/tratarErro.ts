import { NextResponse } from "next/server";
import { NaoEncontradoError, NaoAutorizadoError, RegraDeNegocioError } from "@/lib/errors";
import { TokenInvalidoError, ContaBloqueadaError } from "@/lib/services/authService";
import { SemTokenError } from "@/lib/auth/getUsuarioAutenticado";
 
// Único lugar que traduz erro de domínio em status HTTP.
export function tratarErro(err: unknown) {
  if (err instanceof SemTokenError || err instanceof TokenInvalidoError) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (err instanceof ContaBloqueadaError) {
    return NextResponse.json({ error: "Conta bloqueada" }, { status: 403 });
  }
  if (err instanceof NaoEncontradoError) {
    return NextResponse.json({ error: err.message || "Não encontrado" }, { status: 404 });
  }
  if (err instanceof NaoAutorizadoError) {
    return NextResponse.json({ error: err.message || "Sem permissão" }, { status: 403 });
  }
  if (err instanceof RegraDeNegocioError) {
    return NextResponse.json({ error: err.message }, { status: 422 });
  }
  console.error(err);
  return NextResponse.json({ error: "Erro interno" }, { status: 500 });
}
 