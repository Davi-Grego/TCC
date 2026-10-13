import { NextRequest, NextResponse } from "next/server";
import { servicoService } from "@/lib/services/servicoService";
import { getUsuarioAutenticado } from "@/lib/auth/getUsuarioAutenticado";
import { tratarErro } from "@/lib/http/tratarErro";

type Params = { params: Promise<{ id: string }> };

// RF05 — editar (só o dono)
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const usuario = await getUsuarioAutenticado(req);
    const dados = await req.json();
    const servico = await servicoService.atualizarServico(usuario.id, id, dados);
    return NextResponse.json({ servico });
  } catch (err) {
    return tratarErro(err);
  }
}

// RF05 — excluir (só o dono, e só se não tiver contratações)
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const usuario = await getUsuarioAutenticado(req);
    await servicoService.deletarServico(usuario.id, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return tratarErro(err);
  }
}