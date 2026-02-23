"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiSymptomAnalysisService = exports.AiSymptomAnalysisService = void 0;
const database_1 = require("@medthread/database");
class AiSymptomAnalysisService {
    /**
     * Analyze symptoms and suggest possible conditions
     * This is a rule-based system - can be enhanced with actual AI/ML models
     */
    async analyzeSymptoms(input) {
        const { symptoms } = input;
        // Emergency red flags
        const redFlags = this.detectRedFlags(symptoms);
        // Analyze symptom patterns
        const possibleConditions = this.matchSymptomPatterns(symptoms);
        // Recommend specialty
        const specialtyRecommendation = this.recommendSpecialty(symptoms, possibleConditions);
        // Generate recommendations
        const recommendedActions = this.generateRecommendations(symptoms, possibleConditions, redFlags);
        // Emergency warning
        const emergencyWarning = redFlags.length > 0
            ? 'URGENT: You have symptoms that may require immediate medical attention. Please seek emergency care or call emergency services.'
            : undefined;
        return {
            possibleConditions,
            redFlags,
            recommendedActions,
            specialtyRecommendation,
            emergencyWarning
        };
    }
    /**
     * Detect emergency red flags
     */
    detectRedFlags(symptoms) {
        const redFlags = [];
        const description = symptoms.description.toLowerCase();
        const primarySymptoms = symptoms.primarySymptoms.map((s) => s.toLowerCase());
        // Cardiovascular red flags
        if (primarySymptoms.some(s => s.includes('chest pain') || s.includes('chest pressure'))) {
            redFlags.push('Chest pain - possible cardiac emergency');
        }
        // Neurological red flags
        if (primarySymptoms.some(s => s.includes('severe headache') ||
            s.includes('confusion') ||
            s.includes('loss of consciousness') ||
            s.includes('seizure'))) {
            redFlags.push('Neurological symptoms - requires immediate evaluation');
        }
        // Respiratory red flags
        if (primarySymptoms.some(s => s.includes('difficulty breathing') ||
            s.includes('shortness of breath') ||
            s.includes('cannot breathe'))) {
            redFlags.push('Severe respiratory distress - seek emergency care');
        }
        // Bleeding/trauma
        if (description.includes('severe bleeding') || description.includes('heavy bleeding')) {
            redFlags.push('Severe bleeding - requires immediate attention');
        }
        // Abdominal emergencies
        if (primarySymptoms.some(s => s.includes('severe abdominal pain')) &&
            description.includes('sudden')) {
            redFlags.push('Acute abdomen - possible surgical emergency');
        }
        // Allergic reactions
        if (primarySymptoms.some(s => s.includes('swelling') &&
            (s.includes('throat') || s.includes('tongue') || s.includes('face')))) {
            redFlags.push('Possible anaphylaxis - seek emergency care immediately');
        }
        return redFlags;
    }
    /**
     * Match symptoms to possible conditions
     */
    matchSymptomPatterns(symptoms) {
        const conditions = [];
        const primarySymptoms = symptoms.primarySymptoms.map((s) => s.toLowerCase());
        const description = symptoms.description.toLowerCase();
        // Common cold/flu
        if (this.hasSymptoms(primarySymptoms, ['fever', 'cough', 'runny nose', 'sore throat'])) {
            conditions.push({
                condition: 'Common Cold or Influenza',
                probability: 75,
                reasoning: 'Classic upper respiratory infection symptoms',
                urgency: 'low'
            });
        }
        // COVID-19
        if (this.hasSymptoms(primarySymptoms, ['fever', 'cough', 'loss of taste', 'loss of smell'])) {
            conditions.push({
                condition: 'COVID-19',
                probability: 70,
                reasoning: 'Symptoms consistent with COVID-19 infection',
                urgency: 'medium'
            });
        }
        // Migraine
        if (this.hasSymptoms(primarySymptoms, ['headache', 'nausea']) &&
            (description.includes('severe') || description.includes('throbbing'))) {
            conditions.push({
                condition: 'Migraine',
                probability: 65,
                reasoning: 'Severe headache with associated symptoms',
                urgency: 'medium'
            });
        }
        // Gastroenteritis
        if (this.hasSymptoms(primarySymptoms, ['nausea', 'vomiting', 'diarrhea'])) {
            conditions.push({
                condition: 'Gastroenteritis',
                probability: 70,
                reasoning: 'Gastrointestinal symptoms suggest stomach infection',
                urgency: 'low'
            });
        }
        // Urinary tract infection
        if (this.hasSymptoms(primarySymptoms, ['burning urination', 'frequent urination', 'pain'])) {
            conditions.push({
                condition: 'Urinary Tract Infection',
                probability: 75,
                reasoning: 'Classic UTI symptoms',
                urgency: 'medium'
            });
        }
        // Hypertension
        if (this.hasSymptoms(primarySymptoms, ['headache', 'dizziness']) &&
            symptoms.existingConditions?.includes('hypertension')) {
            conditions.push({
                condition: 'Hypertensive Crisis',
                probability: 60,
                reasoning: 'Symptoms with history of hypertension',
                urgency: 'high'
            });
        }
        // Anxiety/Panic attack
        if (this.hasSymptoms(primarySymptoms, ['chest pain', 'rapid heartbeat', 'shortness of breath', 'sweating'])) {
            conditions.push({
                condition: 'Anxiety or Panic Attack',
                probability: 55,
                reasoning: 'Symptoms consistent with anxiety, but cardiac causes must be ruled out',
                urgency: 'medium'
            });
        }
        // Diabetes complications
        if (this.hasSymptoms(primarySymptoms, ['excessive thirst', 'frequent urination', 'fatigue'])) {
            conditions.push({
                condition: 'Diabetes or Hyperglycemia',
                probability: 65,
                reasoning: 'Classic diabetes symptoms',
                urgency: 'medium'
            });
        }
        // Allergic reaction
        if (this.hasSymptoms(primarySymptoms, ['rash', 'itching', 'swelling'])) {
            conditions.push({
                condition: 'Allergic Reaction',
                probability: 70,
                reasoning: 'Symptoms suggest allergic response',
                urgency: description.includes('throat') || description.includes('breathing') ? 'emergency' : 'low'
            });
        }
        // Sort by probability
        return conditions.sort((a, b) => b.probability - a.probability).slice(0, 5);
    }
    /**
     * Helper to check if symptoms match pattern
     */
    hasSymptoms(symptoms, pattern) {
        const matchCount = pattern.filter(p => symptoms.some(s => s.includes(p))).length;
        // At least 50% of pattern symptoms must match
        return matchCount >= Math.ceil(pattern.length * 0.5);
    }
    /**
     * Recommend medical specialty
     */
    recommendSpecialty(symptoms, conditions) {
        const primarySymptoms = symptoms.primarySymptoms.map((s) => s.toLowerCase());
        // Cardiology
        if (primarySymptoms.some(s => s.includes('chest') || s.includes('heart') || s.includes('palpitation'))) {
            return 'Cardiology';
        }
        // Neurology
        if (primarySymptoms.some(s => s.includes('headache') || s.includes('dizziness') || s.includes('seizure') || s.includes('numbness'))) {
            return 'Neurology';
        }
        // Gastroenterology
        if (primarySymptoms.some(s => s.includes('stomach') || s.includes('abdominal') || s.includes('nausea') || s.includes('diarrhea'))) {
            return 'Gastroenterology';
        }
        // Pulmonology
        if (primarySymptoms.some(s => s.includes('breathing') || s.includes('cough') || s.includes('lung'))) {
            return 'Pulmonology';
        }
        // Dermatology
        if (primarySymptoms.some(s => s.includes('rash') || s.includes('skin') || s.includes('itching'))) {
            return 'Dermatology';
        }
        // Orthopedics
        if (primarySymptoms.some(s => s.includes('joint') || s.includes('bone') || s.includes('fracture'))) {
            return 'Orthopedics';
        }
        // Default to General Medicine
        return 'General Medicine';
    }
    /**
     * Generate recommended actions
     */
    generateRecommendations(symptoms, conditions, redFlags) {
        const recommendations = [];
        // Emergency recommendations
        if (redFlags.length > 0) {
            recommendations.push('Seek immediate emergency medical care');
            recommendations.push('Call emergency services (911) if symptoms worsen');
            return recommendations;
        }
        // High urgency
        if (conditions.some(c => c.urgency === 'high')) {
            recommendations.push('Schedule an urgent appointment with a doctor within 24 hours');
            recommendations.push('Monitor symptoms closely and seek emergency care if they worsen');
        }
        // Medium urgency
        if (conditions.some(c => c.urgency === 'medium')) {
            recommendations.push('Schedule an appointment with a doctor within 2-3 days');
            recommendations.push('Keep track of your symptoms and their progression');
        }
        // General recommendations
        recommendations.push('Stay hydrated and get adequate rest');
        recommendations.push('Avoid self-medication without consulting a healthcare provider');
        recommendations.push('Document your symptoms, including when they started and any triggers');
        // Severity-based recommendations
        if (symptoms.severity === 'HIGH' || symptoms.severity === 'EMERGENCY') {
            recommendations.push('Do not delay seeking medical attention');
        }
        return recommendations;
    }
    /**
     * Get AI analysis for a thread
     */
    async analyzeThread(threadId) {
        const thread = await database_1.prisma.medicalThread.findUnique({
            where: { id: threadId }
        });
        if (!thread) {
            throw new Error('Thread not found');
        }
        const analysis = await this.analyzeSymptoms({ symptoms: thread.symptoms });
        // Store analysis in thread
        await database_1.prisma.medicalThread.update({
            where: { id: threadId },
            data: {
                aiAnalysis: analysis
            }
        });
        return analysis;
    }
}
exports.AiSymptomAnalysisService = AiSymptomAnalysisService;
exports.aiSymptomAnalysisService = new AiSymptomAnalysisService();
