# StockSnap

## Descricao Geral

O StockSnap e um sistema completo de gerenciamento de estoque desenvolvido com arquitetura desacoplada, composto por uma API RESTful no backend e uma interface web moderna no frontend. O projeto implementa o ciclo operacional completo de controle de inventario: cadastro de produtos e categorias, registro de movimentacoes de entrada e saida com transacoes atomicas, painel analitico com metricas em tempo real e autenticacao segura via JSON Web Tokens.

A base de codigo foi construida com foco em boas praticas de engenharia de software, incluindo tipagem estatica de ponta a ponta com TypeScript, camada de cache com Redis para otimizacao de consultas pesadas, containerizacao com Docker e pipeline de integracao continua via GitHub Actions.

## Objetivo do Projeto

O StockSnap resolve o problema de controle de inventario para pequenas e medias operacoes comerciais que necessitam de visibilidade em tempo real sobre seu estoque. O sistema permite que operadores registrem entradas (compras de fornecedores) e saidas (vendas) com rastreabilidade completa, enquanto gestores acompanham indicadores criticos como produtos abaixo do estoque minimo, valor total em estoque e tendencias de movimentacao dos ultimos sete dias.

## Funcionalidades Principais

* Autenticacao de usuarios com registro, login e emissao de tokens JWT com suporte a papeis (ADMIN e OPERATOR)
* Cadastro completo de categorias com validacao de unicidade de nome e protecao contra exclusao de categorias com produtos vinculados
* CRUD de produtos com busca textual, filtragem por categoria, ordenacao dinamica e paginacao server-side
* Validacao de unicidade de SKU tanto na criacao quanto na atualizacao de produtos
* Registro de movimentacoes de estoque (entrada e saida) com transacao atomica via Prisma, garantindo consistencia entre o registro da movimentacao e a atualizacao do saldo
* Validacao de saldo antes de saidas, impedindo que o estoque fique negativo
* Painel analitico (Dashboard) com metricas de KPI: total de produtos, valor total em estoque, itens criticos, movimentacoes do dia e comparativo com o dia anterior
* Grafico de movimentacoes dos ultimos sete dias com visualizacao combinada de entradas e saidas
* Lista de produtos com estoque critico (abaixo do minimo definido), ordenados por severidade
* Cache Redis com TTL de 60 segundos nas consultas do Dashboard, com invalidacao automatica apos operacoes de escrita
* Interface responsiva com tema escuro, Design System baseado em CSS Variables e integracao com Tailwind CSS 4
* Cliente API centralizado com injecao automatica de Bearer Token e interceptor de sessao expirada (401)

## Tecnologias Utilizadas

### Backend

* **NestJS 11**: Framework Node.js para construcao de aplicacoes server-side escaláveis. Utilizado como base arquitetural do backend, fornecendo injecao de dependencias, modularizacao por dominio, pipes de validacao global e integracao nativa com guards de autenticacao.

* **Prisma ORM 6**: ORM de proxima geracao para Node.js e TypeScript. Responsavel pela definicao do schema do banco de dados, geracao de migrations versionadas, tipagem automatica das queries e execucao de transacoes atomicas nas operacoes de movimentacao de estoque.

* **PostgreSQL 16**: Sistema gerenciador de banco de dados relacional. Armazena todas as entidades do dominio (usuarios, categorias, produtos e movimentacoes) com suporte a tipos decimais de alta precisao para valores monetarios e UUIDs como chaves primarias.

* **Redis 7**: Armazenamento em memoria de alto desempenho utilizado como camada de cache. Reduz a carga sobre o banco de dados nas consultas de agregacao do Dashboard, com TTL de 60 segundos e invalidacao cirurgica apos cada operacao de escrita.

* **Passport.js com JWT**: Estrategia de autenticacao stateless. O Passport gerencia a validacao de tokens JWT em cada requisicao protegida, enquanto o bcrypt garante o hash seguro de senhas com salt de 10 rounds.

* **class-validator e class-transformer**: Bibliotecas de validacao e transformacao de DTOs. Integradas ao ValidationPipe global do NestJS com configuracao `whitelist` e `forbidNonWhitelisted`, rejeitando automaticamente campos nao declarados nos DTOs.

### Frontend

* **Next.js 16 (App Router)**: Framework React para aplicacoes web de producao. Utilizado com o modelo de App Router para estruturacao de layouts aninhados e separacao logica entre rotas de autenticacao e rotas protegidas do dashboard.

* **React 19**: Biblioteca para construcao de interfaces declarativas. Base para todos os componentes da aplicacao, incluindo modais controlados, formularios com validacao e tabelas com paginacao.

* **Zustand 5**: Biblioteca de gerenciamento de estado minimalista. Substitui o Context API com zero boilerplate, oferecendo renderizacoes otimizadas (componentes so atualizam quando o fragmento selecionado do estado muda) e middleware `persist` para sincronizacao com localStorage.

* **Tailwind CSS 4**: Framework CSS utilitario de proxima geracao. Integrado a um Design System customizado via CSS Variables, fornecendo tokens semanticos para cores, estados de status (critico, atencao, normal) e tipografia consistente.

* **Recharts 3**: Biblioteca de graficos composiveis para React. Utilizada no Dashboard para renderizacao do grafico combinado (barras e linhas) de movimentacoes diarias dos ultimos sete dias.

* **Lucide React**: Biblioteca de icones SVG otimizados. Fornece iconografia consistente em toda a interface, incluindo indicadores de status, acoes de CRUD e elementos de navegacao.

### Infraestrutura

* **Docker e Docker Compose**: Containerizacao da aplicacao completa. Orquestra quatro servicos (PostgreSQL, Redis, API e Frontend) com healthchecks para garantir a ordem correta de inicializacao.

* **GitHub Actions**: Pipeline de integracao continua. Executa automaticamente lint, testes e build para backend e frontend em cada push ou pull request nas branches `main` e `develop`.

## Arquitetura do Sistema

O StockSnap adota uma arquitetura de servicos desacoplados, onde o backend (API REST) e o frontend (SPA) operam como aplicacoes independentes que se comunicam exclusivamente via protocolo HTTP.

### Backend (Arquitetura Modular NestJS)

O backend segue o padrao modular do NestJS, onde cada dominio de negocio (Auth, Products, Categories, Movements, Dashboard) e encapsulado em seu proprio modulo com Controller, Service e DTOs dedicados. O fluxo de uma requisicao segue a cadeia:

```
Requisicao HTTP -> Controller -> Service -> Prisma ORM -> PostgreSQL
                       |                        |
                   JwtAuthGuard            Cache Redis
                   ValidationPipe
```

* **Controllers** recebem e validam requisicoes HTTP, delegando a logica ao Service correspondente
* **Services** implementam as regras de negocio, incluindo validacoes de unicidade, integridade referencial e transacoes atomicas
* **PrismaService** e registrado como modulo global, disponibilizando o client tipado para todos os services sem necessidade de reimportacao
* **CacheModule** (Redis) e igualmente global, permitindo que qualquer service injete o `CACHE_MANAGER` para leitura e invalidacao de cache

### Frontend (SPA com Zustand)

O frontend opera como uma Single Page Application que consome a API via um cliente HTTP centralizado (`api.ts`). O gerenciamento de estado e distribuido em stores Zustand especializadas por dominio:

```
Componente React -> Store Zustand -> Cliente API -> Backend REST
                        |
                   localStorage (persist)
```

* O `auth-store` gerencia login, registro e persistencia do token JWT via middleware `persist` com reidratacao automatica
* Stores de dominio (`product-store`, `movement-store`, `category-store`, `dashboard-store`) encapsulam chamadas a API, estados de carregamento e tratamento de erros
* O cliente API injeta automaticamente o Bearer Token e intercepta respostas 401 para redirecionar ao login

## Estrutura de Pastas

```
stocksnap/
├── .github/workflows/       # Pipeline CI/CD (GitHub Actions)
├── backend/
│   ├── prisma/
│   │   ├── migrations/       # Historico de migrations versionadas
│   │   ├── schema.prisma     # Definicao dos modelos de dominio
│   │   └── seed.ts           # Script de populacao do banco de dados
│   └── src/
│       ├── auth/             # Modulo de autenticacao (JWT, bcrypt, guards)
│       ├── categories/       # Modulo de categorias (CRUD com unicidade)
│       ├── dashboard/        # Modulo de metricas e graficos (cache Redis)
│       ├── movements/        # Modulo de movimentacoes (transacoes atomicas)
│       ├── prisma/           # Modulo global do Prisma ORM
│       ├── products/         # Modulo de produtos (CRUD com paginacao)
│       ├── app.module.ts     # Modulo raiz com configuracao de cache global
│       └── main.ts           # Ponto de entrada com CORS e ValidationPipe
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── (auth)/       # Grupo de rotas de autenticacao (login)
│       │   └── (dashboard)/  # Grupo de rotas protegidas do painel
│       ├── components/       # Componentes reutilizaveis (modais, UI)
│       ├── lib/              # Cliente API centralizado e utilitarios
│       ├── stores/           # Stores Zustand por dominio
│       └── types/            # Interfaces TypeScript compartilhadas
├── docker-compose.yml        # Orquestracao dos servicos containerizados
└── README.md
```

## Como Executar o Projeto Localmente

### Pre-requisitos

* Node.js 20 ou superior
* PostgreSQL 16 (local ou via Docker)
* Redis 7 (local ou via Docker)
* npm 10 ou superior

### Opcao 1: Execucao via Docker Compose (Recomendada)

```bash
git clone https://github.com/gabriellqv/stocksnap.git
cd stocksnap
```

Crie o arquivo `backend/.env` com as variaveis necessarias (consulte a secao "Variaveis de Ambiente"). Em seguida, execute:

```bash
docker-compose up --build
```

O sistema estara disponivel em `http://localhost:3000` (frontend) e `http://localhost:3001/api` (backend).

### Opcao 2: Execucao Manual

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

## Variaveis de Ambiente

O arquivo `backend/.env` deve conter as seguintes variaveis:

| Variavel | Descricao |
|---|---|
| `DATABASE_URL` | String de conexao com o PostgreSQL no formato `postgresql://usuario:senha@host:porta/banco?schema=public` |
| `JWT_SECRET` | Chave secreta utilizada para assinatura e verificacao dos tokens JWT. Deve ser uma string aleatoria e segura |
| `JWT_EXPIRATION` | Tempo de expiracao dos tokens JWT (exemplo: `7d` para sete dias) |
| `REDIS_HOST` | Endereco do servidor Redis (padrao: `localhost`) |
| `REDIS_PORT` | Porta do servidor Redis (padrao: `6379`) |
| `PORT` | Porta onde a API ira escutar conexoes HTTP (padrao: `3001`) |
| `CORS_ORIGIN` | URL de origem permitida para requisicoes cross-origin (padrao: `http://localhost:3000`) |

O frontend utiliza uma unica variavel de ambiente:

| Variavel | Descricao |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL base da API backend acessivel pelo navegador (exemplo: `http://localhost:3001/api`) |

## Testes

O projeto possui uma suite de 60 testes automatizados (29 no backend e 31 no frontend), executados automaticamente pela pipeline de integracao continua a cada push.

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

### Cobertura por Modulo

**Backend (29 testes):**

* `AuthService`: validacao de credenciais, hash de senhas, emissao de tokens e prevencao de enumeracao de usuarios
* `CategoriesService`: unicidade de nome, atualizacao com validacao de conflito e bloqueio de exclusao com produtos vinculados
* `ProductsService`: unicidade de SKU, validacao de categoria e invalidacao de cache apos mutacoes
* `MovementsService`: transacoes atomicas, validacao de saldo negativo e invalidacao seletiva de cache
* `DashboardService`: cache hit/miss, calculo de metricas e integracao com Redis

**Frontend (31 testes):**

* `AuthStore`: fluxo de login, logout, persistencia de token e reidratacao
* `CategoryStore`: operacoes CRUD e tratamento de erros da API
* `ApiClient`: injecao de token, interceptor de 401 e tratamento de erros HTTP
* `Utilitarios`: formatacao de moeda, datas e composicao de classes CSS
* `Componentes UI`: renderizacao condicional do StockBadge, Button e MovementModal

## Decisoes Tecnicas Relevantes

* **Transacoes Atomicas com Prisma**: O registro de movimentacoes de estoque utiliza `prisma.$transaction()` para garantir que a criacao do registro e a atualizacao do saldo do produto ocorram de forma indivisivel. Em caso de falha em qualquer etapa, toda a operacao e revertida, prevenindo inconsistencias de dados.

* **Cache Redis com Invalidacao Seletiva**: As consultas de agregacao do Dashboard (metricas, graficos e alertas de estoque critico) sao cacheadas por 60 segundos. Apos cada operacao de escrita nos modulos de Products e Movements, apenas as chaves de cache afetadas sao invalidadas, evitando a penalizacao de performance de um flush global.

* **Zustand sobre Context API**: A escolha do Zustand como gerenciador de estado se justifica pela eliminacao de boilerplate (nenhum Provider necessario), renderizacoes otimizadas por fragmento de estado e o middleware `persist` nativo para sincronizacao transparente com localStorage. O callback `onRehydrateStorage` restaura o token JWT no cliente API ao recarregar a pagina.

* **ValidationPipe Global Rigoroso**: O NestJS e configurado com `whitelist: true` e `forbidNonWhitelisted: true`, rejeitando automaticamente qualquer campo nao declarado nos DTOs. Essa abordagem previne ataques de mass assignment e garante que a API processe exclusivamente os dados esperados.

* **ParseUUIDPipe nos Controllers**: Todos os endpoints que recebem identificadores via path parameter utilizam `ParseUUIDPipe` para validar o formato UUID antes de atingir a camada de servico. Requisicoes com IDs malformados retornam HTTP 400 imediatamente, protegendo o banco de dados contra queries desnecessarias.

* **Seguranca Anti-enumeracao no Login**: Tanto para email inexistente quanto para senha incorreta, o sistema retorna a mesma mensagem generica ("Email ou senha incorretos"), conforme recomendacao OWASP A07:2021, impedindo que atacantes identifiquem quais emails estao registrados.

* **Design System com CSS Variables**: A interface utiliza um sistema de tokens semanticos definidos em CSS Variables (cores de status, superficies, bordas), integrados ao Tailwind CSS 4 via diretiva `@theme`. Essa abordagem garante consistencia visual e facilita a manutencao do tema.

* **Cliente API Centralizado**: Todas as requisicoes HTTP do frontend passam por um wrapper unico (`api.ts`) que injeta automaticamente o Bearer Token, trata respostas 401 com redirect e limpeza de sessao, e encapsula erros em uma classe `ApiError` customizada com status HTTP e payload.

## Possiveis Melhorias Futuras

* Implementacao de controle de acesso baseado em papeis (RBAC) no frontend, restringindo componentes e acoes com base no campo `role` do usuario autenticado
* Adicao de testes de integracao (E2E) com `supertest` no backend para validar o fluxo HTTP completo
* Implementacao de paginacao e filtros no modulo de categorias
* Rate limiting via `@nestjs/throttler` para protecao contra ataques de forca bruta nos endpoints de autenticacao
* Headers de seguranca HTTP via `helmet` para protecao contra ataques XSS, clickjacking e sniffing de MIME type
* Implementacao de refresh tokens para renovacao silenciosa de sessoes expiradas
* Monitoramento de aplicacao com instrumentacao OpenTelemetry para rastreamento de latencia e taxa de erros
* Exportacao de relatorios de movimentacoes em formato PDF e CSV

## Consideracoes Finais

O StockSnap representa uma implementacao completa de um sistema de controle de estoque que prioriza seguranca, consistencia de dados e experiencia do desenvolvedor. A base de codigo demonstra competencia em pilares fundamentais de engenharia de software: modelagem de dominio com integridade referencial, transacoes atomicas para operacoes criticas, cache distribuido com invalidacao seletiva, autenticacao stateless com JWT, validacao rigorosa de entrada de dados e gerenciamento de estado reativo no frontend. A organizacao modular, a tipagem estatica de ponta a ponta, a suite de testes automatizados e a infraestrutura de integracao continua refletem a preocupacao com a manutenibilidade, escalabilidade e a qualidade de codigo necessarias para contribuir de forma imediata em equipes de engenharia profissionais.
