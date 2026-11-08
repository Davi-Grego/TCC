import { denunciaRepository } from "@/lib/repositories/denunciaRepository";
import { RegraDeNegocioError } from "@/lib/errors";

export const denunciaService = {
  async criar(denuncianteId: string, dados: { alvoTipo: string; alvoId: string; motivo: string }) {
    if (!dados.alvoId || !dados.motivo || !dados.alvoTipo) {
      throw new RegraDeNegocioError("Dados incompletos para registrar a denúncia.");
    }
    
    if (dados.motivo.trim().length < 10) {
      throw new RegraDeNegocioError("O motivo deve conter detalhes suficientes (mínimo de 10 caracteres).");
    }

    return denunciaRepository.create_denuncia({
      denuncianteId,
      alvoTipo: dados.alvoTipo, // "USUARIO" ou "SERVICO"
      alvoId: dados.alvoId,
      motivo: dados.motivo.trim(),
    });
  },
};