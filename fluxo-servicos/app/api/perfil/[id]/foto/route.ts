import { perfilService } from "@/lib/services/perfilService";
import { tratarErro } from "@/lib/http/tratarErro";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const foto = await perfilService.obterFoto(id);
    return new Response(foto.conteudo, {
      headers: {
        "Content-Type": foto.mimeType,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    return tratarErro(err);
  }
}
