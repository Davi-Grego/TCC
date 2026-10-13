import { NextRequest, NextResponse } from "next/server";
import { servicoService } from "@/lib/services/servicoService";
import { getUsuarioAutenticado } from "@/lib/auth/getUsuarioAutenticado";
import { tratarErro } from "@/lib/http/tratarErro";

// GET: Discover (todos) | GET ?meus=1: só os meus serviços (aba Projetos)
export async function GET(req: NextRequest) {
  try {
    const usuario = await getUsuarioAutenticado(req);
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const meus = searchParams.get("meus") === "1";

    const servicos = await servicoService.listarServicos({
      contratadoId: meus ? usuario.id : undefined,
      page,
    });
    return NextResponse.json({ servicos });
  } catch (err) {
    return tratarErro(err);
  }
}

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