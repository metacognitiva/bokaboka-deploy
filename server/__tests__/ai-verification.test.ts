import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { verifyProfessionalWithAI } from '../ai-verification';

describe('Sistema de Verificação com IA', () => {
  
  beforeEach(() => {
    // Resetar mocks antes de cada teste
    jest.clearAllMocks();
  });

  describe('Cenários de Aprovação', () => {
    
    it('deve aprovar quando similaridade facial é alta (>75%) e sem antecedentes', async () => {
      // Mock para forçar score alto
      jest.spyOn(Math, 'random')
        .mockReturnValueOnce(0.9)  // faceMatchScore = 97
        .mockReturnValueOnce(0.9); // confidenceScore = 98

      const result = await verifyProfessionalWithAI(
        'João Silva',
        '123.456.789-00',
        'https://example.com/document.jpg',
        'https://example.com/selfie.jpg'
      );

      expect(result.recommendation).toBe('approve');
      expect(result.faceMatchScore).toBeGreaterThanOrEqual(75);
      expect(result.confidenceScore).toBeGreaterThanOrEqual(85);
      expect(result.backgroundCheckPassed).toBe(true);
      expect(result.reasoning).toContain('aprovada');
    });

    it('deve aprovar com scores no limite mínimo (75% e 85%)', async () => {
      jest.spyOn(Math, 'random')
        .mockReturnValueOnce(0.17)  // faceMatchScore = 75
        .mockReturnValueOnce(0.25); // confidenceScore = 85

      const result = await verifyProfessionalWithAI(
        'Maria Santos',
        '987.654.321-00',
        'https://example.com/document.jpg',
        'https://example.com/selfie.jpg'
      );

      expect(result.recommendation).toBe('approve');
      expect(result.faceMatchScore).toBe(75);
      expect(result.confidenceScore).toBe(85);
    });

  });

  describe('Cenários de Revisão Manual', () => {
    
    it('deve solicitar revisão manual quando similaridade facial é baixa (<75%)', async () => {
      jest.spyOn(Math, 'random')
        .mockReturnValueOnce(0.1)   // faceMatchScore = 73
        .mockReturnValueOnce(0.9);  // confidenceScore = 98

      const result = await verifyProfessionalWithAI(
        'Pedro Costa',
        '111.222.333-44',
        'https://example.com/document.jpg',
        'https://example.com/selfie.jpg'
      );

      expect(result.recommendation).toBe('manual_review');
      expect(result.faceMatchScore).toBeLessThan(75);
      expect(result.reasoning).toContain('Similaridade facial abaixo do limite');
    });

    it('deve solicitar revisão manual quando confiança é baixa (<85%)', async () => {
      jest.spyOn(Math, 'random')
        .mockReturnValueOnce(0.9)   // faceMatchScore = 97
        .mockReturnValueOnce(0.1);  // confidenceScore = 82

      const result = await verifyProfessionalWithAI(
        'Ana Lima',
        '555.666.777-88',
        'https://example.com/document.jpg',
        'https://example.com/selfie.jpg'
      );

      expect(result.recommendation).toBe('manual_review');
      expect(result.confidenceScore).toBeLessThan(85);
      expect(result.reasoning).toContain('Confiança da análise abaixo do limite');
    });

    it('deve solicitar revisão manual quando ambos os scores são baixos', async () => {
      jest.spyOn(Math, 'random')
        .mockReturnValueOnce(0.05)  // faceMatchScore = 71
        .mockReturnValueOnce(0.05); // confidenceScore = 81

      const result = await verifyProfessionalWithAI(
        'Carlos Oliveira',
        '999.888.777-66',
        'https://example.com/document.jpg',
        'https://example.com/selfie.jpg'
      );

      expect(result.recommendation).toBe('manual_review');
      expect(result.faceMatchScore).toBeLessThan(75);
      expect(result.confidenceScore).toBeLessThan(85);
    });

  });

  describe('Validação de Estrutura de Resposta', () => {
    
    it('deve retornar todos os campos obrigatórios', async () => {
      const result = await verifyProfessionalWithAI(
        'Teste Completo',
        '123.456.789-00',
        'https://example.com/document.jpg',
        'https://example.com/selfie.jpg'
      );

      expect(result).toHaveProperty('recommendation');
      expect(result).toHaveProperty('reasoning');
      expect(result).toHaveProperty('faceMatchScore');
      expect(result).toHaveProperty('confidenceScore');
      expect(result).toHaveProperty('backgroundCheckPassed');
      expect(result).toHaveProperty('backgroundCheckNotes');
    });

    it('deve retornar recommendation válida (approve, reject ou manual_review)', async () => {
      const result = await verifyProfessionalWithAI(
        'Teste Validação',
        '123.456.789-00',
        'https://example.com/document.jpg',
        'https://example.com/selfie.jpg'
      );

      expect(['approve', 'reject', 'manual_review']).toContain(result.recommendation);
    });

    it('deve retornar scores numéricos válidos (0-100)', async () => {
      const result = await verifyProfessionalWithAI(
        'Teste Scores',
        '123.456.789-00',
        'https://example.com/document.jpg',
        'https://example.com/selfie.jpg'
      );

      expect(result.faceMatchScore).toBeGreaterThanOrEqual(0);
      expect(result.faceMatchScore).toBeLessThanOrEqual(100);
      expect(result.confidenceScore).toBeGreaterThanOrEqual(0);
      expect(result.confidenceScore).toBeLessThanOrEqual(100);
    });

    it('deve retornar backgroundCheckPassed como boolean', async () => {
      const result = await verifyProfessionalWithAI(
        'Teste Background',
        '123.456.789-00',
        'https://example.com/document.jpg',
        'https://example.com/selfie.jpg'
      );

      expect(typeof result.backgroundCheckPassed).toBe('boolean');
    });

  });

  describe('Variação de Scores', () => {
    
    it('deve gerar scores diferentes em múltiplas execuções', async () => {
      const results = [];
      
      for (let i = 0; i < 10; i++) {
        const result = await verifyProfessionalWithAI(
          `Teste ${i}`,
          '123.456.789-00',
          'https://example.com/document.jpg',
          'https://example.com/selfie.jpg'
        );
        results.push(result);
      }

      // Verificar que há variação nos scores
      const uniqueFaceScores = new Set(results.map(r => r.faceMatchScore));
      const uniqueConfScores = new Set(results.map(r => r.confidenceScore));

      expect(uniqueFaceScores.size).toBeGreaterThan(1);
      expect(uniqueConfScores.size).toBeGreaterThan(1);
    });

    it('deve manter scores dentro do range esperado (70-100 e 80-100)', async () => {
      const results = [];
      
      for (let i = 0; i < 20; i++) {
        const result = await verifyProfessionalWithAI(
          `Teste Range ${i}`,
          '123.456.789-00',
          'https://example.com/document.jpg',
          'https://example.com/selfie.jpg'
        );
        results.push(result);
      }

      results.forEach(result => {
        expect(result.faceMatchScore).toBeGreaterThanOrEqual(70);
        expect(result.faceMatchScore).toBeLessThanOrEqual(100);
        expect(result.confidenceScore).toBeGreaterThanOrEqual(80);
        expect(result.confidenceScore).toBeLessThanOrEqual(100);
      });
    });

  });

  describe('Tratamento de Erros', () => {
    
    it('deve retornar manual_review em caso de erro', async () => {
      // Forçar erro no Math.random
      jest.spyOn(Math, 'random').mockImplementation(() => {
        throw new Error('Erro simulado');
      });

      const result = await verifyProfessionalWithAI(
        'Teste Erro',
        '123.456.789-00',
        'https://example.com/document.jpg',
        'https://example.com/selfie.jpg'
      );

      expect(result.recommendation).toBe('manual_review');
      expect(result.reasoning).toContain('Erro durante a verificação');
      expect(result.faceMatchScore).toBe(0);
      expect(result.confidenceScore).toBe(0);
    });

  });

  describe('Distribuição Estatística', () => {
    
    it('deve ter distribuição equilibrada de recomendações', async () => {
      const results = [];
      
      for (let i = 0; i < 100; i++) {
        const result = await verifyProfessionalWithAI(
          `Teste Distribuição ${i}`,
          '123.456.789-00',
          'https://example.com/document.jpg',
          'https://example.com/selfie.jpg'
        );
        results.push(result);
      }

      const approveCount = results.filter(r => r.recommendation === 'approve').length;
      const reviewCount = results.filter(r => r.recommendation === 'manual_review').length;

      // Com scores aleatórios entre 70-100 e 80-100:
      // - Approve: faceScore >= 75 E confScore >= 85
      // - Manual Review: faceScore < 75 OU confScore < 85
      
      console.log(`\n📊 Distribuição de 100 testes:`);
      console.log(`   ✅ Aprovados: ${approveCount}%`);
      console.log(`   ⚠️  Revisão Manual: ${reviewCount}%`);

      // Deve ter pelo menos alguns de cada tipo
      expect(approveCount).toBeGreaterThan(0);
      expect(reviewCount).toBeGreaterThan(0);
    });

    it('deve calcular taxa de aprovação esperada', async () => {
      const results = [];
      
      for (let i = 0; i < 1000; i++) {
        const result = await verifyProfessionalWithAI(
          `Teste Taxa ${i}`,
          '123.456.789-00',
          'https://example.com/document.jpg',
          'https://example.com/selfie.jpg'
        );
        results.push(result);
      }

      const approveRate = results.filter(r => r.recommendation === 'approve').length / 1000;
      
      console.log(`\n📈 Taxa de aprovação em 1000 testes: ${(approveRate * 100).toFixed(1)}%`);
      
      // Com distribuição uniforme:
      // faceScore: 70-100 (range 30) -> P(>=75) = 25/30 = 83.3%
      // confScore: 80-100 (range 20) -> P(>=85) = 15/20 = 75%
      // P(approve) = 0.833 * 0.75 = 62.5%
      
      // Permitir margem de erro de ±5%
      expect(approveRate).toBeGreaterThan(0.55);
      expect(approveRate).toBeLessThan(0.70);
    });

  });

  describe('Casos Extremos', () => {
    
    it('deve lidar com nome vazio', async () => {
      const result = await verifyProfessionalWithAI(
        '',
        '123.456.789-00',
        'https://example.com/document.jpg',
        'https://example.com/selfie.jpg'
      );

      expect(result).toHaveProperty('recommendation');
      expect(result.backgroundCheckNotes).toBeTruthy();
    });

    it('deve lidar com CPF inválido', async () => {
      const result = await verifyProfessionalWithAI(
        'João Silva',
        'INVALIDO',
        'https://example.com/document.jpg',
        'https://example.com/selfie.jpg'
      );

      expect(result).toHaveProperty('recommendation');
    });

    it('deve lidar com URLs vazias', async () => {
      const result = await verifyProfessionalWithAI(
        'João Silva',
        '123.456.789-00',
        '',
        ''
      );

      expect(result).toHaveProperty('recommendation');
    });

  });

  describe('Performance', () => {
    
    it('deve executar verificação em menos de 1 segundo', async () => {
      const startTime = Date.now();
      
      await verifyProfessionalWithAI(
        'Teste Performance',
        '123.456.789-00',
        'https://example.com/document.jpg',
        'https://example.com/selfie.jpg'
      );
      
      const duration = Date.now() - startTime;
      
      console.log(`\n⚡ Tempo de execução: ${duration}ms`);
      expect(duration).toBeLessThan(1000);
    });

    it('deve processar múltiplas verificações em paralelo', async () => {
      const startTime = Date.now();
      
      const promises = Array.from({ length: 10 }, (_, i) =>
        verifyProfessionalWithAI(
          `Teste Paralelo ${i}`,
          '123.456.789-00',
          'https://example.com/document.jpg',
          'https://example.com/selfie.jpg'
        )
      );
      
      const results = await Promise.all(promises);
      
      const duration = Date.now() - startTime;
      
      console.log(`\n🚀 10 verificações em paralelo: ${duration}ms`);
      expect(results).toHaveLength(10);
      expect(duration).toBeLessThan(2000);
    });

  });

});

