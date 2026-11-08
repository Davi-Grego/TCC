import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  // Proteção de segurança: bloqueia em produção
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ erro: "Rota restrita ao ambiente local" }, { status: 403 });
  }

  const usuarios = await prisma.usuario.findMany({
    select: { id: true, nome: true, email: true, papel: true },
    orderBy: { criadoEm: "desc" }
  });

  return NextResponse.json(usuarios);
}