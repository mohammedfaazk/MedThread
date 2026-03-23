"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthInsightsService = exports.HealthInsightsService = void 0;
const database_1 = require("@medthread/database");
class HealthInsightsService {
    /**
     * Generate trending symptoms insight
     */
    async generateTrendingSymptoms(timeframe = 'week') {
        const startDate = this.getStartDate(timeframe);
        const previousStartDate = this.getPreviousStartDate(timeframe);
        // Get threads from current period
        const currentThreads = await database_1.prisma.medicalThread.findMany({
            where: {
                createdAt: { gte: startDate }
            },
            select: {
                symptoms: true,
                tags: true,
                severityScore: true
            }
        });
        // Get threads from previous period for comparison
        const previousThreads = await database_1.prisma.medicalThread.findMany({
            where: {
                createdAt: {
                    gte: previousStartDate,
                    lt: startDate
                }
            },
            select: {
                symptoms: true,
                tags: true
            }
        });
        // Extract and count symptoms
        const currentSymptomCounts = this.countSymptoms(currentThreads);
        const previousSymptomCounts = this.countSymptoms(previousThreads);
        // Calculate growth rates and generate insights
        const insights = [];
        for (const [symptom, currentCount] of Object.entries(currentSymptomCounts)) {
            const previousCount = previousSymptomCounts[symptom] || 0;
            const growthRate = previousCount > 0
                ? ((currentCount - previousCount) / previousCount) * 100
                : 100;
            // Only include if significant growth or high volume
            if (growthRate > 20 || currentCount > 10) {
                insights.push({
                    type: 'symptom',
                    title: `${symptom} cases trending`,
                    description: `${currentCount} cases reported in the last ${timeframe}`,
                    growthRate: Math.round(growthRate),
                    caseCount: currentCount,
                    timeframe,
                    severity: this.calculateSeverity(currentCount, growthRate)
                });
            }
        }
        return insights.sort((a, b) => b.growthRate - a.growthRate).slice(0, 10);
    }
    /**
     * Generate regional health alerts
     */
    async generateRegionalAlerts() {
        const startDate = this.getStartDate('week');
        const threads = await database_1.prisma.medicalThread.findMany({
            where: {
                createdAt: { gte: startDate }
            },
            include: {
                patient: {
                    select: {
                        clinicAddress: true // Using as proxy for region
                    }
                }
            }
        });
        // Group by region and symptom
        const regionalData = new Map();
        threads.forEach((thread) => {
            const region = this.extractRegion(thread.patient.clinicAddress);
            if (!region)
                return;
            if (!regionalData.has(region)) {
                regionalData.set(region, new Map());
            }
            const symptoms = this.extractSymptoms(thread.symptoms);
            symptoms.forEach(symptom => {
                const regionMap = regionalData.get(region);
                regionMap.set(symptom, (regionMap.get(symptom) || 0) + 1);
            });
        });
        // Generate alerts for regions with unusual patterns
        const alerts = [];
        regionalData.forEach((symptomMap, region) => {
            symptomMap.forEach((count, symptom) => {
                if (count >= 5) { // Threshold for alert
                    alerts.push({
                        region,
                        symptom,
                        caseCount: count,
                        severity: count >= 10 ? 'high' : 'medium',
                        alert: `${count} cases of ${symptom} reported in ${region}`,
                        recommendation: 'Monitor for potential outbreak'
                    });
                }
            });
        });
        return alerts.sort((a, b) => b.caseCount - a.caseCount);
    }
    /**
     * Analyze medication patterns
     */
    async analyzeMedicationPatterns() {
        const threads = await database_1.prisma.medicalThread.findMany({
            where: {
                createdAt: { gte: this.getStartDate('month') }
            },
            include: {
                replies: {
                    where: {
                        author: {
                            role: 'DOCTOR',
                            doctorVerificationStatus: 'APPROVED'
                        }
                    },
                    select: {
                        content: true
                    }
                }
            }
        });
        const medicationData = new Map();
        // Extract medication mentions from doctor replies
        threads.forEach(thread => {
            thread.replies.forEach(reply => {
                const medications = this.extractMedications(reply.content);
                const conditions = thread.tags;
                medications.forEach(med => {
                    if (!medicationData.has(med)) {
                        medicationData.set(med, {
                            mentions: 0,
                            sideEffects: new Map(),
                            positive: 0,
                            negative: 0,
                            neutral: 0,
                            conditions: new Set()
                        });
                    }
                    const data = medicationData.get(med);
                    data.mentions++;
                    conditions.forEach(c => data.conditions.add(c));
                    // Extract sentiment and side effects
                    const sentiment = this.analyzeSentiment(reply.content, med);
                    if (sentiment === 'positive')
                        data.positive++;
                    else if (sentiment === 'negative')
                        data.negative++;
                    else
                        data.neutral++;
                    const sideEffects = this.extractSideEffects(reply.content, med);
                    sideEffects.forEach(effect => {
                        data.sideEffects.set(effect, (data.sideEffects.get(effect) || 0) + 1);
                    });
                });
            });
        });
        // Convert to array and format
        const patterns = [];
        medicationData.forEach((data, medication) => {
            if (data.mentions >= 3) { // Minimum threshold
                patterns.push({
                    medicationName: medication,
                    mentionCount: data.mentions,
                    sideEffects: Array.from(data.sideEffects.entries())
                        .map(([effect, frequency]) => ({
                        effect,
                        frequency,
                        severity: frequency > 2 ? 'common' : 'rare'
                    }))
                        .sort((a, b) => b.frequency - a.frequency),
                    efficacy: {
                        positive: data.positive,
                        negative: data.negative,
                        neutral: data.neutral
                    },
                    commonConditions: Array.from(data.conditions)
                });
            }
        });
        return patterns.sort((a, b) => b.mentionCount - a.mentionCount);
    }
    /**
     * Get diagnostic patterns and common misdiagnoses
     */
    async getDiagnosticPatterns() {
        const threads = await database_1.prisma.medicalThread.findMany({
            where: {
                isResolved: true,
                createdAt: { gte: this.getStartDate('month') }
            },
            include: {
                replies: {
                    where: {
                        author: {
                            role: 'DOCTOR',
                            doctorVerificationStatus: 'APPROVED'
                        }
                    },
                    orderBy: {
                        createdAt: 'asc'
                    },
                    select: {
                        content: true,
                        createdAt: true
                    }
                }
            }
        });
        const patterns = [];
        threads.forEach(thread => {
            const symptoms = this.extractSymptoms(thread.symptoms);
            const diagnoses = thread.replies
                .map(r => this.extractDiagnoses(r.content))
                .flat();
            if (diagnoses.length > 1) {
                // Multiple diagnoses suggested - potential misdiagnosis pattern
                patterns.push({
                    symptoms: symptoms.join(', '),
                    initialDiagnosis: diagnoses[0],
                    finalDiagnosis: diagnoses[diagnoses.length - 1],
                    differentialCount: diagnoses.length,
                    tags: thread.tags
                });
            }
        });
        // Group by symptom combinations
        const grouped = new Map();
        patterns.forEach(p => {
            const key = p.symptoms;
            if (!grouped.has(key)) {
                grouped.set(key, []);
            }
            grouped.get(key).push(p);
        });
        // Find common misdiagnosis patterns
        const commonPatterns = [];
        grouped.forEach((cases, symptoms) => {
            if (cases.length >= 3) {
                const misdiagnoses = new Map();
                cases.forEach(c => {
                    if (c.initialDiagnosis !== c.finalDiagnosis) {
                        const key = `${c.initialDiagnosis} → ${c.finalDiagnosis}`;
                        misdiagnoses.set(key, (misdiagnoses.get(key) || 0) + 1);
                    }
                });
                if (misdiagnoses.size > 0) {
                    commonPatterns.push({
                        symptoms,
                        caseCount: cases.length,
                        commonMisdiagnoses: Array.from(misdiagnoses.entries())
                            .map(([pattern, count]) => ({ pattern, count }))
                            .sort((a, b) => b.count - a.count)
                    });
                }
            }
        });
        return commonPatterns;
    }
    /**
     * Get insights dashboard for doctor
     */
    async getDoctorInsightsDashboard(doctorId, specialty) {
        const [trendingSymptoms, regionalAlerts, medicationPatterns, diagnosticPatterns] = await Promise.all([
            this.generateTrendingSymptoms('week'),
            this.generateRegionalAlerts(),
            this.analyzeMedicationPatterns(),
            this.getDiagnosticPatterns()
        ]);
        // Filter by specialty if provided
        const specialtyFilter = specialty || (await database_1.prisma.user.findUnique({
            where: { id: doctorId },
            select: { specialty: true }
        }))?.specialty;
        return {
            trendingSymptoms: specialtyFilter
                ? trendingSymptoms.filter(s => s.title.toLowerCase().includes(specialtyFilter.toLowerCase()))
                : trendingSymptoms,
            regionalAlerts,
            medicationPatterns: medicationPatterns.slice(0, 10),
            diagnosticPatterns: diagnosticPatterns.slice(0, 5),
            generatedAt: new Date()
        };
    }
    // Helper methods
    getStartDate(timeframe) {
        const now = new Date();
        if (timeframe === 'week') {
            return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    getPreviousStartDate(timeframe) {
        const now = new Date();
        if (timeframe === 'week') {
            return new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        }
        return new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    }
    countSymptoms(threads) {
        const counts = {};
        threads.forEach(thread => {
            const symptoms = this.extractSymptoms(thread.symptoms);
            symptoms.forEach(symptom => {
                counts[symptom] = (counts[symptom] || 0) + 1;
            });
        });
        return counts;
    }
    extractSymptoms(symptomsData) {
        if (typeof symptomsData === 'string') {
            return [symptomsData];
        }
        if (Array.isArray(symptomsData)) {
            return symptomsData;
        }
        if (symptomsData && typeof symptomsData === 'object') {
            return Object.values(symptomsData).flat();
        }
        return [];
    }
    extractRegion(address) {
        if (!address)
            return null;
        // Simple extraction - can be enhanced with geocoding
        const parts = address.split(',');
        return parts[parts.length - 1]?.trim() || null;
    }
    extractMedications(text) {
        // Simple pattern matching - can be enhanced with medical NLP
        const medicationPatterns = [
            /\b(paracetamol|ibuprofen|aspirin|amoxicillin|metformin|atorvastatin)\b/gi,
            /\b([A-Z][a-z]+(?:ol|in|ide|ate|ine))\b/g // Common drug suffixes
        ];
        const medications = new Set();
        medicationPatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                matches.forEach(m => medications.add(m.toLowerCase()));
            }
        });
        return Array.from(medications);
    }
    analyzeSentiment(text, medication) {
        const lowerText = text.toLowerCase();
        const medLower = medication.toLowerCase();
        const positiveWords = ['effective', 'helpful', 'recommend', 'works well', 'good results'];
        const negativeWords = ['side effect', 'adverse', 'not recommended', 'avoid', 'ineffective'];
        const contextWindow = 50; // characters around medication mention
        const medIndex = lowerText.indexOf(medLower);
        if (medIndex === -1)
            return 'neutral';
        const context = lowerText.substring(Math.max(0, medIndex - contextWindow), Math.min(lowerText.length, medIndex + medLower.length + contextWindow));
        const hasPositive = positiveWords.some(word => context.includes(word));
        const hasNegative = negativeWords.some(word => context.includes(word));
        if (hasPositive && !hasNegative)
            return 'positive';
        if (hasNegative && !hasPositive)
            return 'negative';
        return 'neutral';
    }
    extractSideEffects(text, medication) {
        const sideEffectPatterns = [
            /side effects?:?\s*([^.]+)/gi,
            /adverse effects?:?\s*([^.]+)/gi,
            /caused?\s+([^.]+)/gi
        ];
        const effects = new Set();
        sideEffectPatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                matches.forEach(m => {
                    const effect = m.replace(/side effects?:?\s*/gi, '').trim();
                    if (effect.length > 3 && effect.length < 50) {
                        effects.add(effect);
                    }
                });
            }
        });
        return Array.from(effects);
    }
    extractDiagnoses(text) {
        const diagnosisPatterns = [
            /(?:diagnosis|diagnosed with|likely|possibly|could be)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
            /\b(diabetes|hypertension|asthma|depression|anxiety|thyroid)\b/gi
        ];
        const diagnoses = new Set();
        diagnosisPatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                matches.forEach(m => diagnoses.add(m.toLowerCase()));
            }
        });
        return Array.from(diagnoses);
    }
    calculateSeverity(count, growthRate) {
        if (count > 50 && growthRate > 100)
            return 'critical';
        if (count > 30 || growthRate > 75)
            return 'high';
        if (count > 15 || growthRate > 40)
            return 'medium';
        return 'low';
    }
}
exports.HealthInsightsService = HealthInsightsService;
exports.healthInsightsService = new HealthInsightsService();
