import { NextRequest, NextResponse } from "next/server";
import { tratarErro } from "@/lib/http/tratarErro";
import { perfilService } from "@/lib/services/perfilService";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const perfil = await perfilService.obterPerfilPublico(id);
    return NextResponse.json(perfil);
  } catch (error: unknown) {
    return tratarErro(error);
  }
}