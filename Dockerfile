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

# Definir variáveis de ambiente do Vite com valores fixos
ENV VITE_APP_ID=bokaboka
ENV VITE_APP_TITLE=BokaBoka
ENV VITE_APP_LOGO=https://placehold.co/40x40/3b82f6/ffffff?text=B
ENV VITE_OAUTH_PORTAL_URL=https://vida.butterfly-effect.dev
ENV OAUTH_SERVER_URL=https://vidabiz.butterfly-effect.dev

# Build do projeto
RUN pnpm build

# Expor porta
EXPOSE 3000

# Comando para iniciar
CMD ["pnpm", "start"]
