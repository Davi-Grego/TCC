import { NextRequest, NextResponse } from "next/server";
import { getUsuarioAutenticado } from "@/lib/auth/getUsuarioAutenticado";
import { tratarErro } from "@/lib/http/tratarErro";
import { projetoPortfolioService } from "@/lib/services/projetoPortfolioService";

export async function POST(req: NextRequest) {
  try {
    const usuario = await getUsuarioAutenticado(req);
    const formData = await req.formData();
    const projeto = await projetoPortfolioService.criar(usuario.id, {
      titulo: formData.get("titulo"),
      descricao: formData.get("descricao"),
      imagem: formData.get("imagem"),
    });

    return NextResponse.json({ projeto }, { status: 201 });
  } catch (err) {
    return tratarErro(err);
  }
}
