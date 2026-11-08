import { prisma } from "@/lib/prisma";

const selectPerfil = {
    id: true,
    usuarioId: true,
    bio: true,
    fotoUrl: true,
    fotoMimeType: true,
    telefone: true,
    localizacao: true,
} as const;

export const perfilRepository = {

    create_perfil(usuarioId: string) {
        return prisma.perfil.create({
            data: { usuarioId },
            select: selectPerfil,
        });
    },

    get_perfil_by_usuarioId(usuarioId: string) {
        return prisma.perfil.findUnique({
            where: { usuarioId },
            select: selectPerfil,
        });
    },

    get_perfil_publico_by_usuarioId(usuarioId: string) {
        return prisma.perfil.findUnique({
            where: { usuarioId },
            select: {
                bio: true,
                fotoUrl: true,
                fotoMimeType: true,
                telefone: true,
                localizacao: true,
            },
        });
    },

    get_foto_by_usuarioId(usuarioId: string) {
        return prisma.perfil.findUnique({
            where: { usuarioId },
            select: { fotoConteudo: true, fotoMimeType: true },
        });
    },

    update_perfil(usuarioId: string, dados: {
        bio?: string | null;
        fotoUrl?: string | null;
        fotoConteudo?: Uint8Array<ArrayBuffer> | null;
        fotoMimeType?: string | null;
        localizacao?: string | null;
        telefone?: string | null;
    }) {
        return prisma.perfil.upsert({
            where: { usuarioId },
            create: { usuarioId, ...dados },
            update: dados,
            select: selectPerfil,
        });
    },

    delete_perfil(usuarioId: string) {
        return prisma.perfil.delete({
            where: { usuarioId },
        });
    }

};