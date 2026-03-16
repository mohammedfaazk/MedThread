export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH'
export type RiskCategory = 'SAFE_HOME_CARE' | 'VISIT_PHC' | 'EMERGENCY'

export interface Symptom {
  id: string
  name: string
  severity: number
  duration: string
}

export interface PatientInfo {
  age: number
  gender: 'male' | 'female' | 'other'
  chronicConditions: string[]
  allergies: string[]
  currentMedications: string[]
  isPregnant?: boolean
}

export interface ChatMessage {
  id: string
  sender: 'user' | 'assistant'
  text: string
  timestamp: Date
  isEmergency?: boolean
}

export interface ConversationContext {
  currentSymptoms: Symptom[]
  questionsAsked: string[]
  assessmentStage: 'initial' | 'gathering' | 'analyzing' | 'complete'
  emergencyDetected: boolean
}
