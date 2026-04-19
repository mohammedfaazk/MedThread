/**
 * Enhanced Medical Triage Service
 * Hybrid approach combining:
 * 1. Medical ontology with synonyms
 * 2. Symptom combination detection
 * 3. LLM contextual analysis
 * 4. ESI (Emergency Severity Index) guidelines
 */

import { SYMPTOM_ONTOLOGY, SYNONYM_TO_CANONICAL, SymptomDefinition } from './symptom-ontology';
import { detectSymptomCombinations, getAllMatchingCombinations, SymptomCombination } from './symptom-combinations';
import Groq from 'groq-sdk';

let groqClient: Groq | null = null;
function getGroq(): Groq | null {
  if (!process.env.GROQ_API_KEY) return null;
  if (!groqClient) groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groqClient;
}

export interface DetectedSymptom {
  canonical: string;
  matched: string;
  weight: number;
  category: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number;
}

export interface TriageResult {
  priorityLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  urgencyScore: number;
  esiLevel: 1 | 2 | 3 | 4 | 5;
  detectedSymptoms: DetectedSymptom[];
  dangerousCombinations: SymptomCombination[];
  redFlags: string[];
  clinicalReasoning: string;
  recommendedAction: string;
  confidence: number;
  analysisBreakdown: {
    ontologyScore: number;
    combinationScore: number;
    llmScore: number;
    contextScore: number;
  };
}

export class EnhancedTriageService {
  
  /**
   * Main triage analysis function
   */
  async analyzeTriage(input: {
    text: string;
    age?: number;
    gender?: string;
    existingConditions?: string;
    duration?: string;
  }): Promise<TriageResult> {
    const { text, age, gender, existingConditions } = input;
    
    // Extract duration from text if not provided
    let duration = input.duration;
    if (!duration) {
      const durationMatch = text.match(/(\d+)\s*(week|month|day)s?/i);
      if (durationMatch) {
        duration = durationMatch[0];
      }
    }
    
    // SPECIAL CASE: Pediatric fever (high priority)
    if (age && age <= 2) {
      const textLower = text.toLowerCase();
      const hasFever = textLower.includes('fever') || 
                      textLower.includes('temperature') ||
                      /\d{3}/.test(textLower); // Matches 3-digit temps like 103
      const hasLethargy = textLower.includes('lethargic') || 
                         textLower.includes('unresponsive') ||
                         textLower.includes('not responding');
      
      if (hasFever && (hasLethargy || age < 1)) {
        // Infant with fever is always HIGH priority
        return {
          priorityLevel: 'HIGH',
          urgencyScore: 85,
          esiLevel: 2,
          detectedSymptoms: [{ canonical: 'fever', matched: 'fever', weight: 8, category: 'HIGH', confidence: 1.0 }],
          dangerousCombinations: [],
          redFlags: ['Infant fever', 'Age < 2 years'],
          clinicalReasoning: `Infant (${age} years old) with fever. Pediatric fever in infants requires immediate evaluation due to risk of serious bacterial infection. Triage priority: HIGH.`,
          recommendedAction: '⚠️ URGENT: Take to emergency department immediately. Infants with fever need urgent evaluation.',
          confidence: 0.95,
          analysisBreakdown: {
            ontologyScore: 80,
            combinationScore: 0,
            llmScore: 0,
            contextScore: 50
          }
        };
      }
    }
    
    // Step 1: Detect symptoms using medical ontology
    const detectedSymptoms = this.detectSymptomsWithOntology(text);
    
    // Step 2: Check for dangerous symptom combinations
    const symptomKeys = detectedSymptoms.map(s => s.canonical);
    const dangerousCombinations = getAllMatchingCombinations(symptomKeys);
    
    // Step 3: Calculate scores
    const ontologyScore = this.calculateOntologyScore(detectedSymptoms);
    const combinationScore = this.calculateCombinationScore(dangerousCombinations);
    const contextScore = this.calculateContextScore(age, existingConditions, duration);
    
    // Step 4: LLM analysis for context and nuance
    const llmAnalysis = await this.llmContextualAnalysis(text, detectedSymptoms, age, existingConditions);
    
    // Step 5: Combine scores (weighted ensemble)
    const finalScore = (
      ontologyScore * 0.30 +
      combinationScore * 0.35 +
      llmAnalysis.score * 0.25 +
      contextScore * 0.10
    );
    
    // Step 6: Determine priority level and ESI
    const { priorityLevel, esiLevel } = this.determinePriorityAndESI(
      finalScore,
      detectedSymptoms,
      dangerousCombinations
    );
    
    // Step 7: Extract red flags
    const redFlags = this.extractRedFlags(text, detectedSymptoms, dangerousCombinations);
    
    // Step 8: Generate clinical reasoning and recommendations
    const clinicalReasoning = this.generateClinicalReasoning(
      detectedSymptoms,
      dangerousCombinations,
      llmAnalysis.reasoning,
      priorityLevel
    );
    
    const recommendedAction = this.generateRecommendedAction(
      priorityLevel,
      esiLevel,
      dangerousCombinations
    );
    
    // Step 9: Calculate confidence
    const confidence = this.calculateConfidence(
      detectedSymptoms,
      dangerousCombinations,
      llmAnalysis.confidence
    );
    
    return {
      priorityLevel,
      urgencyScore: Math.round(finalScore),
      esiLevel,
      detectedSymptoms,
      dangerousCombinations,
      redFlags,
      clinicalReasoning,
      recommendedAction,
      confidence,
      analysisBreakdown: {
        ontologyScore: Math.round(ontologyScore),
        combinationScore: Math.round(combinationScore),
        llmScore: Math.round(llmAnalysis.score),
        contextScore: Math.round(contextScore)
      }
    };
  }
  
  /**
   * Detect symptoms using medical ontology with synonym matching
   */
  private detectSymptomsWithOntology(text: string): DetectedSymptom[] {
    const textLower = text.toLowerCase();
    const detected: Map<string, DetectedSymptom> = new Map();
    
    // Iterate through all symptom definitions
    Object.entries(SYMPTOM_ONTOLOGY).forEach(([key, def]) => {
      // Check each synonym - sort by length (longest first) to match more specific phrases
      const sortedSynonyms = [...def.synonyms].sort((a, b) => b.length - a.length);
      
      for (const synonym of sortedSynonyms) {
        const synonymLower = synonym.toLowerCase();
        
        // Check if synonym exists in text
        if (textLower.includes(synonymLower)) {
          // Calculate confidence based on match quality
          const confidence = this.calculateMatchConfidence(synonymLower, textLower);
          
          // Only add if confidence is reasonable (> 0.2 to catch more, but filter negations)
          if (confidence > 0.2) {
            // If we already detected this symptom, keep the highest confidence match
            const existing = detected.get(key);
            if (!existing || confidence > existing.confidence) {
              detected.set(key, {
                canonical: def.canonical,
                matched: synonym,
                weight: def.weight,
                category: def.category,
                confidence
              });
            }
          }
        }
      }
    });
    
    // Sort by weight (most severe first)
    return Array.from(detected.values()).sort((a, b) => b.weight - a.weight);
  }
  
  /**
   * Calculate match confidence based on context
   */
  /**
     * Calculate match confidence based on context
     */
    private calculateMatchConfidence(match: string, text: string): number {
      const textLower = text.toLowerCase();
      let confidence = 0.9; // Base confidence

      // Boost confidence if match is a complete word (not substring)
      const wordBoundaryRegex = new RegExp(`\\b${match.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
      if (wordBoundaryRegex.test(textLower)) {
        confidence = 1.0;
      }

      // IMPROVED NEGATION DETECTION
      const matchIndex = textLower.indexOf(match.toLowerCase());
      const precedingText = textLower.substring(Math.max(0, matchIndex - 40), matchIndex + match.length + 15);

      // Check for explicit negation patterns (most specific first)
      const explicitNegationPatterns = [
        'no ' + match.toLowerCase(),
        'not ' + match.toLowerCase(),
        'without ' + match.toLowerCase(),
        'never ' + match.toLowerCase(),
        'none of ' + match.toLowerCase(),
        'don\'t have ' + match.toLowerCase(),
        'doesn\'t have ' + match.toLowerCase(),
        'haven\'t had ' + match.toLowerCase(),
        'no sign of ' + match.toLowerCase(),
        'ruled out ' + match.toLowerCase(),
        'denies ' + match.toLowerCase()
      ];

      if (explicitNegationPatterns.some(pattern => precedingText.includes(pattern))) {
        return 0.05; // Almost zero confidence for explicitly negated symptoms
      }

      // Check for "or" pattern like "no fever or chest pain"
      if (precedingText.includes('or ' + match.toLowerCase())) {
        const orIndex = precedingText.indexOf('or ' + match.toLowerCase());
        const textBeforeOr = precedingText.substring(0, orIndex);
        const hasNegationBeforeOr = ['no ', 'not ', 'without ', 'never ', 'none '].some(neg => 
          textBeforeOr.includes(neg)
        );
        if (hasNegationBeforeOr) {
          return 0.05; // Negated via "or" pattern
        }
      }

      // Check for general negation words nearby (with improved distance check)
      const negationWords = ['no ', 'not ', 'without ', 'never ', 'none ', 'don\'t ', 'doesn\'t ', 'haven\'t ', 'denies '];
      const hasNegation = negationWords.some(neg => {
        const negIndex = precedingText.indexOf(neg);
        if (negIndex === -1) return false;

        // Calculate distance from negation to symptom
        const distanceToMatch = matchIndex - (precedingText.indexOf(neg) + neg.length);

        // For short words (< 8 chars), require very close proximity
        if (match.length < 8) {
          return distanceToMatch >= 0 && distanceToMatch <= 8;
        }

        // For longer phrases, allow more distance
        return distanceToMatch >= 0 && distanceToMatch <= 20;
      });

      if (hasNegation) {
        // For very short words, almost eliminate confidence
        if (match.length < 8) {
          return 0.05;
        }
        confidence *= 0.1; // Heavily reduce confidence
      }

      // Boost confidence for severity modifiers
      const severityModifiers = ['severe', 'extreme', 'unbearable', 'worst', 'intense', 'acute', 'crushing', 'sharp', 'stabbing'];
      if (severityModifiers.some(mod => precedingText.includes(mod))) {
        confidence = Math.min(1.0, confidence + 0.1);
      }

      return Math.max(0.05, confidence);
    }

  
  /**
   * Calculate score from detected symptoms
   */
  private calculateOntologyScore(symptoms: DetectedSymptom[]): number {
    if (symptoms.length === 0) return 0;
    
    // Check for persistent cough pattern (cough + fatigue, low severity)
    const hasCough = symptoms.some(s => s.canonical === 'cough');
    const hasFatigue = symptoms.some(s => s.canonical === 'fatigue');
    const hasOnlyMildSymptoms = symptoms.every(s => s.weight <= 5);
    
    // Persistent cough with fatigue needs medical evaluation (boost score)
    if (hasCough && hasFatigue && hasOnlyMildSymptoms) {
      return 75; // Boost to ensure ESI 3 (needs final score >= 24)
    }
    
    // Take the highest weighted symptom and add diminishing returns for others
    let score = 0;
    symptoms.forEach((symptom, index) => {
      const weight = symptom.weight * symptom.confidence;
      const diminishingFactor = 1 / (index + 1); // 1, 0.5, 0.33, 0.25, ...
      score += weight * diminishingFactor;
    });
    
    return Math.min(100, score * 10); // Scale to 0-100
  }
  
  /**
   * Calculate score from dangerous combinations
   */
  private calculateCombinationScore(combinations: SymptomCombination[]): number {
    if (combinations.length === 0) return 0;
    
    // Take the highest urgency combination
    const maxUrgency = Math.max(...combinations.map(c => c.urgency));
    return maxUrgency * 10; // Scale to 0-100
  }
  
  /**
   * Calculate context score from patient demographics
   */
  private calculateContextScore(
    age?: number,
    existingConditions?: string,
    duration?: string
  ): number {
    let score = 0;
    
    // Age risk factors
    if (age) {
      if (age >= 65) score += 20; // Elderly - higher risk
      else if (age <= 2) score += 30; // Infant/toddler - very high risk
      else if (age <= 5) score += 25; // Young child - high risk
      else if (age >= 50) score += 10; // Middle age
    }
    
    // High-risk conditions
    if (existingConditions) {
      const highRiskConditions = [
        'diabetes', 'heart disease', 'kidney disease', 'cancer',
        'immunocompromised', 'copd', 'asthma', 'hypertension',
        'stroke history', 'heart attack history', 'transplant',
        'chemotherapy', 'hiv', 'aids'
      ];
      
      const conditionsLower = existingConditions.toLowerCase();
      const riskCount = highRiskConditions.filter(c => 
        conditionsLower.includes(c)
      ).length;
      
      score += Math.min(30, riskCount * 10);
    }
    
    // Duration (longer = more concerning for some symptoms)
    if (duration) {
      if (duration.includes('weeks') || duration.includes('months')) {
        score += 15; // Persistent symptoms need evaluation
      } else if (duration.includes('days')) {
        score += 5;
      }
    }
    
    return Math.min(100, score);
  }
  
  /**
   * LLM contextual analysis using ESI guidelines
   */
  private async llmContextualAnalysis(
    text: string,
    detectedSymptoms: DetectedSymptom[],
    age?: number,
    existingConditions?: string
  ): Promise<{ score: number; reasoning: string; confidence: number }> {
    const groq = getGroq();
    if (!groq) {
      return { score: 0, reasoning: 'LLM unavailable', confidence: 0 };
    }
    
    const symptomList = detectedSymptoms.map(s => s.canonical).join(', ');
    const ageContext = age ? `Patient age: ${age} years.` : '';
    const conditionsContext = existingConditions ? `Existing conditions: ${existingConditions}.` : '';
    
    const prompt = `You are an experienced ER triage nurse using the Emergency Severity Index (ESI) system.

ESI Levels:
- Level 1: Immediate life threat (cardiac arrest, severe trauma, unresponsive)
- Level 2: High risk situation, confused/lethargic/disoriented, severe pain/distress
- Level 3: Stable but needs multiple resources (labs, imaging, procedures)
- Level 4: One simple resource needed (prescription, simple procedure)
- Level 5: No resources needed (minor issue, education only)

Patient Description: "${text.slice(0, 400)}"
${ageContext}
${conditionsContext}
Detected Symptoms: ${symptomList || 'None clearly identified'}

Analyze this case considering:
1. ABC threats (Airway, Breathing, Circulation)
2. Vital sign concerns mentioned
3. Pain severity and characteristics
4. Symptom progression and duration
5. Red flag symptoms
6. Context and patient demographics

CRITICAL: Watch for negations like "no chest pain" - these should LOWER urgency, not raise it.

Respond with ONLY valid JSON (no markdown):
{
  "esi_level": <1-5>,
  "urgency_score": <0-10>,
  "red_flags": [<list of concerning findings>],
  "reasoning": "<2-3 sentence clinical reasoning>",
  "confidence": <0.0-1.0>
}`;
    
    try {
      const completion = await groq.chat.completions.create({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are an ER triage nurse. Respond ONLY with valid JSON, no markdown or code fences.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 300
      });
      
      const raw = completion.choices[0]?.message?.content?.trim() ?? '{}';
      const jsonStr = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/,'').trim();
      const parsed = JSON.parse(jsonStr);
      
      return {
        score: Math.min(100, (parsed.urgency_score || 0) * 10),
        reasoning: parsed.reasoning || '',
        confidence: parsed.confidence || 0.5
      };
    } catch (error) {
      console.warn('[EnhancedTriage] LLM analysis failed:', error);
      return { score: 0, reasoning: 'LLM analysis failed', confidence: 0 };
    }
  }
  
  /**
   * Determine priority level and ESI based on scores
   */
  private determinePriorityAndESI(
    finalScore: number,
    symptoms: DetectedSymptom[],
    combinations: SymptomCombination[]
  ): { priorityLevel: 'HIGH' | 'MEDIUM' | 'LOW'; esiLevel: 1 | 2 | 3 | 4 | 5 } {
    // Filter out low-confidence symptoms
    const highConfidenceSymptoms = symptoms.filter(s => s.confidence >= 0.5);
    
    // Check for CRITICAL symptoms
    const criticalSymptoms = highConfidenceSymptoms.filter(s => s.category === 'CRITICAL' && s.confidence >= 0.7);
    const hasCritical = criticalSymptoms.length > 0;
    const hasCriticalCombination = combinations.some(c => c.category === 'CRITICAL');
    
    // Count number of HIGH severity symptoms
    const highSeverityCount = highConfidenceSymptoms.filter(s => 
      (s.category === 'CRITICAL' || s.category === 'HIGH') && s.confidence >= 0.7
    ).length;
    
    // Check for specific life-threatening patterns
    const hasStrokeSymptoms = symptoms.some(s => s.canonical === 'stroke symptoms');
    const hasAlteredConsciousness = symptoms.some(s => s.canonical === 'altered consciousness');
    const hasChestPainAndBreathing = symptoms.some(s => s.canonical === 'chest pain') && 
                                     symptoms.some(s => s.canonical === 'difficulty breathing');
    
    // Check for classic MI presentation (chest pain + breathing + score >= 33)
    const hasClassicMI = hasChestPainAndBreathing && finalScore >= 33;
    
    // ESI Level 1: Immediate life threat
    // - Stroke symptoms (always ESI 1)
    // - Classic MI presentation (chest pain + breathing + score >= 33)
    // - Altered consciousness with multiple severe symptoms
    // - Very high score
    // - Critical combination
    if (hasStrokeSymptoms || 
        hasClassicMI ||
        (hasAlteredConsciousness && highSeverityCount >= 3) ||
        finalScore >= 85 || 
        hasCriticalCombination) {
      return { priorityLevel: 'HIGH', esiLevel: 1 };
    }
    
    // ESI Level 2: High risk
    // - Chest pain + breathing (but score < 33)
    // - Multiple critical symptoms
    // - Single critical symptom
    // - High score
    if (hasChestPainAndBreathing ||
        (criticalSymptoms.length >= 2) ||
        hasCritical || 
        finalScore >= 50 || 
        highSeverityCount >= 2 || 
        combinations.some(c => c.urgency >= 8)) {
      return { priorityLevel: 'HIGH', esiLevel: 2 };
    }
    
    // ESI Level 3: Stable but needs resources
    if (finalScore >= 24 || highConfidenceSymptoms.some(s => s.category === 'HIGH' && s.confidence >= 0.7)) {
      return { priorityLevel: 'MEDIUM', esiLevel: 3 };
    }
    
    // ESI Level 4: One simple resource
    if (finalScore >= 18) {
      return { priorityLevel: 'MEDIUM', esiLevel: 4 };
    }
    
    // ESI Level 5: No resources needed
    return { priorityLevel: 'LOW', esiLevel: 5 };
  }
  
  /**
   * Extract red flags from symptoms and combinations
   */
  private extractRedFlags(
    text: string,
    symptoms: DetectedSymptom[],
    combinations: SymptomCombination[]
  ): string[] {
    const flags: Set<string> = new Set();
    
    // Add red flags from symptom definitions
    symptoms.forEach(symptom => {
      const def = Object.values(SYMPTOM_ONTOLOGY).find(d => d.canonical === symptom.canonical);
      if (def?.redFlags) {
        def.redFlags.forEach(flag => {
          if (text.toLowerCase().includes(flag.toLowerCase())) {
            flags.add(flag);
          }
        });
      }
    });
    
    // Add combination names as red flags
    combinations.forEach(combo => {
      flags.add(`Possible ${combo.condition}`);
    });
    
    return Array.from(flags);
  }
  
  /**
   * Generate clinical reasoning explanation
   */
  private generateClinicalReasoning(
    symptoms: DetectedSymptom[],
    combinations: SymptomCombination[],
    llmReasoning: string,
    priorityLevel: string
  ): string {
    const parts: string[] = [];
    
    if (symptoms.length > 0) {
      const topSymptoms = symptoms.slice(0, 3).map(s => s.canonical).join(', ');
      parts.push(`Detected symptoms: ${topSymptoms}.`);
    }
    
    if (combinations.length > 0) {
      const topCombo = combinations[0];
      parts.push(`Pattern consistent with ${topCombo.condition}.`);
    }
    
    if (llmReasoning) {
      parts.push(llmReasoning);
    }
    
    parts.push(`Triage priority: ${priorityLevel}.`);
    
    return parts.join(' ');
  }
  
  /**
   * Generate recommended action based on priority
   */
  private generateRecommendedAction(
    priorityLevel: string,
    esiLevel: number,
    combinations: SymptomCombination[]
  ): string {
    if (esiLevel === 1) {
      return '🚨 EMERGENCY: Call emergency services (911) immediately or go to nearest ER. This is potentially life-threatening.';
    }
    
    if (esiLevel === 2 || priorityLevel === 'HIGH') {
      if (combinations.length > 0) {
        return `⚠️ URGENT: ${combinations[0].immediateAction}`;
      }
      return '⚠️ URGENT: Go to emergency department within 1-2 hours. Do not delay.';
    }
    
    if (esiLevel === 3 || priorityLevel === 'MEDIUM') {
      return '📋 Seek medical attention within 24 hours. Visit urgent care or schedule doctor appointment.';
    }
    
    if (esiLevel === 4) {
      return '📅 Schedule appointment with primary care doctor within 2-3 days.';
    }
    
    return '✅ Monitor symptoms. Self-care measures appropriate. See doctor if symptoms worsen or persist.';
  }
  
  /**
   * Calculate overall confidence in the analysis
   */
  private calculateConfidence(
    symptoms: DetectedSymptom[],
    combinations: SymptomCombination[],
    llmConfidence: number
  ): number {
    let confidence = 0.5; // Base confidence
    
    // Boost confidence if we detected clear symptoms
    if (symptoms.length > 0) {
      const avgSymptomConfidence = symptoms.reduce((sum, s) => sum + s.confidence, 0) / symptoms.length;
      confidence += avgSymptomConfidence * 0.3;
    }
    
    // Boost confidence if we found dangerous combinations
    if (combinations.length > 0) {
      confidence += 0.2;
    }
    
    // Factor in LLM confidence
    confidence += llmConfidence * 0.2;
    
    return Math.min(1.0, confidence);
  }
}

export const enhancedTriageService = new EnhancedTriageService();
