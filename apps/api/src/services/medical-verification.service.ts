import { prisma } from '@medthread/database';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY,
  baseURL: process.env.GROQ_API_KEY ? 'https://api.groq.com/openai/v1' : undefined,
});

interface MedicalVerificationResult {
  isAccurate: boolean;
  confidenceScore: number;
  concerns: string[];
  recommendations: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiresReview: boolean;
}

export class MedicalVerificationService {
  /**
   * Verify medical content accuracy using AI
   */
  async verifyMedicalContent(content: string, authorRole: string): Promise<MedicalVerificationResult> {
    try {
      const prompt = `
You are a medical content verification AI. Analyze the following medical content for accuracy, safety, and appropriateness.

Content: "${content}"
Author Role: ${authorRole}

Evaluate:
1. Medical accuracy (0-100)
2. Safety concerns
3. Misinformation risks
4. Emergency indicators
5. Appropriateness for public health forum

Respond in JSON format:
{
  "isAccurate": boolean,
  "confidenceScore": number (0-100),
  "concerns": ["concern1", "concern2"],
  "recommendations": ["rec1", "rec2"],
  "riskLevel": "LOW|MEDIUM|HIGH|CRITICAL",
  "requiresReview": boolean,
  "reasoning": "explanation"
}
`;

      const response = await openai.chat.completions.create({
        model: process.env.GROQ_API_KEY ? 'mixtral-8x7b-32768' : 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 1000,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      // Store verification result
      await this.storeVerificationResult(content, result);
      
      return result;
    } catch (error) {
      console.error('Medical verification failed:', error);
      return {
        isAccurate: false,
        confidenceScore: 0,
        concerns: ['Unable to verify content'],
        recommendations: ['Manual review required'],
        riskLevel: 'MEDIUM',
        requiresReview: true,
      };
    }
  }

  /**
   * Check for drug interactions and contraindications
   */
  async checkDrugInteractions(medications: string[]): Promise<{
    interactions: Array<{
      drug1: string;
      drug2: string;
      severity: 'MINOR' | 'MODERATE' | 'MAJOR';
      description: string;
    }>;
    contraindications: string[];
  }> {
    try {
      const prompt = `
Analyze these medications for interactions and contraindications:
${medications.join(', ')}

Check for:
1. Drug-drug interactions
2. Common contraindications
3. Severity levels

Respond in JSON format:
{
  "interactions": [
    {
      "drug1": "medication1",
      "drug2": "medication2", 
      "severity": "MINOR|MODERATE|MAJOR",
      "description": "interaction description"
    }
  ],
  "contraindications": ["condition1", "condition2"]
}
`;

      const response = await openai.chat.completions.create({
        model: process.env.GROQ_API_KEY ? 'mixtral-8x7b-32768' : 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
      });

      return JSON.parse(response.choices[0].message.content || '{"interactions":[],"contraindications":[]}');
    } catch (error) {
      console.error('Drug interaction check failed:', error);
      return { interactions: [], contraindications: [] };
    }
  }

  /**
   * Detect emergency situations in content
   */
  async detectEmergency(content: string): Promise<{
    isEmergency: boolean;
    urgencyLevel: number;
    emergencyType: string;
    recommendedAction: string;
  }> {
    const emergencyKeywords = [
      'chest pain', 'heart attack', 'stroke', 'seizure', 'unconscious',
      'severe bleeding', 'difficulty breathing', 'choking', 'overdose',
      'suicide', 'self harm', 'severe pain', 'can\'t breathe'
    ];

    const hasEmergencyKeywords = emergencyKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );

    if (hasEmergencyKeywords) {
      try {
        const prompt = `
Analyze this medical content for emergency indicators:
"${content}"

Determine:
1. Is this a medical emergency? (true/false)
2. Urgency level (1-10)
3. Type of emergency
4. Recommended immediate action

Respond in JSON format:
{
  "isEmergency": boolean,
  "urgencyLevel": number,
  "emergencyType": "string",
  "recommendedAction": "string"
}
`;

        const response = await openai.chat.completions.create({
          model: process.env.GROQ_API_KEY ? 'mixtral-8x7b-32768' : 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
        });

        return JSON.parse(response.choices[0].message.content || '{}');
      } catch (error) {
        console.error('Emergency detection failed:', error);
      }
    }

    return {
      isEmergency: false,
      urgencyLevel: 1,
      emergencyType: 'none',
      recommendedAction: 'none'
    };
  }

  /**
   * Store verification result in database
   */
  private async storeVerificationResult(content: string, result: any) {
    try {
      await prisma.medicalVerification.create({
        data: {
          content: content.substring(0, 1000), // Limit content length
          isAccurate: result.isAccurate,
          confidenceScore: result.confidenceScore,
          concerns: result.concerns,
          recommendations: result.recommendations,
          riskLevel: result.riskLevel,
          requiresReview: result.requiresReview,
          verifiedAt: new Date(),
        }
      });
    } catch (error) {
      console.error('Failed to store verification result:', error);
    }
  }

  /**
   * Get medical accuracy score for content
   */
  async getMedicalAccuracyScore(postId: string): Promise<number> {
    try {
      const verification = await prisma.medicalVerification.findFirst({
        where: { postId },
        orderBy: { verifiedAt: 'desc' }
      });

      return verification?.confidenceScore || 0;
    } catch (error) {
      console.error('Failed to get accuracy score:', error);
      return 0;
    }
  }
}

export const medicalVerificationService = new MedicalVerificationService();