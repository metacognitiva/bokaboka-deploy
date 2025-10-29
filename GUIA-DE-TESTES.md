# 🧪 Guia de Testes - BokaBoka

## Ambiente de Teste de Pagamentos

### Acesso Rápido

**URL:** `/test-payments`

Este ambiente permite simular pagamentos completos usando cartões de teste do Mercado Pago.

---

## 🚀 Como Testar

### 1. Acessar o Ambiente de Teste

```
https://seu-dominio.com/test-payments
```

### 2. Profissional de Teste

Já está configurado automaticamente:
- **ID:** 1
- **UID:** test-professional
- **Nome:** Profissional de Teste
- **Email:** teste@bokaboka.com

### 3. Escolher Plano

Você pode testar ambos os planos:

**Plano Base**
- Valor: R$ 29,90/mês
- Botão: "Testar Checkout Base"

**Plano Destaque**
- Valor: R$ 49,90/mês
- Botão: "Testar Checkout Destaque"

### 4. Cartões de Teste

Use estes cartões no checkout do Mercado Pago:

#### ✅ Pagamento Aprovado
```
Número: 5031 4332 1540 6351
CVV: 123
Validade: 11/25
Nome: APRO (qualquer nome)
```

#### ❌ Pagamento Rejeitado
```
Número: 5031 7557 3453 0604
CVV: 123
Validade: 11/25
Nome: OTHE (qualquer nome)
```

#### ⏳ Pagamento Pendente
```
Número: 5031 4332 1540 6351
CVV: 123
Validade: 11/25
Valor: R$ 1.000,00 (específico)
```

### 5. Completar Pagamento

1. Clique em "Testar Checkout Base" ou "Testar Checkout Destaque"
2. Você será redirecionado para o checkout do Mercado Pago (sandbox)
3. Preencha com um dos cartões de teste acima
4. Complete o pagamento
5. Você será redirecionado de volta para:
   - `/payment/success` - Se aprovado
   - `/payment/pending` - Se pendente
   - `/payment/failure` - Se rejeitado

### 6. Verificar Resultado

#### No Banco de Dados

```sql
-- Ver pagamento registrado
SELECT * FROM payments ORDER BY createdAt DESC LIMIT 1;

-- Ver profissional atualizado
SELECT id, displayName, planType, isActive, subscriptionEndsAt 
FROM professionals 
WHERE id = 1;
```

#### No Dashboard Admin

1. Acesse `/admin`
2. Vá na aba "Visão Geral"
3. Veja o card "Total de Pagamentos" atualizado

#### No Dashboard Financeiro

1. Acesse `/financial`
2. Veja:
   - MRR atualizado
   - Histórico de pagamentos
   - Gráfico de receita

---

## 🔍 Cenários de Teste

### Cenário 1: Pagamento Aprovado

**Objetivo:** Simular um pagamento bem-sucedido

**Passos:**
1. Acesse `/test-payments`
2. Clique em "Testar Checkout Base"
3. Use cartão aprovado: `5031 4332 1540 6351`
4. Complete o pagamento

**Resultado Esperado:**
- ✅ Redirecionado para `/payment/success`
- ✅ Pagamento registrado na tabela `payments` com status `completed`
- ✅ Profissional ativado (`isActive = true`)
- ✅ Data de expiração definida (+30 dias)
- ✅ MRR atualizado no dashboard financeiro

### Cenário 2: Pagamento Rejeitado

**Objetivo:** Simular um pagamento recusado

**Passos:**
1. Acesse `/test-payments`
2. Clique em "Testar Checkout Destaque"
3. Use cartão rejeitado: `5031 7557 3453 0604`
4. Tente completar o pagamento

**Resultado Esperado:**
- ❌ Redirecionado para `/payment/failure`
- ❌ Nenhum pagamento registrado
- ❌ Profissional permanece inativo
- ❌ MRR não alterado

### Cenário 3: Pagamento Pendente

**Objetivo:** Simular um pagamento em análise

**Passos:**
1. Acesse `/test-payments`
2. Clique em "Testar Checkout Base"
3. Use cartão aprovado mas com valor R$ 1.000,00
4. Complete o pagamento

**Resultado Esperado:**
- ⏳ Redirecionado para `/payment/pending`
- ⏳ Pagamento registrado com status `pending`
- ⏳ Profissional permanece inativo até aprovação
- ⏳ MRR não alterado até aprovação

---

## 🔧 Webhooks

### Testando Webhooks Localmente

O Mercado Pago precisa acessar sua URL de webhook para enviar notificações. Em desenvolvimento local, use **ngrok** ou **localtunnel**:

#### Com ngrok:
```bash
ngrok http 3000
```

Copie a URL gerada (ex: `https://abc123.ngrok.io`) e configure no painel do Mercado Pago:
```
https://abc123.ngrok.io/api/webhooks/mercadopago
```

#### Verificar Logs do Webhook:

```bash
# No terminal do servidor, você verá:
📩 Webhook recebido: { type: 'payment', data: { id: '123456' } }
💰 Status do pagamento: { status: 'approved', ... }
✅ Pagamento aprovado para profissional 1
```

---

## 📊 Monitoramento

### Logs Importantes

```bash
# Inicialização do Mercado Pago
✅ Mercado Pago inicializado

# Criação de preferência
🎫 Preferência criada: pref-abc123

# Webhook recebido
📩 Webhook recebido: {...}

# Pagamento processado
✅ Pagamento aprovado para profissional X
```

### Queries Úteis

```sql
-- Todos os pagamentos
SELECT 
  p.id,
  prof.displayName,
  p.planType,
  p.amount / 100 as valor_reais,
  p.paymentStatus,
  p.createdAt
FROM payments p
JOIN professionals prof ON p.professionalId = prof.id
ORDER BY p.createdAt DESC;

-- Profissionais ativos com assinatura
SELECT 
  id,
  displayName,
  planType,
  isActive,
  subscriptionEndsAt,
  DATEDIFF(subscriptionEndsAt, NOW()) as dias_restantes
FROM professionals
WHERE isActive = true
ORDER BY subscriptionEndsAt ASC;

-- MRR (Monthly Recurring Revenue)
SELECT 
  SUM(CASE WHEN planType = 'base' THEN 29.90 ELSE 49.90 END) as mrr_total,
  COUNT(*) as assinaturas_ativas
FROM professionals
WHERE isActive = true;
```

---

## ⚠️ Avisos Importantes

### 1. Ambiente de Teste vs Produção

- **Teste:** Use credenciais de teste (`TEST-xxxx`)
- **Produção:** Use credenciais de produção (`APP_USR-xxxx`)

### 2. Cartões de Teste

- ⚠️ **NUNCA** use cartões reais em ambiente de teste
- ⚠️ **SEMPRE** use cartões de teste do Mercado Pago
- ⚠️ Cartões de teste **NÃO FUNCIONAM** em produção

### 3. Webhooks

- Configure a URL do webhook no painel do Mercado Pago
- Use HTTPS em produção (obrigatório)
- Implemente validação de assinatura em produção

### 4. Limpeza de Dados

Para limpar dados de teste:

```sql
-- Deletar pagamentos de teste
DELETE FROM payments WHERE professionalId = 1;

-- Resetar profissional de teste
UPDATE professionals 
SET isActive = false, subscriptionEndsAt = NULL 
WHERE id = 1;
```

---

## 📚 Recursos Adicionais

### Documentação Mercado Pago

- **Cartões de Teste:** https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/test-cards
- **Webhooks:** https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/webhooks
- **Painel:** https://www.mercadopago.com.br/developers/panel

### Páginas Relacionadas

- `/test-payments` - Ambiente de teste
- `/planos` - Página de planos
- `/checkout/:id/:plano` - Checkout
- `/payment/success` - Pagamento aprovado
- `/payment/pending` - Pagamento pendente
- `/payment/failure` - Pagamento rejeitado
- `/admin` - Dashboard administrativo
- `/financial` - Dashboard financeiro

---

## 🆘 Troubleshooting

### Problema: Webhook não está sendo recebido

**Solução:**
1. Verifique se a URL está correta no painel do Mercado Pago
2. Use ngrok em desenvolvimento local
3. Verifique os logs do servidor
4. Teste manualmente com curl:
```bash
curl -X POST http://localhost:3000/api/webhooks/mercadopago \
  -H "Content-Type: application/json" \
  -d '{"type":"payment","data":{"id":"123"}}'
```

### Problema: Pagamento não está sendo registrado

**Solução:**
1. Verifique se o webhook foi recebido (logs)
2. Verifique se o profissional existe no banco
3. Verifique se há erros no console do servidor
4. Verifique a tabela `payments` diretamente

### Problema: Erro ao criar preferência

**Solução:**
1. Verifique se `MERCADOPAGO_ACCESS_TOKEN` está configurado
2. Verifique se o token é válido (teste/produção)
3. Verifique os logs do servidor
4. Teste a conexão com a API do Mercado Pago

---

**Status:** ✅ Ambiente de teste completo e funcional
**Última atualização:** 2024-10-24

