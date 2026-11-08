import { NextRequest, NextResponse } from "next/server";
import { getUsuarioAutenticado } from "@/lib/auth/getUsuarioAutenticado";
import { notificacaoService } from "@/lib/services/notificacaoService";
import { tratarErro } from "@/lib/http/tratarErro";

export async function GET(req: NextRequest) {
  try {
    const usuario = await getUsuarioAutenticado(req);
    const notificacoes = await notificacaoService.listarPendentes(usuario.id);
    
    return NextResponse.json(notificacoes);
  } catch (error: any) {
    return tratarErro(error);
  }
}