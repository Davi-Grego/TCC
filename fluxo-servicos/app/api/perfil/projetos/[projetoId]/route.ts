import { NextRequest, NextResponse } from "next/server";
import { getUsuarioAutenticado } from "@/lib/auth/getUsuarioAutenticado";
import { tratarErro } from "@/lib/http/tratarErro";
import { projetoPortfolioService } from "@/lib/services/projetoPortfolioService";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projetoId: string }> },
) {
  try {
    const usuario = await getUsuarioAutenticado(req);
    const { projetoId } = await params;
    await projetoPortfolioService.remover(usuario.id, projetoId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return tratarErro(err);
  }
}
