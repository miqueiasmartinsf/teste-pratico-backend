Teste Prático Back-end

Sistema gerenciador de pagamentos multi-gateway desenvolvido com **AdonisJS 7** (Node.js) + **MySQL**.

---

## Nível implementado

**Nível 3** – Completo:
- Valor da compra calculado via back-end a partir de múltiplos produtos e quantidades
- Autenticação nos gateways de pagamento
- Sistema de roles: `ADMIN`, `MANAGER`, `FINANCE`, `USER`
- TDD com Japa
- Docker Compose com MySQL, aplicação e mock dos gateways

---

## Requisitos

- **Node.js** >= 20
- **npm** >= 10
- **Docker** e **Docker Compose** (para rodar com containers)
- **MySQL 8** (para rodar localmente sem Docker)

---

## Instalação e execução

### Com Docker (recomendado)

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd teste-pratico-backend

# Copie e configure as variáveis de ambiente
cp .env.example .env
# Edite APP_KEY e JWT_SECRET com valores seguros

# Suba todos os serviços (MySQL + mock dos gateways + aplicação)
docker compose up -d

# A API estará disponível em http://localhost:3333
```

### Localmente

```bash
# Instale as dependências
npm install

# Copie e configure o .env
cp .env.example .env
# Ajuste DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE conforme seu MySQL local

# Rode o mock dos gateways em outro terminal
docker run -p 3001:3001 -p 3002:3002 matheusprotzen/gateways-mock

# Execute as migrations
node ace migration:run

# Inicie o servidor em modo de desenvolvimento
npm run dev
```

### Rodando os testes

Os testes utilizam **SQLite** automaticamente (sem precisar de MySQL):

```bash
npm test
```

### Documentação Swagger

Com a aplicação rodando, a documentação fica disponível em:

- `GET /api/v1/docs`
- `GET /api/v1/docs/openapi.json`

A interface HTML usa o Swagger UI via CDN e consome a spec OpenAPI exposta pela própria API.

---

## Variáveis de ambiente

| Variável | Descrição | Exemplo |
|---|---|---|
| `NODE_ENV` | Ambiente | `development` |
| `PORT` | Porta do servidor | `3333` |
| `HOST` | Host do servidor | `localhost` |
| `APP_KEY` | Chave de criptografia da aplicação | `...` |
| `JWT_SECRET` | Segredo para assinar tokens JWT | `...` |
| `SESSION_DRIVER` | Driver de sessão | `cookie` |
| `DB_HOST` | Host do MySQL | `127.0.0.1` |
| `DB_PORT` | Porta do MySQL | `3306` |
| `DB_USER` | Usuário do MySQL | `root` |
| `DB_PASSWORD` | Senha do MySQL | `secret` |
| `DB_DATABASE` | Nome do banco | `database_name` |
| `GATEWAY1_URL` | URL do Gateway 1 | `http://localhost:3001` |
| `GATEWAY1_EMAIL` | Email de autenticação do Gateway 1 | `dev@database.tech` |
| `GATEWAY1_TOKEN` | Token de autenticação do Gateway 1 | `FEC9BB...` |
| `GATEWAY2_URL` | URL do Gateway 2 | `http://localhost:3002` |
| `GATEWAY2_AUTH_TOKEN` | Header token do Gateway 2 | `tk_f219...` |
| `GATEWAY2_AUTH_SECRET` | Header secret do Gateway 2 | `3d15e8...` |

---

## Estrutura do Banco de Dados

```
users           – id, name, email, hashed_password, role, created_at, updated_at
gateways        – id, name, is_active, priority, created_at, updated_at
clients         – id, name, email, created_at, updated_at
products        – id, name, amount (centavos), created_at, updated_at, deleted_at
transactions    – id, client_id, gateway_id, external_id, status, amount, card_last_numbers, created_at, updated_at
transaction_products – id, transaction_id, product_id, quantity, unit_amount, created_at, updated_at
auth_tokens     – tokens JWT (gerenciados pelo AdonisJS)
```

---

## Sistema de Roles

| Role | Permissões |
|---|---|
| `ADMIN` | Acesso total |
| `MANAGER` | Gerenciar usuários e produtos |
| `FINANCE` | Gerenciar produtos e realizar reembolsos |
| `USER` | Listar/ver clientes e transações |

---

## Rotas da API

Base URL: `http://localhost:3333/api/v1`

### Públicas

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/auth/register` | Registrar novo usuário |
| `POST` | `/auth/login` | Login (retorna JWT) |
| `POST` | `/transactions/purchase` | Realizar uma compra |

#### POST `/auth/register`
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}
```

#### POST `/auth/login`
```json
{
  "email": "joao@example.com",
  "password": "senha123"
}
```
Retorno:
```json
{
  "token": "eyJ...",
  "refreshToken": "eyJ...",
  "user": { "id": 1, "name": "João Silva", "email": "joao@example.com", "role": "USER" }
}
```

#### POST `/transactions/purchase`
```json
{
  "client": {
    "name": "Maria Santos",
    "email": "maria@example.com"
  },
  "products": [
    { "id": 1, "quantity": 2 },
    { "id": 3, "quantity": 1 }
  ],
  "card": {
    "number": "5569000000006063",
    "cvv": "010"
  }
}
```

---

### Privadas (require `Authorization: Bearer <token>`)

#### Gateways (ADMIN)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/gateways` | Listar gateways |
| `PATCH` | `/gateways/:id` | Atualizar gateway (ativar/desativar, alterar prioridade) |

```json
// PATCH /gateways/:id
{
  "isActive": false,
  "priority": 2
}
```

---

#### Usuários (ADMIN, MANAGER)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/users` | Listar usuários |
| `GET` | `/users/:id` | Detalhe de um usuário |
| `POST` | `/users` | Criar usuário |
| `PUT` | `/users/:id` | Atualizar usuário |
| `DELETE` | `/users/:id` | Remover usuário |

```json
// POST /users
{
  "name": "Ana Costa",
  "email": "ana@example.com",
  "password": "senha123",
  "role": "FINANCE"
}
```

---

#### Produtos (ADMIN, MANAGER, FINANCE)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/products` | Listar produtos |
| `GET` | `/products/:id` | Detalhe de um produto |
| `POST` | `/products` | Criar produto |
| `PUT` | `/products/:id` | Atualizar produto |
| `DELETE` | `/products/:id` | Remover produto (soft delete) |

```json
// POST /products
{
  "name": "Camiseta BeTalent",
  "amount": 4990
}
```
> `amount` é em centavos. Ex: `4990` = R$ 49,90

---

#### Clientes (todos autenticados)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/clients` | Listar todos os clientes |
| `GET` | `/clients/:id` | Detalhe do cliente com todas as compras |

---

#### Transações (todos autenticados; reembolso: ADMIN e FINANCE)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/transactions` | Listar todas as transações |
| `GET` | `/transactions/:id` | Detalhe de uma transação |
| `POST` | `/transactions/:id/refund` | Reembolsar uma transação |

---

## Lógica Multi-Gateway

1. Os gateways são buscados do banco ordenados por `priority` (menor = maior prioridade)
2. A cobrança é tentada no primeiro gateway ativo
3. Em caso de falha, tenta o próximo gateway
4. Se algum tiver sucesso, a transação é salva e retornada sem erro
5. Novos gateways podem ser adicionados criando uma nova classe `GatewayXService` que implementa a interface `GatewayService` e registrando-a no `GatewayManagerService`

---

## Arquitetura

```
app/
  controllers/     – Controladores HTTP
  middleware/      – auth_middleware, role_middleware
  models/          – Modelos Lucid ORM
  services/        – gateway_manager_service, gateway1_service, gateway2_service
  validators/      – Validações VineJS
database/
  migrations/      – Migrations do banco
tests/
  functional/      – Testes de integração (HTTP)
  unit/            – Testes unitários de serviços
```

---

## Tecnologias

- **AdonisJS 7** – Framework Node.js
- **Lucid ORM** – ORM para MySQL/SQLite
- **VineJS** – Validação de dados
- **JWT** – Autenticação via `@maximemrf/adonisjs-jwt`
- **Japa** – Framework de testes
- **MySQL 8** – Banco de dados de produção
- **SQLite** – Banco de dados para testes
- **Docker Compose** – Orquestração de containers
