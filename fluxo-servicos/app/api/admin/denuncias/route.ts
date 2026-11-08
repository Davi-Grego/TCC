// app/api/admin/denuncias/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getUsuarioAutenticado } from "@/lib/auth/getUsuarioAutenticado";
import { adminService } from "@/lib/services/adminService";
import { tratarErro } from "@/lib/http/tratarErro";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const usuario = await getUsuarioAutenticado(req);
    
    // RF19: Barra imediatamente se não for ADMIN
    await adminService.verificarPrivilegios(usuario.id);

    // Se passou, busca os dados sensíveis
    const denuncias = await prisma.denuncia.findMany({
      orderBy: { criadoEm: "desc" }
    });

    return NextResponse.json(denuncias);
  } catch (error: any) {
    return tratarErro(error);
  }
}