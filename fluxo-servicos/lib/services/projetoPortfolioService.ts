import { NaoEncontradoError, RegraDeNegocioError } from "@/lib/errors";
import { lerImagem } from "@/lib/files/imagem";
import { projetoPortfolioRepository } from "@/lib/repositories/projetoPortfolioRepository";

function validarTexto(valor: unknown, campo: string, maximo: number) {
  if (typeof valor !== "string") {
    throw new RegraDeNegocioError(`${campo} é obrigatório.`);
  }
  const texto = valor.trim();
  if (!texto || texto.length > maximo) {
    throw new RegraDeNegocioError(`${campo} deve ter entre 1 e ${maximo} caracteres.`);
  }
  return texto;
}

export const projetoPortfolioService = {
  async criar(usuarioId: string, dados: {
    titulo: unknown;
    descricao: unknown;
    imagem?: FormDataEntryValue | null;
  }) {
    const titulo = validarTexto(dados.titulo, "O título", 120);
    const descricao = validarTexto(dados.descricao, "A descrição", 2000);
    const imagem = await lerImagem(dados.imagem ?? null, 5 * 1024 * 1024);

    const projeto = await projetoPortfolioRepository.criar({
      usuarioId,
      titulo,
      descricao,
      imagem: imagem?.conteudo,
      imagemMimeType: imagem?.mimeType,
    });
    const { imagemMimeType, ...dadosProjeto } = projeto;
    return {
      ...dadosProjeto,
      imagemUrl: imagemMimeType
        ? `/api/perfil/${usuarioId}/projetos/${projeto.id}/imagem`
        : null,
    };
  },

  async listar(usuarioId: string) {
    const projetos = await projetoPortfolioRepository.listarPorUsuario(usuarioId);
    return projetos.map(({ imagemMimeType, ...projeto }) => ({
      ...projeto,
      imagemUrl: imagemMimeType
        ? `/api/perfil/${usuarioId}/projetos/${projeto.id}/imagem`
        : null,
    }));
  },

  async obterImagem(usuarioId: string, projetoId: string) {
    const projeto = await projetoPortfolioRepository.obterImagem(usuarioId, projetoId);
    if (!projeto?.imagem || !projeto.imagemMimeType) {
      throw new NaoEncontradoError("Imagem não encontrada.");
    }
    return { conteudo: Buffer.from(projeto.imagem), mimeType: projeto.imagemMimeType };
  },

  async remover(usuarioId: string, projetoId: string) {
    const resultado = await projetoPortfolioRepository.remover(usuarioId, projetoId);
    if (resultado.count === 0) throw new NaoEncontradoError("Projeto não encontrado.");
  },
};
