# Realtime Messaging

Aplicação de chat em tempo real inspirada no Discord. Usuários criam servidores, organizam conversas em canais, convidam outras pessoas e trocam mensagens atualizadas por WebSocket.

O projeto é um **monólito modular**: backend e frontend vivem no mesmo repositório, mas o backend organiza cada capacidade de negócio em módulos coesos (`auth`, `servers`, `channels`, `invites` e `messages`). Não há microserviços.

## Recursos

- Cadastro, login e autenticação com JWT.
- Criação de servidores com canal padrão `general` e criador como `OWNER`.
- Criação de canais por proprietários.
- Convites com código, expiração e limite de usos opcionais.
- Histórico de mensagens paginado por cursor.
- Mensagens em tempo real via Socket.IO, autenticadas no handshake.
- Rooms por servidor para isolar broadcasts.
- Envio otimista com `tempId`, para mostrar a mensagem imediatamente e confirmá-la sem duplicação.
- Contador de não lidas em canais que não estão abertos.

## Stack

| Área | Tecnologias |
|---|---|
| Frontend | React, TypeScript, Vite, React Router e Socket.IO Client |
| Backend | Node.js, TypeScript, Express e Socket.IO |
| Dados | PostgreSQL, Prisma e Prisma Migrate |
| Segurança | bcrypt, JWT e Zod |
| Ambiente local | Docker Compose |

## Arquitetura

```text
client/                         Interface React
  src/features/                 auth, chat, convites e landing page
  src/lib/                      cliente HTTP, socket e armazenamento do token

server/                         Backend do monólito modular
  src/modules/                  módulos por funcionalidade
    auth/ servers/ channels/ invites/ messages/
  src/ws/                       autenticação, handlers e broadcast Socket.IO
  src/shared/                   Prisma, JWT, erros e middlewares reutilizáveis
  prisma/                       schema e migrations
```

Cada módulo backend segue o fluxo abaixo, sem colocar regras de negócio em rotas ou handlers de socket:

```text
rota HTTP / handler WebSocket → service (caso de uso) → repository (Prisma)
```

Para mensagens, o Socket.IO é apenas a borda de entrada: o handler chama `messages.service`, que valida membership, salva no banco e só então chama o broadcaster. Assim, WebSocket é o único caminho de escrita e REST fica responsável por histórico e CRUD.

## Pré-requisitos

- Node.js 20 ou superior
- npm
- Docker e Docker Compose

## Execução local

### 1. Backend e banco

No PowerShell, configure as variáveis de ambiente:

```powershell
cd server
Copy-Item .env.example .env
```

Edite `server/.env`. `JWT_SECRET` é obrigatório; `PORT`, `JWT_EXPIRES_IN` e `CLIENT_ORIGIN` têm padrão.

```dotenv
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=realtime_messaging
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/realtime_messaging?schema=public"

JWT_SECRET=troque-esta-chave-por-uma-chave-local-segura
JWT_EXPIRES_IN=7d
PORT=3000
CLIENT_ORIGIN=http://localhost:5173
```

> Não versione `.env` e não use a chave de desenvolvimento em produção.

O Compose usa um volume Docker externo para preservar os dados. Crie-o uma vez, instale as dependências e suba o banco:

```powershell
docker volume create realtime-messaging_realtime_messaging_pgdata
npm install
npm run db:up
```

Execute a migration, gere o Prisma Client e inicie a API:

```powershell
npm run db:migrate
npm run db:generate
npm run dev
```

A API e o Socket.IO estarão em `http://localhost:3000`. Para verificar:

```powershell
Invoke-RestMethod http://localhost:3000/health
```

O resultado esperado é `{ "ok": true }`.

### 2. Frontend

Em outro terminal, a partir da raiz do repositório:

```powershell
cd client
npm install
npm run dev
```

Abra o endereço exibido pelo Vite, normalmente `http://localhost:5173`. O Vite encaminha `/api` e `/socket.io` para `http://localhost:3000`; não há URL de API adicional para configurar localmente.

### 3. Parar o banco

Na pasta `server`:

```powershell
npm run db:down
```

O container é removido, mas os dados permanecem no volume Docker. Para apagá-los, remova explicitamente o volume criado acima.

## Fluxo de uso

1. Crie uma conta em `/register`.
2. Crie um servidor; o canal `general` aparecerá automaticamente.
3. Crie canais extras como proprietário.
4. Gere um convite e abra-o em uma janela anônima para um segundo usuário.
5. Aceite o convite e troque mensagens entre as duas sessões.
6. Envie uma mensagem em outro canal e observe o contador de não lidas na sessão que continua no canal atual.

## API HTTP

Rotas protegidas exigem `Authorization: Bearer <JWT>`.

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/health` | Verificação da API |
| `POST` | `/auth/register` | Cria uma conta |
| `POST` | `/auth/login` | Autentica e retorna JWT |
| `POST` | `/auth/logout` | Encerra a sessão no client |
| `GET` | `/me` | Usuário autenticado |
| `GET` / `POST` | `/servers` | Lista ou cria servidores |
| `GET` / `POST` | `/servers/:serverId/channels` | Lista ou cria canais |
| `GET` | `/channels/:channelId/messages?before=<id>&limit=<n>` | Histórico paginado |
| `POST` | `/servers/:serverId/invites` | Cria convite |
| `GET` | `/invites/:code` | Prévia de convite |
| `POST` | `/invites/:code/accept` | Aceita convite idempotentemente |

## Eventos Socket.IO

O client envia o JWT em `socket.handshake.auth.token`. Após validá-lo, o servidor adiciona o socket às rooms dos servidores do usuário.

| Direção | Evento | Finalidade |
|---|---|---|
| Client → server | `message:send` | Envia `{ channelId, content, tempId }` |
| Server → clients | `message:new` | Transmite a mensagem persistida para `server:{serverId}` |
| Client → server | `server:join` | Entra na room após aceitar convite |
| Server → client | `error` | Erros de validação, autorização ou infraestrutura |

`tempId` é um UUID gerado pelo navegador no envio. A interface cria uma bolha provisória com ele; depois que o backend persiste a mensagem, o mesmo `tempId` volta no broadcast. O client troca a bolha provisória pela mensagem definitiva em vez de adicionar uma segunda bolha.

## Scripts

### `server/`

| Comando | Descrição |
|---|---|
| `npm run dev` | API em modo watch |
| `npm run db:up` / `db:down` | Inicia / para PostgreSQL |
| `npm run db:migrate` | Cria ou aplica migrations locais |
| `npm run db:generate` | Gera Prisma Client |
| `npm run db:studio` | Abre Prisma Studio |

### `client/`

| Comando | Descrição |
|---|---|
| `npm run dev` | Vite em desenvolvimento |
| `npm run build` | Checagem TypeScript e build de produção |
| `npm run lint` | ESLint |
| `npm run preview` | Servidor do build local |

## Modelo de dados

O PostgreSQL armazena `User`, `Server`, `ServerMember`, `Channel`, `Message` e `Invite`.

- `ServerMember` representa a relação N:N entre usuários e servidores e impede duplicação de membership.
- Criar servidor é transacional: servidor, membership `OWNER` e canal padrão são criados juntos.
- `Message` tem índice `(channelId, createdAt)` para histórico cronológico.
- Convites podem expirar, limitar usos e ser aceitos repetidamente sem duplicar membership.

## Limitações atuais

Este é um MVP local e single-instance. Ainda não inclui refresh token/blacklist JWT, permissões granulares por canal, mensagens diretas, anexos, edição/remoção de mensagens, rate limiting, observabilidade, testes automatizados ou escala horizontal com Redis adapter.

### Lint pendente

O comando `npm run lint` do frontend está configurado, mas ainda possui violações conhecidas fora do escopo atual: usos de `any`, organização de hooks/contexts para Fast Refresh e dependências de efeitos React. Esses avisos não impedem a execução local do projeto, porém o comando terminará com erro até uma etapa futura de refatoração e tipagem.