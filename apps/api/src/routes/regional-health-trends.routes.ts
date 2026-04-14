import { Router } from 'express';
import { prisma } from '@medthread/database';
import Groq from 'groq-sdk';

const router = Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface SymptomData {
  symptom: string;
  count: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  trend: 'increasing' | 'stable' | 'decreasing';
  lastReported: Date;
}

interface RegionalHealthData {
  region: string;
  regionType: 'pincode' | 'city' | 'state' | 'country' | 'worldwide';
  totalCases: number;
  symptoms: SymptomData[];
  topSymptoms: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  lastUpdated: Date;
  dataSource: 'patient_data' | 'ai_estimated' | 'hybrid';
}

/**
 * Extract symptoms from text using AI
 */
async function extractSymptomsFromText(text: string): Promise<string[]> {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a medical symptom extractor. Extract all medical symptoms mentioned in the text.
Return ONLY a JSON array of symptom names in 