"use strict";
/**
 * Smart Matching Service
 * Intelligent patient-doctor matching based on multiple criteria
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.smartMatchingService = exports.SmartMatchingService = void 0;
const database_1 = require("@medthread/database");
const location_service_1 = require("./location.service");
class SmartMatchingService {
    /**
     * Find best matching doctors for a patient
     */
    async findMatches(patientId, criteria, limit = 10) {
        const { symptoms, patientLocation, preferredLanguage, insuranceProvider, maxDistance = 50, minRating = 4.0, consultationType = 'any', preferredGender = 'any' } = criteria;
        // Get patient preferences
        const preferences = await this.getPatientPreferences(patientId);
        // Find symptom categories
        const symptomCategories = await this.identifySymptomCategories(symptoms);
        const relatedSpecialties = this.extractRelatedSpecialties(symptomCategories);
        // Build doctor query
        let doctorQuery = `
      SELECT DISTINCT
        u.id,
        u.username,
        u.email,
        u.avatar,
        u.specialty,
        u."subSpecialty",
        u."yearsOfExperience",
        u."hospitalAffiliation",
        u.verified,
        u.overall_rating,
        u.total_reviews,
        u.gender,
        dr.response_time_minutes,
        dr.consultation_success_rate,
        dr.patient_satisfaction_score
      FROM "User" u
      INNER JOIN "DoctorRating" dr ON u.id = dr.doctor_id
      WHERE u.role IN ('DOCTOR', 'NURSE', 'PHARMACIST')
        AND u.verified = true
        AND dr.overall_rating >= ${minRating}
    `;
        // Filter by specialty
        if (relatedSpecialties.length > 0) {
            const specialtyList = relatedSpecialties.map(s => `'${s}'`).join(',');
            doctorQuery += ` AND u.specialty IN (${specialtyList})`;
        }
        // Filter by gender
        if (preferredGender !== 'any') {
            doctorQuery += ` AND u.gender = '${preferredGender}'`;
        }
        const doctors = await database_1.prisma.$queryRawUnsafe(doctorQuery);
        // Calculate match scores for each doctor
        const matches = [];
        for (const doctor of doctors) {
            const scores = await this.calculateMatchScores(doctor, criteria, symptomCategories, preferences);
            // Calculate weighted overall score
            const weights = preferences || {
                specialty_weight: 30,
                location_weight: 25,
                availability_weight: 20,
                rating_weight: 15,
                language_weight: 5,
                insurance_weight: 5
            };
            const overallScore = (scores.specialty * weights.specialty_weight / 100) +
                (scores.location * weights.location_weight / 100) +
                (scores.availability * weights.availability_weight / 100) +
                (scores.rating * weights.rating_weight / 100) +
                (scores.language * weights.language_weight / 100) +
                (scores.insurance * weights.insurance_weight / 100);
            // Filter by max distance if location provided
            if (patientLocation && scores.distance && scores.distance > maxDistance) {
                continue;
            }
            matches.push({
                doctor,
                matchScore: Math.round(overallScore * 100) / 100,
                scores: {
                    specialty: scores.specialty,
                    location: scores.location,
                    availability: scores.availability,
                    rating: scores.rating,
                    language: scores.language,
                    insurance: scores.insurance,
                    experience: scores.experience
                },
                distance: scores.distance,
                matchReason: this.generateMatchReason(scores, symptomCategories),
                estimatedWaitTime: scores.estimatedWaitTime
            });
        }
        // Sort by match score
        matches.sort((a, b) => b.matchScore - a.matchScore);
        // Save match results
        await this.saveMatchResults(patientId, matches.slice(0, limit), criteria);
        return matches.slice(0, limit);
    }
    /**
     * Calculate individual match scores
     */
    async calculateMatchScores(doctor, criteria, symptomCategories, preferences) {
        const scores = {
            specialty: 0,
            location: 0,
            availability: 0,
            rating: 0,
            language: 0,
            insurance: 0,
            experience: 0,
            distance: null,
            estimatedWaitTime: null
        };
        // Specialty score (based on expertise)
        const expertise = await database_1.prisma.$queryRaw `
      SELECT success_rate, cases_handled
      FROM "DoctorExpertise"
      WHERE doctor_id = ${doctor.id}
        AND symptom_categories && ${symptomCategories.map(c => c.category_name)}
      ORDER BY success_rate DESC
      LIMIT 1
    `;
        if (expertise.length > 0) {
            scores.specialty = parseFloat(expertise[0].success_rate) || 0;
        }
        else {
            // Fallback to specialty match
            const specialtyMatch = symptomCategories.some(cat => cat.related_specialties.includes(doctor.specialty));
            scores.specialty = specialtyMatch ? 70 : 30;
        }
        // Location score
        if (criteria.patientLocation) {
            const clinics = await database_1.prisma.$queryRaw `
        SELECT 
          ST_Y(location::geometry) as latitude,
          ST_X(location::geometry) as longitude
        FROM "DoctorClinic"
        WHERE doctor_id = ${doctor.id}
        ORDER BY is_primary DESC
        LIMIT 1
      `;
            if (clinics.length > 0) {
                const distance = location_service_1.locationService.calculateDistance(criteria.patientLocation.latitude, criteria.patientLocation.longitude, clinics[0].latitude, clinics[0].longitude);
                scores.distance = distance;
                scores.location = Math.max(0, 100 - (distance * 2));
            }
        }
        else {
            scores.location = 100; // No location preference
        }
        // Availability score
        const availability = await database_1.prisma.$queryRaw `
      SELECT is_available, next_available_slot
      FROM "DoctorAvailability"
      WHERE doctor_id = ${doctor.id}
      ORDER BY next_available_slot ASC
      LIMIT 1
    `;
        if (availability.length > 0 && availability[0].is_available) {
            scores.availability = 100;
            const nextSlot = new Date(availability[0].next_available_slot);
            const now = new Date();
            scores.estimatedWaitTime = Math.max(0, Math.round((nextSlot.getTime() - now.getTime()) / (1000 * 60)));
        }
        else {
            scores.availability = 50;
        }
        // Rating score
        scores.rating = (parseFloat(doctor.overall_rating) / 5) * 100;
        // Language score
        if (criteria.preferredLanguage) {
            const languages = await database_1.prisma.$queryRaw `
        SELECT language_code
        FROM "DoctorLanguage"
        WHERE doctor_id = ${doctor.id}
          AND language_code = ${criteria.preferredLanguage}
      `;
            scores.language = languages.length > 0 ? 100 : 0;
        }
        else {
            scores.language = 100;
        }
        // Insurance score
        if (criteria.insuranceProvider) {
            const insurance = await database_1.prisma.$queryRaw `
        SELECT is_in_network
        FROM "DoctorInsurance"
        WHERE doctor_id = ${doctor.id}
          AND insurance_provider = ${criteria.insuranceProvider}
          AND is_in_network = true
      `;
            scores.insurance = insurance.length > 0 ? 100 : 0;
        }
        else {
            scores.insurance = 100;
        }
        // Experience score (based on case history)
        const caseHistory = await database_1.prisma.$queryRaw `
      SELECT 
        COUNT(*) FILTER (WHERE outcome_status = 'resolved') as resolved,
        COUNT(*) as total
      FROM "CaseHistory"
      WHERE doctor_id = ${doctor.id}
        AND symptom_categories && ${symptomCategories.map(c => c.category_name)}
    `;
        if (caseHistory.length > 0 && caseHistory[0].total > 0) {
            scores.experience = (caseHistory[0].resolved / caseHistory[0].total) * 100;
        }
        else {
            scores.experience = Math.min(100, (doctor.yearsOfExperience || 0) * 10);
        }
        return scores;
    }
    /**
     * Identify symptom categories from symptoms
     */
    async identifySymptomCategories(symptoms) {
        if (symptoms.length === 0)
            return [];
        const categories = await database_1.prisma.$queryRaw `
      SELECT *
      FROM "SymptomCategory"
      WHERE keywords && ${symptoms}
      ORDER BY array_length(keywords & ${symptoms}, 1) DESC
    `;
        return categories;
    }
    /**
     * Extract related specialties from symptom categories
     */
    extractRelatedSpecialties(categories) {
        const specialties = new Set();
        categories.forEach(cat => {
            cat.related_specialties?.forEach((s) => specialties.add(s));
        });
        return Array.from(specialties);
    }
    /**
     * Generate match reason text
     */
    generateMatchReason(scores, categories) {
        const reasons = [];
        if (scores.specialty > 80) {
            reasons.push('High expertise in treating similar cases');
        }
        if (scores.location > 80 && scores.distance) {
            reasons.push(`Nearby location (${scores.distance.toFixed(1)}km)`);
        }
        if (scores.availability === 100) {
            reasons.push('Available soon');
        }
        if (scores.rating > 90) {
            reasons.push('Excellent patient ratings');
        }
        if (scores.experience > 80) {
            reasons.push('Proven track record with similar symptoms');
        }
        return reasons.length > 0 ? reasons.join(' • ') : 'Good overall match';
    }
    /**
     * Get patient matching preferences
     */
    async getPatientPreferences(patientId) {
        const prefs = await database_1.prisma.$queryRaw `
      SELECT *
      FROM "MatchingPreference"
      WHERE patient_id = ${patientId}
    `;
        return prefs.length > 0 ? prefs[0] : null;
    }
    /**
     * Save match results
     */
    async saveMatchResults(patientId, matches, criteria) {
        for (let i = 0; i < matches.length; i++) {
            const match = matches[i];
            await database_1.prisma.$executeRaw `
        INSERT INTO "MatchingResult" (
          patient_id, doctor_id, overall_match_score,
          specialty_score, location_score, availability_score,
          rating_score, language_score, insurance_score, experience_score,
          match_reason, distance_km, estimated_wait_time_minutes,
          rank_position, search_criteria
        ) VALUES (
          ${patientId}, ${match.doctor.id}, ${match.matchScore},
          ${match.scores.specialty}, ${match.scores.location}, ${match.scores.availability},
          ${match.scores.rating}, ${match.scores.language}, ${match.scores.insurance},
          ${match.scores.experience}, ${match.matchReason}, ${match.distance || null},
          ${match.estimatedWaitTime || null}, ${i + 1}, ${JSON.stringify(criteria)}::jsonb
        )
      `;
        }
    }
    /**
     * Update patient preferences
     */
    async updatePatientPreferences(patientId, preferences) {
        await database_1.prisma.$executeRaw `
      INSERT INTO "MatchingPreference" (
        patient_id, specialty_weight, location_weight, availability_weight,
        rating_weight, language_weight, insurance_weight,
        max_distance_km, preferred_languages, required_insurance,
        min_rating, preferred_consultation_type, preferred_gender
      ) VALUES (
        ${patientId}, ${preferences.specialtyWeight || 30},
        ${preferences.locationWeight || 25}, ${preferences.availabilityWeight || 20},
        ${preferences.ratingWeight || 15}, ${preferences.languageWeight || 5},
        ${preferences.insuranceWeight || 5}, ${preferences.maxDistance || 50},
        ${preferences.preferredLanguages || []}, ${preferences.requiredInsurance || null},
        ${preferences.minRating || 4.0}, ${preferences.preferredConsultationType || 'any'},
        ${preferences.preferredGender || 'any'}
      )
      ON CONFLICT (patient_id) DO UPDATE
      SET specialty_weight = ${preferences.specialtyWeight || 30},
          location_weight = ${preferences.locationWeight || 25},
          availability_weight = ${preferences.availabilityWeight || 20},
          rating_weight = ${preferences.ratingWeight || 15},
          language_weight = ${preferences.languageWeight || 5},
          insurance_weight = ${preferences.insuranceWeight || 5},
          max_distance_km = ${preferences.maxDistance || 50},
          preferred_languages = ${preferences.preferredLanguages || []},
          required_insurance = ${preferences.requiredInsurance || null},
          min_rating = ${preferences.minRating || 4.0},
          preferred_consultation_type = ${preferences.preferredConsultationType || 'any'},
          preferred_gender = ${preferences.preferredGender || 'any'},
          updated_at = CURRENT_TIMESTAMP
    `;
    }
    /**
     * Submit matching feedback
     */
    async submitFeedback(matchingResultId, patientId, feedback) {
        const result = await database_1.prisma.$queryRaw `
      SELECT doctor_id FROM "MatchingResult" WHERE id = ${matchingResultId}
    `;
        if (result.length === 0) {
            throw new Error('Matching result not found');
        }
        await database_1.prisma.$executeRaw `
      INSERT INTO "MatchingFeedback" (
        matching_result_id, patient_id, doctor_id,
        was_helpful, feedback_type, feedback_text, match_accuracy_rating
      ) VALUES (
        ${matchingResultId}, ${patientId}, ${result[0].doctor_id},
        ${feedback.wasHelpful}, ${feedback.feedbackType},
        ${feedback.feedbackText || null}, ${feedback.matchAccuracyRating || null}
      )
    `;
    }
    /**
     * Get match details
     */
    async getMatchDetails(matchingResultId) {
        const matches = await database_1.prisma.$queryRaw `
      SELECT 
        mr.*,
        u.username as doctor_name,
        u.avatar as doctor_avatar,
        u.specialty,
        u."yearsOfExperience",
        u.overall_rating,
        u.total_reviews
      FROM "MatchingResult" mr
      INNER JOIN "User" u ON mr.doctor_id = u.id
      WHERE mr.id = ${matchingResultId}
    `;
        return matches.length > 0 ? matches[0] : null;
    }
}
exports.SmartMatchingService = SmartMatchingService;
exports.smartMatchingService = new SmartMatchingService();
