# Dockerfile para BokaBoka
FROM node:22-alpine

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências E patches
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Instalar dependências
RUN pnpm install --frozen-lockfile

# Copiar código fonte
COPY . .

# Build do projeto
RUN pnpm build

# Expor porta
EXPOSE 3000

# Comando para iniciar
CMD ["pnpm", "start"]
