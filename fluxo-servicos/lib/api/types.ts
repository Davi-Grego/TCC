export type StatusContratacao = "PENDENTE" | "ACEITA" | "EM_ANDAMENTO" | "CONCLUIDA" | "CANCELADA";

export type Categoria = { id: string; nome: string };

export type Servico = {
  id: string;
  titulo: string;
  descricao: string;
  preco: number;
  criadoEm: string;
  contratadoId: string;
  categoria: Categoria;
  contratado: { id: string; nome: string };
};

export type AvaliacaoContratacao = {
  id: string;
  autorId: string;
  nota: number;
  comentario: string | null;
  criadoEm: string;
  autor: { id: string; nome: string };
};

export type Contratacao = {
  id: string;
  status: StatusContratacao;
  criadoEm: string;
  concluidoEm: string | null;
  comprovantePagamentoUrl: string | null;
  comprovanteConclusaoUrl: string | null;
  avaliacaoFeitaPeloUsuario: boolean;
  avaliacoes: AvaliacaoContratacao[];
  servico: {
    id: string;
    titulo: string;
    preco: number;
    contratadoId: string;
    contratado: { id: string; nome: string };
  };
  contratante: { id: string; nome: string };
};