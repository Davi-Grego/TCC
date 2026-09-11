import { servicoRepository } from "@/lib/repositories/servicoRepository";

export class ServicoNaoEncontradoError extends Error {}
export class NaoAutorizadoError extends Error {}

export const servicoService = {
  criarServico(dados: {
    titulo: string;
    descricao: string;
    preco: number;
    contratadoId: string;
    categoriaId: string;
  }) {
    return servicoRepository.create_servico(dados);
  },

  listarServicos(page?: number, pageSize?: number) {
    return servicoRepository.get_servicos(page, pageSize);
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
    return servicoRepository.update_servico(servicoId, dados);
  },

  async deletarServico(usuarioId: string, servicoId: string) {
    await garantirDono(usuarioId, servicoId);
    return servicoRepository.delete_servico(servicoId);
  },
};

async function garantirDono(usuarioId: string, servicoId: string) {
  const servico = await servicoRepository.get_contratadoid_by_id(servicoId);

  if (!servico) {
    throw new ServicoNaoEncontradoError();
  }

  if (servico.contratadoId !== usuarioId) {
    throw new NaoAutorizadoError();
  }
}