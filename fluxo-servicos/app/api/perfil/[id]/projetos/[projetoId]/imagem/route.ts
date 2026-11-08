import { tratarErro } from "@/lib/http/tratarErro";
import { projetoPortfolioService } from "@/lib/services/projetoPortfolioService";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; projetoId: string }> },
) {
  try {
    const { id, projetoId } = await params;
    const imagem = await projetoPortfolioService.obterImagem(id, projetoId);
    return new Response(imagem.conteudo, {
      headers: {
        "Content-Type": imagem.mimeType,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    return tratarErro(err);
  }
}
