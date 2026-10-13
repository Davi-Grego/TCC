import { NextRequest, NextResponse } from "next/server";
import { categoriaService } from "@/lib/services/categoriaService";
import { getUsuarioAutenticado } from "@/lib/auth/getUsuarioAutenticado";
import { tratarErro } from "@/lib/http/tratarErro";

export async function GET(req: NextRequest) {
  try {
    await getUsuarioAutenticado(req);
    const categorias = await categoriaService.listar();
    return NextResponse.json({ categorias });
  } catch (err) {
    return tratarErro(err);
  }
}