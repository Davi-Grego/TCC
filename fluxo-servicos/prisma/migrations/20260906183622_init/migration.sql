-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firebaseUid" TEXT NOT NULL,
    "papel" TEXT NOT NULL,
    "bloqueado" BOOLEAN NOT NULL DEFAULT false,
    "bloqueadoEm" DATETIME,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Perfil" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "bio" TEXT,
    "fotoUrl" TEXT,
    "telefone" TEXT,
    "localizacao" TEXT,
    CONSTRAINT "Perfil_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Servico" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contratadoId" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "preco" REAL NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Servico_contratadoId_fkey" FOREIGN KEY ("contratadoId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Servico_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Contratacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "servicoId" TEXT NOT NULL,
    "contratanteId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "concluidoEm" DATETIME,
    CONSTRAINT "Contratacao_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "Servico" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Contratacao_contratanteId_fkey" FOREIGN KEY ("contratanteId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Avaliacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contratacaoId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "nota" INTEGER NOT NULL,
    "comentario" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Avaliacao_contratacaoId_fkey" FOREIGN KEY ("contratacaoId") REFERENCES "Contratacao" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Avaliacao_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Denuncia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "denuncianteId" TEXT NOT NULL,
    "alvoTipo" TEXT NOT NULL,
    "alvoId" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Denuncia_denuncianteId_fkey" FOREIGN KEY ("denuncianteId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notificacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notificacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_firebaseUid_key" ON "Usuario"("firebaseUid");

-- CreateIndex
CREATE UNIQUE INDEX "Perfil_usuarioId_key" ON "Perfil"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nome_key" ON "Categoria"("nome");
