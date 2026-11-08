import { RegraDeNegocioError } from "@/lib/errors";

const ASSINATURAS = {
  "image/jpeg": (bytes: Uint8Array) =>
    bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  "image/png": (bytes: Uint8Array) =>
    bytes.length >= 8 &&
    [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte),
  "image/webp": (bytes: Uint8Array) =>
    bytes.length >= 12 &&
    [82, 73, 70, 70].every((byte, index) => bytes[index] === byte) &&
    [87, 69, 66, 80].every((byte, index) => bytes[index + 8] === byte),
  "application/pdf": (bytes: Uint8Array) =>
    bytes.length >= 5 &&
    [37, 80, 68, 70, 45].every((byte, index) => bytes[index] === byte),
} as const;

export async function lerComprovante(
  valor: FormDataEntryValue | null,
  tamanhoMaximo = 5 * 1024 * 1024,
): Promise<{ conteudo: Uint8Array<ArrayBuffer>; mimeType: string }> {
  if (!(valor instanceof File) || valor.size === 0) {
    throw new RegraDeNegocioError("Anexe um comprovante.");
  }
  if (valor.size > tamanhoMaximo) {
    throw new RegraDeNegocioError("O comprovante deve ter até 5 MB.");
  }

  const validarAssinatura =
    ASSINATURAS[valor.type as keyof typeof ASSINATURAS];
  if (!validarAssinatura) {
    throw new RegraDeNegocioError("Formato não permitido. Use JPG, PNG, WebP ou PDF.");
  }

  const conteudo = new Uint8Array(await valor.arrayBuffer());
  if (!validarAssinatura(conteudo)) {
    throw new RegraDeNegocioError("O conteúdo do arquivo não corresponde ao formato informado.");
  }

  return { conteudo, mimeType: valor.type };
}
