# 📦 StockSnap

![CI](https://github.com/gabriellqv/stocksnap/actions/workflows/ci.yml/badge.svg)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-5-F36D22?logo=react&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

> Sistema full-stack de controle de estoque para pequenos comércios e MEIs. Gerencie produtos, registre entradas e saídas com transações atômicas, receba alertas de estoque baixo e acompanhe métricas de negócio em tempo real.

🔗 **[Demo ao Vivo](https://stocksnap.vercel.app)** · 📡 **[API](https://stocksnap-api.up.railway.app/api)**

<!-- ![StockSnap Demo](./docs/demo.gif) -->

---

## 🧩 O Problema

Donos de pequenos comércios controlam estoque em cadernos ou planilhas. Não sabem quando um produto vai acabar até que o cliente pede e não tem - gerando perda de vendas e desorganização.

**StockSnap** resolve isso com:

- 📋 Cadastro de produtos com categorias, SKU e preços (custo + venda)
- 📥📤 Registro de entradas e saídas com **transação atômica**
- 🔄 Cálculo automático de estoque - se a operação falha no meio, tudo é revertido
- 🔴 Alertas visuais quando o estoque atinge o mínimo configurado
- 📊 Dashboard com métricas de negócio em tempo real, cacheado com Redis

---

## 🏗️ Arquitetura

```
┌─────────────────────┐      REST API       ┌─────────────────────┐
│      Frontend        │ ◄────────────────► │       Backend        │
│  Next.js 16          │                     │      NestJS 11       │
│  React 19 + TS       │                     │    TypeScript        │
│  Zustand (stores)    │                     │    Prisma ORM        │
│  Tailwind CSS 4      │                     │    class-validator    │
│  Recharts            │                     │                      │
└─────────────────────┘                     └───────┬──────┬───────┘
                                                    │      │
                                               ┌────▼──┐ ┌─▼────┐
                                               │Postgres│ │Redis │
                                               │  16    │ │  7   │
                                               │ (DB)   │ │(Cache)│
                                               └───────┘ └──────┘
```

```
Telas (Frontend):               Módulos (Backend):
• Login                          • AuthModule (JWT, Guards, Roles)
• Dashboard (cards + gráfico)    • ProductsModule (CRUD + paginação)
• Produtos (tabela + CRUD)       • CategoriesModule (CRUD)
• Movimentações (formulário)     • MovementsModule (transação atômica)
• Categorias (CRUD simples)      • DashboardModule (métricas + cache)

Zustand Stores:
• useAuthStore (JWT + persist)
• useProductStore (CRUD + paginação)
• useCategoryStore (CRUD)
```

---

## ⚡ Tech Stack

| Camada | Tecnologia | Justificativa |
|---|---|---|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 4, **Zustand** | App Router, RSC, tipagem end-to-end, estado global |
| **Backend** | NestJS 11, TypeScript, Prisma ORM | Arquitetura modular, DI nativa, validação com DTOs |
| **Banco** | PostgreSQL 16 | Transações ACID, queries de agregação, raw queries |
| **Cache** | Redis 7 | Cache do dashboard (TTL 60s) com invalidação automática |
| **Validação** | class-validator, class-transformer, Zod | DTOs rigorosos no backend, schemas no frontend |
| **Gráficos** | Recharts | Charts responsivos no dashboard |
| **Testes** | Jest, React Testing Library | Unitários (services) + componentes |
| **DevOps** | Docker Compose, GitHub Actions | Containerização + CI pipeline (lint → test → build) |
| **Deploy** | Railway (API + DB + Redis), Vercel (Frontend) | Deploy automático a cada push na `main` |

---

## 📋 Funcionalidades

| Feature | Descrição |
|---|---|
| 🔐 **Autenticação JWT** | Register/Login com bcrypt (10 salt rounds), roles Admin/Operator |
| 📦 **CRUD de Produtos** | Cadastro com SKU único, preço de custo/venda, estoque mínimo |
| 📂 **CRUD de Categorias** | Agrupamento lógico com proteção contra exclusão com vínculos |
| 📥📤 **Movimentações Atômicas** | Entradas/saídas via `prisma.$transaction()` - movimento + update juntos |
| 🚫 **Estoque Negativo Bloqueado** | Validação server-side impede saídas maiores que o disponível |
| 🔴 **Alertas de Estoque Baixo** | Badges visuais (verde/amarelo/vermelho) + lista de itens críticos |
| 📊 **Dashboard em Tempo Real** | Cards de métricas + gráfico de barras (Recharts) dos últimos 7 dias |
| ⚡ **Cache Redis** | Dashboard cacheado com TTL 60s, invalidado automaticamente em cada movimentação |
| 🔍 **Busca e Filtros** | Pesquisa case-insensitive por nome/SKU + filtro por categoria |
| 📄 **Paginação Server-Side** | API paginada com metadados (`total`, `page`, `limit`, `totalPages`) |
| 👤 **Auditoria** | Cada movimentação registra o usuário responsável (extraído do JWT) |
| ✅ **Testes** | Jest (regras de negócio) + RTL (componentes) |
| 🐳 **Docker** | `docker-compose up --build` sobe 4 containers (API + Frontend + Postgres + Redis) |
| 🔄 **CI/CD** | GitHub Actions roda lint + test + build em cada push/PR |

---

## 📁 Estrutura do Projeto

```
stocksnap/
├── backend/
│   ├── src/
│   │   ├── auth/               # JWT, Guards, Strategies, Decorators
│   │   │   ├── decorators/     # @CurrentUser()
│   │   │   ├── dto/            # RegisterDto, LoginDto
│   │   │   ├── guards/         # JwtAuthGuard
│   │   │   └── strategies/     # JwtStrategy (Passport)
│   │   ├── categories/         # CRUD com validação de unicidade
│   │   ├── products/           # CRUD com paginação, busca, filtros
│   │   ├── movements/          # Entrada/saída com transação atômica
│   │   ├── dashboard/          # Métricas agregadas + cache Redis
│   │   ├── prisma/             # PrismaService global
│   │   └── main.ts             # Bootstrap com ValidationPipe + CORS
│   ├── prisma/
│   │   ├── schema.prisma       # 4 modelos, 2 enums
│   │   └── seed.ts             # 2 users, 5 categorias, 15 produtos, 6 movimentações
│   ├── rest-client/
│   │   └── requests.http       # Testes manuais da API (VS Code REST Client)
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/login/   # Página de login
│   │   │   └── (dashboard)/    # Rotas protegidas com sidebar
│   │   │       ├── page.tsx        # Dashboard
│   │   │       ├── products/       # Tabela + modal CRUD
│   │   │       ├── movements/      # Formulário + histórico
│   │   │       └── categories/     # CRUD simples
│   │   ├── components/         # Sidebar, Header, UI components
│   │   ├── stores/             # Zustand stores (auth, products, categories)
│   │   ├── lib/                # API Client centralizado, utils
│   │   └── types/              # Interfaces TypeScript (end-to-end)
│   └── Dockerfile
├── docker-compose.yml          # Postgres 16 + Redis 7 (+ API + Frontend)
├── .github/workflows/ci.yml   # CI pipeline
└── README.md
```

---

## 🚀 Rodar Localmente

### Pré-requisitos

- **Node.js** 20+
- **Docker Desktop** (para Postgres e Redis)

### Setup rápido

```bash
# 1. Clonar o repositório
git clone https://github.com/gabriellqv/stocksnap.git
cd stocksnap

# 2. Subir banco + cache
docker-compose up -d postgres redis

# 3. Backend (terminal 1)
cd backend
cp .env.example .env       # ou use o .env existente
npm install
npx prisma migrate dev     # cria as tabelas
npx prisma db seed         # popula com dados de exemplo
npm run start:dev           # http://localhost:3001

# 4. Frontend (terminal 2)
cd frontend
npm install
npm run dev                 # http://localhost:3000
```

**Acesse** → `http://localhost:3000`
**Login** → `admin@stocksnap.com` / `admin123`

### Ou com Docker Compose (tudo de uma vez)

```bash
docker-compose up --build
```

> Sobe 4 containers: PostgreSQL, Redis, API (NestJS) e Frontend (Next.js).
> Acesse `http://localhost:3000` - o sistema inteiro rodando em containers.

---

## 📡 API Endpoints

Todas as rotas (exceto Auth) exigem `Authorization: Bearer <JWT>`.

### Auth

| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/api/auth/register` | Criar conta (name, email, password) |
| `POST` | `/api/auth/login` | Login → retorna `{ access_token, user }` |

### Categorias

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/categories` | Listar todas (com contagem de produtos) |
| `POST` | `/api/categories` | Criar (name único) |
| `PATCH` | `/api/categories/:id` | Editar |
| `DELETE` | `/api/categories/:id` | Deletar (bloqueado se tem produtos) |

### Produtos

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/products?search=X&categoryId=Y&page=1&limit=10` | Listar (paginado, filtros) |
| `GET` | `/api/products/:id` | Detalhe + últimas 20 movimentações |
| `POST` | `/api/products` | Criar (SKU único) |
| `PATCH` | `/api/products/:id` | Editar parcialmente |
| `DELETE` | `/api/products/:id` | Deletar (bloqueado se tem movimentações) |

### Movimentações

| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/api/movements` | Registrar entrada/saída (transação atômica) |
| `GET` | `/api/movements?type=ENTRY&productId=X&page=1` | Listar com filtros |

### Dashboard

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/dashboard/summary` | `{ totalProducts, totalValue, criticalItems, todayMovements }` |
| `GET` | `/api/dashboard/chart` | Movimentações dos últimos 7 dias (entradas vs saídas) |
| `GET` | `/api/dashboard/low-stock` | Produtos com estoque ≤ mínimo (ordenado por criticidade) |

---

## 🎯 Destaques Técnicos

### 1. Transação Atômica nas Movimentações

O coração do sistema. Ao registrar uma entrada ou saída, duas operações precisam acontecer juntas: criar o registro de movimentação **e** atualizar a quantidade do produto. Usando `prisma.$transaction()`, garantimos que ambas executam ou nenhuma - evitando dados inconsistentes.

```typescript
const result = await this.prisma.$transaction(async (tx) => {
  const movement = await tx.movement.create({ ... });
  const updatedProduct = await tx.product.update({
    where: { id: dto.productId },
    data: { quantity: { increment: quantityChange } },
  });
  return { movement, updatedStock: updatedProduct.quantity };
});
```

### 2. Cache Inteligente com Redis

O Dashboard faz queries pesadas de agregação. Com Redis (TTL 60s), a query roda no máximo 1x por minuto - mesmo com 100 acessos simultâneos. O cache é **invalidado automaticamente** quando uma nova movimentação é registrada.

```
SEM cache:  Usuário → API → PostgreSQL (query pesada) → 300ms
COM cache:  Usuário → API → Redis (memória)           →   5ms ⚡
```

### 3. Validação em Camadas

- **Backend:** DTOs com `class-validator` - `whitelist: true` + `forbidNonWhitelisted: true` garantem que nenhum campo inválido chega ao banco
- **Frontend:** Schemas Zod + React Hook Form para feedback instantâneo
- **Negócio:** Estoque negativo bloqueado server-side, SKUs e emails únicos com tratamento de conflito (409)

### 4. Proteção Completa

- JWT com payload (`sub`, `email`, `role`) + expiração configurável
- Guard global em todas as rotas protegidas
- `userId` extraído do token (nunca do body) para auditoria
- CORS restrito ao frontend (`http://localhost:3000`)
- Mensagens de erro genéricas no login (OWASP A07:2021 - evita enumeração de contas)

### 5. Estado Global com Zustand

3 stores modulares gerenciam todo o estado da aplicação frontend:

- **`useAuthStore`**: JWT token + dados do usuário, com middleware `persist` para `localStorage`. Sincroniza o token com o API client automaticamente via `onRehydrateStorage`.
- **`useProductStore`**: lista paginada, busca, filtros e CRUD completo com atualização otimista.
- **`useCategoryStore`**: CRUD de categorias com refresh automático.

### 6. API Profissional

- Paginação server-side com metadados completos
- Busca case-insensitive por nome e SKU
- Filtros combináveis (categoria + busca + paginação)
- Status codes corretos (200, 201, 400, 401, 404, 409)
- Mensagens de erro descritivas em português

---

## 🧪 Testes

```bash
# Backend - regras de negócio (movimentações, estoque negativo, cache)
cd backend && npm test

# Frontend - componentes (badges, renderização)
cd frontend && npx jest
```

**Backend (6 testes):**
- ✓ Produto inexistente → `NotFoundException`
- ✓ Saída > estoque → `BadRequestException`
- ✓ Mensagem de erro descritiva
- ✓ Entrada com estoque zero → permite
- ✓ Saída exata (zera estoque) → permite
- ✓ Invalidação de cache após movimentação

**Frontend (4 testes):**
- ✓ Badge verde quando estoque saudável
- ✓ Badge vermelho quando estoque crítico
- ✓ Badge amarelo em zona de alerta
- ✓ Boundary case (dobro do mínimo + 1)

---

## 🗃️ Modelo do Banco de Dados

```
┌──────────┐       ┌──────────────┐       ┌──────────┐
│   User   │       │   Product    │       │ Category │
├──────────┤       ├──────────────┤       ├──────────┤
│ id       │       │ id           │       │ id       │
│ name     │       │ name         │       │ name     │
│ email 🔑 │──┐    │ sku 🔑       │    ┌──│          │
│ password │  │    │ description  │    │  └──────────┘
│ role     │  │    │ costPrice    │    │
│ createdAt│  │    │ sellPrice    │    │   Roles:
└──────────┘  │    │ quantity     │    │   • ADMIN
              │    │ minQuantity  │    │   • OPERATOR
              │    │ categoryId ──┼────┘
              │    │ createdAt    │        MovementType:
              │    │ updatedAt    │        • ENTRY
              │    └──────┬───────┘        • EXIT
              │           │
              │    ┌──────▼───────┐
              │    │  Movement    │
              │    ├──────────────┤
              │    │ id           │
              │    │ type         │
              │    │ quantity     │
              │    │ reason       │
              └───▶│ userId       │
                   │ productId    │
                   │ createdAt    │
                   └──────────────┘
```

**Relações:**
- `Category 1 → N Product` (uma categoria tem vários produtos)
- `Product 1 → N Movement` (um produto tem várias movimentações)
- `User 1 → N Movement` (um usuário registra várias movimentações)

---

## 🛡️ Regras de Negócio

| # | Regra | Comportamento |
|:-:|---|---|
| 1 | Estoque nunca negativo | Saída > estoque → `400 Bad Request` |
| 2 | Movimentações auditáveis | Cada registro inclui usuário, data e motivo |
| 3 | Atualização atômica | Movimento + update de estoque em `$transaction` |
| 4 | Alerta de estoque baixo | `quantity ≤ minQuantity` → alerta visual no dashboard |
| 5 | Auditoria automática | `userId` extraído do JWT, não do body |
| 6 | Roles (Admin/Operator) | Admin: CRUD completo · Operator: movimentações + visualização |

---

## ⚙️ Variáveis de Ambiente

### Backend (`backend/.env`)

```env
DATABASE_URL="postgresql://stocksnap:stocksnap123@localhost:5432/stocksnap?schema=public"
JWT_SECRET="sua-chave-secreta-aqui-troque-em-producao"
JWT_EXPIRATION="7d"
REDIS_HOST="localhost"
REDIS_PORT=6379
PORT=3001
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 📝 Licença

MIT

---

Feito por **[Gabriel Queiroz](https://github.com/gabriellqv)** · [LinkedIn](https://linkedin.com/in/gabriellqv)
