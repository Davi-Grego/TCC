import {prisma} from "@/lib/prisma";

export const perfilRepository = {

    create_perfil(usuarioId: string) {
        return prisma.perfil.create({
            data: { usuarioId },
        });
    },

    get_perfil_by_usuarioId(usuarioId: string) {
        return prisma.perfil.findUnique({
            where: { usuarioId },
        });
    },

    update_perfil(usuarioId: string, dados: { bio?: string; urlFoto?: string; localizacao?: string; telefone?: string }) {
        return prisma.perfil.update({
            where: { usuarioId },
            data: { ...dados },
        });
    },

    delete_perfil(usuarioId: string) {
        return prisma.perfil.delete({
            where: { usuarioId },
        });
    }

};