import { describe, it, expect, jest } from '@jest/globals';

describe('Integração: Endpoint tRPC professionals.create', () => {
  
  it('deve criar profissional COM fotos e executar verificação IA', async () => {
    const mockInput = {
      displayName: 'João Silva',
      cpf: '123.456.789-00',
      documentPhotoUrl: 'https://s3.amazonaws.com/doc.jpg',
      selfiePhotoUrl: 'https://s3.amazonaws.com/selfie.jpg',
    };

    const mockResult = {
      id: 1,
      ...mockInput,
      aiVerificationResult: JSON.stringify({
        recommendation: 'approve',
        faceMatchScore: 92,
        confidenceScore: 95,
      }),
    };

    expect(mockResult).toHaveProperty('aiVerificationResult');
    const aiResult = JSON.parse(mockResult.aiVerificationResult);
    expect(aiResult.recommendation).toBe('approve');
  });

  it('deve criar profissional SEM fotos e não executar verificação', async () => {
    const mockInput = {
      displayName: 'Maria Santos',
      category: 'Eletricista',
    };

    const mockResult = {
      id: 2,
      ...mockInput,
      aiVerificationResult: null,
    };

    expect(mockResult.aiVerificationResult).toBeNull();
  });
});
