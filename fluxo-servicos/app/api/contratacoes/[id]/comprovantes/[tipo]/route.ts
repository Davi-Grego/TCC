import { NextRequest, NextResponse } from "next/server";
import { getUsuarioAutenticado } from "@/lib/auth/getUsuarioAutenticado";
import { RegraDeNegocioError } from "@/lib/errors";
import { tratarErro } from "@/lib/http/tratarErro";
import { contratacaoService } from "@/lib/services/contratacaoService";

type Params = { params: Promise<{ id: string; tipo: string }> };
type TipoComprovante = "pagamento" | "conclusao";

function validarTipo(tipo: string): TipoComprovante {
  if (tipo !== "pagamento" && tipo !== "conclusao") {
    throw new RegraDeNegocioError("Tipo de comprovante inválido.");
  }
  return tipo;
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id, tipo: tipoParam } = await params;
    const usuario = await getUsuarioAutenticado(req);
    const tamanho = Number(req.headers.get("content-length"));
    if (tamanho > 5.5 * 1024 * 1024) {
      return NextResponse.json({ error: "O comprovante deve ter até 5 MB." }, { status: 413 });
    }

    const formData = await req.formData();
    const comprovante = await contratacaoService.anexarComprovante(
      usuario.id,
      id,
      validarTipo(tipoParam),
      formData.get("comprovante"),
    );
    return NextResponse.json({ comprovante });
  } catch (err) {
    return tratarErro(err);
  }
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id, tipo: tipoParam } = await params;
    const usuario = await getUsuarioAutenticado(req);
    const comprovante = await contratacaoService.obterComprovante(
      usuario.id,
      id,
      validarTipo(tipoParam),
    );
    return new Response(comprovante.conteudo, {
      headers: {
        "Content-Type": comprovante.mimeType,
        "Content-Disposition": "inline",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    return tratarErro(err);
  }
}
