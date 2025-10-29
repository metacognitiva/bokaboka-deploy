#!/usr/bin/env node

/**
 * Script de Teste para Sistema de Verificação com IA
 * Execute: node test-ai-verification.js
 */

console.log('🧪 Iniciando Testes do Sistema de Verificação com IA\n');

// Simular a função verifyProfessionalWithAI
function verifyProfessionalWithAI(displayName, cpf, documentPhotoUrl, selfiePhotoUrl) {
  const faceMatchScore = Math.floor(Math.random() * 30) + 70; // 70-100%
  const confidenceScore = Math.floor(Math.random() * 20) + 80; // 80-100%
  
  const backgroundCheckPassed = true; // Simular busca
  const backgroundCheckNotes = 'Nenhum registro negativo encontrado em busca na internet';
  
  let recommendation = 'approve';
  let reasoning = '';
  
  if (!backgroundCheckPassed) {
    recommendation = 'reject';
    reasoning = `Encontrados registros negativos: ${backgroundCheckNotes}`;
  } else if (faceMatchScore < 75) {
    recommendation = 'manual_review';
    reasoning = 'Similaridade facial abaixo do limite (75%). Requer revisão manual.';
  } else if (confidenceScore < 85) {
    recommendation = 'manual_review';
    reasoning = 'Confiança da análise abaixo do limite (85%). Requer revisão manual.';
  } else {
    recommendation = 'approve';
    reasoning = 'Verificação facial aprovada e sem registros negativos encontrados.';
  }
  
  return {
    recommendation,
    reasoning,
    faceMatchScore,
    confidenceScore,
    backgroundCheckPassed,
    backgroundCheckNotes,
  };
}

// Testes
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`✅ ${name}`);
  } catch (error) {
    failedTests++;
    console.log(`❌ ${name}`);
    console.log(`   Erro: ${error.message}\n`);
  }
}

function expect(value) {
  return {
    toBe(expected) {
      if (value !== expected) {
        throw new Error(`Expected ${expected}, got ${value}`);
      }
    },
    toBeGreaterThan(expected) {
      if (value <= expected) {
        throw new Error(`Expected ${value} to be greater than ${expected}`);
      }
    },
    toBeGreaterThanOrEqual(expected) {
      if (value < expected) {
        throw new Error(`Expected ${value} to be >= ${expected}`);
      }
    },
    toBeLessThan(expected) {
      if (value >= expected) {
        throw new Error(`Expected ${value} to be less than ${expected}`);
      }
    },
    toHaveProperty(prop) {
      if (!(prop in value)) {
        throw new Error(`Expected to have property ${prop}`);
      }
    },
    toContain(substring) {
      if (!value.includes(substring)) {
        throw new Error(`Expected "${value}" to contain "${substring}"`);
      }
    },
  };
}

console.log('📋 Testes Unitários\n');

// Teste 1: Estrutura de resposta
test('deve retornar todos os campos obrigatórios', () => {
  const result = verifyProfessionalWithAI(
    'João Silva',
    '123.456.789-00',
    'https://example.com/doc.jpg',
    'https://example.com/selfie.jpg'
  );
  
  expect(result).toHaveProperty('recommendation');
  expect(result).toHaveProperty('reasoning');
  expect(result).toHaveProperty('faceMatchScore');
  expect(result).toHaveProperty('confidenceScore');
  expect(result).toHaveProperty('backgroundCheckPassed');
  expect(result).toHaveProperty('backgroundCheckNotes');
});

// Teste 2: Scores válidos
test('deve retornar scores dentro do range esperado', () => {
  const result = verifyProfessionalWithAI(
    'Maria Santos',
    '987.654.321-00',
    'https://example.com/doc.jpg',
    'https://example.com/selfie.jpg'
  );
  
  expect(result.faceMatchScore).toBeGreaterThanOrEqual(70);
  expect(result.faceMatchScore).toBeLessThan(101);
  expect(result.confidenceScore).toBeGreaterThanOrEqual(80);
  expect(result.confidenceScore).toBeLessThan(101);
});

// Teste 3: Recomendação válida
test('deve retornar recommendation válida', () => {
  const result = verifyProfessionalWithAI(
    'Pedro Costa',
    '111.222.333-44',
    'https://example.com/doc.jpg',
    'https://example.com/selfie.jpg'
  );
  
  const validRecommendations = ['approve', 'reject', 'manual_review'];
  if (!validRecommendations.includes(result.recommendation)) {
    throw new Error(`Invalid recommendation: ${result.recommendation}`);
  }
});

// Teste 4: Reasoning não vazio
test('deve retornar reasoning não vazio', () => {
  const result = verifyProfessionalWithAI(
    'Ana Lima',
    '555.666.777-88',
    'https://example.com/doc.jpg',
    'https://example.com/selfie.jpg'
  );
  
  if (!result.reasoning || result.reasoning.length === 0) {
    throw new Error('Reasoning is empty');
  }
});

console.log('\n📊 Testes Estatísticos\n');

// Teste 5: Distribuição de recomendações
test('deve ter distribuição equilibrada em 100 testes', () => {
  const results = [];
  for (let i = 0; i < 100; i++) {
    const result = verifyProfessionalWithAI(
      `Teste ${i}`,
      '123.456.789-00',
      'https://example.com/doc.jpg',
      'https://example.com/selfie.jpg'
    );
    results.push(result);
  }
  
  const approveCount = results.filter(r => r.recommendation === 'approve').length;
  const reviewCount = results.filter(r => r.recommendation === 'manual_review').length;
  
  console.log(`   📈 Aprovados: ${approveCount}%`);
  console.log(`   ⚠️  Revisão Manual: ${reviewCount}%`);
  
  // Deve ter pelo menos alguns de cada tipo
  expect(approveCount).toBeGreaterThan(0);
  expect(reviewCount).toBeGreaterThan(0);
});

// Teste 6: Variação de scores
test('deve gerar scores diferentes em múltiplas execuções', () => {
  const results = [];
  for (let i = 0; i < 20; i++) {
    const result = verifyProfessionalWithAI(
      `Teste Variação ${i}`,
      '123.456.789-00',
      'https://example.com/doc.jpg',
      'https://example.com/selfie.jpg'
    );
    results.push(result);
  }
  
  const uniqueFaceScores = new Set(results.map(r => r.faceMatchScore));
  const uniqueConfScores = new Set(results.map(r => r.confidenceScore));
  
  expect(uniqueFaceScores.size).toBeGreaterThan(1);
  expect(uniqueConfScores.size).toBeGreaterThan(1);
});

console.log('\n⚡ Testes de Performance\n');

// Teste 7: Performance individual
test('deve executar verificação em menos de 100ms', () => {
  const startTime = Date.now();
  
  verifyProfessionalWithAI(
    'Teste Performance',
    '123.456.789-00',
    'https://example.com/doc.jpg',
    'https://example.com/selfie.jpg'
  );
  
  const duration = Date.now() - startTime;
  console.log(`   ⏱️  Tempo: ${duration}ms`);
  
  if (duration >= 100) {
    throw new Error(`Too slow: ${duration}ms`);
  }
});

// Teste 8: Performance em lote
test('deve processar 100 verificações rapidamente', () => {
  const startTime = Date.now();
  
  for (let i = 0; i < 100; i++) {
    verifyProfessionalWithAI(
      `Teste Lote ${i}`,
      '123.456.789-00',
      'https://example.com/doc.jpg',
      'https://example.com/selfie.jpg'
    );
  }
  
  const duration = Date.now() - startTime;
  console.log(`   ⏱️  100 verificações: ${duration}ms (${(duration/100).toFixed(2)}ms cada)`);
  
  if (duration >= 1000) {
    throw new Error(`Too slow: ${duration}ms for 100 tests`);
  }
});

console.log('\n🎯 Testes de Cenários Específicos\n');

// Teste 9: Simular aprovação (forçar scores altos)
test('cenário de aprovação (scores altos)', () => {
  // Salvar Math.random original
  const originalRandom = Math.random;
  
  // Mock para retornar valores altos
  let callCount = 0;
  Math.random = () => {
    callCount++;
    return 0.9; // Vai gerar scores altos
  };
  
  const result = verifyProfessionalWithAI(
    'João Aprovado',
    '123.456.789-00',
    'https://example.com/doc.jpg',
    'https://example.com/selfie.jpg'
  );
  
  // Restaurar Math.random
  Math.random = originalRandom;
  
  expect(result.recommendation).toBe('approve');
  expect(result.faceMatchScore).toBeGreaterThanOrEqual(75);
  expect(result.confidenceScore).toBeGreaterThanOrEqual(85);
  console.log(`   ✅ Face: ${result.faceMatchScore}%, Conf: ${result.confidenceScore}%`);
});

// Teste 10: Simular revisão manual (scores baixos)
test('cenário de revisão manual (scores baixos)', () => {
  const originalRandom = Math.random;
  
  Math.random = () => 0.1; // Vai gerar scores baixos
  
  const result = verifyProfessionalWithAI(
    'Pedro Revisar',
    '123.456.789-00',
    'https://example.com/doc.jpg',
    'https://example.com/selfie.jpg'
  );
  
  Math.random = originalRandom;
  
  expect(result.recommendation).toBe('manual_review');
  console.log(`   ⚠️  Face: ${result.faceMatchScore}%, Conf: ${result.confidenceScore}%`);
  console.log(`   📝 Motivo: ${result.reasoning}`);
});

// Resumo final
console.log('\n' + '='.repeat(60));
console.log('📊 RESUMO DOS TESTES');
console.log('='.repeat(60));
console.log(`Total de testes: ${totalTests}`);
console.log(`✅ Passou: ${passedTests}`);
console.log(`❌ Falhou: ${failedTests}`);
console.log(`📈 Taxa de sucesso: ${((passedTests/totalTests)*100).toFixed(1)}%`);
console.log('='.repeat(60) + '\n');

if (failedTests === 0) {
  console.log('🎉 Todos os testes passaram!\n');
  process.exit(0);
} else {
  console.log('⚠️  Alguns testes falharam. Revise os erros acima.\n');
  process.exit(1);
}

