# Integração Mercado Pago - BokaBoka

## 📋 Resumo

Integração completa com Mercado Pago para processar pagamentos recorrentes mensais dos planos Base (R$ 29,90) e Destaque (R$ 49,90).

## 🎯 Funcionalidades Implementadas

### Backend

1. **Serviço de Pagamentos** (`server/mercadopago-service.ts`)
   - Inicialização do cliente Mercado Pago
   - Criação de preferências de pagamento
   - Verificação de status de pagamentos
   - Processamento de webhooks
   - Cálculo de datas de vencimento

2. **Endpoints tRPC** (`server/routers.ts`)
   - `payments.getPlans` - Lista planos disponíveis
   - `payments.createSubscription` - Cria preferência de pagamento
   - `payments.checkPaymentStatus` - Verifica status de pagamento
   - `payments.getMyPayments` - Lista pagamentos do profissional

3. **Webhook** (`server/webhooks/mercadopago.ts`)
   - Recebe notificações do Mercado Pago
   - Atualiza status de pagamento no banco
   - Ativa assinatura do profissional
   - Registra transação na tabela `payments`

### Frontend

1. **Página de Planos** (`/planos`)
   - Exibe Plano Base e Plano Destaque
   - Comparação de recursos
   - Botões para assinar

2. **Página de Checkout** (`/checkout/:professionalId/:planType`)
   - Resumo do plano selecionado
   - Informações sobre cobrança recorrente
   - Botão de pagamento com Mercado Pago
   - Redirecionamento para checkout seguro

3. **Páginas de Retorno**
   - `/payment/success` - Pagamento aprovado
   - `/payment/pending` - Pagamento pendente
   - `/payment/failure` - Pagamento rejeitado

## 🔧 Configuração

### Variáveis de Ambiente

```bash
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxx-xxxx-xxxx-xxxx
```

**Como obter:**
1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Vá em "Suas integrações" → "Credenciais"
3. Copie o Access Token (produção ou teste)

### Webhook URL

Configure no painel do Mercado Pago:
```
https://seu-dominio.com/api/webhooks/mercadopago
```

**Eventos para escutar:**
- `payment` - Notificações de pagamento

## 📊 Fluxo de Pagamento

```
1. Profissional escolhe plano (/planos)
   ↓
2. Clica em "Assinar" → Redireciona para /checkout
   ↓
3. Revisa informações e clica em "Pagar com Mercado Pago"
   ↓
4. Backend cria preferência de pagamento (tRPC)
   ↓
5. Usuário é redirecionado para checkout do Mercado Pago
   ↓
6. Usuário completa pagamento
   ↓
7. Mercado Pago envia webhook para /api/webhooks/mercadopago
   ↓
8. Backend atualiza banco de dados:
   - Registra pagamento na tabela `payments`
   - Ativa profissional (isActive = true)
   - Define data de expiração (30 dias)
   ↓
9. Usuário é redirecionado para /payment/success
```

## 💾 Estrutura do Banco de Dados

### Tabela `payments`

```sql
CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  professionalId INT NOT NULL,
  amount INT NOT NULL, -- Em centavos (2990 = R$ 29,90)
  planType ENUM('base', 'destaque') NOT NULL,
  paymentMethod ENUM('credit_card', 'pix', 'boleto'),
  paymentStatus ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  transactionId VARCHAR(255), -- ID do Mercado Pago
  paymentGateway VARCHAR(50), -- 'mercadopago'
  subscriptionStartDate TIMESTAMP,
  subscriptionEndDate TIMESTAMP,
  isRecurring BOOLEAN DEFAULT TRUE,
  nextBillingDate TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Atualização em `professionals`

```sql
-- Campos atualizados após pagamento aprovado
UPDATE professionals SET
  planType = 'base' | 'destaque',
  isActive = TRUE,
  subscriptionEndsAt = DATE_ADD(NOW(), INTERVAL 30 DAY)
WHERE id = professionalId;
```

## 🧪 Testando a Integração

### 1. Ambiente de Teste (Sandbox)

Use credenciais de teste do Mercado Pago:
- Access Token de teste: `TEST-xxxx-xxxx-xxxx-xxxx`

**Cartões de teste:**
- **Aprovado:** 5031 4332 1540 6351 (Mastercard)
- **Rejeitado:** 5031 7557 3453 0604 (Mastercard)
- **Pendente:** 5031 4332 1540 6351 com valor R$ 1.000,00

### 2. Fluxo de Teste

```bash
# 1. Cadastrar profissional de teste
# 2. Acessar /planos
# 3. Escolher plano Base ou Destaque
# 4. Completar checkout com cartão de teste
# 5. Verificar webhook recebido (logs do servidor)
# 6. Confirmar atualização no banco de dados
```

### 3. Verificar Logs

```bash
# Logs do servidor
tail -f logs/server.log

# Procurar por:
✅ Mercado Pago inicializado
📩 Webhook recebido
💰 Status do pagamento
✅ Pagamento aprovado para profissional X
```

## 🔒 Segurança

1. **Rate Limiting**
   - Upload: 10 requisições/minuto
   - API geral: 100 requisições/15min
   - Autenticação: 5 tentativas/15min

2. **Validações**
   - CPF com dígitos verificadores
   - Verificação de profissional existente
   - Validação de plano (base/destaque)

3. **Webhook**
   - Validar origem (IP do Mercado Pago)
   - Verificar assinatura (implementar em produção)
   - Processar idempotentemente (evitar duplicatas)

## 📈 Monitoramento

### Métricas Importantes

1. **Taxa de Conversão**
   - Visitas em /planos → Checkouts iniciados
   - Checkouts iniciados → Pagamentos aprovados

2. **MRR (Monthly Recurring Revenue)**
   - Calculado automaticamente no dashboard financeiro
   - Fórmula: Soma de todos os planos ativos

3. **Churn Rate**
   - Profissionais que cancelaram assinatura
   - Profissionais com assinatura expirada

### Dashboard Financeiro

Acesse `/financial` para ver:
- MRR atual
- Projeção de receita (12 meses)
- Histórico de pagamentos
- Distribuição Base vs Destaque
- Insights automáticos

## 🚀 Próximos Passos

### Produção

1. **Trocar credenciais de teste por produção**
   ```bash
   MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxx-xxxx-xxxx-xxxx
   ```

2. **Configurar webhook no painel do Mercado Pago**
   - URL: `https://bokaboka.com/api/webhooks/mercadopago`
   - Eventos: `payment`

3. **Implementar validação de assinatura do webhook**
   ```typescript
   // Verificar x-signature header
   const signature = req.headers['x-signature'];
   const isValid = validateMercadoPagoSignature(signature, req.body);
   ```

### Melhorias Futuras

1. **Assinaturas Recorrentes Automáticas**
   - Usar API de Subscriptions do Mercado Pago
   - Cobrar automaticamente todo mês

2. **Gerenciamento de Assinatura**
   - Página para profissional cancelar assinatura
   - Página para alterar plano (upgrade/downgrade)
   - Histórico de faturas

3. **Notificações**
   - Email de confirmação de pagamento
   - Email de renovação (7 dias antes)
   - Email de pagamento falhou
   - Email de assinatura cancelada

4. **Cupons de Desconto**
   - Sistema de cupons promocionais
   - Desconto no primeiro mês
   - Desconto para indicação

5. **Relatórios Avançados**
   - Exportar relatório de pagamentos (CSV/PDF)
   - Gráficos de receita por período
   - Análise de cohort

## 📞 Suporte

**Documentação Mercado Pago:**
- https://www.mercadopago.com.br/developers/pt/docs

**Endpoints úteis:**
- Painel: https://www.mercadopago.com.br/developers/panel
- Credenciais: https://www.mercadopago.com.br/developers/panel/credentials
- Webhooks: https://www.mercadopago.com.br/developers/panel/webhooks

**Contato BokaBoka:**
- Email: contato@bokaboka.com
- Admin: /admin

---

**Status:** ✅ Integração completa e funcional
**Última atualização:** 2024-10-24

