import { NextRequest, NextResponse } from "next/server";
import { avaliacaoService } from "@/lib/services/avaliacaoService";
import { getUsuarioAutenticado } from "@/lib/auth/getUsuarioAutenticado";
import { tratarErro } from "@/lib/http/tratarErro";

type Params = { params: Promise<{ id: string }> };

// RF12 — as duas partes podem avaliar, uma vez cada, após CONCLUIDA
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const usuario = await getUsuarioAutenticado(req);
    const { nota, comentario } = await req.json();
    const avaliacao = await avaliacaoService.avaliar(usuario.id, id, { nota, comentario });
    return NextResponse.json({ avaliacao }, { status: 201 });
  } catch (err) {
    return tratarErro(err);
  }
}

// RF12 — lista as avaliações da contratação (só as partes)
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const usuario = await getUsuarioAutenticado(req);
    const avaliacoes = await avaliacaoService.listar(usuario.id, id);
    return NextResponse.json({ avaliacoes });
  } catch (err) {
    return tratarErro(err);
  }
}