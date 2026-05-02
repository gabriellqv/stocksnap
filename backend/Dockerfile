FROM node:20-alpine

WORKDIR /app

# Copiar package.json primeiro (cache de camadas do Docker)
COPY package*.json ./

RUN npm ci

# Copiar o resto do código
COPY . .

# Gerar o Prisma Client dentro do container
RUN npx prisma generate

# Build do TypeScript
RUN npm run build

EXPOSE 3001

# Rodar migrations e iniciar
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
