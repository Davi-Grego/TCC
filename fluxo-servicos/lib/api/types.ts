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

export type Contratacao = {
  id: string;
  status: StatusContratacao;
  criadoEm: string;
  concluidoEm: string | null;
  servico: {
    id: string;
    titulo: string;
    preco: number;
    contratadoId: string;
    contratado: { id: string; nome: string };
  };
  contratante: { id: string; nome: string };
};