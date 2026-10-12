// Erros de domínio. A camada HTTP (tratarErro) traduz cada um pra um status.
export class NaoEncontradoError extends Error {}
export class NaoAutorizadoError extends Error {}
export class RegraDeNegocioError extends Error {}
 