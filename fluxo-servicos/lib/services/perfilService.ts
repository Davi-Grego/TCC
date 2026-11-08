import { NaoEncontradoError, RegraDeNegocioError } from "@/lib/errors";
import { lerImagem } from "@/lib/files/imagem";
import { avaliacaoService } from "@/lib/services/avaliacaoService";
import { projetoPortfolioService } from "@/lib/services/projetoPortfolioService";
import { servicoService } from "@/lib/services/servicoService";
import { perfilRepository } from "@/lib/repositories/perfilRepository";
import { usuarioRepository } from "@/lib/repositories/usuarioRepository";

export type DadosPerfil = {
  bio?: unknown;
  fotoUrl?: unknown;
  foto?: FormDataEntryValue | null;
  localizacao?: unknown;
  telefone?: unknown;
};

function lerTexto(valor: unknown, campo: string, maximo: number) {
  if (valor === undefined) return undefined;
  if (valor === null) return null;
  if (typeof valor !== "string") {
    throw new RegraDeNegocioError(`${campo} deve ser um texto.`);
  }
  const texto = valor.trim();
  if (texto.length > maximo) {
    throw new RegraDeNegocioError(`${campo} deve ter até ${maximo} caracteres.`);
  }
  return texto || null;
}

function formatarPerfil(
  usuarioId: string,
  perfil: NonNullable<Awaited<ReturnType<typeof perfilRepository.get_perfil_by_usuarioId>>>,
) {
  return {
    ...perfil,
    fotoUrl: perfil.fotoMimeType ? `/api/perfil/${usuarioId}/foto` : perfil.fotoUrl,
    temFoto: Boolean(perfil.fotoMimeType),
  };
}

export const perfilService = {
  async criarPerfil(usuarioId: string) {
    return perfilRepository.create_perfil(usuarioId);
  },

  async obterMeuPerfil(usuarioId: string) {
    const usuario = await usuarioRepository.get_user_by_id(usuarioId);
    if (!usuario) throw new NaoEncontradoError("Perfil não encontrado.");

    let perfil = await perfilRepository.get_perfil_by_usuarioId(usuarioId);
    if (!perfil) perfil = await perfilRepository.create_perfil(usuarioId);

    return { usuario, perfil: formatarPerfil(usuarioId, perfil) };
  },

  async atualizarPerfil(usuarioId: string, dados: DadosPerfil) {
    const bio = lerTexto(dados.bio, "A biografia", 1000);
    const telefone = lerTexto(dados.telefone, "O telefone", 40);
    const localizacao = lerTexto(dados.localizacao, "A localização", 120);
    const fotoUrl = lerTexto(dados.fotoUrl, "A URL da foto", 2048);
    const imagem = await lerImagem(dados.foto ?? null, 2 * 1024 * 1024);

    const atualizacao: Parameters<typeof perfilRepository.update_perfil>[1] = {
      ...(bio !== undefined ? { bio } : {}),
      ...(telefone !== undefined ? { telefone } : {}),
      ...(localizacao !== undefined ? { localizacao } : {}),
      ...(fotoUrl !== undefined ? { fotoUrl, fotoConteudo: null, fotoMimeType: null } : {}),
      ...(imagem
        ? {
            fotoConteudo: imagem.conteudo,
            fotoMimeType: imagem.mimeType,
            fotoUrl: null,
          }
        : {}),
    };

    const perfil = await perfilRepository.update_perfil(usuarioId, atualizacao);
    return formatarPerfil(usuarioId, perfil);
  },

  async obterPerfilPublico(usuarioId: string) {
    const usuario = await usuarioRepository.get_perfil_publico(usuarioId);
    if (!usuario) throw new NaoEncontradoError("Perfil não encontrado.");

    const [perfil, servicos, projetos, avaliacoes, avaliacao] = await Promise.all([
      perfilRepository.get_perfil_publico_by_usuarioId(usuarioId),
      servicoService.listarDoPrestador(usuarioId),
      projetoPortfolioService.listar(usuarioId),
      avaliacaoService.listarRecebidas(usuarioId),
      avaliacaoService.obterMedia(usuarioId),
    ]);

    return {
      ...usuario,
      bio: perfil?.bio ?? null,
      fotoUrl: perfil?.fotoMimeType ? `/api/perfil/${usuarioId}/foto` : perfil?.fotoUrl ?? null,
      telefone: perfil?.telefone ?? null,
      localizacao: perfil?.localizacao ?? null,
      avaliacao,
      servicos,
      projetos,
      avaliacoes,
    };
  },

  async obterFoto(usuarioId: string) {
    const perfil = await perfilRepository.get_foto_by_usuarioId(usuarioId);
    if (!perfil?.fotoConteudo || !perfil.fotoMimeType) {
      throw new NaoEncontradoError("Foto não encontrada.");
    }
    return { conteudo: Buffer.from(perfil.fotoConteudo), mimeType: perfil.fotoMimeType };
  },
};
