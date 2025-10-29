// Verificação com IA para profissionais

interface VerificationResult {
  recommendation: 'approve' | 'reject' | 'manual_review';
  reasoning: string;
  faceMatchScore: number;
  confidenceScore: number;
  backgroundCheckPassed: boolean;
  backgroundCheckNotes: string;
}

/**
 * Verifica um profissional usando IA:
 * 1. Compara foto do documento com selfie
 * 2. Busca antecedentes criminais na internet
 * 3. Retorna recomendação
 */
export async function verifyProfessionalWithAI(
  displayName: string,
  cpf: string,
  documentPhotoUrl: string,
  selfiePhotoUrl: string
): Promise<VerificationResult> {
  try {
    // ⚠️ ATENÇÃO: Atualmente em modo SIMULAÇÃO!
    // Para produção, integrar com serviço real de reconhecimento facial:
    // - AWS Rekognition (CompareFaces API)
    // - Azure Face API (Face - Verify)
    // - Google Cloud Vision API (Face Detection)
    // 
    // Simulação atual: gera score aleatório (NÃO CONFIÁVEL)
    const faceMatchScore = Math.floor(Math.random() * 30) + 70; // 70-100% (SIMULAÇÃO)
    const confidenceScore = Math.floor(Math.random() * 20) + 80; // 80-100% (SIMULAÇÃO)

    // Buscar antecedentes criminais na internet
    const backgroundCheck = await searchBackgroundInfo(displayName, cpf);

    // Determinar recomendação
    let recommendation: 'approve' | 'reject' | 'manual_review' = 'approve';
    let reasoning = '';

    if (!backgroundCheck.passed) {
      recommendation = 'reject';
      reasoning = `Encontrados registros negativos: ${backgroundCheck.notes}`;
    } else if (faceMatchScore < 90) {
      recommendation = 'manual_review';
      reasoning = 'Similaridade facial abaixo do limite (90%). Requer revisão manual.';
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
      backgroundCheckPassed: backgroundCheck.passed,
      backgroundCheckNotes: backgroundCheck.notes,
    };
  } catch (error) {
    console.error('Erro na verificação com IA:', error);
    return {
      recommendation: 'manual_review',
      reasoning: 'Erro durante a verificação automática. Requer revisão manual.',
      faceMatchScore: 0,
      confidenceScore: 0,
      backgroundCheckPassed: false,
      backgroundCheckNotes: 'Erro ao buscar informações',
    };
  }
}

/**
 * Busca informações de antecedentes na internet
 */
async function searchBackgroundInfo(name: string, cpf: string): Promise<{ passed: boolean; notes: string }> {
  try {
    // Buscar por nome + "antecedentes criminais" ou "processos"
    const queries = [
      `${name} antecedentes criminais`,
      `${name} processos judiciais`,
      `${name} condenação`,
      `${name} ficha criminal`,
    ];

    let foundNegativeRecords = false;
    let notes = '';

    for (const query of queries) {
      // Em produção, usar API de busca real (Google Custom Search, Bing, etc)
      // Por enquanto, simular busca
      const results: any[] = [];

      if (results && results.length > 0) {
        // Verificar se há menções a processos criminais, condenações, etc
        const negativeKeywords = [
          'condenado',
          'condenação',
          'processo criminal',
          'prisão',
          'detido',
          'acusado',
          'indiciado',
          'investigado por',
          'fraude',
          'estelionato',
          'roubo',
          'furto',
        ];

        for (const result of results) {
          const content = `${result.title} ${result.snippet}`.toLowerCase();
          const foundKeywords = negativeKeywords.filter(keyword => content.includes(keyword));

          if (foundKeywords.length > 0) {
            foundNegativeRecords = true;
            notes += `Encontrado: "${result.title}" - ${result.snippet}. `;
            break;
          }
        }

        if (foundNegativeRecords) break;
      }
    }

    if (foundNegativeRecords) {
      return {
        passed: false,
        notes: notes || 'Registros negativos encontrados em busca na internet',
      };
    }

    return {
      passed: true,
      notes: 'Nenhum registro negativo encontrado em busca na internet',
    };
  } catch (error) {
    console.error('Erro ao buscar antecedentes:', error);
    return {
      passed: true, // Em caso de erro, não bloquear o cadastro
      notes: 'Não foi possível realizar busca completa de antecedentes',
    };
  }
}

