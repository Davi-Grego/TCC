import { prisma } from "@/lib/prisma";
import { StatusContratacao } from "@prisma/client";


export const contratacaoRepository = {

    create_contratacao(dados: {
        servicoId: string;
        contratanteId: string;
        contratadoId: string;
        status: StatusContratacao;
        
    }) {
        return prisma.contratacao.create({
            data: dados,
        });
    },

    update_status(id: string, status: StatusContratacao) {
        return prisma.contratacao.update({
            where: { id },
            data: { status },
        });
    },

    get_contratacao_by_usuarioId(usuarioId: string, page = 1, pageSize = 20) {
        const skip = (page - 1) * pageSize;
        return prisma.contratacao.findMany({
            where: {
                OR: [
                    { contratanteId: usuarioId },
                    { contratadoId: usuarioId }
                ]
            },
            skip,
            take: pageSize
        });
    },


    get_contratacao_user_by_status(userid: string, status: StatusContratacao, page = 1, pageSize = 20) {
        const skip = (page - 1) * pageSize;
        return prisma.contratacao.findMany({
            where: { status , OR: [
                { contratanteId: userid },
                { contratadoId: userid }
            ]},
            skip,
            take: pageSize
        });
    },

    get_usersId_by_contratacaoId(id: string) {
        return prisma.contratacao.findUnique({
            where: { id },
            select: {
                contratanteId: true,
                contratadoId: true
            }
        });
    }


};