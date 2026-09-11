import {prisma } from "@/lib/prisma";


// model Avaliacao {
//   id            String      @id @default(uuid())
//   contratacao   Contratacao @relation(fields: [contratacaoId], references: [id])
//   contratacaoId String
//   autor         Usuario     @relation("AvaliacoesEscritas", fields: [autorId], references: [id])
//   autorId       String
//   nota          Int
//   comentario    String?
//   criadoEm      DateTime    @default(now())
// }

export const avaliacaoRepository = {

    async create_avaliacao(contratacaoId: string, autorId: string, nota: number, comentario?: string) {
        return await prisma.avaliacao.create({
            data: {
                contratacaoId,
                autorId,
                nota,
                comentario
            }
        });
    },

    async get_avaliacoes_by_contratacao(contratacaoId: string) {
        return await prisma.avaliacao.findMany({
            where: {
                contratacaoId
            }
        });
    },

    async get_avaliacoes_by_autor(autorId: string) {
        return await prisma.avaliacao.findMany({
            where: {
                autorId
            }
        });
    }    




};
