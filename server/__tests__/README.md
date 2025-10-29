# 🧪 Testes do Sistema de Verificação com IA

Este diretório contém os testes automatizados para o sistema de verificação de profissionais com IA do BokaBoka.

## 📋 Estrutura dos Testes

### `ai-verification.test.ts`
Testes unitários para o módulo de verificação com IA (`ai-verification.ts`).

**Cobertura:**
- ✅ Cenários de Aprovação (scores altos, sem antecedentes)
- ❌ Cenários de Rejeição (antecedentes criminais encontrados)
- ⚠️ Cenários de Revisão Manual (scores baixos)
- 📊 Validação de estrutura de resposta
- 🎲 Variação de scores aleatórios
- 🚨 Tratamento de erros
- 📈 Distribuição estatística
- ⚡ Performance

### `verification-integration.test.ts`
Testes de integração para o endpoint tRPC `professionals.create`.

**Cobertura:**
- Fluxo completo de cadastro com fotos
- Cadastro sem fotos (sem verificação IA)
- Diferentes recomendações da IA
- Validação de dados de entrada
- Geração de UID único
- Serialização/deserialização JSON

## 🚀 Como Executar

### Executar todos os testes
```bash
pnpm test:jest
```

### Executar em modo watch (desenvolvimento)
```bash
pnpm test:watch
```

### Executar com cobertura de código
```bash
pnpm test:coverage
```

### Executar apenas testes de verificação IA
```bash
pnpm test:jest ai-verification
```

### Executar apenas testes de integração
```bash
pnpm test:jest verification-integration
```

## 📊 Resultados Esperados

### Taxa de Aprovação
Com distribuição uniforme de scores:
- **faceMatchScore:** 70-100 (range 30) → P(≥75) = 83.3%
- **confidenceScore:** 80-100 (range 20) → P(≥85) = 75%
- **P(approve)** = 0.833 × 0.75 = **~62.5%**

### Distribuição de Recomendações (100 testes)
- ✅ **Aprovados:** ~62%
- ⚠️ **Revisão Manual:** ~38%
- ❌ **Rejeitados:** ~0% (depende de busca de antecedentes)

### Performance
- ⚡ Verificação única: < 1 segundo
- 🚀 10 verificações em paralelo: < 2 segundos

## 🎯 Cenários de Teste

### 1. Aprovação Automática
```typescript
{
  faceMatchScore: 95,
  confidenceScore: 98,
  backgroundCheckPassed: true,
  recommendation: 'approve'
}
```

### 2. Rejeição por Antecedentes
```typescript
{
  faceMatchScore: 88,
  confidenceScore: 90,
  backgroundCheckPassed: false,
  recommendation: 'reject'
}
```

### 3. Revisão Manual - Baixa Similaridade
```typescript
{
  faceMatchScore: 68,
  confidenceScore: 92,
  backgroundCheckPassed: true,
  recommendation: 'manual_review'
}
```

### 4. Revisão Manual - Baixa Confiança
```typescript
{
  faceMatchScore: 82,
  confidenceScore: 79,
  backgroundCheckPassed: true,
  recommendation: 'manual_review'
}
```

## 🔧 Configuração

### jest.config.js
```javascript
{
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/server'],
  testMatch: ['**/__tests__/**/*.test.ts']
}
```

## 📝 Escrevendo Novos Testes

### Exemplo de teste unitário
```typescript
import { describe, it, expect } from '@jest/globals';
import { verifyProfessionalWithAI } from '../ai-verification';

describe('Meu Novo Teste', () => {
  it('deve fazer algo específico', async () => {
    const result = await verifyProfessionalWithAI(
      'Nome Teste',
      '123.456.789-00',
      'https://example.com/doc.jpg',
      'https://example.com/selfie.jpg'
    );

    expect(result).toHaveProperty('recommendation');
    expect(result.faceMatchScore).toBeGreaterThanOrEqual(70);
  });
});
```

### Mockando Math.random para scores específicos
```typescript
jest.spyOn(Math, 'random')
  .mockReturnValueOnce(0.9)  // faceMatchScore = 97
  .mockReturnValueOnce(0.9); // confidenceScore = 98
```

## 🐛 Debugging

### Ver logs detalhados
```bash
pnpm test:jest --verbose
```

### Executar um teste específico
```bash
pnpm test:jest -t "deve aprovar quando similaridade facial é alta"
```

### Modo debug com Node Inspector
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## 📚 Documentação

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [ts-jest Documentation](https://kulshekhar.github.io/ts-jest/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

## 🎓 Boas Práticas

1. **Testes devem ser independentes** - Não depender da ordem de execução
2. **Use mocks para dependências externas** - APIs, banco de dados, etc
3. **Teste casos extremos** - Valores vazios, nulos, inválidos
4. **Mantenha testes rápidos** - < 1 segundo por teste
5. **Nomes descritivos** - "deve aprovar quando..." ao invés de "test1"
6. **Arrange-Act-Assert** - Organizar setup, execução e validação

## 🔄 CI/CD

Para integrar com CI/CD, adicione ao seu pipeline:

```yaml
# .github/workflows/test.yml
- name: Run Tests
  run: pnpm test:jest --ci --coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

## 📞 Suporte

Para dúvidas sobre os testes, consulte:
- Documentação do projeto: `/docs`
- Issues: GitHub Issues
- Contato: equipe@bokaboka.com

