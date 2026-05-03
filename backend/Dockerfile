# ===== STAGE 1: Build =====
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate
RUN npx tsc prisma/seed.ts --target ES2022 --module NodeNext --moduleResolution NodeNext --esModuleInterop

COPY . .
RUN npm run build

# Remove devDependencies após o build
RUN npm prune --omit=dev

# ===== STAGE 2: Runtime =====
FROM node:20-alpine AS runtime
WORKDIR /app

# Cria usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copia apenas o necessário do estágio de build
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

USER nestjs
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD wget -qO- http://localhost:3001/api || exit 1

CMD ["sh", "-c", "npx prisma migrate deploy && node prisma/seed.js && node dist/main.js"]
