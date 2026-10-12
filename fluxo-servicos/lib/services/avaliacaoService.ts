import { avaliacaoRepository } from "@/lib/repositories/avaliacaoRepository";
import { contratacaoService } from "@/lib/services/contratacaoService";
import { RegraDeNegocioError } from "@/lib/errors";

export const avaliacaoService = {
  async avaliar(autorId: string, contratacaoId: string, dados: { nota: number; comentario?: string }) {
    // obter já garante que a contratação existe e que o autor é parte dela
    const contratacao = await contratacaoService.obter(autorId, contratacaoId);

    if (contratacao.status !== "CONCLUIDA") {
      throw new RegraDeNegocioError("Só dá pra avaliar depois que o serviço for concluído");
    }
    if (!Number.isInteger(dados.nota) || dados.nota < 1 || dados.nota > 5) {
      throw new RegraDeNegocioError("Nota deve ser um inteiro de 1 a 5");
    }
    if (await avaliacaoRepository.get_avaliacao_by_autor(contratacaoId, autorId)) {
      throw new RegraDeNegocioError("Você já avaliou essa contratação");
    }

    return avaliacaoRepository.create_avaliacao({
      contratacaoId,
      autorId,
      nota: dados.nota,
      comentario: dados.comentario?.trim() || null,
    });
  },

  async listar(usuarioId: string, contratacaoId: string) {
    await contratacaoService.obter(usuarioId, contratacaoId);
    return avaliacaoRepository.get_avaliacoes_by_contratacao(contratacaoId);
  },
};
