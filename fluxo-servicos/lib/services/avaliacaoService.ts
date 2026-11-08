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
    if (contratacao.contratanteId !== autorId) {
      throw new RegraDeNegocioError("Somente quem contratou o serviço pode avaliá-lo.");
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

  // RF16: Nova função para ser chamada pelo Front ou pela rota de Perfil
  async obterMedia(usuarioId: string) {
    if (!usuarioId) return { media: 0, total: 0 };
    
    const agregacao = await avaliacaoRepository.get_media_by_usuario(usuarioId);
    
    return {
      media: Number(agregacao._avg.nota?.toFixed(1)) || 0, // Formata pra 1 casa decimal (ex: 4.8)
      total: agregacao._count.nota || 0,
    };
  },

  listarRecebidas(usuarioId: string) {
    return avaliacaoRepository.get_avaliacoes_recebidas(usuarioId);
  },
};