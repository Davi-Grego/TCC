import { NextRequest, NextResponse } from "next/server";
import { perfilService } from "@/lib/services/perfilService";
import { getUsuarioAutenticado, SemTokenError } from "@/lib/auth/getUsuarioAutenticado";
import { TokenInvalidoError, ContaBloqueadaError } from "@/lib/services/authService";

function tratarErro(err: unknown) {
  if (err instanceof ContaBloqueadaError) {
    return NextResponse.json({ error: "Conta bloqueada" }, { status: 403 });
  }
  if (err instanceof TokenInvalidoError || err instanceof SemTokenError) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  console.error(err);
  return NextResponse.json({ error: "Erro interno" }, { status: 500 });
}

export async function GET(req: NextRequest) {
  try {
    const usuario = await getUsuarioAutenticado(req);
    let perfil = await perfilService.obterPerfil(usuario.id);

    // primeiro acesso: ainda não existe linha de Perfil pra esse usuário
    if (!perfil) {
      perfil = await perfilService.criarPerfil(usuario.id);
    }

    return NextResponse.json({ usuario, perfil });
  } catch (err) {
    return tratarErro(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const usuario = await getUsuarioAutenticado(req);
    const dados = await req.json();
    const perfil = await perfilService.atualizarPerfil(usuario.id, dados);
    return NextResponse.json({ perfil });
  } catch (err) {
    return tratarErro(err);
  }
}