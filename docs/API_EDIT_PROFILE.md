# 📝 API de Edição de Perfil - BokaBoka

## Visão Geral

A API de edição de perfil permite que profissionais autenticados atualizem suas informações pessoais, fotos e dados de contato diretamente na plataforma BokaBoka.

**Base URL:** `https://seu-dominio.com/api/trpc`  
**Protocolo:** tRPC (Type-safe RPC)  
**Autenticação:** JWT via cookies (sessão OAuth)

---

## Endpoints

### 1. Obter Perfil do Profissional Logado

**Endpoint:** `professionals.getMyProfile`  
**Método:** `query`  
**Autenticação:** ✅ Obrigatória (`protectedProcedure`)

#### Descrição
Retorna todos os dados do perfil do profissional atualmente autenticado.

#### Request

**Parâmetros:** Nenhum (usa sessão do usuário logado)

**Exemplo (TypeScript/React):**
```typescript
const { data: professional, isLoading } = trpc.professionals.getMyProfile.useQuery();
```

#### Response

**Status:** `200 OK`

**Body:**
```json
{
  "id": 123,
  "uid": "TeGPdsMazb3yDdfPNGgnso",
  "displayName": "João Silva",
  "category": "Psicólogo",
  "city": "São Paulo",
  "bio": "Psicólogo clínico com 10 anos de experiência...",
  "phone": "(11) 98765-4321",
  "whatsapp": "5511987654321",
  "instagramHandle": "joaosilva",
  "photoUrl": "https://exemplo.com/foto.jpg",
  "galleryPhotos": "[\"url1\", \"url2\", \"url3\"]",
  "beforeAfterPhotos": "{\"before\":\"url1\",\"after\":\"url2\"}",
  "instagramVideoUrl": "https://instagram.com/reel/abc123",
  "email": "joao@exemplo.com",
  "stars": 45,
  "reviewCount": 12,
  "badge": "verified",
  "planType": "destaque",
  "verificationStatus": "approved",
  "responseTime": 30,
  "latitude": "-23.550520",
  "longitude": "-46.633308",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-10-27T14:20:00Z"
}
```

#### Erros

| Código | Mensagem | Descrição |
|--------|----------|-----------|
| `401` | `Unauthorized` | Usuário não autenticado |
| `404` | `Perfil não encontrado` | Profissional não existe no banco |
| `500` | `Database not available` | Erro de conexão com banco |

---

### 2. Atualizar Perfil do Profissional Logado

**Endpoint:** `professionals.updateProfile`  
**Método:** `mutation`  
**Autenticação:** ✅ Obrigatória (`protectedProcedure`)

#### Descrição
Atualiza as informações do perfil do profissional autenticado. Apenas os campos enviados serão atualizados (partial update).

#### Request

**Parâmetros:**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `displayName` | `string` | ❌ | Nome de exibição do profissional |
| `bio` | `string` | ❌ | Biografia/descrição profissional |
| `phone` | `string` | ❌ | Telefone de contato |
| `whatsapp` | `string` | ❌ | Número do WhatsApp (formato: 5511987654321) |
| `instagramHandle` | `string` | ❌ | Username do Instagram (sem @) |
| `photoUrl` | `string` | ❌ | URL da foto principal |
| `beforeAfterPhotos` | `string \| null` | ❌ | JSON string com fotos antes/depois |

**Validação:**
```typescript
z.object({
  displayName: z.string().optional(),
  bio: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  instagramHandle: z.string().optional(),
  photoUrl: z.string().optional(),
  beforeAfterPhotos: z.string().nullable().optional(),
})
```

**Exemplo (TypeScript/React):**
```typescript
const updateProfile = trpc.professionals.updateProfile.useMutation();

await updateProfile.mutateAsync({
  displayName: "João Silva - Psicólogo Clínico",
  bio: "Especialista em terapia cognitivo-comportamental...",
  phone: "(11) 98765-4321",
  whatsapp: "5511987654321",
  instagramHandle: "joaosilva",
  photoUrl: "https://exemplo.com/nova-foto.jpg",
  beforeAfterPhotos: JSON.stringify({
    before: "https://exemplo.com/antes.jpg",
    after: "https://exemplo.com/depois.jpg"
  })
});
```

**Exemplo (cURL):**
```bash
curl -X POST https://seu-dominio.com/api/trpc/professionals.updateProfile \
  -H "Content-Type: application/json" \
  -H "Cookie: session=seu-token-jwt" \
  -d '{
    "displayName": "João Silva",
    "bio": "Psicólogo clínico...",
    "phone": "(11) 98765-4321",
    "whatsapp": "5511987654321",
    "photoUrl": "https://exemplo.com/foto.jpg"
  }'
```

#### Response

**Status:** `200 OK`

**Body:**
```json
{
  "success": true,
  "message": "Perfil atualizado com sucesso!"
}
```

#### Erros

| Código | Mensagem | Descrição |
|--------|----------|-----------|
| `400` | `Validation error` | Dados inválidos (ex: tipo errado) |
| `401` | `Unauthorized` | Usuário não autenticado |
| `500` | `Database not available` | Erro de conexão com banco |

---

## Formato de Dados Especiais

### beforeAfterPhotos

Campo JSON string contendo URLs das fotos "antes" e "depois":

**Formato:**
```json
{
  "before": "https://exemplo.com/antes.jpg",
  "after": "https://exemplo.com/depois.jpg"
}
```

**Como enviar:**
```typescript
beforeAfterPhotos: JSON.stringify({
  before: "url-antes",
  after: "url-depois"
})
```

**Como remover:**
```typescript
beforeAfterPhotos: null
```

---

## Segurança

### Autenticação
- ✅ Todos os endpoints requerem autenticação via JWT
- ✅ Token armazenado em cookie HTTP-only
- ✅ Sessão validada automaticamente pelo middleware

### Autorização
- ✅ Profissional só pode editar **próprio perfil**
- ✅ Identificação por `ctx.user.openId` (OAuth)
- ✅ Não é possível editar perfil de outro usuário

### Validação
- ✅ Validação de tipos com Zod
- ✅ Campos undefined são ignorados (não sobrescrevem)
- ✅ Campos null são aceitos para remoção de dados

---

## Fluxo de Uso

### 1. Obter Dados Atuais
```typescript
const { data: professional } = trpc.professionals.getMyProfile.useQuery();
```

### 2. Preencher Formulário
```typescript
const [formData, setFormData] = useState({
  displayName: professional?.displayName || '',
  bio: professional?.bio || '',
  phone: professional?.phone || '',
  // ... outros campos
});
```

### 3. Atualizar Perfil
```typescript
const updateProfile = trpc.professionals.updateProfile.useMutation();

const handleSave = async () => {
  try {
    await updateProfile.mutateAsync(formData);
    toast.success('Perfil atualizado!');
  } catch (error) {
    toast.error('Erro ao atualizar');
  }
};
```

---

## Exemplos Práticos

### Atualizar apenas nome
```typescript
await updateProfile.mutateAsync({
  displayName: "Novo Nome"
});
```

### Atualizar bio e telefone
```typescript
await updateProfile.mutateAsync({
  bio: "Nova descrição profissional...",
  phone: "(11) 91234-5678"
});
```

### Adicionar fotos antes/depois
```typescript
await updateProfile.mutateAsync({
  beforeAfterPhotos: JSON.stringify({
    before: "https://imgur.com/antes.jpg",
    after: "https://imgur.com/depois.jpg"
  })
});
```

### Remover fotos antes/depois
```typescript
await updateProfile.mutateAsync({
  beforeAfterPhotos: null
});
```

---

## Limitações e Restrições

### Campos NÃO Editáveis
Os seguintes campos **não podem** ser alterados via esta API:
- `id` - ID do profissional
- `uid` - OAuth Open ID
- `category` - Categoria profissional
- `city` - Cidade
- `email` - Email (gerenciado pelo OAuth)
- `stars` - Avaliação (calculada automaticamente)
- `reviewCount` - Número de avaliações
- `badge` - Badge de verificação (apenas admin)
- `planType` - Tipo de plano (via pagamento)
- `verificationStatus` - Status de verificação (apenas admin)
- `latitude` / `longitude` - Coordenadas (via geocoding)
- `createdAt` / `updatedAt` - Timestamps automáticos

### Campos Editáveis por Admin
Alguns campos só podem ser editados por administradores via endpoints específicos:
- `badge` - Via `professionals.approve`
- `verificationStatus` - Via `professionals.approve` / `professionals.reject`
- `planType` - Via sistema de pagamentos

---

## Troubleshooting

### Erro: "Perfil não encontrado"
**Causa:** Profissional não existe no banco ou `uid` não corresponde  
**Solução:** Verificar se usuário completou cadastro profissional

### Erro: "Unauthorized"
**Causa:** Token JWT inválido ou expirado  
**Solução:** Fazer login novamente

### Erro: "Validation error"
**Causa:** Tipo de dado incorreto (ex: número em campo string)  
**Solução:** Verificar tipos dos campos enviados

### beforeAfterPhotos não aparece no card
**Causa:** JSON inválido ou URLs quebradas  
**Solução:** Validar JSON e testar URLs das imagens

---

## Changelog

### v1.0.0 (2024-10-27)
- ✅ Endpoint `getMyProfile` criado
- ✅ Endpoint `updateProfile` criado
- ✅ Validação com Zod implementada
- ✅ Segurança por `protectedProcedure`
- ✅ Suporte a fotos antes/depois
- ✅ Partial updates (apenas campos enviados)

---

## Suporte

Para dúvidas ou problemas:
- 📧 Email: suporte@bokaboka.com
- 🐛 Issues: https://github.com/bokaboka/issues
- 📚 Documentação completa: https://docs.bokaboka.com

---

**Última atualização:** 27 de outubro de 2024

