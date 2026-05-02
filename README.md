# StockSnap

## Descrição Geral

O StockSnap é um sistema completo de gerenciamento de estoque desenvolvido com arquitetura desacoplada, composto por uma API RESTful no backend e uma interface web moderna no frontend. O projeto implementa o ciclo operacional completo de controle de inventário: cadastro de produtos e categorias, registro de movimentações de entrada e saída com transações atômicas, painel analítico com métricas em tempo real e autenticação segura via JSON Web Tokens.

A base de código foi construída com foco em boas práticas de engenharia de software, incluindo tipagem estática de ponta a ponta com TypeScript, camada de cache com Redis para otimização de consultas pesadas, containerização com Docker e pipeline de integração contínua via GitHub Actions.

## Objetivo do Projeto

O StockSnap resolve o problema de controle de inventário para pequenas e médias operações comerciais que necessitam de visibilidade em tempo real sobre seu estoque. O sistema permite que operadores registrem entradas (compras de fornecedores) e saídas (vendas) com rastreabilidade completa, enquanto gestores acompanham indicadores críticos como produtos abaixo do estoque mínimo, valor total em estoque e tendências de movimentação dos últimos sete dias.

## Funcionalidades Principais

* Autenticação de usuários com registro, login e emissão de tokens JWT com suporte a papéis (ADMIN e OPERATOR)
* Cadastro completo de categorias com validação de unicidade de nome e proteção contra exclusão de categorias com produtos vinculados
* CRUD de produtos com busca textual, filtragem por categoria, ordenação dinâmica e paginação server-side
* Validação de unicidade de SKU tanto na criação quanto na atualização de produtos
* Registro de movimentações de estoque (entrada e saída) com transação atômica via Prisma, garantindo consistência entre o registro da movimentação e a atualização do saldo
* Validação de saldo antes de saídas, impedindo que o estoque fique negativo
* Painel analítico (Dashboard) com métricas de KPI: total de produtos, valor total em estoque, itens críticos, movimentações do dia e comparativo com o dia anterior
* Gráfico de movimentações dos últimos sete dias com visualização combinada de entradas e saídas
* Lista de produtos com estoque crítico (abaixo do mínimo definido), ordenados por severidade
* Cache Redis com TTL de 60 segundos nas consultas do Dashboard, com invalidação automática após operações de escrita
* Interface responsiva com tema escuro, Design System baseado em CSS Variables e integração com Tailwind CSS 4
* Cliente API centralizado com injeção automática de Bearer Token e interceptor de sessão expirada (401)

## Tecnologias Utilizadas

### Backend

* **NestJS 11**: Framework Node.js para construção de aplicações server-side escaláveis. Utilizado como base arquitetural do backend, fornecendo injeção de dependências, modularização por domínio, pipes de validação global e integração nativa com guards de autenticação.

* **Prisma ORM 6**: ORM de próxima geração para Node.js e TypeScript. Responsável pela definição do schema do banco de dados, geração de migrations versionadas, tipagem automática das queries e execução de transações atômicas nas operações de movimentação de estoque.

* **PostgreSQL 16**: Sistema gerenciador de banco de dados relacional. Armazena todas as entidades do domínio (usuários, categorias, produtos e movimentações) com suporte a tipos decimais de alta precisão para valores monetários e UUIDs como chaves primárias.

* **Redis 7**: Armazenamento em memória de alto desempenho utilizado como camada de cache. Reduz a carga sobre o banco de dados nas consultas de agregação do Dashboard, com TTL de 60 segundos e invalidação cirúrgica após cada operação de escrita.

* **Passport.js com JWT**: Estratégia de autenticação stateless. O Passport gerencia a validação de tokens JWT em cada requisição protegida, enquanto o bcrypt garante o hash seguro de senhas com salt de 10 rounds.

* **class-validator e class-transformer**: Bibliotecas de validação e transformação de DTOs. Integradas ao ValidationPipe global do NestJS com configuração `whitelist` e `forbidNonWhitelisted`, rejeitando automaticamente campos não declarados nos DTOs.

### Frontend

* **Next.js 16 (App Router)**: Framework React para aplicações web de produção. Utilizado com o modelo de App Router para estruturação de layouts aninhados e separação lógica entre rotas de autenticação e rotas protegidas do dashboard.

* **React 19**: Biblioteca para construção de interfaces declarativas. Base para todos os componentes da aplicação, incluindo modais controlados, formulários com validação e tabelas com paginação.

* **Zustand 5**: Biblioteca de gerenciamento de estado minimalista. Substitui o Context API com zero boilerplate, oferecendo renderizações otimizadas (componentes só atualizam quando o fragmento selecionado do estado muda) e middleware `persist` para sincronização com localStorage.

* **Tailwind CSS 4**: Framework CSS utilitário de próxima geração. Integrado a um Design System customizado via CSS Variables, fornecendo tokens semânticos para cores, estados de status (crítico, atenção, normal) e tipografia consistente.

* **Recharts 3**: Biblioteca de gráficos composíveis para React. Utilizada no Dashboard para renderização do gráfico combinado (barras e linhas) de movimentações diárias dos últimos sete dias.

* **Lucide React**: Biblioteca de ícones SVG otimizados. Fornece iconografia consistente em toda a interface, incluindo indicadores de status, ações de CRUD e elementos de navegação.

### Infraestrutura

* **Docker e Docker Compose**: Containerização da aplicação completa. Orquestra quatro serviços (PostgreSQL, Redis, API e Frontend) com healthchecks para garantir a ordem correta de inicialização.

* **GitHub Actions**: Pipeline de integração contínua. Executa automaticamente lint, testes e build para backend e frontend em cada push ou pull request nas branches `main` e `develop`.

## Estrutura de Pastas

```
stocksnap/
├── .github
│   └── workflows
│       └── ci.yml
├── backend
│   ├── http
│   │   └── api.http
│   ├── prisma
│   │   ├── migrations
│   │   │   ├── 20260430004028_init
│   │   │   │   └── migration.sql
│   │   │   └── migration_lock.toml
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src
│   │   ├── auth
│   │   │   ├── decorators
│   │   │   │   └── current-user.decorator.ts
│   │   │   ├── dto
│   │   │   │   ├── login.dto.ts
│   │   │   │   └── register.dto.ts
│   │   │   ├── guards
│   │   │   │   └── jwt-auth.guard.ts
│   │   │   ├── strategies
│   │   │   │   └── jwt.strategy.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.spec.ts
│   │   │   └── auth.service.ts
│   │   ├── categories
│   │   │   ├── dto
│   │   │   │   ├── create-category.dto.ts
│   │   │   │   └── update-category.dto.ts
│   │   │   ├── categories.controller.ts
│   │   │   ├── categories.module.ts
│   │   │   ├── categories.service.spec.ts
│   │   │   └── categories.service.ts
│   │   ├── dashboard
│   │   │   ├── dashboard.controller.ts
│   │   │   ├── dashboard.module.ts
│   │   │   ├── dashboard.service.spec.ts
│   │   │   └── dashboard.service.ts
│   │   ├── movements
│   │   │   ├── dto
│   │   │   │   ├── create-movement.dto.ts
│   │   │   │   └── query-movement.dto.ts
│   │   │   ├── movements.controller.ts
│   │   │   ├── movements.module.ts
│   │   │   ├── movements.service.spec.ts
│   │   │   └── movements.service.ts
│   │   ├── prisma
│   │   │   ├── prisma.module.ts
│   │   │   └── prisma.service.ts
│   │   ├── products
│   │   │   ├── dto
│   │   │   │   ├── create-product.dto.ts
│   │   │   │   ├── query-product.dto.ts
│   │   │   │   └── update-product.dto.ts
│   │   │   ├── products.controller.ts
│   │   │   ├── products.module.ts
│   │   │   ├── products.service.spec.ts
│   │   │   └── products.service.ts
│   │   ├── app.controller.spec.ts
│   │   ├── app.controller.ts
│   │   ├── app.module.ts
│   │   ├── app.service.ts
│   │   └── main.ts
│   ├── test
│   │   ├── app.e2e-spec.ts
│   │   └── jest-e2e.json
│   ├── .dockerignore
│   ├── .env
│   ├── Dockerfile
│   ├── eslint.config.mjs
│   ├── nest-cli.json
│   ├── package-lock.json
│   ├── package.json
│   ├── tsconfig.build.json
│   └── tsconfig.json
├── frontend
│   ├── public
│   ├── src
│   │   ├── app
│   │   │   ├── (auth)
│   │   │   │   └── login
│   │   │   │       └── page.tsx
│   │   │   ├── (dashboard)
│   │   │   │   ├── categories
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── movements
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── products
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── globals.css
│   │   │   ├── icon.svg
│   │   │   └── layout.tsx
│   │   ├── components
│   │   │   ├── ui
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── button.test.tsx
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── stock-badge.test.tsx
│   │   │   │   └── stock-badge.tsx
│   │   │   ├── category-modal.tsx
│   │   │   ├── header.tsx
│   │   │   ├── movement-modal.test.tsx
│   │   │   ├── movement-modal.tsx
│   │   │   ├── product-modal.tsx
│   │   │   └── sidebar.tsx
│   │   ├── lib
│   │   │   ├── api.test.ts
│   │   │   ├── api.ts
│   │   │   ├── utils.test.ts
│   │   │   └── utils.ts
│   │   ├── stores
│   │   │   ├── auth-store.test.ts
│   │   │   ├── auth-store.ts
│   │   │   ├── category-store.test.ts
│   │   │   ├── category-store.ts
│   │   │   ├── dashboard-store.ts
│   │   │   ├── movement-store.ts
│   │   │   └── product-store.ts
│   │   ├── types
│   │   │   └── index.ts
│   │   └── proxy.ts
│   ├── .dockerignore
│   ├── .env.local
│   ├── Dockerfile
│   ├── eslint.config.mjs
│   ├── jest.config.ts
│   ├── jest.setup.ts
│   ├── next-env.d.ts
│   ├── next.config.ts
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── tsconfig.json
│   └── tsconfig.tsbuildinfo
├── .dockerignore
├── .gitignore
├── .prettierignore
├── .prettierrc
├── docker-compose.yml
└── README.md
```

A estrutura do projeto é dividida em dois blocos lógicos principais: o backend (API REST) e o frontend (Single Page Application). Abaixo, detalhamos as responsabilidades dos principais diretórios e arquivos da base de código:

### Backend (NestJS e Prisma)

* **`backend/prisma/`**: Contém o schema de dados (`schema.prisma`), o histórico rigoroso de migrations geradas automaticamente e o script de seed (`seed.ts`) para população inicial do banco de dados.
* **`backend/http/`**: Coleção de requisições pré-configuradas (`api.http`) para uso em extensões como o REST Client do VS Code. Facilita o teste manual isolado da API sem a necessidade de uma interface de usuário ou Postman.
* **`backend/src/`**: Diretório raiz da aplicação server-side.
  * **`backend/src/auth/`**: Módulo de segurança. Contém a estratégia JWT, decorators customizados para extração do usuário da requisição, guards de proteção de rotas e lógica de hash de senhas via bcrypt.
  * **`backend/src/<dominios>/`**: Módulos de negócio isolados (`categories`, `dashboard`, `movements`, `products`). Cada pasta encapsula seu respectivo Controller (exposição de endpoints), Service (regras de negócio) e DTOs (validação estrita de payload de entrada).
  * **`backend/src/app.module.ts`**: Módulo raiz responsável por orquestrar a injeção de dependências global e a configuração do cache em memória (Redis).
* **`backend/test/`**: Suíte de testes automatizados E2E para garantir o funcionamento correto e integrado dos endpoints HTTP.
* **`backend/Dockerfile`**: Receita de construção da imagem Docker de produção da API, otimizada com Alpine Linux.

### Frontend (Next.js e Zustand)

* **`frontend/src/app/`**: Diretório central utilizando o padrão App Router do Next.js.
  * **`(auth)/`**: Grupo de rotas públicas dedicadas à autenticação (painéis de login).
  * **`(dashboard)/`**: Grupo de rotas privadas (com layout compartilhado) abrigando o painel administrativo, listagens com paginação e CRUDs.
* **`frontend/src/components/`**: Camada de interface baseada em componentes React isolados e reutilizáveis. Inclui elementos granulares (`ui/`), modais de criação/edição e módulos estruturais da tela (`sidebar.tsx`, `header.tsx`).
* **`frontend/src/lib/`**: Biblioteca de utilitários transversais. Destaca-se o `api.ts`, um wrapper centralizado para chamadas HTTP que intercepta e injeta o token de sessão (Bearer) de forma autônoma em cada requisição.
* **`frontend/src/stores/`**: Camada de gerenciamento de estado global, implementada com Zustand. O `auth-store.ts` sincroniza e hidrata a sessão diretamente do localStorage, enquanto as demais stores gerenciam regras de busca, limites e memória em listagens de domínio.
* **`frontend/src/proxy.ts`**: Camada de segurança do Next.js, responsável por validar a integridade dos cookies e redirecionar acessos não autorizados de forma veloz.

### Infraestrutura e Configurações Globais

* **`.github/workflows/ci.yml`**: Configuração do pipeline de Integração Contínua executado pelo GitHub Actions (realiza validação de linting, testes e rotinas de build em cada pull request).
* **`docker-compose.yml`**: Orquestrador central utilizado para subir e intercomunicar simultaneamente o banco de dados PostgreSQL, o servidor cache Redis, a API e a Interface Web em ambiente de desenvolvimento.

## Como Executar O Projeto Localmente

### Pré-requisitos

* Node.js 20 ou superior
* PostgreSQL 16 (local ou via Docker)
* Redis 7 (local ou via Docker)
* npm 10 ou superior

### Opção 1: Execução via Docker Compose (Recomendada)

```bash
git clone https://github.com/gabriellqv/stocksnap.git
cd stocksnap
```

Crie o arquivo `backend/.env` com as variáveis necessárias (consulte a seção "Variáveis de Ambiente"). Em seguida, execute:

```bash
docker-compose up --build
```

O sistema estará disponível em `http://localhost:3000` (frontend) e `http://localhost:3001/api` (backend).

### Opção 2: Execução Manual

**Backend:**

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

## Variáveis de Ambiente

O arquivo `backend/.env` deve conter as seguintes variáveis:

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão com o PostgreSQL no formato `postgresql://usuario:senha@host:porta/banco?schema=public` |
| `JWT_SECRET` | Chave secreta utilizada para assinatura e verificação dos tokens JWT. Deve ser uma string aleatória e segura |
| `JWT_EXPIRATION` | Tempo de expiração dos tokens JWT (exemplo: `7d` para sete dias) |
| `REDIS_HOST` | Endereço do servidor Redis (padrão: `localhost`) |
| `REDIS_PORT` | Porta do servidor Redis (padrão: `6379`) |
| `PORT` | Porta onde a API irá escutar conexões HTTP (padrão: `3001`) |
| `CORS_ORIGIN` | URL de origem permitida para requisições cross-origin (padrão: `http://localhost:3000`) |

O frontend utiliza uma única variável de ambiente:

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL base da API backend acessível pelo navegador (exemplo: `http://localhost:3001/api`) |

## Testes

O projeto possui uma suíte de 60 testes automatizados (29 no backend e 31 no frontend), executados automaticamente pela pipeline de integração contínua a cada push.

**Executar testes do backend:**

```bash
cd backend
npm test
```

**Executar testes do frontend:**

```bash
cd frontend
npm test
```

### Cobertura por Módulo

**Backend (29 testes):**

* `AuthService`: validação de credenciais, hash de senhas, emissão de tokens e prevenção de enumeração de usuários
* `CategoriesService`: unicidade de nome, atualização com validação de conflito e bloqueio de exclusão com produtos vinculados
* `ProductsService`: unicidade de SKU, validação de categoria e invalidação de cache após mutações
* `MovementsService`: transações atômicas, validação de saldo negativo e invalidação seletiva de cache
* `DashboardService`: cache hit/miss, cálculo de métricas e integração com Redis

**Frontend (31 testes):**

* `AuthStore`: fluxo de login, logout, persistência de token e reidratação
* `CategoryStore`: operações CRUD e tratamento de erros da API
* `ApiClient`: injeção de token, interceptor de 401 e tratamento de erros HTTP
* `Utilitários`: formatação de moeda, datas e composição de classes CSS
* `Componentes UI`: renderização condicional do StockBadge, Button e MovementModal

## Decisões Técnicas Relevantes

* **Transações Atômicas com Prisma**: O registro de movimentações de estoque utiliza `prisma.$transaction()` para garantir que a criação do registro e a atualização do saldo do produto ocorram de forma indivisível. Em caso de falha em qualquer etapa, toda a operação é revertida, prevenindo inconsistências de dados.

* **Cache Redis com Invalidação Seletiva**: As consultas de agregação do Dashboard (métricas, gráficos e alertas de estoque crítico) são cacheadas por 60 segundos. Após cada operação de escrita nos módulos de Products e Movements, apenas as chaves de cache afetadas são invalidadas, evitando a penalização de performance de um flush global.

* **Zustand sobre Context API**: A escolha do Zustand como gerenciador de estado se justifica pela eliminação de boilerplate (nenhum Provider necessário), renderizações otimizadas por fragmento de estado e o middleware `persist` nativo para sincronização transparente com localStorage. O callback `onRehydrateStorage` restaura o token JWT no cliente API ao recarregar a página.

* **ValidationPipe Global Rigoroso**: O NestJS é configurado com `whitelist: true` e `forbidNonWhitelisted: true`, rejeitando automaticamente qualquer campo não declarado nos DTOs. Essa abordagem previne ataques de mass assignment e garante que a API processe exclusivamente os dados esperados.

* **ParseUUIDPipe nos Controllers**: Todos os endpoints que recebem identificadores via path parameter utilizam `ParseUUIDPipe` para validar o formato UUID antes de atingir a camada de serviço. Requisições com IDs malformados retornam HTTP 400 imediatamente, protegendo o banco de dados contra queries desnecessárias.

* **Segurança Anti-enumeração no Login**: Tanto para email inexistente quanto para senha incorreta, o sistema retorna a mesma mensagem genérica ("Email ou senha incorretos"), conforme recomendação OWASP A07:2021, impedindo que atacantes identifiquem quais emails estão registrados.

* **Design System com CSS Variables**: A interface utiliza um sistema de tokens semânticos definidos em CSS Variables (cores de status, superfícies, bordas), integrados ao Tailwind CSS 4 via diretiva `@theme`. Essa abordagem garante consistência visual e facilita a manutenção do tema.

* **Cliente API Centralizado**: Todas as requisições HTTP do frontend passam por um wrapper único (`api.ts`) que injeta automaticamente o Bearer Token, trata respostas 401 com redirect e limpeza de sessão, e encapsula erros em uma classe `ApiError` customizada com status HTTP e payload.

## Possíveis Melhorias Futuras

* Implementação de controle de acesso baseado em papéis (RBAC) no frontend, restringindo componentes e ações com base no campo `role` do usuário autenticado
* Adição de testes de integração (E2E) com `supertest` no backend para validar o fluxo HTTP completo
* Implementação de paginação e filtros no módulo de categorias
* Rate limiting via `@nestjs/throttler` para proteção contra ataques de força bruta nos endpoints de autenticação
* Headers de segurança HTTP via `helmet` para proteção contra ataques XSS, clickjacking e sniffing de MIME type
* Implementação de refresh tokens para renovação silenciosa de sessões expiradas
* Monitoramento de aplicação com instrumentação OpenTelemetry para rastreamento de latência e taxa de erros
* Exportação de relatórios de movimentações em formato PDF e CSV

## Considerações Finais

O StockSnap representa uma implementação completa de um sistema de controle de estoque que prioriza segurança, consistência de dados e experiência do desenvolvedor. A base de código demonstra competência em pilares fundamentais de engenharia de software: modelagem de domínio com integridade referencial, transações atômicas para operações críticas, cache distribuído com invalidação seletiva, autenticação stateless com JWT, validação rigorosa de entrada de dados e gerenciamento de estado reativo no frontend. A organização modular, a tipagem estática de ponta a ponta, a suíte de testes automatizados e a infraestrutura de integração contínua refletem a preocupação com a manutenibilidade, escalabilidade e a qualidade de código necessárias para contribuir de forma imediata em equipes de engenharia profissionais.
