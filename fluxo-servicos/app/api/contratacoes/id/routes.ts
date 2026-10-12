import { NextRequest, NextResponse } from "next/server";
import { StatusContratacao } from "@prisma/client";
import { contratacaoService } from "@/lib/services/contratacaoService";
import { getUsuarioAutenticado } from "@/lib/auth/getUsuarioAutenticado";
import { tratarErro } from "@/lib/http/tratarErro";
import { RegraDeNegocioError } from "@/lib/errors";

type Params = { params: Promise<{ id: string }> };

// RF10 — detalhe (só as partes da contratação)
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const usuario = await getUsuarioAutenticado(req);
    const contratacao = await contratacaoService.obter(usuario.id, id);
    return NextResponse.json({ contratacao });
  } catch (err) {
    return tratarErro(err);
  }
}

// RF09 (ACEITA / CANCELADA) e RF11 (CONCLUIDA): mudança de status validada pela máquina de estados
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const usuario = await getUsuarioAutenticado(req);
    const { status } = await req.json();

    if (!Object.values(StatusContratacao).includes(status)) {
      throw new RegraDeNegocioError("Status inválido");
    }

    const contratacao = await contratacaoService.transicionar(usuario.id, id, status);
    return NextResponse.json({ contratacao });
  } catch (err) {
    return tratarErro(err);
  }
}