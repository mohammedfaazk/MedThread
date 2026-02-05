// User Roles
export enum UserRole {
  PATIENT = 'PATIENT',
  VERIFIED_DOCTOR = 'VERIFIED_DOCTOR',
  NURSE = 'NURSE',
  MEDICAL_STUDENT = 'MEDICAL_STUDENT',
  PHARMACIST = 'PHARMACIST',
  COMMUNITY_CONTRIBUTOR = 'COMMUNITY_CONTRIBUTOR'
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

export enum SeverityLevel {
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
  EMERGENCY = 'EMERGENCY'
}

// User Types
export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  verificationStatus: VerificationStatus;
  reputationScore: number;
  createdAt: Date;
  updatedAt: Date;
}

// Medical Thread Types
export interface MedicalThread {
  id: string;
  patientId: string;
  title: string;
  symptoms: SymptomData;
  severityScore: SeverityLevel;
  tags: string[];
  aiAnalysis?: AIAnalysis;
  createdAt: Date;
  updatedAt: Date;
}

export interface SymptomData {
  age?: number;
  gender?: string;
  weight?: number;
  existingConditions: string[];
  medications: string[];
  primarySymptoms: string[];
  duration: string;
  severity: SeverityLevel;
  description: string;
  medicalFiles?: string[];
}

export interface AIAnalysis {
  possibleConditions: string[];
  emergencyWarning: boolean;
  suggestedQuestions: string[];
  similarCases: string[];
  riskScore: number;
}

// Reply Types
export interface ThreadReply {
  id: string;
  threadId: string;
  parentReplyId?: string;
  authorId: string;
  authorRole: UserRole;
  content: string;
  doctorVerified: boolean;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Case Timeline
export interface CaseTimelineEvent {
  id: string;
  threadId: string;
  eventType: TimelineEventType;
  timestamp: Date;
  data: Record<string, any>;
}

export enum TimelineEventType {
  SYMPTOM_START = 'SYMPTOM_START',
  DOCTOR_ADVICE = 'DOCTOR_ADVICE',
  TEST_RESULTS = 'TEST_RESULTS',
  MEDICATION_UPDATE = 'MEDICATION_UPDATE',
  RECOVERY_LOG = 'RECOVERY_LOG'
}
