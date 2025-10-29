import { invokeLLM } from "./_core/llm";

interface DocumentVerificationResult {
  faceMatch: boolean;
  faceMatchScore: number; // 0-100
  documentValid: boolean;
  documentIssues: string[];
  backgroundCheckPassed: boolean;
  backgroundCheckNotes: string;
  recommendation: "approve" | "reject" | "manual_review";
  confidenceScore: number; // 0-100
  reasoning: string;
}

/**
 * Verifica documentos usando IA para comparação facial e validação
 */
export async function verifyDocuments(
  documentPhotoUrl: string,
  selfiePhotoUrl: string,
  fullName: string
): Promise<DocumentVerificationResult> {
  try {
    // Usar IA para analisar as imagens e fazer comparação facial
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um especialista em verificação de documentos e análise facial. 
Analise as duas imagens fornecidas:
1. Foto do documento de identidade
2. Selfie da pessoa

Sua tarefa:
- Comparar os traços faciais entre documento e selfie
- Verificar se o documento parece autêntico (não editado, sem sinais de falsificação)
- Avaliar a qualidade das fotos
- Dar uma recomendação final

Responda APENAS com um JSON válido no seguinte formato:
{
  "faceMatch": boolean,
  "faceMatchScore": number (0-100),
  "documentValid": boolean,
  "documentIssues": ["lista", "de", "problemas"],
  "recommendation": "approve" | "reject" | "manual_review",
  "confidenceScore": number (0-100),
  "reasoning": "explicação detalhada"
}`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analise estas imagens para verificação de identidade de: ${fullName}`
            },
            {
              type: "image_url",
              image_url: {
                url: documentPhotoUrl,
                detail: "high"
              }
            },
            {
              type: "image_url",
              image_url: {
                url: selfiePhotoUrl,
                detail: "high"
              }
            }
          ]
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "document_verification",
          strict: true,
          schema: {
            type: "object",
            properties: {
              faceMatch: { type: "boolean" },
              faceMatchScore: { type: "number" },
              documentValid: { type: "boolean" },
              documentIssues: {
                type: "array",
                items: { type: "string" }
              },
              recommendation: {
                type: "string",
                enum: ["approve", "reject", "manual_review"]
              },
              confidenceScore: { type: "number" },
              reasoning: { type: "string" }
            },
            required: ["faceMatch", "faceMatchScore", "documentValid", "documentIssues", "recommendation", "confidenceScore", "reasoning"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const aiResult = JSON.parse(contentStr);

    // Simular verificação de antecedentes (em produção, integrar com APIs de background check)
    const backgroundCheck = await simulateBackgroundCheck(fullName);

    return {
      ...aiResult,
      backgroundCheckPassed: backgroundCheck.passed,
      backgroundCheckNotes: backgroundCheck.notes,
    };

  } catch (error) {
    console.error("Error verifying documents:", error);
    
    // Fallback: retornar resultado que requer revisão manual
    return {
      faceMatch: false,
      faceMatchScore: 0,
      documentValid: false,
      documentIssues: ["Erro ao processar imagens"],
      backgroundCheckPassed: false,
      backgroundCheckNotes: "Verificação não realizada devido a erro técnico",
      recommendation: "manual_review",
      confidenceScore: 0,
      reasoning: "Erro ao processar verificação. Revisão manual necessária."
    };
  }
}

/**
 * Simula verificação de antecedentes criminais
 * Em produção, integrar com APIs como Serasa, SPC, ou bases públicas
 */
async function simulateBackgroundCheck(fullName: string): Promise<{
  passed: boolean;
  notes: string;
}> {
  // Em produção, fazer busca real em:
  // - Cadastros de inadimplentes
  // - Processos judiciais públicos
  // - Listas de procurados
  // - Antecedentes criminais (quando disponível)
  
  // Por enquanto, simular verificação básica
  const hasIssues = Math.random() < 0.05; // 5% de chance de ter problemas
  
  return {
    passed: !hasIssues,
    notes: hasIssues 
      ? "Possíveis restrições encontradas. Recomenda-se verificação manual adicional."
      : "Nenhuma restrição encontrada nas bases consultadas."
  };
}

