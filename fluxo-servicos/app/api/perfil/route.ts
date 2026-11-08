import { NextRequest, NextResponse } from "next/server";
import { getUsuarioAutenticado } from "@/lib/auth/getUsuarioAutenticado";
import { tratarErro } from "@/lib/http/tratarErro";
import { perfilService } from "@/lib/services/perfilService";
import type { DadosPerfil } from "@/lib/services/perfilService";

export async function GET(req: NextRequest) {
  try {
    const usuario = await getUsuarioAutenticado(req);
    const dados = await perfilService.obterMeuPerfil(usuario.id);
    return NextResponse.json(dados);
  } catch (err) {
    return tratarErro(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const usuario = await getUsuarioAutenticado(req);
    let dados: DadosPerfil;

    if (req.headers.get("content-type")?.includes("multipart/form-data")) {
      const formData = await req.formData();
      dados = {
        bio: formData.get("bio") ?? undefined,
        telefone: formData.get("telefone") ?? undefined,
        localizacao: formData.get("localizacao") ?? undefined,
        foto: formData.get("foto"),
      };
    } else {
      const body: unknown = await req.json();
      if (!body || typeof body !== "object" || Array.isArray(body)) {
        return NextResponse.json({ error: "Dados do perfil inválidos." }, { status: 422 });
      }
      dados = body as DadosPerfil;
    }

    const perfil = await perfilService.atualizarPerfil(usuario.id, dados);
    return NextResponse.json({ perfil });
  } catch (err) {
    return tratarErro(err);
  }
}
