# Fluxo Serviços

Fluxo Serviços é uma aplicação web de prestação de serviços com autenticação Google via Firebase, front em Next.js, interface visual em CSS e componentes React, e persistência com Prisma + SQLite.

O projeto está em evolução. Este README descreve apenas o que está implementado no repositório atualmente e como rodar a aplicação localmente.

## Visão geral

A aplicação tem como objetivo conectar usuários que precisam contratar serviços com usuários que prestam serviços. Hoje o fluxo implementado é: entrar com Google, sincronizar o usuário no banco, visualizar a página inicial e consultar/editar o perfil autenticado.

## O que já está funcionando

### Autenticação

- Login com conta Google usando Firebase Auth.
- `AuthProvider` cria o contexto de autenticação global.
- O callback `onAuthStateChanged` observa a sessão do Firebase.
- O token do Firebase é enviado para `/api/auth/sync`.
- A rota `/api/auth/sync` recebe o token, valida com `adminAuth.verifyIdToken`, e cria ou busca o usuário no banco local com Prisma.
- O fluxo de login redireciona para `/` quando o usuário já está autenticado.

### Banco de dados

- O modelo principal está definido em `prisma/schema.prisma`.
- Entidades implementadas pelo schema: `Usuario`, `Perfil`, `Categoria`, `Servico`, `Contratacao`, `Avaliacao`, `Denuncia` e `Notificacao`.
- A base de dados usada no ambiente atual é SQLite com `DATABASE_URL="file:./dev.db"`.
- O projeto já possui migrações em `prisma/migrations/`.

### Página inicial

- A home page em `app/page.tsx` mostra uma landing page com hero, blocos de demanda, cartões de categorias e elementos visuais de identidade do projeto.
- A página não está conectada a uma listagem dinâmica de serviços em tempo real.

### Perfil

- A rota `/perfil` está implementada como página cliente em `app/perfil/page.tsx`.
- A página carrega o usuário autenticado pelo `AuthProvider`.
- A página busca o perfil pelo endpoint `/api/perfil` com `Authorization: Bearer <token>`.
- O perfil traz `usuario` e `perfil` do `GET /api/perfil`.
- O perfil pode ser exibido com foto, bio, telefone, localização e dados básicos do usuário.
- O perfil também permite editar `bio`, `telefone`, `localizacao` e `fotoUrl`.
- Os campos de edição são alterados em `draft` do cliente e só são enviados ao backend quando o usuário clica em salvar.
- A interface de perfil possui botão de edição com ícone, botão de salvar, botão de cancelar e botão de logout.

### API de perfil

- `GET /api/perfil` lê o token no header de autorização, valida o usuário e cria o perfil se ele ainda não existir.
- `PUT /api/perfil` atualiza o perfil do usuário autenticado com os dados enviados pelo cliente.

### Navegação

- A navegação por menu fica em `components/Sidebar.tsx`.
- O menu expõe links de `/`, `/projetos`, `/mensagens`, `/salvos` e `/perfil`.
- A navegação conecta com o `usePathname` para destacar o item ativo.

## Estrutura de pastas

```text
app/
  api/
    auth/sync/route.ts
    perfil/route.ts
  login/page.tsx
  perfil/page.tsx
  page.tsx

components/
  LoginButton.tsx
  Sidebar.tsx

lib/
  auth/getUsuarioAutenticado.ts
  firebase/AuthProvider.tsx
  firebase/admin.ts
  firebase/client.ts
  prisma.ts
  repositories/
  services/
```

## Tecnologias

- Next.js 16
- React 19
- TypeScript
- Firebase Auth
- Firebase Admin
- Prisma ORM
- SQLite
- Tailwind v4
- Lucide React

## Requisitos para executar

- Node.js 18+
- npm
- Uma conta Google e configuração do Firebase
- Banco SQLite disponível localmente

## Configuração de ambiente

O projeto já inclui um arquivo `.env` com valores de exemplo e chaves reais de desenvolvimento. Para rodar em outro ambiente, configure as variáveis abaixo:

```env
DATABASE_URL="file:./dev.db"

NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="..."

FIREBASE_PROJECT_ID="..."
FIREBASE_CLIENT_EMAIL="..."
FIREBASE_PRIVATE_KEY="..."
```

Os valores do Firebase precisam bater com o projeto configurado no Firebase Console.

## Passos para rodar localmente

1. Instale as dependências:

```bash
npm install
```

2. Gere o cliente Prisma:

```bash
npx prisma generate
```

3. Execute as migrações do banco:

```bash
npx prisma migrate dev
```

4. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

5. Abra a aplicação:

```text
http://localhost:3000
```

Se a porta 3000 estiver ocupada, o Next.js pode abrir outra porta, como 3001.

## Comandos disponíveis

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Limitações conhecidas

- A aplicação tem páginas de login, home, e perfil implementadas, mas ainda não tem fluxo completo de criação e listagem de serviços em interface.
- A API de cadastro de usuários já existe via sincronização com Firebase e Prisma, mas o fluxo de contratação de serviços e seus filtros ainda estão em estrutura de repositórios e serviços, sem tela completa implementada.
- O build atual do projeto falha em um ponto do repositório de contratação por incompatibilidade de tipo Prisma em `contratacaoRepository.ts`.

## Observação importante

Este README foi escrito para refletir o projeto como está hoje, sem prometer recursos que ainda não têm tela, rota ou fluxo completo implementados.
