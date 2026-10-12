import { NextRequest, NextResponse } from "next/server";
import { servicoService } from "@/lib/services/servicoService";
import { getUsuarioAutenticado } from "@/lib/auth/getUsuarioAutenticado";
import { tratarErro } from "@/lib/http/tratarErro";

// RF05 — criar serviço. O dono vem do token, nunca do body.
export async function POST(req: NextRequest) {
  try {
    const usuario = await getUsuarioAutenticado(req);
    const body = await req.json();
    const servico = await servicoService.criarServico({
      titulo: body.titulo,
      descricao: body.descricao,
      preco: Number(body.preco),
      categoriaId: body.categoriaId,
      contratadoId: usuario.id,
    });
    return NextResponse.json({ servico }, { status: 201 });
  } catch (err) {
    return tratarErro(err);
  }
}