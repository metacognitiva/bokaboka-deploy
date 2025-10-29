# Guia Completo de Deploy em Produção - BokaBoka

Este guia fornece instruções detalhadas para fazer o deploy permanente do site BokaBoka em produção.

## 📦 Repositório GitHub

O código fonte completo está disponível em:
**https://github.com/metacognitiva/bokaboka-deploy**

## 🎯 Opções de Deploy Recomendadas

### Opção 1: Railway (Recomendado - Mais Simples)

O Railway oferece deploy completo com banco de dados MySQL incluído, tudo em uma única plataforma.

#### Vantagens:
- Deploy automático via GitHub
- Banco de dados MySQL incluído
- $5 de crédito gratuito mensal
- Domínio público automático
- SSL/HTTPS automático

#### Passos para Deploy no Railway:

1. **Acesse:** https://railway.app
2. **Faça login** com sua conta GitHub
3. **Clique em "New Project"**
4. **Selecione "Deploy from GitHub repo"**
5. **Escolha o repositório:** `metacognitiva/bokaboka-deploy`
6. **Adicione o serviço MySQL:**
   - Clique em "+ New"
   - Selecione "Database"
   - Escolha "MySQL"
7. **Configure as variáveis de ambiente** (Settings > Variables):

```env
# Banco de Dados (Railway fornece automaticamente)
DATABASE_URL=${{MySQL.DATABASE_URL}}
DATABASE_HOST=${{MySQL.MYSQL_HOST}}
DATABASE_USERNAME=${{MySQL.MYSQL_USER}}
DATABASE_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
DATABASE_NAME=${{MySQL.MYSQL_DATABASE}}

# App Info
VITE_APP_ID=bokaboka
VITE_APP_TITLE=BokaBoka
VITE_APP_LOGO=https://placehold.co/40x40/3b82f6/ffffff?text=B

# OAuth (Manus)
VITE_OAUTH_PORTAL_URL=https://vida.butterfly-effect.dev
OAUTH_SERVER_URL=https://vidabiz.butterfly-effect.dev
OWNER_OPEN_ID=default_owner
OWNER_NAME=Admin

# JWT
JWT_SECRET=bokaboka-production-secret-change-this-to-random-string

# Email (Resend)
RESEND_API_KEY=re_your_resend_api_key
EMAIL_FROM=noreply@bokaboka.com.br
ADMIN_EMAIL=admin@bokaboka.com.br

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=your_mercadopago_token

# Storage (Forge - Manus)
BUILT_IN_FORGE_API_KEY=your_forge_api_key
BUILT_IN_FORGE_API_URL=https://forge.manus.ai/v1

# OpenAI (opcional)
OPENAI_API_URL=https://api.manus.im/api/llm-proxy/v1
OPENAI_API_KEY=your_openai_key

# Infrastructure
PORT=3000
NODE_ENV=production
```

8. **Importe o banco de dados:**
   - Acesse o MySQL via Railway CLI ou phpMyAdmin
   - Importe o arquivo `database_export_production.sql`
   - Ou use o comando: `railway run mysql -u root -p < database_export_production.sql`

9. **Deploy automático:**
   - O Railway fará o deploy automaticamente
   - Aguarde alguns minutos
   - Acesse a URL fornecida pelo Railway

---

### Opção 2: Render.com

O Render oferece hospedagem gratuita para aplicações web e banco de dados PostgreSQL (não MySQL).

#### Vantagens:
- Plano gratuito permanente
- Deploy automático via GitHub
- SSL/HTTPS automático
- Domínio público gratuito

#### Desvantagens:
- Usa PostgreSQL ao invés de MySQL (requer migração)
- Serviços gratuitos entram em sleep após inatividade

#### Passos para Deploy no Render:

1. **Acesse:** https://render.com
2. **Faça login** com GitHub
3. **Crie um novo PostgreSQL Database:**
   - Dashboard > New > PostgreSQL
   - Nome: bokaboka-db
   - Plano: Free
4. **Anote as credenciais do banco** (Internal Database URL)
5. **Crie um novo Web Service:**
   - Dashboard > New > Web Service
   - Conecte ao repositório: `metacognitiva/bokaboka-deploy`
   - Nome: bokaboka
   - Environment: Node
   - Build Command: `pnpm install && pnpm build`
   - Start Command: `pnpm start`
6. **Configure as variáveis de ambiente** (mesmas da Opção 1, mas usando PostgreSQL URL)
7. **Migre o banco de dados:**
   - Converta MySQL para PostgreSQL usando ferramentas como pgLoader
   - Ou recrie os dados manualmente

---

### Opção 3: Vercel (Frontend) + Aiven (Banco de Dados)

Separar frontend e backend para melhor performance e escalabilidade.

#### Vantagens:
- Vercel é extremamente rápido para frontend
- Aiven oferece MySQL gratuito
- Melhor separação de responsabilidades

#### Desvantagens:
- Requer configuração em duas plataformas
- Mais complexo de configurar

#### Passos:

**Parte 1: Configurar Banco de Dados no Aiven**

1. Acesse: https://aiven.io/free-mysql-database
2. Crie conta gratuita
3. Crie um novo serviço MySQL
4. Anote as credenciais de conexão
5. Importe o banco: `mysql -h HOST -u USER -p DATABASE < database_export_production.sql`

**Parte 2: Deploy no Vercel**

1. Acesse: https://vercel.com
2. Importe o repositório GitHub
3. Configure as variáveis de ambiente
4. Deploy automático

---

## 📊 Importação do Banco de Dados

O arquivo `database_export_production.sql` contém todos os dados:
- 16 profissionais
- 1 usuário
- Todas as tabelas e estruturas

### Como importar:

**Via MySQL CLI:**
```bash
mysql -h HOST -u USER -p DATABASE < database_export_production.sql
```

**Via Railway CLI:**
```bash
railway run mysql -u root -p < database_export_production.sql
```

**Via phpMyAdmin:**
1. Acesse phpMyAdmin
2. Selecione o banco de dados
3. Vá em "Importar"
4. Escolha o arquivo SQL
5. Clique em "Executar"

---

## 🔐 Configuração de Secrets

### Secrets Obrigatórias:

1. **DATABASE_URL** - Fornecido automaticamente pelo Railway/Render
2. **JWT_SECRET** - Gere uma string aleatória segura

### Secrets Opcionais (mas recomendadas):

3. **RESEND_API_KEY** - Para envio de emails
   - Crie conta em: https://resend.com
   - Obtenha a API key no dashboard
   
4. **MERCADOPAGO_ACCESS_TOKEN** - Para pagamentos
   - Acesse: https://www.mercadopago.com.br/developers
   - Crie uma aplicação
   - Obtenha o Access Token
   
5. **BUILT_IN_FORGE_API_KEY** - Para upload de imagens
   - Fornecido pelo Manus
   - Ou use alternativas como Cloudinary, AWS S3

---

## 🚀 Comandos de Build e Start

O projeto já está configurado com os comandos corretos no `package.json`:

```json
{
  "scripts": {
    "build": "vite build && esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "dev": "NODE_ENV=development tsx watch server/_core/index.ts"
  }
}
```

---

## ✅ Checklist de Deploy

Antes de fazer o deploy, verifique:

- [ ] Código commitado no GitHub
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados criado
- [ ] Dados importados
- [ ] Build testado localmente (`pnpm build && pnpm start`)
- [ ] Secrets configuradas (JWT, API keys)
- [ ] Domínio configurado (opcional)

---

## 🔧 Troubleshooting

### Erro: "Cannot connect to database"
- Verifique se DATABASE_URL está correta
- Confirme que o banco de dados está rodando
- Teste a conexão manualmente

### Erro: "Build failed"
- Execute `pnpm install` localmente
- Verifique se todas as dependências estão no package.json
- Confirme que a versão do Node é compatível (>= 18)

### Erro: "Port already in use"
- Altere a variável PORT nas configurações
- Railway e Render configuram a porta automaticamente

### Site lento ou não responde
- Serviços gratuitos podem entrar em sleep
- Considere upgrade para plano pago
- Use serviços de monitoramento (UptimeRobot)

---

## 📱 Domínio Personalizado

Após o deploy, você pode configurar um domínio personalizado:

**Railway:**
- Settings > Domains > Add Custom Domain
- Configure DNS: CNAME apontando para o domínio do Railway

**Render:**
- Settings > Custom Domain
- Configure DNS conforme instruções

**Vercel:**
- Settings > Domains
- Adicione seu domínio e configure DNS

---

## 🎉 Conclusão

Com este guia, você tem todas as informações necessárias para fazer o deploy permanente do BokaBoka em produção. Recomendo começar com o **Railway** pela simplicidade e depois migrar para soluções mais robustas conforme o projeto cresce.

**Próximos passos:**
1. Escolha uma plataforma de deploy
2. Configure o banco de dados
3. Importe os dados
4. Configure as variáveis de ambiente
5. Faça o deploy
6. Teste todas as funcionalidades
7. Configure domínio personalizado (opcional)

Boa sorte com o deploy! 🚀
