-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ALUNOS" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "curso" TEXT NOT NULL DEFAULT 'Sistemas de Informação',
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "cadastrado_por" TEXT,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ALUNOS_cadastrado_por_fkey" FOREIGN KEY ("cadastrado_por") REFERENCES "USUARIOS" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ALUNOS" ("cadastrado_por", "criado_em", "curso", "email", "id", "nome", "senha_hash", "status") SELECT "cadastrado_por", "criado_em", "curso", "email", "id", "nome", "senha_hash", "status" FROM "ALUNOS";
DROP TABLE "ALUNOS";
ALTER TABLE "new_ALUNOS" RENAME TO "ALUNOS";
CREATE UNIQUE INDEX "ALUNOS_email_key" ON "ALUNOS"("email");
CREATE TABLE "new_PROBLEMAS_COMPUTADORES" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "computador_id" INTEGER,
    "categoria" TEXT,
    "descricao" TEXT NOT NULL,
    "data_registro" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_resolucao" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "registrado_por" TEXT NOT NULL,
    "registrado_por_usuario_id" TEXT,
    "registrado_por_aluno_id" TEXT,
    CONSTRAINT "PROBLEMAS_COMPUTADORES_computador_id_fkey" FOREIGN KEY ("computador_id") REFERENCES "COMPUTADORES" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PROBLEMAS_COMPUTADORES_registrado_por_usuario_id_fkey" FOREIGN KEY ("registrado_por_usuario_id") REFERENCES "USUARIOS" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PROBLEMAS_COMPUTADORES_registrado_por_aluno_id_fkey" FOREIGN KEY ("registrado_por_aluno_id") REFERENCES "ALUNOS" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PROBLEMAS_COMPUTADORES" ("categoria", "computador_id", "data_registro", "data_resolucao", "descricao", "id", "registrado_por", "status") SELECT "categoria", "computador_id", "data_registro", "data_resolucao", "descricao", "id", "registrado_por", "status" FROM "PROBLEMAS_COMPUTADORES";
DROP TABLE "PROBLEMAS_COMPUTADORES";
ALTER TABLE "new_PROBLEMAS_COMPUTADORES" RENAME TO "PROBLEMAS_COMPUTADORES";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
