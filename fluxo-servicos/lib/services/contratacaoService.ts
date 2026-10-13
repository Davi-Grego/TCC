import { StatusContratacao } from "@prisma/client";
import { contratacaoRepository } from "@/lib/repositories/contratacaoRepository";
import { servicoRepository } from "@/lib/repositories/servicoRepository";
import { NaoEncontradoError, NaoAutorizadoError, RegraDeNegocioError } from "@/lib/errors";

type Papel = "contratante" | "contratado";
// "ambos": qualquer parte da contratação pode fazer a mudança
type Autor = Papel | "ambos";

// Máquina de estados: origem -> destino -> quem pode fazer a mudança.
const TRANSICOES: Partial<Record<StatusContratacao, Partial<Record<StatusContratacao, Autor>>>> = {
  PENDENTE: {
    ACEITA: "contratado",  // RF09 aceitar
    CANCELADA: "ambos",    // RF09 recusar (contratado) | RF17 cancelar (contratante)
  },
  ACEITA: {
    EM_ANDAMENTO: "contratado", // opcional: remove se não quiser esse passo
    CONCLUIDA: "contratado",    // RF11
  },
  EM_ANDAMENTO: {
    CONCLUIDA: "contratado",    // RF11
  },
};

type ContratacaoComServico = {
  contratanteId: string;
  status: StatusContratacao;
  servico: { contratadoId: string };
};

function papelDo(usuarioId: string, c: ContratacaoComServico): Papel | null {
  if (c.contratanteId === usuarioId) return "contratante";
  if (c.servico.contratadoId === usuarioId) return "contratado";
  return null;
}

async function carregarParte(usuarioId: string, id: string) {
  const c = await contratacaoRepository.get_contratacao_by_id(id);
  if (!c) throw new NaoEncontradoError("Contratação não encontrada");
  if (!papelDo(usuarioId, c)) throw new NaoAutorizadoError("Você não participa dessa contratação");
  return c;
}

export const contratacaoService = {
  async criar(contratanteId: string, servicoId: string) {
    if (!servicoId) throw new RegraDeNegocioError("servicoId é obrigatório");
    const servico = await servicoRepository.get_contratadoid_by_id(servicoId);
    if (!servico) throw new NaoEncontradoError("Serviço não encontrado");
    if (servico.contratadoId === contratanteId) {
      throw new RegraDeNegocioError("Você não pode contratar um serviço seu");
    }
    return contratacaoRepository.create_contratacao({ servicoId, contratanteId });
  },

  obter(usuarioId: string, id: string) {
    return carregarParte(usuarioId, id);
  },

  listar(
    usuarioId: string,
    opcoes: { status?: StatusContratacao; papel?: "contratante" | "contratado"; page?: number }
  ) {
    return contratacaoRepository.listar_por_usuario(usuarioId, opcoes);
  },

  async transicionar(usuarioId: string, id: string, novoStatus: StatusContratacao) {
    const c = await carregarParte(usuarioId, id);

    if (novoStatus === "CANCELADA" && c.status !== "PENDENTE") {
      throw new RegraDeNegocioError("Só dá pra cancelar enquanto a contratação aguarda resposta");
    }

    const exigido = TRANSICOES[c.status]?.[novoStatus];
    if (!exigido) {
      throw new RegraDeNegocioError(`Não é possível mudar de ${c.status} para ${novoStatus}`);
    }

    const papel = papelDo(usuarioId, c);
    if (exigido !== "ambos" && papel !== exigido) {
      throw new NaoAutorizadoError(`Só o ${exigido} pode fazer essa mudança`);
    }

    return contratacaoRepository.update_contratacao(id, {
      status: novoStatus,
      ...(novoStatus === "CONCLUIDA" ? { concluidoEm: new Date() } : {}),
    });
  },
};