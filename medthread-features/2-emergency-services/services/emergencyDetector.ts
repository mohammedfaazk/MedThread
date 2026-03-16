// Emergency detection system for critical health conditions

import { EMERGENCY_KEYWORDS } from '@/config/constants';
import { languageService, type LanguageCode } from './languageService';
import type { EmergencyProtocol, Symptom } from '@/types/health';

const emergencyProtocols: Record<string, EmergencyProtocol> = {
    CHEST_PAIN: {
        condition: 'Chest Pain / Possible Heart Attack',
        immediateActions: [
            'Sit down and rest immediately',
            'Loosen tight clothing',
            'If you have aspirin, chew one tablet (unless allergic)',
            'Stay calm and breathe slowly',
        ],
        callAmbulance: true,
        warningMessage: 'This could be a heart attack. Call 108 immediately!',
    },
    BREATHING_DIFFICULTY: {
        condition: 'Severe Breathing Difficulty',
        immediateActions: [
            'Sit upright in a comfortable position',
            'Loosen tight clothing around neck and chest',
            'Open windows for fresh air',
            'Try to stay calm and breathe slowly',
            'If you have an inhaler, use it',
        ],
        callAmbulance: true,
        warningMessage: 'Severe breathing difficulty requires immediate medical attention!',
    },
    HIGH_FEVER: {
        condition: 'Very High Fever (Above 103°F / 39.5°C)',
        immediateActions: [
            'Remove excess clothing',
            'Apply cool, damp cloth to forehead',
            'Drink plenty of water',
            'Take paracetamol if available',
            'Monitor temperature every 30 minutes',
        ],
        callAmbulance: true,
        warningMessage: 'Very high fever can be dangerous. Seek medical help immediately!',
    },
    UNCONSCIOUS: {
        condition: 'Unconsciousness',
        immediateActions: [
            'Check if person is breathing',
            'Place in recovery position (on side)',
            'Do NOT give anything by mouth',
            'Keep airway clear',
            'Monitor breathing continuously',
        ],
        callAmbulance: true,
        warningMessage: 'Person is unconscious. Call 108 immediately!',
    },
    SEVERE_BLEEDING: {
        condition: 'Severe Bleeding',
        immediateActions: [
            'Apply direct pressure with clean cloth',
            'Elevate the injured area above heart level',
            'Do NOT remove cloth if soaked - add more on top',
            'Keep person lying down',
            'Keep them warm',
        ],
        callAmbulance: true,
        warningMessage: 'Severe bleeding is life-threatening. Call 108 now!',
    },
    STROKE: {
        condition: 'Possible Stroke',
        immediateActions: [
            'Note the time symptoms started',
            'Keep person lying down with head slightly elevated',
            'Do NOT give food or water',
            'Loosen tight clothing',
            'Stay with the person',
        ],
        callAmbulance: true,
        warningMessage: 'FAST: Face drooping, Arm weakness, Speech difficulty - Time to call 108!',
    },
    PREGNANCY_EMERGENCY: {
        condition: 'Pregnancy Emergency',
        immediateActions: [
            'Keep the pregnant woman lying on her left side',
            'Keep her calm and comfortable',
            'Do NOT give anything by mouth',
            'Note any bleeding or fluid discharge',
            'Monitor contractions if in labor',
        ],
        callAmbulance: true,
        warningMessage: 'Pregnancy complications need immediate medical care. Call 108!',
    },
    POISONING: {
        condition: 'Poisoning / Toxic Ingestion',
        immediateActions: [
            'Identify what was consumed if possible',
            'Do NOT induce vomiting',
            'Keep the person sitting or lying on their side',
            'Save container/packaging of substance',
            'Keep person awake if possible',
        ],
        callAmbulance: true,
        warningMessage: 'Poisoning is a medical emergency. Call 108 immediately!',
    },
    SNAKE_BITE: {
        condition: 'Snake Bite',
        immediateActions: [
            'Keep the person calm and still',
            'Remove jewelry and tight clothing from affected area',
            'Keep bitten area below heart level',
            'Do NOT apply ice or tourniquet',
            'Do NOT try to catch or kill the snake',
            'Note the snake\'s appearance if safe to do so',
        ],
        callAmbulance: true,
        firstAidSteps: [
            'Wash the bite with soap and water',
            'Cover with clean, dry dressing',
            'Immobilize the affected limb',
        ],
        warningMessage: 'Snake bite requires anti-venom. Get to hospital immediately!',
    },
};

class EmergencyDetector {
    /**
     * Detect if symptoms indicate an emergency
     */
    detectEmergency(
        symptoms: Symptom[],
        userInput?: string,
        language?: LanguageCode
    ): { isEmergency: boolean; protocol?: EmergencyProtocol; matchedKeywords?: string[] } {
        const matchedKeywords: string[] = [];
        let detectedProtocol: EmergencyProtocol | undefined;

        // Check user input for emergency keywords
        if (userInput) {
            const lang = language || languageService.detectLanguage(userInput);
            const keywords = EMERGENCY_KEYWORDS[lang] || EMERGENCY_KEYWORDS.en;
            const lowerInput = userInput.toLowerCase();

            for (const keyword of keywords) {
                if (lowerInput.includes(keyword.toLowerCase())) {
                    matchedKeywords.push(keyword);
                }
            }

            // Map keywords to protocols
            if (matchedKeywords.length > 0) {
                detectedProtocol = this.getProtocolFromKeywords(matchedKeywords, lowerInput);
            }
        }

        // Check symptoms for emergency indicators
        const emergencySymptoms = this.checkSymptomsForEmergency(symptoms);
        if (emergencySymptoms.isEmergency && !detectedProtocol) {
            detectedProtocol = emergencySymptoms.protocol;
        }

        const isEmergency = matchedKeywords.length > 0 || emergencySymptoms.isEmergency;

        return {
            isEmergency,
            protocol: detectedProtocol,
            matchedKeywords: matchedKeywords.length > 0 ? matchedKeywords : undefined,
        };
    }

    /**
     * Check symptoms for emergency conditions
     */
    private checkSymptomsForEmergency(symptoms: Symptom[]): {
        isEmergency: boolean;
        protocol?: EmergencyProtocol;
    } {
        // High severity symptoms (8-10) are potential emergencies
        const highSeveritySymptoms = symptoms.filter(s => s.severity >= 8);

        if (highSeveritySymptoms.length > 0) {
            // Check for specific emergency patterns
            const symptomNames = symptoms.map(s => s.name.toLowerCase());

            if (symptomNames.some(s => s.includes('chest') && s.includes('pain'))) {
                return { isEmergency: true, protocol: emergencyProtocols.CHEST_PAIN };
            }

            if (symptomNames.some(s => s.includes('breath') || s.includes('breathing'))) {
                return { isEmergency: true, protocol: emergencyProtocols.BREATHING_DIFFICULTY };
            }

            if (symptomNames.some(s => s.includes('bleed'))) {
                return { isEmergency: true, protocol: emergencyProtocols.SEVERE_BLEEDING };
            }
        }

        // Check for fever above 103°F
        const feverSymptom = symptoms.find(s =>
            s.name.toLowerCase().includes('fever') && s.severity >= 9
        );
        if (feverSymptom) {
            return { isEmergency: true, protocol: emergencyProtocols.HIGH_FEVER };
        }

        return { isEmergency: false };
    }

    /**
     * Get appropriate protocol from matched keywords
     */
    private getProtocolFromKeywords(keywords: string[], input: string): EmergencyProtocol {
        const lowerInput = input.toLowerCase();

        if (keywords.some(k => k.toLowerCase().includes('chest') || k.toLowerCase().includes('heart'))) {
            return emergencyProtocols.CHEST_PAIN;
        }

        if (keywords.some(k => k.toLowerCase().includes('breath') || k.toLowerCase().includes('उसिर') || k.toLowerCase().includes('শ্বাস'))) {
            return emergencyProtocols.BREATHING_DIFFICULTY;
        }

        if (keywords.some(k => k.toLowerCase().includes('unconscious') || k.toLowerCase().includes('मयक्कम') || k.toLowerCase().includes('অজ্ঞান'))) {
            return emergencyProtocols.UNCONSCIOUS;
        }

        if (keywords.some(k => k.toLowerCase().includes('bleed') || k.toLowerCase().includes('இரத்த') || k.toLowerCase().includes('రక్త'))) {
            return emergencyProtocols.SEVERE_BLEEDING;
        }

        if (keywords.some(k => k.toLowerCase().includes('stroke') || k.toLowerCase().includes('பக்கவாதம'))) {
            return emergencyProtocols.STROKE;
        }

        if (lowerInput.includes('pregnant') || lowerInput.includes('pregnancy') || lowerInput.includes('गर्भ')) {
            return emergencyProtocols.PREGNANCY_EMERGENCY;
        }

        if (lowerInput.includes('poison') || lowerInput.includes('toxic') || lowerInput.includes('விஷம்')) {
            return emergencyProtocols.POISONING;
        }

        if (lowerInput.includes('snake') || lowerInput.includes('bite') || lowerInput.includes('பாம்பு')) {
            return emergencyProtocols.SNAKE_BITE;
        }

        // Default to breathing difficulty if unclear
        return emergencyProtocols.BREATHING_DIFFICULTY;
    }

    /**
     * Get all emergency protocols
     */
    getAllProtocols(): Record<string, EmergencyProtocol> {
        return emergencyProtocols;
    }

    /**
     * Get specific protocol by key
     */
    getProtocol(key: string): EmergencyProtocol | undefined {
        return emergencyProtocols[key];
    }
}

export const emergencyDetector = new EmergencyDetector();
