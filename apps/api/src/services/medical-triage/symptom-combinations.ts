/**
 * Dangerous Symptom Combinations
 * Based on clinical emergency protocols and red flag combinations
 */

export interface SymptomCombination {
  name: string;
  condition: string;
  symptoms: string[];
  minMatch: number;
  urgency: number;
  category: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  clinicalGuideline: string;
  immediateAction: string;
}

export const DANGEROUS_COMBINATIONS: SymptomCombination[] = [
  // ═══════════════════════════════════════════════════════════════════════
  // CRITICAL COMBINATIONS - CALL 911 / GO TO ER IMMEDIATELY
  // ═══════════════════════════════════════════════════════════════════════
  
  {
    name: 'Acute Coronary Syndrome (Heart Attack)',
    condition: 'Myocardial Infarction',
    symptoms: ['chest_pain', 'difficulty_breathing', 'nausea_vomiting', 'dizziness'],
    minMatch: 2,
    urgency: 10,
    category: 'CRITICAL',
    clinicalGuideline: 'STEMI protocol - Time is muscle',
    immediateAction: 'Call emergency services immediately. Chew aspirin if available and not allergic.'
  },

  {
    name: 'Stroke (FAST)',
    condition: 'Cerebrovascular Accident',
    symptoms: ['stroke_symptoms', 'severe_headache', 'altered_consciousness', 'dizziness'],
    minMatch: 2,
    urgency: 10,
    category: 'CRITICAL',
    clinicalGuideline: 'Time-sensitive - 4.5 hour window for tPA',
    immediateAction: 'Call emergency services. Note time of symptom onset.'
  },

  {
    name: 'Sepsis',
    condition: 'Systemic Infection',
    symptoms: ['high_fever', 'altered_consciousness', 'difficulty_breathing', 'dizziness'],
    minMatch: 3,
    urgency: 10,
    category: 'CRITICAL',
    clinicalGuideline: 'Sepsis-3 criteria - qSOFA score',
    immediateAction: 'Emergency department immediately. Sepsis is life-threatening.'
  },

  {
    name: 'Meningitis',
    condition: 'Meningeal Inflammation',
    symptoms: ['high_fever', 'severe_headache', 'altered_consciousness'],
    minMatch: 2,
    urgency: 10,
    category: 'CRITICAL',
    clinicalGuideline: 'Bacterial meningitis - hours matter',
    immediateAction: 'Emergency department immediately for lumbar puncture and antibiotics.'
  },

  {
    name: 'Pulmonary Embolism',
    condition: 'Blood Clot in Lung',
    symptoms: ['difficulty_breathing', 'chest_pain', 'dizziness'],
    minMatch: 2,
    urgency: 10,
    category: 'CRITICAL',
    clinicalGuideline: 'Wells criteria for PE',
    immediateAction: 'Emergency department for CT angiography and anticoagulation.'
  },

  {
    name: 'Anaphylactic Shock',
    condition: 'Severe Allergic Reaction',
    symptoms: ['anaphylaxis', 'difficulty_breathing', 'dizziness'],
    minMatch: 2,
    urgency: 10,
    category: 'CRITICAL',
    clinicalGuideline: 'Epinephrine within minutes',
    immediateAction: 'Use EpiPen if available. Call emergency services immediately.'
  },

  {
    name: 'Subarachnoid Hemorrhage',
    condition: 'Brain Bleed',
    symptoms: ['severe_headache', 'altered_consciousness', 'nausea_vomiting'],
    minMatch: 2,
    urgency: 10,
    category: 'CRITICAL',
    clinicalGuideline: 'Worst headache of life - thunderclap onset',
    immediateAction: 'Emergency CT scan and neurosurgical consultation.'
  },

  {
    name: 'Diabetic Ketoacidosis',
    condition: 'DKA',
    symptoms: ['diabetic_emergency', 'nausea_vomiting', 'abdominal_pain', 'altered_consciousness'],
    minMatch: 2,
    urgency: 10,
    category: 'CRITICAL',
    clinicalGuideline: 'DKA triad: hyperglycemia, ketosis, acidosis',
    immediateAction: 'Emergency department for IV fluids and insulin.'
  },

  // ═══════════════════════════════════════════════════════════════════════
  // HIGH URGENCY COMBINATIONS - SEEK CARE WITHIN HOURS
  // ═══════════════════════════════════════════════════════════════════════

  {
    name: 'Acute Appendicitis',
    condition: 'Appendicitis',
    symptoms: ['severe_abdominal_pain', 'nausea_vomiting', 'fever'],
    minMatch: 2,
    urgency: 9,
    category: 'HIGH',
    clinicalGuideline: 'McBurney\'s point tenderness, rebound',
    immediateAction: 'Emergency department for surgical evaluation.'
  },

  {
    name: 'Pneumonia',
    condition: 'Lung Infection',
    symptoms: ['high_fever', 'persistent_cough', 'difficulty_breathing'],
    minMatch: 2,
    urgency: 8,
    category: 'HIGH',
    clinicalGuideline: 'CURB-65 score for severity',
    immediateAction: 'Urgent care or ER for chest X-ray and antibiotics.'
  },

  {
    name: 'Acute Asthma Exacerbation',
    condition: 'Severe Asthma Attack',
    symptoms: ['severe_asthma', 'difficulty_breathing', 'dizziness'],
    minMatch: 2,
    urgency: 9,
    category: 'HIGH',
    clinicalGuideline: 'Peak flow <50% predicted',
    immediateAction: 'Use rescue inhaler. If no improvement, go to ER.'
  },

  {
    name: 'Kidney Stones',
    condition: 'Nephrolithiasis',
    symptoms: ['severe_abdominal_pain', 'blood_in_urine', 'nausea_vomiting'],
    minMatch: 2,
    urgency: 8,
    category: 'HIGH',
    clinicalGuideline: 'Flank pain radiating to groin',
    immediateAction: 'ER for pain control and CT scan.'
  },

  {
    name: 'Urinary Tract Infection (Complicated)',
    condition: 'Pyelonephritis',
    symptoms: ['high_fever', 'back_pain', 'nausea_vomiting'],
    minMatch: 2,
    urgency: 8,
    category: 'HIGH',
    clinicalGuideline: 'Costovertebral angle tenderness',
    immediateAction: 'Urgent care or ER for IV antibiotics.'
  },

  {
    name: 'Gastrointestinal Bleeding',
    condition: 'GI Bleed',
    symptoms: ['blood_in_stool', 'dizziness', 'nausea_vomiting'],
    minMatch: 2,
    urgency: 9,
    category: 'HIGH',
    clinicalGuideline: 'Glasgow-Blatchford score',
    immediateAction: 'Emergency department for endoscopy and transfusion if needed.'
  },

  {
    name: 'Severe Migraine',
    condition: 'Status Migrainosus',
    symptoms: ['severe_headache', 'nausea_vomiting', 'dizziness'],
    minMatch: 2,
    urgency: 7,
    category: 'HIGH',
    clinicalGuideline: 'Migraine lasting >72 hours',
    immediateAction: 'Urgent care for IV fluids and anti-emetics.'
  },

  {
    name: 'Cellulitis',
    condition: 'Skin Infection',
    symptoms: ['fever', 'joint_pain'],
    minMatch: 2,
    urgency: 7,
    category: 'HIGH',
    clinicalGuideline: 'Spreading erythema, warmth, swelling',
    immediateAction: 'Urgent care for antibiotics. Watch for spreading.'
  },

  // ═══════════════════════════════════════════════════════════════════════
  // MEDIUM URGENCY COMBINATIONS - SEEK CARE WITHIN 24-48 HOURS
  // ═══════════════════════════════════════════════════════════════════════

  {
    name: 'Viral Gastroenteritis',
    condition: 'Stomach Flu',
    symptoms: ['nausea_vomiting', 'abdominal_pain', 'fever'],
    minMatch: 2,
    urgency: 5,
    category: 'MEDIUM',
    clinicalGuideline: 'Self-limiting in 24-48 hours',
    immediateAction: 'Stay hydrated. See doctor if symptoms worsen or persist >3 days.'
  },

  {
    name: 'Sinusitis',
    condition: 'Sinus Infection',
    symptoms: ['headache', 'fever', 'common_cold'],
    minMatch: 3,
    urgency: 4,
    category: 'MEDIUM',
    clinicalGuideline: 'Symptoms >10 days or worsening after 5-7 days',
    immediateAction: 'See doctor if symptoms persist >10 days for possible antibiotics.'
  },

  {
    name: 'Influenza',
    condition: 'Flu',
    symptoms: ['fever', 'cough', 'fatigue', 'headache'],
    minMatch: 3,
    urgency: 5,
    category: 'MEDIUM',
    clinicalGuideline: 'Antiviral within 48 hours most effective',
    immediateAction: 'See doctor within 48 hours for antiviral consideration.'
  },

  {
    name: 'Urinary Tract Infection (Uncomplicated)',
    condition: 'Cystitis',
    symptoms: ['fever', 'abdominal_pain'],
    minMatch: 2,
    urgency: 5,
    category: 'MEDIUM',
    clinicalGuideline: 'Dysuria, frequency, urgency',
    immediateAction: 'See doctor within 24-48 hours for antibiotics.'
  },

  {
    name: 'Acute Bronchitis',
    condition: 'Bronchitis',
    symptoms: ['persistent_cough', 'fever', 'fatigue'],
    minMatch: 2,
    urgency: 4,
    category: 'MEDIUM',
    clinicalGuideline: 'Usually viral, self-limiting',
    immediateAction: 'See doctor if symptoms worsen or persist >3 weeks.'
  },

  {
    name: 'Tension Headache',
    condition: 'Tension-Type Headache',
    symptoms: ['headache', 'stress_anxiety', 'fatigue'],
    minMatch: 2,
    urgency: 3,
    category: 'MEDIUM',
    clinicalGuideline: 'Bilateral, pressing/tightening quality',
    immediateAction: 'OTC pain relievers. See doctor if frequent or severe.'
  },

  {
    name: 'Muscle Strain',
    condition: 'Musculoskeletal Pain',
    symptoms: ['back_pain', 'joint_pain'],
    minMatch: 1,
    urgency: 3,
    category: 'MEDIUM',
    clinicalGuideline: 'RICE protocol: Rest, Ice, Compression, Elevation',
    immediateAction: 'Rest and OTC pain relievers. See doctor if no improvement in 1 week.'
  }
];

/**
 * Check if text contains symptom combination patterns
 */
export function detectSymptomCombinations(
  text: string,
  detectedSymptoms: string[]
): SymptomCombination | null {
  const textLower = text.toLowerCase();
  
  for (const combo of DANGEROUS_COMBINATIONS) {
    // Count how many symptoms from the combination are present
    const matchCount = combo.symptoms.filter(symptom => {
      // Check if symptom is in detected symptoms list
      if (detectedSymptoms.includes(symptom)) return true;
      
      // Also check text directly for symptom keywords
      return textLower.includes(symptom.replace(/_/g, ' '));
    }).length;
    
    // If we meet the minimum match threshold, return this combination
    if (matchCount >= combo.minMatch) {
      return combo;
    }
  }
  
  return null;
}

/**
 * Get all possible combinations for a set of symptoms
 */
export function getAllMatchingCombinations(
  detectedSymptoms: string[]
): SymptomCombination[] {
  const matches: SymptomCombination[] = [];
  
  for (const combo of DANGEROUS_COMBINATIONS) {
    const matchCount = combo.symptoms.filter(s => 
      detectedSymptoms.includes(s)
    ).length;
    
    if (matchCount >= combo.minMatch) {
      matches.push(combo);
    }
  }
  
  // Sort by urgency (highest first)
  return matches.sort((a, b) => b.urgency - a.urgency);
}
