/*
  Warnings:

  - A unique constraint covering the columns `[contratacaoId,autorId]` on the table `Avaliacao` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Avaliacao_contratacaoId_autorId_key" ON "Avaliacao"("contratacaoId", "autorId");
