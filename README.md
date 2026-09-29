# LabView UFPI - Sistema de Gerenciamento de Laboratório de Informática

Sistema desenvolvido para apoio e controle das atividades do Laboratório de Informática do **Bacharelado em Sistemas de Informação da Universidade Federal do Piauí (UFPI - CSHNB Picos)**.

Baseado na proposta e modelagem de: **Luis G. L. D. Ramos, Marcos Eduardo e Veron**.

---

## 🎨 Identidade Visual & Paleta de Cores
O sistema foi desenvolvido utilizando a paleta com variações de roxos/violetas:
- **Lavanda Suave (Backgrounds):** `#F5F3FF`
- **Roxo Real / Acentos:** `#5E3BEE` / `#7C5CFC`
- **Violeta Profundo:** `#3A1E9E` / `#4828C5`
- **Índigo / Obsidian (Modo Escuro):** `#1C103E` / `#0D081D`
- Alternância dinâmica entre **Modo Claro** e **Modo Escuro**.

---

## 🚀 Tecnologias Utilizadas
- **Framework:** [Next.js 15 (App Router)](https://nextjs.org) + **React 19** + **TypeScript**
- **Banco de Dados & Backend:** [Supabase PostgreSQL](https://supabase.com) com Row Level Security (RLS)
- **Estilização:** Tailwind CSS v4 com design tokens customizados e Glassmorphism
- **Ícones:** [Lucide React](https://lucide.dev)
- **QR Code:** `qrcode.react` (SVG de alta resolução para crachás e carteirinhas)
- **Persistência de Estado:** React Context API + LocalStorage Engine + Supabase Sync
- **API Serverless:** Endpoints `/api/alunos`, `/api/computadores`, `/api/problemas`, `/api/status`, etc.


---

## 📋 Módulos e Funcionalidades

1. **Dashboard Geral (`/`):**
   - Indicadores em tempo real (Alunos na sala, Computadores em uso, Livres e Chamados).
   - Barra visual de distribuição do parque de máquinas.
   - Feed de presença ao vivo.
   - Busca global rápida por aluno, matrícula ou computador.

2. **Mapa da Sala em Tempo Real (`/mapa`):**
   - Planta visual da sala com identificação da frente (mesa do professor e projetor).
   - Grade interativa de computadores com status por cores:
     - 🟢 **Verde:** Disponível
     - 🟣 **Roxo:** Ocupado (com tempo de uso e nome do aluno)
     - 🔴 **Vermelho:** Em Manutenção
   - Ações com 1 clique: Alocar aluno da sala, alocar por matrícula direta, liberar máquina ou abrir chamado.

3. **Controle de Entrada & Saída (`/acesso`):**
   - Simulador visual de leitor **QR Code / RFID** com scanner animado.
   - Identificação rápida por matrícula com bloqueio de alunos com status **Suspenso**.
   - Liberação automática do computador ao registrar saída.

4. **Inventário de Computadores (`/computadores`):**
   - Listagem completa, patrimônio UFPI, hostname (ex: `LAB-01`) e especificações de hardware.
   - Filtros por status e modal de cadastro/edição/exclusão.

5. **Alunos & Carteirinhas Digitais (`/alunos`):**
   - Gestão de matrículas e cursos da UFPI.
   - Emissor de **Carteirinha Digital UFPI** com QR Code escaneável e layout de impressão.

6. **Ocorrências & Chamados (`/ocorrencias`):**
   - Registro de falhas técnicas com bloqueio automático da máquina no mapa.
   - Histórico de manutenções pendentes e resolvidas.

7. **Histórico & Relatórios (`/relatorios`):**
   - Logs de todas as sessões e acessos.
   - **Exportação para CSV** e impressão de relatório oficial.

8. **Operadores & Administradores (`/usuarios`):**
   - Gestão de perfis (Administrador e Monitor).

---

## 🛠️ Como Rodar Localmente

```bash
# 1. Instalar dependências (já instaladas)
npm install

# 2. Iniciar servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## ☁️ Como Fazer Deploy na Vercel

### Opção 1: Via Vercel CLI (Direto pelo terminal)
```bash
npx vercel
```
Siga os passos interativos informando sua conta Vercel.

### Opção 2: Pelo GitHub (Recomendado)
1. Crie um repositório no seu GitHub.
2. Faça o push do projeto:
   ```bash
   git init
   git add .
   git commit -m "feat: LabView UFPI Sistema de Laboratorios Next.js"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
   git push -u origin main
   ```
3. Acesse [vercel.com/new](https://vercel.com/new), conecte seu repositório GitHub e clique em **Deploy**.
4. O Next.js será detectado automaticamente e o deploy estará no ar em poucos segundos!
