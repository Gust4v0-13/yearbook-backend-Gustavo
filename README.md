# Galeria de Desenhos — Backend

Back-end da aplicação **Galeria de Desenhos**, adaptado a partir da API de referência do professor (Yearbook Digital), desenvolvido para registrar perfis de artistas e os desenhos que eles publicam. Este repositório contém somente a API; o front-end pode consumi-la por HTTP.

## Mapeamento do domínio

Esta API é uma adaptação da API de referência (Aluno/Mensagem) para o tema de uma galeria de desenhos, mantendo a mesma arquitetura (usuário com senha em hash, `role`, relacionamento 1:N com chave estrangeira).

| Original | Adaptado |
| --- | --- |
| `Aluno` (com `senhaHash`, `role`) | `Artista` |
| `Mensagem` (pertence a um aluno) | `Desenho` (pertence a um artista) |
| rotas `/alunos`, `/mensagens` | `/artistas`, `/desenhos` |

## Stack

- Node.js **18.18 ou superior** e npm;
- Express 5;
- Prisma 6 + PostgreSQL (Neon);
- `bcryptjs`, `jsonwebtoken`, `dotenv` e `cors`;
- Bruno para testes manuais/automatizados da API;
- Vercel para execução serverless;
- GitHub Actions para verificação de sintaxe.

## Estrutura do projeto

```text
.
├── controllers/          Regras de negócio de autenticação, artistas e desenhos
├── routes/               Rotas Express
├── middlewares/          Autenticação, autorização, logs e erros
├── utils/                Hash de senha e JWT
├── prisma/
│   ├── schema.prisma     Modelo do banco
│   ├── migrations/       Histórico das alterações do banco
│   ├── seed.js           Dados iniciais para desenvolvimento
│   └── client.js         Instância do Prisma Client
├── docs/API.md           Detalhamento do contrato da API
├── bruno/                Coleção e ambiente local/produção do Bruno
├── .github/workflows/    Smoke test do GitHub Actions
├── index.js              Entrada da aplicação
├── vercel.json           Configuração de deploy na Vercel
├── .env.example          Modelo das variáveis de ambiente
└── package.json          Scripts e dependências
```

## Endpoints disponíveis

Consulte [docs/API.md](./docs/API.md) para os campos dos modelos e as regras de autenticação.

## Como replicar o projeto

### 1. Pré-requisitos

Instale:

- Node.js 18.18+;
- npm;
- uma instância PostgreSQL. Para acompanhar a configuração usada no projeto, crie um banco gratuito no [Neon](https://neon.tech/). Também é possível usar PostgreSQL local.

### 2. Baixar e instalar

```bash
git clone <URL_DO_REPOSITORIO>
cd api-galeria-gustavo
npm install
```

Se o repositório tiver sido baixado como ZIP, basta entrar na pasta do projeto e executar `npm install`.

### 3. Configurar as variáveis de ambiente

Crie o arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

Preencha o arquivo:

```env
PORT=3000
DATABASE_URL="postgresql://usuario:senha@host/banco?sslmode=require"
JWT_SECRET="um-segredo-local-dificil-de-adivinhar"
```

`DATABASE_URL` deve apontar para o banco PostgreSQL criado no passo anterior. Não compartilhe nem versione o `.env`.

### 4. Criar as tabelas e os dados de exemplo

```bash
npx prisma generate
npx prisma migrate deploy
node prisma/seed.js
```

O seed é idempotente e pode ser executado mais de uma vez. Em um banco novo, ele cria:

- artista: `clara@email.com` / `senha123`;
- administrador: `admin@email.com` / `admin123`;
- dois desenhos iniciais da Clara.

Essas credenciais são apenas para desenvolvimento. Troque-as ou remova os dados antes de qualquer uso público.

### 5. Executar a API

Para desenvolvimento, com reinício automático:

```bash
npm run dev
```

Para iniciar sem o Nodemon:

```bash
npm start
```

Teste se o servidor está respondendo:

```bash
curl http://localhost:3000/status
```

Resposta esperada, com um timestamp variável:

```json
{
  "status": "ok",
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

### 6. Testar com Bruno

1. Instale o [Bruno](https://www.usebruno.com/).
2. Abra a pasta `bruno/` como coleção.
3. Selecione o ambiente local, que aponta `baseUrl` para `http://localhost:3000`.
4. Execute `Register` ou use os usuários criados pelo seed.
5. Execute `Login` ou `Login Admin`. O script da requisição salva automaticamente o JWT nas variáveis `tokenDono`/`tokenAdmin`.
6. Execute as requisições de artistas e desenhos. As variáveis de IDs também são preenchidas pelos scripts da coleção quando aplicável.

A coleção inclui casos de sucesso e de erro, como requisições sem token, artista inexistente, desenho sem título e exclusão sem permissão.

## Deploy na Vercel

O arquivo `vercel.json` já configura `index.js` como função serverless. Ao importar o repositório na Vercel, configure no projeto as mesmas variáveis `DATABASE_URL` e `JWT_SECRET` usadas no ambiente de produção. O banco deve ser acessível pela internet, como o Neon.

O seed deve ser executado com cuidado e preferencialmente apenas no banco de desenvolvimento. Para aplicar as migrações no banco de produção, use:

```bash
npx prisma migrate deploy
```

## Scripts e comandos úteis

| Comando                                         | Finalidade                                     |
| ----------------------------------------------- | ---------------------------------------------- |
| `npm install`                                   | Instala as dependências                        |
| `npm run dev`                                   | Inicia com Nodemon                             |
| `npm start`                                     | Inicia a API diretamente                       |
| `npx prisma generate`                           | Gera o Prisma Client                           |
| `npx prisma migrate deploy`                     | Aplica migrações existentes                    |
| `npx prisma migrate dev --name nome-da-mudanca` | Cria/aplica migração durante o desenvolvimento |
| `node prisma/seed.js`                           | Insere os dados iniciais                       |

O workflow do GitHub Actions verifica a sintaxe dos arquivos JavaScript após cada push. Para reproduzir essa verificação localmente:

```bash
find . -name '*.js' -not -path './node_modules/*' -exec node --check {} +
```