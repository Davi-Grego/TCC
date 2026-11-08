import { NextRequest, NextResponse } from "next/server";
import { servicoService } from "@/lib/services/servicoService";
import { getUsuarioAutenticado } from "@/lib/auth/getUsuarioAutenticado";
import { tratarErro } from "@/lib/http/tratarErro";
import { prisma } from "@/lib/prisma";
import { avaliacaoService } from "@/lib/services/avaliacaoService";

type Params = { params: Promise<{ id: string }> };

// RF07 — buscar detalhes de um serviço específico
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const servico = await servicoService.obterServicoPorId(id);
    
    if (!servico) {
      return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 });
    }

    // 1. Busca os dados reais
    const prestador = await prisma.usuario.findUnique({
      where: { id: servico.contratadoId },
      select: { id: true, nome: true }
    });

    // 2. Busca a média
    const prestadorStats = await avaliacaoService.obterMedia(servico.contratadoId);

    // CORREÇÃO: Envolver a resposta dentro de "servico" para o frontend mapear perfeitamente
    return NextResponse.json({ 
      servico: {
        ...servico, 
        prestador, 
        prestadorStats 
      }
    });
  } catch (err) {
    return tratarErro(err);
  }
}

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