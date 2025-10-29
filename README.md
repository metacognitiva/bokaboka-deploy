# 🎯 BokaBoka - Plataforma de Profissionais Verificados

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com)

> Plataforma completa para conectar clientes a profissionais verificados com sistema de avaliações, pagamentos e stories.

## 📋 Sobre o Projeto

BokaBoka é uma plataforma full-stack desenvolvida com React, Node.js, Express, tRPC e MySQL que permite:

- ✅ Cadastro e verificação de profissionais (com IA)
- ⭐ Sistema de avaliações com fotos e áudios
- 💳 Integração com Mercado Pago para pagamentos
- 📸 Stories estilo Instagram para profissionais
- 🔍 Busca avançada por categoria e localização
- 🏆 Sistema de ranking e badges
- 📧 Notificações por email
- 🔐 Autenticação OAuth

## 🚀 Deploy Rápido

### Opção 1: Railway (Recomendado)

1. Acesse: https://railway.app/new
2. Faça login com GitHub
3. Selecione "Deploy from GitHub repo"
4. Escolha: `metacognitiva/bokaboka-deploy`
5. Adicione MySQL database
6. Configure variáveis de ambiente
7. Deploy automático!

**Tempo:** ~5 minutos | **Custo:** Grátis ($5 crédito mensal)

### Opção 2: Render

1. Acesse: https://render.com
2. Conecte ao repositório
3. O arquivo `render.yaml` configura tudo
4. Deploy automático!

**Tempo:** ~10 minutos | **Custo:** Grátis (com limitações)

### Opção 3: Docker

```bash
# Clone o repositório
git clone https://github.com/metacognitiva/bokaboka-deploy.git
cd bokaboka-deploy

# Configure .env
cp .env.example .env
# Edite .env com suas credenciais

# Build e run
docker build -t bokaboka .
docker run -p 3000:3000 bokaboka
```

## 📦 Estrutura do Projeto

```
bokaboka/
├── client/              # Frontend React + Vite
│   ├── src/
│   │   ├── pages/      # Páginas (Home, Profile, Admin, etc)
│   │   ├── components/ # Componentes reutilizáveis
│   │   └── lib/        # Utilitários e hooks
├── server/              # Backend Express + tRPC
│   ├── routers.ts      # Endpoints da API
│   ├── db.ts           # Conexão com banco de dados
│   └── _core/          # Configurações core
├── drizzle/            # Schema e migrations do banco
│   └── schema.ts       # Definição das tabelas
├── shared/             # Tipos e constantes compartilhados
└── public/             # Assets estáticos
```

## 🔧 Tecnologias Utilizadas

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Radix UI** - Componentes acessíveis
- **TanStack Query** - Data fetching
- **Wouter** - Roteamento
- **Framer Motion** - Animações

### Backend
- **Node.js 22** - Runtime
- **Express** - Web framework
- **tRPC** - Type-safe API
- **Drizzle ORM** - Database ORM
- **MySQL** - Banco de dados
- **Zod** - Validação de schemas

### Integrações
- **Mercado Pago** - Pagamentos
- **Resend** - Emails transacionais
- **Forge/Manus** - Upload de imagens
- **OpenAI** - Verificação com IA

## ⚙️ Configuração

### Variáveis de Ambiente Obrigatórias

```env
DATABASE_URL=mysql://user:password@host:3306/database
JWT_SECRET=sua-chave-secreta-muito-segura
NODE_ENV=production
PORT=3000
```

### Variáveis Opcionais

```env
RESEND_API_KEY=re_sua_chave
MERCADOPAGO_ACCESS_TOKEN=seu_token
BUILT_IN_FORGE_API_KEY=sua_chave_forge
OPENAI_API_KEY=sua_chave_openai
```

Veja o arquivo `.env.example` para todas as variáveis disponíveis.

## 💾 Banco de Dados

### Importar Dados Iniciais

O repositório inclui um dump SQL com dados de exemplo:

```bash
# Via MySQL CLI
mysql -h HOST -u USER -p DATABASE < database_export_production.sql

# Via Railway CLI
railway run mysql -u root -p < database_export_production.sql
```

### Schema

O projeto usa Drizzle ORM. Para aplicar migrations:

```bash
pnpm drizzle-kit push
```

## 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
pnpm install

# Configurar .env
cp .env.example .env
# Edite .env com suas credenciais

# Rodar migrations
pnpm drizzle-kit push

# Iniciar servidor de desenvolvimento
pnpm dev
```

Acesse: http://localhost:3000

## 📚 Documentação

- **[DEPLOY_RAPIDO.md](./DEPLOY_RAPIDO.md)** - Guia de deploy com um clique
- **[GUIA_DEPLOY_PRODUCAO.md](./GUIA_DEPLOY_PRODUCAO.md)** - Guia completo de deploy
- **[GUIA_DE_USO.md](./GUIA_DE_USO.md)** - Como usar o sistema
- **[FLUXO-CADASTRO.md](./FLUXO-CADASTRO.md)** - Fluxo de cadastro de profissionais
- **[MERCADOPAGO-INTEGRATION.md](./MERCADOPAGO-INTEGRATION.md)** - Integração de pagamentos

## 🎨 Funcionalidades

### Para Profissionais
- ✅ Cadastro com verificação de identidade (IA)
- 📸 Upload de fotos (perfil, galeria, antes/depois)
- 📱 Stories estilo Instagram
- 💰 Planos (Base e Destaque)
- 📊 Dashboard com analytics
- ⭐ Gerenciamento de avaliações

### Para Clientes
- 🔍 Busca avançada de profissionais
- ⭐ Sistema de avaliações com fotos
- 💬 Contato direto via WhatsApp
- 🏆 Visualização de ranking
- 📱 Interface responsiva

### Para Administradores
- 👥 Moderação de profissionais
- 🔍 Verificação de documentos
- 📊 Analytics e relatórios
- 💳 Gestão de pagamentos
- 🚫 Sistema de denúncias

## 🔒 Segurança

- ✅ Autenticação OAuth
- ✅ JWT para sessões
- ✅ Validação de dados com Zod
- ✅ Rate limiting
- ✅ Helmet.js para headers de segurança
- ✅ Sanitização de inputs
- ✅ HTTPS obrigatório em produção

## 📈 Performance

- ⚡ Server-side rendering
- 🗜️ Compressão de assets
- 🖼️ Lazy loading de imagens
- 📦 Code splitting
- 💾 Cache de queries
- 🔄 Optimistic updates

## 🧪 Testes

```bash
# Testes unitários
pnpm test

# Testes com coverage
pnpm test:coverage

# Testes em watch mode
pnpm test:watch
```

## 📝 Scripts Disponíveis

```bash
pnpm dev          # Desenvolvimento
pnpm build        # Build para produção
pnpm start        # Iniciar produção
pnpm check        # Type checking
pnpm format       # Formatar código
pnpm test         # Rodar testes
pnpm db:push      # Aplicar migrations
```

## 🌍 Deploy em Produção

O projeto está configurado para deploy em:

- ✅ **Railway** - Recomendado (Node.js + MySQL)
- ✅ **Render** - Alternativa gratuita
- ✅ **Vercel** - Frontend (requer backend separado)
- ✅ **Docker** - Qualquer plataforma

Veja [DEPLOY_RAPIDO.md](./DEPLOY_RAPIDO.md) para instruções detalhadas.

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Autores

- **Diego Gonçalves** - *Desenvolvimento* - [Metacognitiva](https://github.com/metacognitiva)

## 🙏 Agradecimentos

- Manus AI pela plataforma de desenvolvimento
- Comunidade React e Node.js
- Todos os contribuidores

---

**Status:** ✅ Em Produção  
**Versão:** 1.0.0  
**Última atualização:** Outubro 2025

---

## 🔗 Links Úteis

- **Repositório:** https://github.com/metacognitiva/bokaboka-deploy
- **Demo:** Em breve
- **Documentação:** Ver pasta `/docs`
- **Issues:** https://github.com/metacognitiva/bokaboka-deploy/issues

---

Feito com ❤️ por [Metacognitiva](https://metacognitiva.com.br)
