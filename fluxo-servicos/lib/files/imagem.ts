import { RegraDeNegocioError } from "@/lib/errors";

const MIME_POR_TIPO = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
} as const;
const CABECALHO_PNG = [137, 80, 78, 71, 13, 10, 26, 10];
const CABECALHO_RIFF = [82, 73, 70, 70];
const CABECALHO_WEBP = [87, 69, 66, 80];

export async function lerImagem(
  valor: FormDataEntryValue | null,
  tamanhoMaximo: number,
): Promise<{ conteudo: Uint8Array<ArrayBuffer>; mimeType: string } | null> {
  if (valor === null) return null;
  if (!(valor instanceof File)) {
    throw new RegraDeNegocioError("Arquivo de imagem inválido.");
  }
  if (valor.size === 0 && valor.name === "") return null;
  if (valor.size === 0 || valor.size > tamanhoMaximo) {
    throw new RegraDeNegocioError(
      `A imagem deve ter entre 1 byte e ${Math.floor(tamanhoMaximo / (1024 * 1024))} MB.`,
    );
  }

  const tipoEsperado = MIME_POR_TIPO[valor.type as keyof typeof MIME_POR_TIPO];
  if (!tipoEsperado) {
    throw new RegraDeNegocioError("Formato não permitido. Use JPG, PNG ou WebP.");
  }

  const conteudo = new Uint8Array(await valor.arrayBuffer());
  const tipoDetectado =
    conteudo[0] === 0xff && conteudo[1] === 0xd8 && conteudo[2] === 0xff
      ? "jpeg"
      : conteudo.length >= CABECALHO_PNG.length &&
          CABECALHO_PNG.every((byte, index) => conteudo[index] === byte)
        ? "png"
        : conteudo.length >= 12 &&
            CABECALHO_RIFF.every((byte, index) => conteudo[index] === byte) &&
            CABECALHO_WEBP.every((byte, index) => conteudo[index + 8] === byte)
          ? "webp"
          : null;

  if (tipoDetectado !== tipoEsperado) {
    throw new RegraDeNegocioError("O conteúdo do arquivo não corresponde ao formato informado.");
  }

  return { conteudo, mimeType: valor.type };
}
