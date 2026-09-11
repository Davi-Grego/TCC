import { perfilRepository } from "@/lib/repositories/perfilRepository";


export const perfilService = {
    async criarPerfil(usuarioId: string) {
        return await perfilRepository.create_perfil(usuarioId);
    },

    async obterPerfil(usuarioId: string) {
        return await perfilRepository.get_perfil_by_usuarioId(usuarioId);
    },

    atualizarPerfil(usuarioId: string, dados: { bio?: string; fotoUrl?: string; localizacao?: string; telefone?: string }) {
        return perfilRepository.update_perfil(usuarioId, dados);
    },

};