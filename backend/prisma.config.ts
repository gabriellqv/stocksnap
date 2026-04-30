/**
 * @description Configuração central do Prisma CLI para o StockSnap.
 *
 * Define o caminho do schema, diretório de migrations e a URL de conexão
 * com o PostgreSQL. A variável `DATABASE_URL` é carregada automaticamente
 * do arquivo `.env` via `dotenv/config` no momento da execução de
 * comandos como `npx prisma migrate` ou `npx prisma generate`.
 */
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
