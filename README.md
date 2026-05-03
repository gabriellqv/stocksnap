# StockSnap

![CI](https://img.shields.io/github/actions/workflow/status/gabriellqv/stocksnap/ci.yml?label=CI&logo=github) ![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white) ![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs&logoColor=white) ![Zustand](https://img.shields.io/badge/Zustand-5-ea580c?logo=react&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white) ![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-5-007ACC?logo=typescript&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

![Coverage](https://img.shields.io/badge/coverage-100%25-success) ![License](https://img.shields.io/badge/license-MIT-blue)

## Visao geral

O StockSnap automatiza o controle de inventario garantindo a exatidao dos saldos por meio de arquitetura transacional e atualizacao imediata via cache.

1. **Stack principal:** Node.js, NestJS, Prisma, PostgreSQL, Redis, Next.js, Zustand e Tailwind CSS.
2. **Diferenciais:** Prevencao de saldos negativos via transacoes no banco de dados, carregamento rapido de metricas com cache distribuido e blindagem contra injecao em exportacoes.
3. **Repositorio oficial:** [github.com/gabriellqv/stocksnap](https://github.com/gabriellqv/stocksnap)
4. **Demonstracao online:** [Acessar Aplicacao Web](https://stocksnap-dashboard.vercel.app/) | [Documentacao da API](https://stocksnap-api.onrender.com/api/docs)

## Preview

<div align="center">
  <img src="./frontend/public/screenshots/dashboard.png" alt="Painel Administrativo" width="800"/>
  <br/>
  <i>Painel administrativo exibindo indicadores de desempenho e fluxo de estoque.</i>
</div>
<br/>

<div align="center">
  <img src="./frontend/public/screenshots/movements.png" alt="Listagem de Movimentacoes" width="800"/>
  <br/>
  <i>Tabela de registro de movimentacoes com historico auditavel de entradas e saidas.</i>
</div>
<br/>

<div align="center">
  <img src="./frontend/public/screenshots/products.png" alt="Gestao de Produtos" width="800"/>
  <br/>
  <i>Interface de gerenciamento de produtos com controle de quantidade minima e categorias.</i>
</div>

## Resultados e impacto

1. **Performance acelerada:** O cache em memoria com Redis elimina a demora nas consultas pesadas do dashboard, entregando as metricas em tempo real.
2. **Consistencia garantida:** O uso de blocos transacionais no banco de dados impossibilita a criacao de saldos negativos, mesmo com requisicoes simultaneas.
3. **Experiencia do usuario fluida:** O controle de estado local via Zustand reduz renderizacoes desnecessarias da interface, evitando lentidao no navegador.
4. **Seguranca preventiva:** O bloqueio estrito de dados nao mapeados e a protecao de rotas impedem manipulacoes e acessos nao autorizados.

## Arquitetura do sistema

```mermaid
graph TD
    Client[Cliente Web / Next.js] -->|HTTP REST / JWT| API(Backend API / NestJS)
    API -->|Consulta Rapida| Redis[(Cache Redis)]
    API -->|Persistencia Transacional| Postgres[(PostgreSQL)]
```

### Fluxo de movimentacao de estoque

```mermaid
sequenceDiagram
    participant F as Frontend
    participant A as API (NestJS)
    participant P as PostgreSQL
    participant R as Redis

    F->>A: POST /movements (JWT + payload)
    A->>P: BEGIN TRANSACTION
    P-->>A: Saldo atual do produto
    A->>A: Validacao (saldo >= quantidade para EXIT)
    A->>P: INSERT movement + UPDATE product.quantity
    A->>P: COMMIT
    A->>R: DEL dashboard:summary, dashboard:low-stock
    A-->>F: 201 { movement, updatedStock }
```

## Tecnologias

| Camada | Tecnologia |
|---|---|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Zustand |
| **Backend** | NestJS 11, TypeScript, Prisma ORM, Swagger |
| **Banco** | PostgreSQL 16 |
| **Cache** | Redis 7 |
| **Validacao** | class-validator, class-transformer, Zod |
| **Graficos** | Recharts |
| **Testes** | Jest, React Testing Library |
| **DevOps** | Docker Compose, GitHub Actions |
| **Deploy** | Render (API), Neon (PostgreSQL), Upstash (Redis), Vercel (Frontend) |

## Funcionalidades

1. Autenticacao via tokens JWT com restricao de rotas por perfis de acesso.
2. Gestao hierarquica de categorias, impedindo a exclusao de categorias que possuam produtos ativos.
3. Catalogacao de produtos com exigencia de identificador unico (SKU).
4. Registro de entradas e saidas com bloqueio ativo em caso de quantidades insuficientes.
5. Visao analitica cruzando historico semanal de vendas e produtos em nivel critico de estoque.
6. Invalidacao automatica de chaves do cache no Redis sempre que uma movimentacao ou produto e criado.
7. Exportacao de relatorios com protecao contra execucao de macros maliciosas (CSV Injection).
8. Documentacao da API disponivel e interativa via Swagger.

## Decisoes tecnicas

1. **Transacoes atomicas:** O registro de movimentacoes e a atualizacao de saldo ocorrem na mesma transacao no Prisma. Se um falha, nada e salvo, evitando inconsistencias.
2. **Cache distribuido:** A comunicacao com o Redis isola as consultas analiticas, poupando o PostgreSQL de processamentos repetitivos e caros.
3. **Seguranca e sanitizacao:** O sistema aplica a injecao automatica de headers de seguranca (Helmet) e sanitiza as entradas na camada de validacao global do NestJS.
4. **Estado reativo local:** O estado da aplicacao no frontend e mantido via Zustand em fatias isoladas, garantindo que componentes distantes interajam sem provocar renderizacoes em cadeia.

## Estrutura do projeto

```
stocksnap/
  backend/
    src/
      auth/           # Autenticacao JWT, guards, strategies, decorators
      categories/     # CRUD de categorias com integridade referencial
      dashboard/      # Metricas analiticas com cache Redis
      movements/      # Transacoes atomicas de entrada/saida
      prisma/         # PrismaService global
      products/       # CRUD de produtos com paginacao e filtros
    prisma/
      schema.prisma   # Schema do banco (User, Product, Movement, Category)
    http/
      api.http        # 36 cenarios de teste via REST Client
    test/
      app.e2e-spec.ts # Testes de integracao
  frontend/
    src/
      app/
        (auth)/       # Paginas publicas (login)
        (dashboard)/  # Paginas protegidas (dashboard, products, movements, categories)
      components/     # Sidebar, Header, Modais, UI primitives
      hooks/          # useIsAdmin (RBAC frontend)
      lib/            # API client, utils, export-csv
      stores/         # Zustand stores (auth, product, category, movement, dashboard)
      types/          # Tipagens compartilhadas
  docker-compose.yml  # Orquestracao de containers
  .github/workflows/  # CI/CD pipeline
```

## Como executar

### Pre-requisitos

1. Node.js 20 ou versao superior.
2. Docker e utilitario Docker Compose.

### Configuracao do ambiente

Copie o arquivo de exemplo e preencha as variaveis:

```bash
cp backend/.env.example backend/.env
```

Variaveis necessarias:

| Variavel | Descricao | Exemplo |
|---|---|---|
| `DATABASE_URL` | String de conexao PostgreSQL | `postgresql://user:pass@postgres:5432/db` |
| `JWT_SECRET` | Chave secreta para assinatura dos tokens | `troque-por-uma-chave-secreta-forte` |
| `JWT_EXPIRATION` | Tempo de validade do token | `7d` |
| `REDIS_HOST` | Endereco do servidor Redis | `redis` |
| `REDIS_PORT` | Porta do Redis | `6379` |
| `PORT` | Porta do backend | `3001` |
| `CORS_ORIGIN` | Origem autorizada para CORS | `http://localhost:3000` |

### Inicializacao via Docker

```bash
docker-compose up --build -d
```

1. Aplicacao visual: `http://localhost:3000`
2. Documentacao da API: `http://localhost:3001/api/docs`

### Desenvolvimento local (sem Docker)

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev

# Frontend (em outro terminal)
cd frontend
npm install
npm run dev
```

### Credenciais de teste

| Campo | Valor |
|---|---|
| Email | `admin@stocksnap.com` |
| Senha | `admin123` |

## Testes

A suite de testes atua como filtro rigoroso com execucao automatica pelo GitHub Actions.

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

| Camada | Suites | Cenarios | Framework |
|---|---|---|---|
| Backend | 6 | ~20+ | Jest |
| Frontend | 7 | ~26+ | Jest + React Testing Library |
| API Manual | 1 | 36 | REST Client (.http) |

## Status do projeto

1. Funcional e livre de impedimentos no fluxo principal.
2. Integracao continua implantada, avaliando codigo e regressoes automaticamente.
3. Testes automatizados ativos e sem falhas.
4. Sistema pronto para implantacao em ambiente produtivo.
