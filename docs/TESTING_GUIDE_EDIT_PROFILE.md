# 🧪 Guia de Testes - Edição de Perfil

## Índice
1. [Testes Manuais via Interface](#1-testes-manuais-via-interface)
2. [Testes via Console do Navegador](#2-testes-via-console-do-navegador)
3. [Testes com Ferramentas HTTP](#3-testes-com-ferramentas-http)
4. [Testes Automatizados](#4-testes-automatizados)
5. [Checklist de Validação](#5-checklist-de-validação)
6. [Casos de Teste Críticos](#6-casos-de-teste-críticos)

---

## 1. Testes Manuais via Interface

### 🎯 **Teste Básico - Fluxo Completo**

#### Pré-requisitos
- ✅ Estar logado como profissional
- ✅ Ter um card profissional aprovado
- ✅ Navegador com DevTools aberto (F12)

#### Passo a Passo

**1. Acessar Página de Edição**
```
1. Abra https://seu-dominio.com
2. Localize SEU próprio card profissional
3. Verifique se aparece botão "Editar" (azul)
4. Clique em "Editar"
5. ✅ Deve abrir página /edit-profile
```

**Resultado Esperado:**
- URL muda para `/edit-profile`
- Formulário carrega com dados atuais preenchidos
- Todos os campos estão editáveis

---

**2. Testar Carregamento de Dados**
```
1. Na página de edição, verifique:
   - Nome está preenchido
   - Bio está preenchida
   - Telefone está preenchido
   - WhatsApp está preenchido
   - Instagram está preenchido
   - Foto principal aparece (se houver)
   - Fotos antes/depois aparecem (se houver)
```

**Resultado Esperado:**
- Todos os campos com dados existentes estão preenchidos
- Campos vazios aparecem com placeholder
- Imagens aparecem como preview

---

**3. Testar Edição de Nome**
```
1. Altere o campo "Nome de Exibição"
2. Clique em "Salvar Alterações"
3. Aguarde mensagem de sucesso
4. Clique em "Voltar"
5. Verifique se nome mudou no card
```

**Resultado Esperado:**
- ✅ Toast verde: "Perfil atualizado com sucesso!"
- ✅ Redirecionamento para home
- ✅ Card mostra novo nome

---

**4. Testar Edição de Bio**
```
1. Volte para /edit-profile
2. Altere o campo "Bio / Descrição"
3. Adicione texto longo (200+ caracteres)
4. Salve
5. Verifique no card (clique "Posso confiar?")
```

**Resultado Esperado:**
- ✅ Bio atualizada
- ✅ Texto completo salvo (sem truncar)
- ✅ Aparece no verso do card

---

**5. Testar Upload de Foto Principal**
```
1. Cole URL de imagem válida no campo "Foto Principal"
   Exemplo: https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800
2. Verifique preview abaixo do campo
3. Salve
4. Volte para home
5. Verifique se foto mudou no card
```

**Resultado Esperado:**
- ✅ Preview aparece imediatamente
- ✅ Foto salva no banco
- ✅ Card mostra nova foto

---

**6. Testar Antes/Depois**
```
1. Cole URLs nas fotos "Antes" e "Depois"
   Antes: https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800
   Depois: https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800
2. Verifique previews
3. Salve
4. Volte para home
5. Procure botão "✨ Ver Transformação" no card
6. Clique no botão
7. Teste o slider (arraste)
```

**Resultado Esperado:**
- ✅ Botão "✨ Ver Transformação" aparece
- ✅ Modal abre com slider
- ✅ Slider funciona (arrasta)
- ✅ Fotos carregam corretamente

---

**7. Testar Remoção de Dados**
```
1. Limpe campo "Instagram"
2. Salve
3. Verifique se botão Instagram sumiu do card
```

**Resultado Esperado:**
- ✅ Campo limpo no banco
- ✅ Botão Instagram não aparece mais

---

## 2. Testes via Console do Navegador

### 🔧 **Teste Direto com tRPC**

**Abra o Console (F12 → Console) e execute:**

#### Teste 1: Obter Perfil Atual
```javascript
// Obter perfil
const profile = await window.trpc.professionals.getMyProfile.query();
console.log('Perfil atual:', profile);
```

**Resultado Esperado:**
```javascript
{
  id: 123,
  displayName: "João Silva",
  bio: "Psicólogo clínico...",
  phone: "(11) 98765-4321",
  // ... outros campos
}
```

---

#### Teste 2: Atualizar Nome
```javascript
// Atualizar apenas nome
const result = await window.trpc.professionals.updateProfile.mutate({
  displayName: "João Silva - TESTE"
});
console.log('Resultado:', result);
// Resultado: { success: true, message: "Perfil atualizado com sucesso!" }

// Verificar mudança
const updated = await window.trpc.professionals.getMyProfile.query();
console.log('Nome atualizado:', updated.displayName);
// Nome atualizado: "João Silva - TESTE"
```

---

#### Teste 3: Atualizar Múltiplos Campos
```javascript
const result = await window.trpc.professionals.updateProfile.mutate({
  displayName: "João Silva",
  bio: "Nova bio de teste",
  phone: "(11) 91234-5678",
  whatsapp: "5511912345678"
});
console.log('Resultado:', result);
```

---

#### Teste 4: Adicionar Antes/Depois
```javascript
const result = await window.trpc.professionals.updateProfile.mutate({
  beforeAfterPhotos: JSON.stringify({
    before: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800",
    after: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800"
  })
});
console.log('Resultado:', result);

// Verificar
const profile = await window.trpc.professionals.getMyProfile.query();
console.log('Antes/Depois:', JSON.parse(profile.beforeAfterPhotos));
```

---

#### Teste 5: Remover Antes/Depois
```javascript
const result = await window.trpc.professionals.updateProfile.mutate({
  beforeAfterPhotos: null
});
console.log('Resultado:', result);
```

---

## 3. Testes com Ferramentas HTTP

### 📡 **Usando cURL**

#### Pré-requisito: Obter Token de Sessão
```bash
# 1. Faça login no navegador
# 2. Abra DevTools (F12) → Application → Cookies
# 3. Copie o valor do cookie "session"
```

#### Teste com cURL
```bash
# Obter perfil
curl -X GET 'https://seu-dominio.com/api/trpc/professionals.getMyProfile' \
  -H 'Cookie: session=SEU_TOKEN_AQUI' \
  -H 'Content-Type: application/json'

# Atualizar perfil
curl -X POST 'https://seu-dominio.com/api/trpc/professionals.updateProfile' \
  -H 'Cookie: session=SEU_TOKEN_AQUI' \
  -H 'Content-Type: application/json' \
  -d '{
    "displayName": "João Silva - Teste cURL",
    "bio": "Bio atualizada via cURL"
  }'
```

---

### 🔥 **Usando Postman/Insomnia**

**1. Criar Collection "BokaBoka - Edit Profile"**

**2. Request: Get My Profile**
```
Method: GET
URL: https://seu-dominio.com/api/trpc/professionals.getMyProfile
Headers:
  Content-Type: application/json
  Cookie: session=SEU_TOKEN
```

**3. Request: Update Profile**
```
Method: POST
URL: https://seu-dominio.com/api/trpc/professionals.updateProfile
Headers:
  Content-Type: application/json
  Cookie: session=SEU_TOKEN
Body (JSON):
{
  "displayName": "João Silva",
  "bio": "Nova bio",
  "phone": "(11) 98765-4321"
}
```

---

## 4. Testes Automatizados

### 🤖 **Script de Teste Completo**

Crie arquivo `test-edit-profile.js`:

```javascript
// test-edit-profile.js
async function runTests() {
  console.log('🧪 Iniciando testes de edição de perfil...\n');
  
  try {
    // Teste 1: Obter perfil
    console.log('1️⃣ Teste: Obter perfil atual');
    const profile = await window.trpc.professionals.getMyProfile.query();
    console.assert(profile.id, '❌ ID não encontrado');
    console.assert(profile.displayName, '❌ Nome não encontrado');
    console.log('✅ Perfil obtido com sucesso\n');
    
    // Salvar dados originais
    const originalName = profile.displayName;
    const originalBio = profile.bio;
    
    // Teste 2: Atualizar nome
    console.log('2️⃣ Teste: Atualizar nome');
    await window.trpc.professionals.updateProfile.mutate({
      displayName: 'TESTE - ' + Date.now()
    });
    const updated1 = await window.trpc.professionals.getMyProfile.query();
    console.assert(updated1.displayName.includes('TESTE'), '❌ Nome não foi atualizado');
    console.log('✅ Nome atualizado com sucesso\n');
    
    // Teste 3: Atualizar bio
    console.log('3️⃣ Teste: Atualizar bio');
    await window.trpc.professionals.updateProfile.mutate({
      bio: 'Bio de teste - ' + Date.now()
    });
    const updated2 = await window.trpc.professionals.getMyProfile.query();
    console.assert(updated2.bio.includes('Bio de teste'), '❌ Bio não foi atualizada');
    console.log('✅ Bio atualizada com sucesso\n');
    
    // Teste 4: Adicionar antes/depois
    console.log('4️⃣ Teste: Adicionar fotos antes/depois');
    await window.trpc.professionals.updateProfile.mutate({
      beforeAfterPhotos: JSON.stringify({
        before: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
        after: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800'
      })
    });
    const updated3 = await window.trpc.professionals.getMyProfile.query();
    console.assert(updated3.beforeAfterPhotos, '❌ Antes/depois não foi salvo');
    const beforeAfter = JSON.parse(updated3.beforeAfterPhotos);
    console.assert(beforeAfter.before && beforeAfter.after, '❌ URLs inválidas');
    console.log('✅ Antes/depois adicionado com sucesso\n');
    
    // Teste 5: Remover antes/depois
    console.log('5️⃣ Teste: Remover fotos antes/depois');
    await window.trpc.professionals.updateProfile.mutate({
      beforeAfterPhotos: null
    });
    const updated4 = await window.trpc.professionals.getMyProfile.query();
    console.assert(!updated4.beforeAfterPhotos, '❌ Antes/depois não foi removido');
    console.log('✅ Antes/depois removido com sucesso\n');
    
    // Restaurar dados originais
    console.log('6️⃣ Restaurando dados originais...');
    await window.trpc.professionals.updateProfile.mutate({
      displayName: originalName,
      bio: originalBio
    });
    console.log('✅ Dados restaurados\n');
    
    console.log('🎉 TODOS OS TESTES PASSARAM!');
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.error(error);
  }
}

// Executar
runTests();
```

**Como usar:**
1. Abra o site logado como profissional
2. Abra Console (F12)
3. Cole o script completo
4. Pressione Enter
5. Aguarde resultados

---

## 5. Checklist de Validação

### ✅ **Funcionalidade**
- [ ] Botão "Editar" aparece apenas no próprio card
- [ ] Página /edit-profile carrega corretamente
- [ ] Dados atuais são preenchidos no formulário
- [ ] Campos podem ser editados
- [ ] Botão "Salvar" funciona
- [ ] Mensagem de sucesso aparece
- [ ] Redirecionamento para home funciona
- [ ] Mudanças aparecem no card imediatamente

### ✅ **Campos Editáveis**
- [ ] Nome de exibição
- [ ] Bio/descrição
- [ ] Telefone
- [ ] WhatsApp
- [ ] Instagram
- [ ] Foto principal
- [ ] Fotos antes/depois

### ✅ **Validações**
- [ ] Campos vazios são aceitos
- [ ] URLs de imagens inválidas não quebram
- [ ] Campos muito longos são aceitos
- [ ] Caracteres especiais são aceitos
- [ ] Emojis são aceitos

### ✅ **Segurança**
- [ ] Não logado → redireciona para login
- [ ] Cliente logado → não vê botão "Editar"
- [ ] Não consegue editar perfil de outro profissional
- [ ] Token inválido → erro 401

### ✅ **Performance**
- [ ] Carregamento < 2 segundos
- [ ] Salvamento < 1 segundo
- [ ] Sem travamentos
- [ ] Sem memory leaks

### ✅ **UX**
- [ ] Loading states aparecem
- [ ] Erros são mostrados claramente
- [ ] Preview de imagens funciona
- [ ] Botão "Cancelar" funciona
- [ ] Botão "Voltar" funciona

---

## 6. Casos de Teste Críticos

### 🔴 **Teste 1: Segurança - Editar Perfil de Outro**
```javascript
// Tentar editar com ID de outro profissional (deve falhar)
// Este teste deve ser feito no backend com outro UID
// Resultado esperado: Erro 401 ou perfil não muda
```

### 🔴 **Teste 2: Dados Inválidos**
```javascript
// Enviar tipos errados
await window.trpc.professionals.updateProfile.mutate({
  displayName: 12345, // Número em vez de string
  bio: { invalid: 'object' } // Objeto em vez de string
});
// Resultado esperado: Erro de validação
```

### 🔴 **Teste 3: JSON Inválido em beforeAfterPhotos**
```javascript
await window.trpc.professionals.updateProfile.mutate({
  beforeAfterPhotos: 'invalid json'
});
// Resultado esperado: Erro ou campo ignorado
```

### 🔴 **Teste 4: URLs Muito Longas**
```javascript
await window.trpc.professionals.updateProfile.mutate({
  photoUrl: 'https://exemplo.com/' + 'a'.repeat(10000)
});
// Resultado esperado: Aceita ou trunca
```

### 🔴 **Teste 5: Concorrência**
```javascript
// Abrir 2 abas
// Editar perfil nas 2 ao mesmo tempo
// Salvar simultaneamente
// Resultado esperado: Última mudança vence
```

---

## 7. Monitoramento em Produção

### 📊 **Métricas a Acompanhar**

```sql
-- Quantas edições por dia
SELECT DATE(updatedAt), COUNT(*) 
FROM professionals 
WHERE updatedAt > NOW() - INTERVAL 7 DAY
GROUP BY DATE(updatedAt);

-- Campos mais editados (verificar logs)
-- Tempo médio de edição
-- Taxa de erro
```

### 🚨 **Alertas**
- Taxa de erro > 5%
- Tempo de resposta > 3s
- Tentativas de edição não autorizada

---

## 8. Troubleshooting

### ❌ **Problema: Botão "Editar" não aparece**
**Causas possíveis:**
- Não está logado
- Logado como cliente (não profissional)
- Card não é do usuário logado
- `user.openId !== professional.uid`

**Solução:**
```javascript
// Verificar no console
console.log('User:', window.user);
console.log('Professional UID:', professional.uid);
console.log('Match:', window.user?.openId === professional.uid);
```

---

### ❌ **Problema: Dados não salvam**
**Causas possíveis:**
- Erro de rede
- Token expirado
- Validação falhou

**Solução:**
```javascript
// Ver erro completo
try {
  await window.trpc.professionals.updateProfile.mutate({...});
} catch (error) {
  console.error('Erro completo:', error);
}
```

---

### ❌ **Problema: Fotos não aparecem**
**Causas possíveis:**
- URL inválida
- CORS bloqueado
- Imagem muito grande

**Solução:**
- Testar URL no navegador
- Usar URLs de CDN confiável (Unsplash, Imgur)
- Verificar console para erros CORS

---

## 9. Próximos Passos

Após validar todos os testes:

1. ✅ **Documentar bugs encontrados**
2. ✅ **Criar testes automatizados (Jest/Vitest)**
3. ✅ **Adicionar logs de auditoria**
4. ✅ **Implementar rate limiting**
5. ✅ **Adicionar upload direto de imagens (S3)**

---

## 📞 Suporte

Encontrou algum problema?
- 🐛 Reporte em: https://github.com/bokaboka/issues
- 📧 Email: dev@bokaboka.com

---

**Última atualização:** 27 de outubro de 2024

