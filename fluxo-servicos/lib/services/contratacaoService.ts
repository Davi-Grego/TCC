import { StatusContratacao } from "@prisma/client";
import { contratacaoRepository } from "@/lib/repositories/contratacaoRepository";
import { servicoRepository } from "@/lib/repositories/servicoRepository";
import { lerComprovante } from "@/lib/files/comprovante";
import { notificacaoService } from "@/lib/services/notificacaoService"; // ADICIONADO AQUI
import { NaoEncontradoError, NaoAutorizadoError, RegraDeNegocioError } from "@/lib/errors";

type Papel = "contratante" | "contratado";
type Autor = Papel | "ambos";

const TRANSICOES: Partial<Record<StatusContratacao, Partial<Record<StatusContratacao, Autor>>>> = {
  PENDENTE: {
    ACEITA: "contratado",  
    CANCELADA: "ambos",    
  },
  ACEITA: {
    EM_ANDAMENTO: "contratado", 
  },
  EM_ANDAMENTO: {
    CONCLUIDA: "contratado",    
  },
};

type ContratacaoComServico = {
  contratanteId: string;
  status: StatusContratacao;
  servico: { contratadoId: string };
};

type ContratacaoComComprovantes = NonNullable<
  Awaited<ReturnType<typeof contratacaoRepository.get_contratacao_by_id>>
> & {
  comprovantePagamentoTipo?: string | null;
  comprovanteConclusaoTipo?: string | null;
};

function papelDo(usuarioId: string, c: ContratacaoComServico): Papel | null {
  if (c.contratanteId === usuarioId) return "contratante";
  if (c.servico.contratadoId === usuarioId) return "contratado";
  return null;
}

async function carregarParte(usuarioId: string, id: string): Promise<ContratacaoComComprovantes> {
  const c = (await contratacaoRepository.get_contratacao_by_id(id)) as ContratacaoComComprovantes | null;
  if (!c) throw new NaoEncontradoError("Contratação não encontrada");
  if (!papelDo(usuarioId, c)) throw new NaoAutorizadoError("Você não participa dessa contratação");
  return c;
}

function formatarContratacao(contratacao: ContratacaoComComprovantes, usuarioId: string) {
  const {
    comprovantePagamentoTipo,
    comprovanteConclusaoTipo,
    avaliacoes,
    ...dadosContratacao
  } = contratacao;

  return {
    ...dadosContratacao,
    comprovantePagamentoUrl: comprovantePagamentoTipo
      ? `/api/contratacoes/${contratacao.id}/comprovantes/pagamento`
      : null,
    comprovanteConclusaoUrl: comprovanteConclusaoTipo
      ? `/api/contratacoes/${contratacao.id}/comprovantes/conclusao`
      : null,
    avaliacaoFeitaPeloUsuario: avaliacoes.some((avaliacao) => avaliacao.autorId === usuarioId),
    avaliacoes,
  };
}

export const contratacaoService = {
  async criar(contratanteId: string, servicoId: string) {
    if (!servicoId) throw new RegraDeNegocioError("servicoId é obrigatório");
    const servico = await servicoRepository.get_contratadoid_by_id(servicoId);
    if (!servico) throw new NaoEncontradoError("Serviço não encontrado");
    if (servico.contratadoId === contratanteId) {
      throw new RegraDeNegocioError("Você não pode contratar um serviço seu");
    }
    
    // RF14: Notificar o contratado que um novo serviço foi solicitado
    const contratacao = await contratacaoRepository.create_contratacao({ servicoId, contratanteId });
    await notificacaoService.criar(
      servico.contratadoId,
      "Nova solicitação de contratação para um dos seus serviços."
    );
    
    return contratacao;
  },

  async obter(usuarioId: string, id: string) {
    const contratacao = await carregarParte(usuarioId, id);
    return formatarContratacao(contratacao, usuarioId);
  },

  async listar(
    usuarioId: string,
    opcoes: { status?: StatusContratacao; papel?: "contratante" | "contratado"; page?: number }
  ) {
    const contratacoes = await contratacaoRepository.listar_por_usuario(usuarioId, opcoes);
    return contratacoes.map((contratacao) => formatarContratacao(contratacao, usuarioId));
  },

  async anexarComprovante(
    usuarioId: string,
    contratacaoId: string,
    tipo: "pagamento" | "conclusao",
    arquivo: FormDataEntryValue | null,
  ) {
    const contratacao = await carregarParte(usuarioId, contratacaoId);
    const papel = papelDo(usuarioId, contratacao);

    if (tipo === "pagamento" && papel !== "contratante") {
      throw new NaoAutorizadoError("Somente quem contratou pode anexar o comprovante de pagamento.");
    }
    if (tipo === "conclusao" && papel !== "contratado") {
      throw new NaoAutorizadoError("Somente o prestador pode anexar o comprovante de conclusão.");
    }

    const statusPermitido =
      tipo === "pagamento"
        ? contratacao.status === StatusContratacao.ACEITA ||
          contratacao.status === StatusContratacao.EM_ANDAMENTO
        : contratacao.status === StatusContratacao.EM_ANDAMENTO;
    if (!statusPermitido) {
      throw new RegraDeNegocioError("Não é possível anexar comprovantes neste status.");
    }

    const comprovante = await lerComprovante(arquivo);
    const resultado =
      tipo === "pagamento"
        ? await contratacaoRepository.salvarComprovantePagamento(
            contratacaoId,
            usuarioId,
            comprovante.conteudo,
            comprovante.mimeType,
          )
        : await contratacaoRepository.salvarComprovanteConclusao(
            contratacaoId,
            contratacao.servico.contratadoId,
            comprovante.conteudo,
            comprovante.mimeType,
          );

    if (resultado.count !== 1) {
      throw new RegraDeNegocioError("A contratação mudou de status. Atualize a página e tente novamente.");
    }

    const destinatario =
      tipo === "pagamento" ? contratacao.servico.contratadoId : contratacao.contratanteId;
    await notificacaoService.criar(
      destinatario,
      tipo === "pagamento"
        ? "O contratante anexou o comprovante de pagamento."
        : "O prestador anexou o comprovante de conclusão.",
    );
    return { tipo, mimeType: comprovante.mimeType };
  },

  async obterComprovante(usuarioId: string, contratacaoId: string, tipo: "pagamento" | "conclusao") {
    await carregarParte(usuarioId, contratacaoId);
    const registro = await contratacaoRepository.get_comprovante(contratacaoId, tipo);
    if (!registro?.conteudo || !registro.mimeType) {
      throw new NaoEncontradoError("Comprovante não encontrado.");
    }
    return { conteudo: Buffer.from(registro.conteudo), mimeType: registro.mimeType };
  },

  async transicionar(usuarioId: string, id: string, novoStatus: StatusContratacao) {
    const c = await carregarParte(usuarioId, id);

    const exigido = TRANSICOES[c.status]?.[novoStatus];
    
    // Pequena correção lógica para permitir a regra "ambos"
    if (!exigido) {
      throw new RegraDeNegocioError(`Não é possível mudar de ${c.status} para ${novoStatus}`);
    }
    if (exigido !== "ambos" && papelDo(usuarioId, c) !== exigido) {
      throw new NaoAutorizadoError(`Só o ${exigido} pode fazer essa mudança`);
    }

    if (
      novoStatus === StatusContratacao.CONCLUIDA &&
      (!c.comprovantePagamentoTipo || !c.comprovanteConclusaoTipo)
    ) {
      throw new RegraDeNegocioError(
        "Para finalizar, o contratante deve anexar o comprovante de pagamento e o prestador o comprovante de conclusão.",
      );
    }

    const ok = await contratacaoRepository.update_contratacao_se_status(id, c.status, {
      status: novoStatus,
      ...(novoStatus === "CONCLUIDA" ? { concluidoEm: new Date() } : {}),
    }, novoStatus === StatusContratacao.CONCLUIDA);

    if (!ok) {
      throw new RegraDeNegocioError("A contratação foi alterada por outra ação. Atualize a página e tente de novo.");
    }

    // RF14: Notificar a outra parte sobre a mudança de status
    const papelAtual = papelDo(usuarioId, c);
    const outroUsuarioId = papelAtual === "contratante" ? c.servico.contratadoId : c.contratanteId;
    
    await notificacaoService.criar(
      outroUsuarioId,
      `Uma contratação mudou seu status para: ${novoStatus}.`
    );

    const atualizada = await contratacaoRepository.get_contratacao_by_id(id);
    return atualizada ? formatarContratacao(atualizada, usuarioId) : null;
  },
};