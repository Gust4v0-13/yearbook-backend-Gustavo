# API da Galeria de Desenhos

Contrato atual da API REST da Galeria de Desenhos.

## Acesso

Em desenvolvimento, a API fica disponível em:

```text
http://localhost:3000
```

Todas as requisições que enviam dados devem usar:

```http
Content-Type: application/json
```

Em produção, substitua a base URL pela URL gerada pelo deploy da Vercel.

## Resumo das rotas

| Método | Rota | Descrição | Autenticação |
| --- | --- | --- | --- |
| `GET` | `/` | Mensagem de boas-vindas | Não |
| `GET` | `/status` | Health check | Não |
| `POST` | `/auth/register` | Cria uma conta de artista | Não |
| `POST` | `/auth/login` | Autentica e retorna um JWT | Não |
| `GET` | `/artistas` | Lista artistas sem `senhaHash` | Não |
| `GET` | `/artistas/:id` | Busca um artista por ID | Não |
| `PUT` | `/artistas/:id` | Atualiza o próprio perfil | JWT do dono |
| `DELETE` | `/artistas/:id` | Exclui um artista | JWT de `ADMIN` |
| `GET` | `/desenhos` | Lista desenhos com dados do artista | Não |
| `POST` | `/desenhos` | Cria um desenho | JWT |
| `DELETE` | `/desenhos/:id` | Exclui um desenho | JWT do dono ou `ADMIN` |

O cadastro de artistas é feito por `/auth/register`. A API não possui `POST /artistas`.

## Autenticação

### Cadastro — `POST /auth/register`

Cria um artista com perfil `USER`. Os campos `nome`, `email` e `senha` são obrigatórios.

#### Requisição

```json
{
  "nome": "Pedro Teste",
  "email": "pedro@example.com",
  "senha": "pedro123",
  "cidade": "Salinas",
  "bio": "Em testes",
  "tecnica": "Aquarela"
}
```

Os campos `cidade`, `bio` e `tecnica` são opcionais.

#### Respostas

- `201 Created`: artista criado;
- `400 Bad Request`: um dos campos obrigatórios não foi enviado;
- `409 Conflict`: o email já está cadastrado;
- `500 Internal Server Error`: erro inesperado.

Exemplo de resposta `201`:

```json
{
  "id": 3,
  "nome": "Pedro Teste",
  "email": "pedro@example.com",
  "cidade": "Salinas",
  "bio": "Em testes",
  "tecnica": "Aquarela",
  "fotoUrl": null,
  "role": "USER",
  "criadoEm": "2026-08-19T12:00:00.000Z"
}
```

### Login — `POST /auth/login`

Autentica um artista e retorna um token JWT.

#### Requisição

```json
{
  "email": "pedro@example.com",
  "senha": "pedro123"
}
```

#### Respostas

- `200 OK`: login realizado;
- `401 Unauthorized`: email ou senha inválidos;
- `500 Internal Server Error`: erro inesperado.

Exemplo de resposta `200`:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

O token é assinado com `JWT_SECRET`, contém o `id` e a `role` do artista e expira em 7 dias.

### Envio do token

Nas rotas protegidas, envie o token no header:

```http
Authorization: Bearer <token>
```

Quando o header não é enviado, a resposta é `401` com:

```json
{
  "erro": "Token não fornecido"
}
```

Para token inválido ou expirado:

```json
{
  "erro": "Token inválido ou expirado"
}
```

## Health check

### Boas-vindas — `GET /`

Retorna `200 OK`:

```json
{
  "mensagem": "Galeria API está no ar! 🎨"
}
```

### Status — `GET /status`

Retorna `200 OK`:

```json
{
  "status": "ok",
  "timestamp": "2026-08-19T12:00:00.000Z"
}
```

## Artistas

### Listar artistas — `GET /artistas`

Retorna `200 OK` com um array de artistas. O campo `senhaHash` nunca aparece.

### Buscar artista — `GET /artistas/:id`

Retorna `200 OK` com o artista solicitado ou `404 Not Found`:

```json
{
  "erro": "Artista não encontrado"
}
```

### Atualizar perfil — `PUT /artistas/:id`

Requer o token do próprio artista. O `id` da URL precisa ser igual ao `id` presente no token.

Exemplo de requisição:

```json
{
  "cidade": "Montes Claros",
  "bio": "Bio atualizada",
  "tecnica": "Nanquim",
  "fotoUrl": "https://exemplo.com/foto.jpg"
}
```

Campos de perfil disponíveis: `nome`, `email`, `cidade`, `bio`, `tecnica` e `fotoUrl`. Envie somente os campos que devem ser alterados. `senhaHash`, `role`, `id` e `criadoEm` não devem ser enviados pelo cliente.

#### Respostas

- `200 OK`: artista atualizado, sem `senhaHash`;
- `401 Unauthorized`: token ausente, inválido ou expirado;
- `403 Forbidden`: o token não pertence ao artista da URL;
- `404 Not Found`: artista não encontrado.

### Excluir artista — `DELETE /artistas/:id`

Requer token com `role: "ADMIN"`. A exclusão também remove os desenhos associados ao artista.

#### Respostas

- `204 No Content`: artista excluído;
- `401 Unauthorized`: token ausente, inválido ou expirado;
- `403 Forbidden`: usuário não é administrador;
- `404 Not Found`: artista não encontrado.

Resposta de acesso negado:

```json
{
  "erro": "Acesso negado"
}
```

## Desenhos

### Listar desenhos — `GET /desenhos`

Retorna `200 OK` com os desenhos ordenados do mais novo para o mais antigo. Cada desenho inclui os dados públicos do artista:

```json
[
  {
    "id": 1,
    "titulo": "Autorretrato em nanquim",
    "imagemUrl": null,
    "artistaId": 1,
    "criadoEm": "2026-08-19T12:00:00.000Z",
    "artista": {
      "nome": "Clara",
      "fotoUrl": null
    }
  }
]
```

### Criar desenho — `POST /desenhos`

Requer um JWT válido. O artista é definido automaticamente pelo usuário autenticado; não é necessário enviar `artistaId`.

#### Requisição

```json
{
  "titulo": "Estudo de retrato",
  "imagemUrl": "https://exemplo.com/imagem.jpg"
}
```

O campo `titulo` é obrigatório e `imagemUrl` é opcional. Os campos de imagem são URLs; a API não realiza upload de arquivos.

#### Respostas

- `201 Created`: desenho criado;
- `400 Bad Request`: o campo `titulo` não foi enviado;
- `401 Unauthorized`: token ausente, inválido ou expirado;
- `500 Internal Server Error`: erro inesperado.

Exemplo de resposta `201`:

```json
{
  "id": 2,
  "titulo": "Estudo de retrato",
  "imagemUrl": "https://exemplo.com/imagem.jpg",
  "artistaId": 1,
  "criadoEm": "2026-08-19T12:00:00.000Z"
}
```

### Excluir desenho — `DELETE /desenhos/:id`

Requer token do artista dono do desenho ou de um administrador.

#### Respostas

- `204 No Content`: desenho excluído;
- `401 Unauthorized`: token ausente, inválido ou expirado;
- `403 Forbidden`: usuário não é o dono nem administrador;
- `404 Not Found`: desenho não encontrado.

Resposta quando não há permissão:

```json
{
  "erro": "Você não tem permissão para excluir este desenho"
}
```

## Modelos de dados

### Artista

| Campo | Tipo | Obrigatório | Observação |
| --- | --- | --- | --- |
| `id` | `Int` | Sim | Gerado automaticamente. |
| `nome` | `String` | Sim | Nome do artista. |
| `email` | `String` | Sim | Único no banco. |
| `senhaHash` | `String` | Sim | Armazenado com bcrypt; nunca retornado pela API. |
| `cidade` | `String` | Não | Cidade do artista. |
| `bio` | `String` | Não | Biografia curta. |
| `tecnica` | `String` | Não | Técnica principal do artista. |
| `fotoUrl` | `String` | Não | URL da foto; não há upload implementado. |
| `role` | `Role` | Sim | `USER` por padrão ou `ADMIN`. |
| `criadoEm` | `DateTime` | Sim | Preenchido automaticamente. |

### Desenho

| Campo | Tipo | Obrigatório | Observação |
| --- | --- | --- | --- |
| `id` | `Int` | Sim | Gerado automaticamente. |
| `titulo` | `String` | Sim | Título do desenho. |
| `imagemUrl` | `String` | Não | URL opcional de uma imagem. |
| `artistaId` | `Int` | Sim | Chave estrangeira para `Artista`. |
| `artista` | `Object` | Em listagem | Contém `nome` e `fotoUrl` do artista. |
| `criadoEm` | `DateTime` | Sim | Preenchido automaticamente. |

Datas são serializadas em formato ISO 8601 nas respostas JSON. A relação `Desenho.artista` usa exclusão em cascata: ao excluir um artista, seus desenhos também são removidos.

## Erros e comportamento geral

As respostas de erro usam o formato:

```json
{
  "erro": "Descrição do erro"
}
```

O middleware global retorna `500 Internal Server Error` para erros não tratados:

```json
{
  "erro": "Erro interno do servidor"
}
```

A API registra método, rota, status HTTP e duração de cada requisição no terminal.

## CORS

CORS está habilitado para qualquer origem. A API pode ser consumida por aplicações em `localhost`, Vercel ou outros domínios sem configuração adicional no cliente.

## Dados de desenvolvimento

Depois de executar `node prisma/seed.js`, o banco contém os seguintes usuários de teste:

| Perfil | Email | Senha |
| --- | --- | --- |
| `USER` | `clara@email.com` | `senha123` |
| `ADMIN` | `admin@email.com` | `admin123` |

Essas credenciais são exclusivas para desenvolvimento local e não devem ser usadas em produção.