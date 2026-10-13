import { servicoRepository } from "@/lib/repositories/servicoRepository";
import { NaoEncontradoError, NaoAutorizadoError, RegraDeNegocioError } from "@/lib/errors";

export const servicoService = {
  criarServico(dados: {
    titulo: string;
    descricao: string;
    preco: number;
    contratadoId: string;
    categoriaId: string;
  }) {
    if (!dados.titulo?.trim()) throw new RegraDeNegocioError("Título é obrigatório");
    if (!(dados.preco > 0)) throw new RegraDeNegocioError("Preço deve ser maior que zero");
    return servicoRepository.create_servico({ ...dados, titulo: dados.titulo.trim() });
  },

  listarServicos(opts: { contratadoId?: string; page?: number } = {}) {
    return servicoRepository.get_servicos(opts);
  },

  listarPorCategoria(categoriaId: string, page?: number, pageSize?: number) {
    return servicoRepository.get_servicosPorCategoria(categoriaId, page, pageSize);
  },

  async atualizarServico(
    usuarioId: string,
    servicoId: string,
    dados: { titulo?: string; descricao?: string; preco?: number }
  ) {
    await garantirDono(usuarioId, servicoId);

    // whitelist: sem isso o body inteiro iria pro update e daria pra trocar contratadoId
    const { titulo, descricao, preco } = dados;
    if (titulo !== undefined && !titulo.trim()) throw new RegraDeNegocioError("Título não pode ser vazio");
    if (preco !== undefined && !(preco > 0)) throw new RegraDeNegocioError("Preço deve ser maior que zero");

    return servicoRepository.update_servico(servicoId, { titulo, descricao, preco });
  },

  async deletarServico(usuarioId: string, servicoId: string) {
    await garantirDono(usuarioId, servicoId);

    const emUso = await servicoRepository.contar_contratacoes(servicoId);
    if (emUso > 0) {
      throw new RegraDeNegocioError("Esse serviço já tem contratações e não pode ser excluído");
    }
    return servicoRepository.delete_servico(servicoId);
  },
};

async function garantirDono(usuarioId: string, servicoId: string) {
  const servico = await servicoRepository.get_contratadoid_by_id(servicoId);
  if (!servico) throw new NaoEncontradoError("Serviço não encontrado");
  if (servico.contratadoId !== usuarioId) throw new NaoAutorizadoError("Você não é o dono desse serviço");
}
