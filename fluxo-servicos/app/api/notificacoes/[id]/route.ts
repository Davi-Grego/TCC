import { NextRequest, NextResponse } from "next/server";
import { getUsuarioAutenticado } from "@/lib/auth/getUsuarioAutenticado";
import { notificacaoService } from "@/lib/services/notificacaoService";
import { tratarErro } from "@/lib/http/tratarErro";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const usuario = await getUsuarioAutenticado(req);
    
    await notificacaoService.visualizar(id, usuario.id);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return tratarErro(error);
  }
}