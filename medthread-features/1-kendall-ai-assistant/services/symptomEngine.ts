// Rule-based symptom analysis engine for offline diagnostics

import { COMMON_DISEASES, SEVERITY_THRESHOLDS, RISK_CATEGORIES } from '@/config/constants';
import type {
    Symptom,
    SymptomAssessment,
    DiseaseMatch,
    HealthRecommendation,
    DiagnosticResult,
    SeverityLevel,
    RiskCategory,
    ConfidenceLevel,
} from '@/types/health';
import { emergencyDetector } from './emergencyDetector';

class SymptomEngine {
    /**
     * Analyze symptoms and provide diagnostic suggestions
     */
    analyzeSymptoms(assessment: SymptomAssessment): DiagnosticResult {
        // Check for emergency first
        const emergencyCheck = emergencyDetector.detectEmergency(
            assessment.symptoms,
            assessment.mainComplaint
        );

        if (emergencyCheck.isEmergency) {
            return this.createEmergencyResult(assessment, emergencyCheck.protocol!);
        }

        // Match symptoms to diseases
        const possibleConditions = this.matchDiseases(assessment);

        // Generate recommendations
        const recommendation = this.generateRecommendations(possibleConditions, assessment);

        // Calculate overall confidence
        const confidence = this.calculateConfidence(possibleConditions, assessment);

        return {
            assessment,
            possibleConditions,
            recommendation,
            confidence,
            isEmergency: false,
            timestamp: new Date(),
        };
    }

    /**
     * Match symptoms to known disease patterns
     */
    private matchDiseases(assessment: SymptomAssessment): DiseaseMatch[] {
        const matches: DiseaseMatch[] = [];
        const symptomNames = assessment.symptoms.map(s => s.name.toLowerCase());

        for (const [key, disease] of Object.entries(COMMON_DISEASES)) {
            const matchedSymptoms: string[] = [];
            let matchScore = 0;

            // Check how many disease symptoms match user symptoms
            for (const diseaseSymptom of disease.symptoms) {
                const found = symptomNames.find(userSymptom =>
                    userSymptom.includes(diseaseSymptom) || diseaseSymptom.includes(userSymptom)
                );

                if (found) {
                    matchedSymptoms.push(diseaseSymptom);
                    matchScore++;
                }
            }

            // Calculate confidence based on match percentage
            const confidence = matchScore / disease.symptoms.length;

            // Only include if at least 30% match
            if (confidence >= 0.3) {
                matches.push({
                    diseaseName: disease.name,
                    matchedSymptoms,
                    confidence,
                    severity: disease.severity as SeverityLevel,
                    description: `Duration: ${disease.duration}`,
                });
            }
        }

        // Sort by confidence (highest first)
        return matches.sort((a, b) => b.confidence - a.confidence);
    }

    /**
     * Generate health recommendations based on diagnosis
     */
    private generateRecommendations(
        conditions: DiseaseMatch[],
        assessment: SymptomAssessment
    ): HealthRecommendation {
        const topCondition = conditions[0];
        const maxSeverity = Math.max(...assessment.symptoms.map(s => s.severity));

        // Determine risk category
        let category: RiskCategory = 'SAFE_HOME_CARE';
        if (maxSeverity >= 7 || topCondition?.severity === 'HIGH') {
            category = 'EMERGENCY';
        } else if (maxSeverity >= 4 || topCondition?.severity === 'MEDIUM') {
            category = 'VISIT_PHC';
        }

        // Generate advice based on category and condition
        const advice: string[] = [];
        const homeCareTips: string[] = [];
        const warningSign: string[] = [];
        const medicationSuggestions: string[] = [];
        const dietarySuggestions: string[] = [];

        // Common advice for all conditions
        advice.push('Monitor your symptoms closely');
        homeCareTips.push('Get adequate rest (7-8 hours of sleep)');
        homeCareTips.push('Drink plenty of water (8-10 glasses per day)');

        // Condition-specific recommendations
        if (topCondition) {
            const diseaseName = topCondition.diseaseName.toLowerCase();

            if (diseaseName.includes('fever')) {
                homeCareTips.push('Take paracetamol for fever (500mg every 6 hours if needed)');
                homeCareTips.push('Use cool compresses on forehead');
                homeCareTips.push('Wear light, breathable clothing');
                dietarySuggestions.push('Consume light, easily digestible foods');
                dietarySuggestions.push('Drink ORS (Oral Rehydration Solution) if sweating');
                warningSign.push('Fever above 103°F (39.5°C)');
                warningSign.push('Fever lasting more than 3 days');
            }

            if (diseaseName.includes('dengue') || diseaseName.includes('malaria')) {
                advice.push('Get blood test done immediately');
                advice.push('Visit doctor for proper diagnosis');
                warningSign.push('Severe headache or pain behind eyes');
                warningSign.push('Bleeding from nose or gums');
                warningSign.push('Severe abdominal pain');
                dietarySuggestions.push('Drink papaya leaf juice (for dengue)');
                dietarySuggestions.push('Eat iron-rich foods');
            }

            if (diseaseName.includes('cold') || diseaseName.includes('flu')) {
                homeCareTips.push('Gargle with warm salt water');
                homeCareTips.push('Steam inhalation 2-3 times daily');
                homeCareTips.push('Use saline nasal drops');
                dietarySuggestions.push('Drink warm liquids (ginger tea, turmeric milk)');
                dietarySuggestions.push('Consume vitamin C rich foods (citrus fruits)');
                medicationSuggestions.push('Paracetamol for fever and body ache');
            }

            if (diseaseName.includes('diarrhea')) {
                homeCareTips.push('Drink ORS frequently to prevent dehydration');
                homeCareTips.push('Maintain hand hygiene');
                dietarySuggestions.push('Eat BRAT diet (Banana, Rice, Applesauce, Toast)');
                dietarySuggestions.push('Avoid dairy products temporarily');
                dietarySuggestions.push('Drink coconut water');
                warningSign.push('Blood in stools');
                warningSign.push('Severe dehydration (dark urine, dizziness)');
                warningSign.push('Diarrhea lasting more than 2 days');
            }

            if (diseaseName.includes('pneumonia')) {
                advice.push('Visit doctor immediately for antibiotics');
                advice.push('Get chest X-ray if recommended');
                warningSign.push('Difficulty breathing');
                warningSign.push('Chest pain when breathing');
                warningSign.push('Bluish lips or fingernails');
            }
        }

        // Age-specific advice
        if (assessment.patientInfo.age < 5) {
            advice.push('Children under 5 need special care - consult pediatrician');
            warningSign.push('Refusal to eat or drink');
            warningSign.push('Excessive crying or irritability');
        } else if (assessment.patientInfo.age > 60) {
            advice.push('Elderly patients should seek medical care earlier');
            warningSign.push('Confusion or disorientation');
            warningSign.push('Weakness or difficulty walking');
        }

        // Pregnancy-specific advice
        if (assessment.patientInfo.isPregnant) {
            advice.push('Pregnant women should consult doctor for any medication');
            advice.push('Do not take any medicine without doctor approval');
            warningSign.push('Any vaginal bleeding');
            warningSign.push('Severe abdominal pain');
            warningSign.push('Reduced fetal movement');
        }

        // Follow-up timing
        let followUpTiming = '24-48 hours';
        if (category === 'EMERGENCY') {
            followUpTiming = 'Immediately';
        } else if (category === 'VISIT_PHC') {
            followUpTiming = 'Within 24 hours';
        }

        return {
            category,
            advice,
            homeCareTips,
            warningSign,
            followUpTiming,
            medicationSuggestions: medicationSuggestions.length > 0 ? medicationSuggestions : undefined,
            dietarySuggestions: dietarySuggestions.length > 0 ? dietarySuggestions : undefined,
        };
    }

    /**
     * Calculate confidence level
     */
    private calculateConfidence(
        conditions: DiseaseMatch[],
        assessment: SymptomAssessment
    ): ConfidenceLevel {
        if (conditions.length === 0) {
            return 'LOW';
        }

        const topConfidence = conditions[0].confidence;
        const symptomCount = assessment.symptoms.length;

        // High confidence if top match is strong and we have enough symptoms
        if (topConfidence >= 0.7 && symptomCount >= 3) {
            return 'HIGH';
        }

        // Medium confidence if decent match
        if (topConfidence >= 0.5 || symptomCount >= 2) {
            return 'MEDIUM';
        }

        return 'LOW';
    }

    /**
     * Create emergency diagnostic result
     */
    private createEmergencyResult(
        assessment: SymptomAssessment,
        protocol: any
    ): DiagnosticResult {
        return {
            assessment,
            possibleConditions: [{
                diseaseName: protocol.condition,
                matchedSymptoms: assessment.symptoms.map(s => s.name),
                confidence: 1.0,
                severity: 'HIGH',
                description: 'Emergency condition detected',
            }],
            recommendation: {
                category: 'EMERGENCY',
                advice: [protocol.warningMessage],
                emergencyInstructions: protocol.immediateActions,
                followUpTiming: 'Immediately',
            },
            confidence: 'HIGH',
            isEmergency: true,
            timestamp: new Date(),
        };
    }

    /**
     * Get severity level from score
     */
    getSeverityLevel(score: number): SeverityLevel {
        if (score >= SEVERITY_THRESHOLDS.HIGH.min) return 'HIGH';
        if (score >= SEVERITY_THRESHOLDS.MEDIUM.min) return 'MEDIUM';
        return 'LOW';
    }

    /**
     * Get risk category info
     */
    getRiskCategoryInfo(category: RiskCategory) {
        return RISK_CATEGORIES[category];
    }
}

export const symptomEngine = new SymptomEngine();
