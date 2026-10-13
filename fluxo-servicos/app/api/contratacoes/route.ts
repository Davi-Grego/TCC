import { NextRequest, NextResponse } from "next/server";
import { StatusContratacao } from "@prisma/client";
import { contratacaoService } from "@/lib/services/contratacaoService";
import { getUsuarioAutenticado } from "@/lib/auth/getUsuarioAutenticado";
import { tratarErro } from "@/lib/http/tratarErro";

// Painéis:
//   ?papel=contratante  -> contratações que eu fiz
//   ?papel=contratado   -> pedidos recebidos nos meus serviços
//   sem papel           -> as duas (histórico completo)
// ?status=CONCLUIDA etc. filtra por status em qualquer caso.
export async function GET(req: NextRequest) {
  try {
    const usuario = await getUsuarioAutenticado(req);
    const { searchParams } = new URL(req.url);

    const statusParam = searchParams.get("status");
    const status =
      statusParam && Object.values(StatusContratacao).includes(statusParam as StatusContratacao)
        ? (statusParam as StatusContratacao)
        : undefined;

    const papelParam = searchParams.get("papel");
    const papel =
      papelParam === "contratante" || papelParam === "contratado" ? papelParam : undefined;

    const page = Math.max(1, Number(searchParams.get("page")) || 1);

    const contratacoes = await contratacaoService.listar(usuario.id, { status, papel, page });
    return NextResponse.json({ contratacoes });
  } catch (err) {
    return tratarErro(err);
  }
}

// RF08 — solicitar contratação (qualquer usuário logado, exceto dono do serviço)
export async function POST(req: NextRequest) {
  try {
    const usuario = await getUsuarioAutenticado(req);
    const { servicoId } = await req.json();
    const contratacao = await contratacaoService.criar(usuario.id, servicoId);
    return NextResponse.json({ contratacao }, { status: 201 });
  } catch (err) {
    return tratarErro(err);
  }
}