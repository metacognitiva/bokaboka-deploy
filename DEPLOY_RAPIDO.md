# 🚀 Deploy Rápido - BokaBoka

## Deploy com Um Clique

Escolha uma das opções abaixo para fazer o deploy permanente do BokaBoka:

### 🔵 Railway (Recomendado)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/mysql-nodejs?referralCode=bokaboka)

**Link direto:** https://railway.app/new

**Passos:**
1. Clique no botão acima ou acesse o link
2. Faça login com GitHub
3. Clique em "Deploy from GitHub repo"
4. Selecione: `metacognitiva/bokaboka-deploy`
5. Adicione MySQL database
6. Configure as variáveis de ambiente (veja abaixo)
7. Aguarde o deploy (3-5 minutos)

---

### 🟣 Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com)

**Link direto:** https://render.com/deploy

**Passos:**
1. Clique no botão acima
2. Faça login com GitHub
3. Conecte ao repositório: `metacognitiva/bokaboka-deploy`
4. O arquivo `render.yaml` configura tudo automaticamente
5. Aguarde o deploy (5-10 minutos)

---

### ⚡ Vercel (Apenas Frontend)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/metacognitiva/bokaboka-deploy)

**Nota:** Vercel é ideal para frontend, mas você precisará de um banco de dados separado (Aiven, PlanetScale, etc.)

---

## 📋 Variáveis de Ambiente Obrigatórias

Copie e cole estas variáveis no painel de configuração da plataforma escolhida:

```env
# Banco de Dados (fornecido automaticamente pela plataforma)
DATABASE_URL=${{DATABASE_URL}}

# App
VITE_APP_ID=bokaboka
VITE_APP_TITLE=BokaBoka
NODE_ENV=production
PORT=3000

# JWT (IMPORTANTE: Mude para uma string aleatória segura)
JWT_SECRET=mude-isto-para-uma-string-aleatoria-muito-segura-123456789

# OAuth
VITE_OAUTH_PORTAL_URL=https://vida.butterfly-effect.dev
OAUTH_SERVER_URL=https://vidabiz.butterfly-effect.dev
OWNER_OPEN_ID=default_owner
OWNER_NAME=Admin
```

## 📋 Variáveis de Ambiente Opcionais

Para funcionalidades completas, adicione também:

```env
# Email (Resend)
RESEND_API_KEY=re_sua_chave_resend
EMAIL_FROM=noreply@bokaboka.com.br
ADMIN_EMAIL=admin@bokaboka.com.br

# Pagamentos (Mercado Pago)
MERCADOPAGO_ACCESS_TOKEN=seu_token_mercadopago

# Upload de Imagens (Forge/Manus)
BUILT_IN_FORGE_API_KEY=sua_chave_forge
BUILT_IN_FORGE_API_URL=https://forge.manus.ai/v1

# OpenAI (opcional)
OPENAI_API_URL=https://api.manus.im/api/llm-proxy/v1
OPENAI_API_KEY=sua_chave_openai
```

---

## 💾 Importar Banco de Dados

Após o deploy, importe os dados:

### Railway:
```bash
# Instale Railway CLI
npm install -g @railway/cli

# Faça login
railway login

# Conecte ao projeto
railway link

# Importe o banco
railway run mysql -u root -p < database_export_production.sql
```

### Render:
1. Acesse o dashboard do banco de dados
2. Clique em "Connect"
3. Use o comando fornecido para conectar
4. Execute: `mysql < database_export_production.sql`

### Manualmente (qualquer plataforma):
1. Baixe o arquivo `database_export_production.sql` do repositório
2. Acesse o painel de administração do banco (phpMyAdmin, Adminer, etc.)
3. Importe o arquivo SQL

---

## ✅ Verificação Pós-Deploy

Após o deploy, verifique:

1. ✅ Site está acessível via URL fornecida
2. ✅ Página inicial carrega corretamente
3. ✅ Profissionais aparecem na listagem
4. ✅ Busca funciona
5. ✅ Imagens carregam
6. ✅ Login funciona (se configurado OAuth)

---

## 🔗 Links Úteis

- **Repositório GitHub:** https://github.com/metacognitiva/bokaboka-deploy
- **Guia Completo de Deploy:** Ver arquivo `GUIA_DEPLOY_PRODUCAO.md`
- **Railway:** https://railway.app
- **Render:** https://render.com
- **Vercel:** https://vercel.com
- **Aiven (MySQL grátis):** https://aiven.io/free-mysql-database

---

## 🆘 Precisa de Ajuda?

Se encontrar problemas:

1. Verifique os logs da plataforma de deploy
2. Confirme que todas as variáveis de ambiente estão corretas
3. Verifique se o banco de dados está rodando
4. Consulte o arquivo `GUIA_DEPLOY_PRODUCAO.md` para troubleshooting detalhado

---

## 🎯 Próximos Passos

Após o deploy bem-sucedido:

1. Configure um domínio personalizado
2. Configure as secrets para email e pagamentos
3. Teste todas as funcionalidades
4. Adicione mais profissionais
5. Configure monitoramento (UptimeRobot, etc.)
6. Configure backups automáticos do banco de dados

---

**Tempo estimado de deploy:** 5-10 minutos  
**Custo:** Gratuito (planos free tier)  
**Persistência:** Permanente (enquanto a conta estiver ativa)

🎉 **Boa sorte com o deploy!**
