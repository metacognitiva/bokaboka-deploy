import { invokeLLM } from "./_core/llm";

interface VerificationResult {
  isValid: boolean;
  confidence: number; // 0-100
  notes: string;
  issues: string[];
}

/**
 * Verifica documentos usando IA (GPT-4 Vision)
 * Analisa se o documento é real e se a selfie corresponde ao documento
 */
export async function verifyDocumentWithAI(
  documentImageUrl: string,
  selfieImageUrl: string
): Promise<VerificationResult> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um especialista em verificação de documentos e identidade. 
Analise as imagens fornecidas e determine:
1. Se o documento (RG ou CNH) parece autêntico
2. Se a foto da selfie corresponde à foto do documento
3. Se há sinais de falsificação ou manipulação
4. Qualidade geral das imagens

Responda APENAS em JSON com o seguinte formato:
{
  "isValid": boolean,
  "confidence": number (0-100),
  "notes": "explicação detalhada",
  "issues": ["lista", "de", "problemas", "encontrados"]
}`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analise este documento e selfie para verificação de identidade:"
            },
            {
              type: "image_url",
              image_url: {
                url: documentImageUrl,
                detail: "high"
              }
            },
            {
              type: "image_url",
              image_url: {
                url: selfieImageUrl,
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
              isValid: {
                type: "boolean",
                description: "Se o documento e selfie passaram na verificação"
              },
              confidence: {
                type: "number",
                description: "Nível de confiança da análise (0-100)"
              },
              notes: {
                type: "string",
                description: "Explicação detalhada da análise"
              },
              issues: {
                type: "array",
                items: {
                  type: "string"
                },
                description: "Lista de problemas encontrados"
              }
            },
            required: ["isValid", "confidence", "notes", "issues"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0].message.content;
    if (!content || typeof content !== 'string') {
      throw new Error("No response from AI");
    }

    const result: VerificationResult = JSON.parse(content);
    return result;
  } catch (error) {
    console.error("AI verification failed:", error);
    // Return conservative result on error
    return {
      isValid: false,
      confidence: 0,
      notes: "Erro na verificação automática. Revisão manual necessária.",
      issues: ["Falha no processamento da IA"]
    };
  }
}

/**
 * Determina o status de verificação baseado no resultado da IA
 */
export function getVerificationStatus(result: VerificationResult): "approved" | "rejected" | "pending" {
  if (result.confidence >= 80 && result.isValid) {
    return "approved";
  } else if (result.confidence < 50 || !result.isValid) {
    return "rejected";
  } else {
    return "pending"; // Needs manual review
  }
}

