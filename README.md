# StockSnap

![CI](https://img.shields.io/github/actions/workflow/status/gabriellqv/stocksnap/ci.yml?label=CI&logo=github) ![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white) ![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs&logoColor=white) ![Zustand](https://img.shields.io/badge/Zustand-5-ea580c?logo=react&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white) ![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-5-007ACC?logo=typescript&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

![Coverage](https://img.shields.io/badge/coverage-100%25-success) ![License](https://img.shields.io/badge/license-MIT-blue)

## Visão geral

O StockSnap automatiza o controle de inventário garantindo a exatidão dos saldos por meio de arquitetura transacional e atualização imediata via cache.

1. **Stack principal:** Node.js, NestJS, Prisma, PostgreSQL, Redis, Next.js, Zustand e Tailwind CSS.
2. **Diferenciais:** Prevenção de saldos negativos via transações no banco de dados, carregamento rápido de métricas com cache distribuído e blindagem contra injeção em exportações.
3. **Repositório oficial:** [github.com/gabriellqv/stocksnap](https://github.com/gabriellqv/stocksnap)
4. **Demonstração online:** [Indisponível no momento]

## Preview

<div align="center">
  <img src="./frontend/public/screenshots/dashboard.png" alt="Painel Administrativo" width="800"/>
  <br/>
  <i>Painel administrativo exibindo indicadores de desempenho e fluxo de estoque.</i>
</div>
<br/>

<div align="center">
  <img src="./frontend/public/screenshots/movements.png" alt="Listagem de Movimentações" width="800"/>
  <br/>
  <i>Tabela de registro de movimentações com histórico auditável de entradas e saídas.</i>
</div>
<br/>

<div align="center">
  <img src="./frontend/public/screenshots/products.png" alt="Gestão de Produtos" width="800"/>
  <br/>
  <i>Interface de gerenciamento de produtos com controle de quantidade mínima e categorias.</i>
</div>

## Resultados e impacto

1. **Performance acelerada:** O cache em memória com Redis elimina a demora nas consultas pesadas do dashboard, entregando as métricas em tempo real.
2. **Consistência garantida:** O uso de blocos transacionais no banco de dados impossibilita a criação de saldos negativos, mesmo com requisições simultâneas.
3. **Experiência do usuário fluida:** O controle de estado local via Zustand reduz renderizações desnecessárias da interface, evitando lentidão no navegador.
4. **Segurança preventiva:** O bloqueio estrito de dados não mapeados e a proteção de rotas impedem manipulações e acessos não autorizados.

## Arquitetura do sistema

```mermaid
graph TD
    Client[Cliente Web / Next.js] -->|HTTP REST / JWT| API(Backend API / NestJS)
    API -->|Consulta Rápida| Redis[(Cache Redis)]
    API -->|Persistência Transacional| Postgres[(PostgreSQL)]
```

## Tecnologias

1. **Backend:** NestJS 11, Prisma ORM 6, Swagger.
2. **Banco de Dados:** PostgreSQL 16, Redis 7.
3. **Frontend:** Next.js 16, React 19, Zustand 5, Tailwind CSS 4.
4. **Infraestrutura:** Docker Multi-stage Builds, GitHub Actions.

## Funcionalidades

1. Autenticação via tokens JWT com restrição de rotas por perfis de acesso.
2. Gestão hierárquica de categorias, impedindo a exclusão de categorias que possuam produtos ativos.
3. Catalogação de produtos com exigência de identificador único (SKU).
4. Registro de entradas e saídas com bloqueio ativo em caso de quantidades insuficientes.
5. Visão analítica cruzando histórico semanal de vendas e produtos em nível crítico de estoque.
6. Invalidação automática de chaves do cache no Redis sempre que uma movimentação ou produto é criado.
7. Exportação de relatórios com proteção contra execução de macros maliciosas (CSV Injection).
8. Documentação da API disponível e interativa via Swagger.

## Decisões técnicas

1. **Transações atômicas:** O registro de movimentações e a atualização de saldo ocorrem na mesma transação no Prisma. Se um falha, nada é salvo, evitando inconsistências.
2. **Cache distribuído:** A comunicação com o Redis isola as consultas analíticas, poupando o PostgreSQL de processamentos repetitivos e caros.
3. **Segurança e sanitização:** O sistema aplica a injeção automática de headers de segurança (Helmet) e sanitiza as entradas na camada de validação global do NestJS.
4. **Estado reativo local:** O estado da aplicação no frontend é mantido via Zustand em fatias isoladas, garantindo que componentes distantes interajam sem provocar renderizações em cadeia.

## Como executar

### Pré-requisitos

1. Node.js 20 ou versão superior.
2. Docker e utilitário Docker Compose.

### Configuração do ambiente

Insira as configurações listadas em um arquivo `.env` no diretório raiz do backend:

1. `DATABASE_URL`: String de conexão primária. Exemplo: `postgresql://user:pass@postgres:5432/db`
2. `JWT_SECRET`: Chave secreta para assinatura dos tokens.
3. `JWT_EXPIRATION`: Tempo de validade operacional do token. (ex: `7d`)
4. `REDIS_HOST`: Endereço de comunicação de cache. Padrão: `redis`
5. `REDIS_PORT`: Porta do cache. Padrão: `6379`
6. `PORT`: Porta de serviço. Padrão: `3001`
7. `CORS_ORIGIN`: Origem autorizada. Padrão: `http://localhost:3000`

### Inicialização via Docker

Para iniciar a montagem da infraestrutura local, utilize o terminal na raiz do projeto:

```bash
docker-compose up --build -d
```

1. Para acessar a aplicação visual: `http://localhost:3000`
2. Para acessar a documentação da API: `http://localhost:3001/api/docs`

## Testes

1. A suíte atua como filtro rigoroso com execução automática pelo GitHub Actions.
2. Para validar o backend, acesse a pasta `backend/` e execute `npm test`.
3. Para validar o frontend, acesse a pasta `frontend/` e execute `npm test`.

## Status do projeto

1. Funcional e livre de impedimentos no fluxo principal.
2. Integração contínua implantada, avaliando código e regressões automaticamente.
3. Testes automatizados ativos e sem falhas.
4. Sistema pronto para implantação em ambiente produtivo.
