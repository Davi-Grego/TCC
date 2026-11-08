import { NextRequest, NextResponse } from "next/server";
import { getUsuarioAutenticado } from "@/lib/auth/getUsuarioAutenticado";
import { denunciaService } from "@/lib/services/denunciaService";
import { tratarErro } from "@/lib/http/tratarErro";

export async function POST(req: NextRequest) {
  try {
    // 1. Valida o token e descobre quem está a fazer a denúncia (denunciante)
    const usuario = await getUsuarioAutenticado(req);
    
    // 2. Extrai os dados enviados pelo modal (DenunciaModal.tsx)
    const body = await req.json();
    
    // 3. Passa os dados para o service validar e criar
    const denuncia = await denunciaService.criar(usuario.id, {
      alvoTipo: body.alvoTipo,
      alvoId: body.alvoId,
      motivo: body.motivo,
    });
    
    // 4. Retorna sucesso com o status 201 (Created)
    return NextResponse.json(denuncia, { status: 201 });
  } catch (error: any) {
    return tratarErro(error);
  }
}