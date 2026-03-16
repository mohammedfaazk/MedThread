// Health-related TypeScript types and interfaces

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type RiskCategory = 'SAFE_HOME_CARE' | 'VISIT_PHC' | 'EMERGENCY';
export type ConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Symptom {
    id: string;
    name: string;
    severity: number; // 1-10 scale
    duration: string; // e.g., "2 days", "1 week"
    bodyPart?: string;
    description?: string;
}

export interface PatientInfo {
    age: number;
    gender: 'male' | 'female' | 'other';
    isPregnant?: boolean;
    chronicConditions: string[];
    allergies: string[];
    currentMedications: string[];
}

export interface SymptomAssessment {
    symptoms: Symptom[];
    patientInfo: PatientInfo;
    timestamp: Date;
    mainComplaint: string;
}

export interface DiseaseMatch {
    diseaseName: string;
    matchedSymptoms: string[];
    confidence: number; // 0-1
    severity: SeverityLevel;
    description: string;
}

export interface HealthRecommendation {
    category: RiskCategory;
    advice: string[];
    homeCareTips?: string[];
    warningSign?: string[];
    followUpTiming?: string;
    medicationSuggestions?: string[];
    dietarySuggestions?: string[];
    emergencyInstructions?: string[];
}

export interface DiagnosticResult {
    assessment: SymptomAssessment;
    possibleConditions: DiseaseMatch[];
    recommendation: HealthRecommendation;
    confidence: ConfidenceLevel;
    isEmergency: boolean;
    timestamp: Date;
}

export interface EmergencyProtocol {
    condition: string;
    immediateActions: string[];
    callAmbulance: boolean;
    firstAidSteps?: string[];
    warningMessage: string;
}

export interface VaccinationRecord {
    vaccineName: string;
    dateGiven: Date;
    nextDue?: Date;
    batchNumber?: string;
    location?: string;
}

export interface HealthHistoryEntry {
    id: string;
    date: Date;
    type: 'consultation' | 'symptom_check' | 'emergency' | 'vaccination' | 'checkup';
    summary: string;
    diagnosis?: string;
    treatment?: string;
    followUp?: string;
    attachments?: string[];
}

export interface FamilyMemberHealth {
    memberId: string;
    healthHistory: HealthHistoryEntry[];
    vaccinations: VaccinationRecord[];
    chronicConditions: string[];
    allergies: string[];
    bloodType: string;
    height?: number;
    weight?: number;
    lastCheckup?: Date;
}

export interface ConversationContext {
    currentSymptoms: Symptom[];
    questionsAsked: string[];
    answersReceived: Record<string, string>;
    assessmentStage: 'initial' | 'gathering' | 'analyzing' | 'complete';
    emergencyDetected: boolean;
}
