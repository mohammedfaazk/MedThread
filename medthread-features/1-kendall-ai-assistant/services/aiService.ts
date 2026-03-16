// AI service for conversational health assistance using Google Gemini API

import type { ConversationContext, SymptomAssessment, PatientInfo } from '@/types/health';
import { languageService } from './languageService';
import { emergencyDetector } from './emergencyDetector';
import { symptomEngine } from './symptomEngine';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

interface AIResponse {
    text: string;
    confidence: number;
    suggestedQuestions?: string[];
    detectedSymptoms?: string[];
}

class AIService {
    private conversationHistory: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
    private context: ConversationContext = {
        currentSymptoms: [],
        questionsAsked: [],
        answersReceived: {},
        assessmentStage: 'initial',
        emergencyDetected: false,
    };
    private currentLanguageCode: string = 'en';

    /**
     * Check if AI service is available (online + API key)
     */
    isAvailable(): boolean {
        return navigator.onLine && GEMINI_API_KEY.length > 0;
    }

    /**
     * Send message to AI and get response
     */
    async chat(userMessage: string, patientInfo?: PatientInfo, languageCode?: string): Promise<AIResponse> {
        if (languageCode) {
            this.currentLanguageCode = languageCode;
            languageService.setLanguage(languageCode as any);
        }

        // Check for emergency first
        const emergencyCheck = emergencyDetector.detectEmergency(
            this.context.currentSymptoms,
            userMessage
        );

        if (emergencyCheck.isEmergency) {
            this.context.emergencyDetected = true;
            return {
                text: emergencyCheck.protocol!.warningMessage,
                confidence: 1.0,
                suggestedQuestions: ['Call 108 immediately'],
            };
        }

        // Try AI if available, otherwise use rule-based
        if (this.isAvailable()) {
            try {
                return await this.getAIResponse(userMessage, patientInfo);
            } catch (error) {
                console.error('AI service error, falling back to rule-based:', error);
                return this.getRuleBasedResponse(userMessage, patientInfo);
            }
        } else {
            return this.getRuleBasedResponse(userMessage, patientInfo);
        }
    }

    /**
     * Get AI-powered response from Gemini
     */
    private async getAIResponse(userMessage: string, patientInfo?: PatientInfo): Promise<AIResponse> {
        const systemPrompt = this.buildSystemPrompt(patientInfo);

        // Add user message to history
        this.conversationHistory.push({
            role: 'user',
            parts: [{ text: userMessage }],
        });

        const requestBody = {
            contents: [
                {
                    role: 'user',
                    parts: [{ text: systemPrompt }],
                },
                ...this.conversationHistory,
            ],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            },
            safetySettings: [
                {
                    category: 'HARM_CATEGORY_HARASSMENT',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
                },
                {
                    category: 'HARM_CATEGORY_HATE_SPEECH',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
                },
                {
                    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
                },
                {
                    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
                },
            ],
        };

        console.log('🔄 Making Gemini API request:', {
            url: `${GEMINI_API_URL}?key=${GEMINI_API_KEY.substring(0, 10)}...`,
            bodySize: JSON.stringify(requestBody).length,
            historyLength: this.conversationHistory.length
        });

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        console.log('📡 Gemini API response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Gemini API error response:', errorText);
            throw new Error(`AI API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ Gemini API response data:', data);
        
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, I could not process that. Please try again.';

        // Add AI response to history
        this.conversationHistory.push({
            role: 'model',
            parts: [{ text: aiText }],
        });

        return {
            text: aiText,
            confidence: 0.8,
        };
    }

    /**
     * Build system prompt for AI
     */
    private buildSystemPrompt(patientInfo?: PatientInfo): string {
        const langCode = this.currentLanguageCode;
        const langName = languageService.getLanguageInfo(langCode as any).name;

        return `You are Kendall, a compassionate healthcare assistant for rural India. 

CRITICAL RULES:
1. Respond in ${langName} language (language code: ${langCode})
2. Use simple, rural-friendly language
3. Ask ONE question at a time
4. Never diagnose - only suggest possibilities
5. Always recommend seeing a doctor for serious symptoms
6. Be empathetic and reassuring
7. If symptoms sound emergency, immediately say "This is an emergency. Call 108 now!"

CURRENT CONTEXT:
${patientInfo ? `- Patient: ${patientInfo.age} years old, ${patientInfo.gender}
- Chronic conditions: ${patientInfo.chronicConditions.join(', ') || 'None'}
- Allergies: ${patientInfo.allergies.join(', ') || 'None'}
- Current medications: ${patientInfo.currentMedications.join(', ') || 'None'}
${patientInfo.isPregnant ? '- PREGNANT (be extra cautious with advice)' : ''}` : ''}

CONVERSATION STAGE: ${this.context.assessmentStage}

Your goal is to:
1. Understand the main health concern
2. Ask about severity, duration, and related symptoms
3. Provide preliminary guidance
4. Recommend appropriate action (home care, visit PHC, or emergency)

Be warm, respectful, and never scary. You are like a trusted community health worker.`;
    }

    /**
     * Get rule-based response (offline fallback)
     */
    private getRuleBasedResponse(userMessage: string, patientInfo?: PatientInfo): AIResponse {
        const lowerMessage = userMessage.toLowerCase();
        const lang = this.currentLanguageCode;

        // Initial greeting
        if (this.context.assessmentStage === 'initial') {
            this.context.assessmentStage = 'gathering';
            return {
                text: languageService.translate('main_problem', lang as any),
                confidence: 0.6,
                suggestedQuestions: [
                    languageService.translate('when_started', lang as any),
                    languageService.translate('severity_question', lang as any),
                ],
            };
        }

        // Extract symptoms from message
        const detectedSymptoms = this.extractSymptoms(lowerMessage);

        // Ask follow-up questions
        if (this.context.questionsAsked.length < 3) {
            const nextQuestion = this.getNextQuestion(detectedSymptoms, patientInfo);
            this.context.questionsAsked.push(nextQuestion);

            return {
                text: nextQuestion,
                confidence: 0.7,
                detectedSymptoms,
            };
        }

        // Provide assessment
        this.context.assessmentStage = 'complete';
        const assessment = this.buildAssessment(detectedSymptoms, patientInfo);
        const result = symptomEngine.analyzeSymptoms(assessment);

        let responseText = languageService.translate('see_doctor', lang as any) + '\n\n';

        if (result.possibleConditions.length > 0) {
            responseText += `Possible condition: ${result.possibleConditions[0].diseaseName}\n\n`;
        }

        responseText += result.recommendation.advice.join('\n');

        return {
            text: responseText,
            confidence: 0.6,
        };
    }

    /**
     * Extract symptoms from user message
     */
    private extractSymptoms(message: string): string[] {
        const commonSymptoms = [
            'fever', 'headache', 'cough', 'cold', 'pain', 'ache',
            'vomit', 'diarrhea', 'weakness', 'dizzy', 'nausea',
            'காய்ச்சல்', 'தலைவலி', 'இருமல்', 'வலி',
            'జ్వరం', 'తలనొప్పి', 'దగ్గు',
            'बुखार', 'सिरदर्द', 'खांसी',
        ];

        return commonSymptoms.filter(symptom => message.includes(symptom));
    }

    /**
     * Get next question to ask
     */
    private getNextQuestion(symptoms: string[], patientInfo?: PatientInfo): string {
        const lang = languageService.getLanguage();

        if (!this.context.questionsAsked.includes('when_started')) {
            return languageService.translate('when_started', lang);
        }

        if (!this.context.questionsAsked.includes('severity')) {
            return languageService.translate('severity_question', lang);
        }

        if (symptoms.some(s => s.includes('fever') || s.includes('காய்ச்சல்'))) {
            return languageService.translate('any_pain', lang);
        }

        return languageService.translate('breathing_ok', lang);
    }

    /**
     * Build symptom assessment from conversation
     */
    private buildAssessment(symptoms: string[], patientInfo?: PatientInfo): SymptomAssessment {
        return {
            symptoms: symptoms.map((s, i) => ({
                id: `symptom_${i}`,
                name: s,
                severity: 5,
                duration: 'unknown',
            })),
            patientInfo: patientInfo || {
                age: 30,
                gender: 'other',
                chronicConditions: [],
                allergies: [],
                currentMedications: [],
            },
            timestamp: new Date(),
            mainComplaint: symptoms[0] || 'general discomfort',
        };
    }

    /**
     * Reset conversation
     */
    resetConversation(): void {
        this.conversationHistory = [];
        this.context = {
            currentSymptoms: [],
            questionsAsked: [],
            answersReceived: {},
            assessmentStage: 'initial',
            emergencyDetected: false,
        };
    }

    /**
     * Get conversation context
     */
    getContext(): ConversationContext {
        return this.context;
    }
}

export const aiService = new AIService();
