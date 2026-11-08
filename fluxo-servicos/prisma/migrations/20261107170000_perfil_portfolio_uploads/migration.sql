ALTER TABLE "Perfil" ADD COLUMN "fotoConteudo" BLOB;
ALTER TABLE "Perfil" ADD COLUMN "fotoMimeType" TEXT;

CREATE TABLE "ProjetoPortfolio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "imagem" BLOB,
    "imagemMimeType" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProjetoPortfolio_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "ProjetoPortfolio_usuarioId_criadoEm_idx" ON "ProjetoPortfolio"("usuarioId", "criadoEm");
