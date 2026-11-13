-- CreateTable
CREATE TABLE "USUARIOS" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "perfil" TEXT NOT NULL DEFAULT 'Administrador',
    "status_aprovacao" TEXT,
    "codigo_confirmacao" TEXT,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ALUNOS" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "curso" TEXT NOT NULL DEFAULT 'Sistemas de Informação',
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "cadastrado_por" TEXT NOT NULL,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ALUNOS_cadastrado_por_fkey" FOREIGN KEY ("cadastrado_por") REFERENCES "USUARIOS" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "COMPUTADORES" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patrimonio" TEXT NOT NULL,
    "nome_host" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'disponivel',
    "especificacoes" TEXT,
    "cadastrado_por" TEXT NOT NULL,
    CONSTRAINT "COMPUTADORES_cadastrado_por_fkey" FOREIGN KEY ("cadastrado_por") REFERENCES "USUARIOS" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CONTROLE_SALA" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "aluno_id" TEXT NOT NULL,
    "entrada" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "saida" DATETIME,
    CONSTRAINT "CONTROLE_SALA_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "ALUNOS" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CONTROLE_COMPUTADORES" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "aluno_id" TEXT NOT NULL,
    "computador_id" INTEGER NOT NULL,
    "inicio_uso" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fim_uso" DATETIME,
    CONSTRAINT "CONTROLE_COMPUTADORES_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "ALUNOS" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CONTROLE_COMPUTADORES_computador_id_fkey" FOREIGN KEY ("computador_id") REFERENCES "COMPUTADORES" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PROBLEMAS_COMPUTADORES" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "computador_id" INTEGER,
    "categoria" TEXT,
    "descricao" TEXT NOT NULL,
    "data_registro" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_resolucao" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "registrado_por" TEXT NOT NULL,
    CONSTRAINT "PROBLEMAS_COMPUTADORES_computador_id_fkey" FOREIGN KEY ("computador_id") REFERENCES "COMPUTADORES" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PROBLEMAS_COMPUTADORES_registrado_por_fkey" FOREIGN KEY ("registrado_por") REFERENCES "USUARIOS" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IMPORTACOES_TERMOS" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'PROCESSANDO',
    "total_arquivos" INTEGER NOT NULL DEFAULT 0,
    "total_processados" INTEGER NOT NULL DEFAULT 0,
    "total_pendentes" INTEGER NOT NULL DEFAULT 0,
    "total_erros" INTEGER NOT NULL DEFAULT 0,
    "criado_por_id" TEXT,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" DATETIME NOT NULL,
    CONSTRAINT "IMPORTACOES_TERMOS_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "USUARIOS" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TERMOS_RESPONSABILIDADE" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome_extraido" TEXT,
    "matricula_extraida" TEXT,
    "data_assinatura" DATETIME,
    "nome_arquivo" TEXT NOT NULL,
    "caminho_arquivo" TEXT NOT NULL,
    "arquivo_hash" TEXT NOT NULL,
    "tamanho_bytes" INTEGER,
    "metodo_extracao" TEXT,
    "confianca_nome" REAL,
    "confianca_matricula" REAL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE_REVISAO',
    "observacao" TEXT,
    "aluno_id" TEXT,
    "importacao_id" TEXT NOT NULL,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" DATETIME NOT NULL,
    CONSTRAINT "TERMOS_RESPONSABILIDADE_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "ALUNOS" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TERMOS_RESPONSABILIDADE_importacao_id_fkey" FOREIGN KEY ("importacao_id") REFERENCES "IMPORTACOES_TERMOS" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "USUARIOS_email_key" ON "USUARIOS"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ALUNOS_email_key" ON "ALUNOS"("email");

-- CreateIndex
CREATE UNIQUE INDEX "COMPUTADORES_patrimonio_key" ON "COMPUTADORES"("patrimonio");

-- CreateIndex
CREATE UNIQUE INDEX "TERMOS_RESPONSABILIDADE_arquivo_hash_key" ON "TERMOS_RESPONSABILIDADE"("arquivo_hash");

-- CreateIndex
CREATE INDEX "TERMOS_RESPONSABILIDADE_matricula_extraida_idx" ON "TERMOS_RESPONSABILIDADE"("matricula_extraida");

-- CreateIndex
CREATE INDEX "TERMOS_RESPONSABILIDADE_status_idx" ON "TERMOS_RESPONSABILIDADE"("status");
