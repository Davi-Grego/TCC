import { categoriaRepository } from "@/lib/repositories/categoriaRepository";

export const categoriaService = {
  listar() {
    return categoriaRepository.listar();
  },
};