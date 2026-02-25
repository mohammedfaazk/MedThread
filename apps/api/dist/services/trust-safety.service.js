"use strict";
/**
 * Trust & Safety Service
 * Handles verification, moderation, and quality control
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.trustSafetyService = exports.TrustSafetyService = void 0;
const database_1 = require("@medthread/database");
class TrustSafetyService {
    /**
     * Submit medical license for verification
     */
    async submitLicenseVerification(data) {
        const { doctorId, licenseNumber, licenseType, issuingAuthority, issuingCountry, issuingState, issueDate, expiryDate, licenseDocumentUrl } = data;
        await database_1.prisma.$executeRaw `
      INSERT INTO "MedicalLicenseVerification" (
        doctor_id, license_number, license_type,
        issuing_authority, issuing_country, issuing_state,
        issue_date, expiry_date, license_document_url,
        verification_status, verification_method
      ) VALUES (
        ${doctorId}, ${licenseNumber}, ${licenseType},
        ${issuingAuthority}, ${issuingCountry}, ${issuingState || null},
        ${issueDate}, ${expiryDate}, ${licenseDocumentUrl || null},
        'pending', 'document_upload'
      )
      ON CONFLICT (license_number, issuing_authority) DO UPDATE
      SET license_document_url = ${licenseDocumentUrl || null},
          updated_at = CURRENT_TIMESTAMP
    `;
        return { success: true, message: 'License submitted for verification' };
    }
    /**
     * Verify medical license (admin action)
     */
    async verifyLicense(licenseId, verifiedBy, approved, notes) {
        const status = approved ? 'verified' : 'rejected';
        await database_1.prisma.$executeRaw `
      UPDATE "MedicalLicenseVerification"
      SET verification_status = ${status},
          verified_by = ${verifiedBy},
          verified_at = CURRENT_TIMESTAMP,
          verification_notes = ${notes || null},
          rejection_reason = ${!approved ? notes : null}
      WHERE id = ${licenseId}
    `;
        if (approved) {
            // Update doctor's verification status
            const license = await database_1.prisma.$queryRaw `
        SELECT doctor_id FROM "MedicalLicenseVerification" WHERE id = ${licenseId}
      `;
            if (license.length > 0) {
                await database_1.prisma.$executeRaw `
          UPDATE "User"
          SET license_verified = true,
              license_verification_date = CURRENT_TIMESTAMP,
              verified = true
          WHERE id = ${license[0].doctor_id}
        `;
                // Recalculate trust score
                await this.calculateTrustScore(license[0].doctor_id, 'doctor');
            }
        }
        return { success: true };
    }
    /**
     * Submit hospital affiliation for verification
     */
    async submitHospitalAffiliation(data) {
        const { doctorId, hospitalName, hospitalAddress, hospitalCity, hospitalState, hospitalCountry, affiliationType, department, position, startDate, endDate, isCurrent } = data;
        await database_1.prisma.$executeRaw `
      INSERT INTO "HospitalAffiliationVerification" (
        doctor_id, hospital_name, hospital_address,
        hospital_city, hospital_state, hospital_country,
        affiliation_type, department, position,
        start_date, end_date, is_current,
        verification_status
      ) VALUES (
        ${doctorId}, ${hospitalName}, ${hospitalAddress || null},
        ${hospitalCity || null}, ${hospitalState || null}, ${hospitalCountry || null},
        ${affiliationType}, ${department || null}, ${position || null},
        ${startDate}, ${endDate || null}, ${isCurrent},
        'pending'
      )
    `;
        return { success: true, message: 'Hospital affiliation submitted for verification' };
    }
    /**
     * Verify hospital affiliation (admin action)
     */
    async verifyHospitalAffiliation(affiliationId, verifiedBy, approved, notes) {
        const status = approved ? 'verified' : 'rejected';
        await database_1.prisma.$executeRaw `
      UPDATE "HospitalAffiliationVerification"
      SET verification_status = ${status},
          verified_by = ${verifiedBy},
          verified_at = CURRENT_TIMESTAMP,
          verification_notes = ${notes || null},
          rejection_reason = ${!approved ? notes : null}
      WHERE id = ${affiliationId}
    `;
        if (approved) {
            const affiliation = await database_1.prisma.$queryRaw `
        SELECT doctor_id FROM "HospitalAffiliationVerification" WHERE id = ${affiliationId}
      `;
            if (affiliation.length > 0) {
                await database_1.prisma.$executeRaw `
          UPDATE "User"
          SET hospital_verified = true
          WHERE id = ${affiliation[0].doctor_id}
        `;
                await this.calculateTrustScore(affiliation[0].doctor_id, 'doctor');
            }
        }
        return { success: true };
    }
    /**
     * Create peer endorsement
     */
    async createPeerEndorsement(data) {
        const { endorserId, endorsedId, endorsementType, specialtyArea, endorsementText, relationshipType, yearsKnown, workedTogether } = data;
        // Check if endorser is a verified doctor
        const endorser = await database_1.prisma.$queryRaw `
      SELECT role, license_verified FROM "User" WHERE id = ${endorserId}
    `;
        if (endorser.length === 0 || !['DOCTOR', 'NURSE', 'PHARMACIST'].includes(endorser[0].role)) {
            throw new Error('Only verified healthcare professionals can endorse');
        }
        await database_1.prisma.$executeRaw `
      INSERT INTO "PeerEndorsement" (
        endorser_id, endorsed_id, endorsement_type,
        specialty_area, endorsement_text, relationship_type,
        years_known, worked_together, is_verified
      ) VALUES (
        ${endorserId}, ${endorsedId}, ${endorsementType},
        ${specialtyArea || null}, ${endorsementText || null}, ${relationshipType},
        ${yearsKnown || null}, ${workedTogether}, ${endorser[0].license_verified}
      )
      ON CONFLICT (endorser_id, endorsed_id, endorsement_type) DO UPDATE
      SET endorsement_text = ${endorsementText || null},
          updated_at = CURRENT_TIMESTAMP
    `;
        // Update endorsement count
        await database_1.prisma.$executeRaw `
      UPDATE "User"
      SET peer_endorsement_count = (
        SELECT COUNT(*) FROM "PeerEndorsement"
        WHERE endorsed_id = ${endorsedId} AND status = 'active'
      )
      WHERE id = ${endorsedId}
    `;
        await this.calculateTrustScore(endorsedId, 'doctor');
        return { success: true };
    }
    /**
     * Verify patient identity for reviews
     */
    async verifyPatientIdentity(data) {
        const { patientId, verificationMethod, appointmentId, fullName, dateOfBirth, phoneNumber, email } = data;
        let verificationLevel = 'basic';
        let verificationStatus = 'pending';
        // Auto-verify if appointment exists
        if (verificationMethod === 'appointment_history' && appointmentId) {
            const appointment = await database_1.prisma.$queryRaw `
        SELECT id FROM "Appointment"
        WHERE id = ${appointmentId}
          AND "patientId" = ${patientId}
          AND status = 'COMPLETED'
      `;
            if (appointment.length > 0) {
                verificationStatus = 'verified';
                verificationLevel = 'standard';
            }
        }
        await database_1.prisma.$executeRaw `
      INSERT INTO "PatientIdentityVerification" (
        patient_id, verification_method, full_name,
        date_of_birth, phone_number, email,
        verified_appointment_id, verification_status, verification_level
      ) VALUES (
        ${patientId}, ${verificationMethod}, ${fullName || null},
        ${dateOfBirth || null}, ${phoneNumber || null}, ${email || null},
        ${appointmentId || null}, ${verificationStatus}, ${verificationLevel}
      )
      ON CONFLICT (patient_id, verification_method) DO UPDATE
      SET verification_status = ${verificationStatus},
          verification_level = ${verificationLevel},
          updated_at = CURRENT_TIMESTAMP
    `;
        if (verificationStatus === 'verified') {
            await database_1.prisma.$executeRaw `
        UPDATE "User"
        SET identity_verified = true
        WHERE id = ${patientId}
      `;
            await this.calculateTrustScore(patientId, 'patient');
        }
        return { success: true, verificationStatus, verificationLevel };
    }
    /**
     * AI content moderation
     */
    async moderateContent(data) {
        const { contentType, contentId, authorId, contentText } = data;
        // Simulate AI analysis (in production, call actual AI service)
        const aiAnalysis = this.analyzeContentWithAI(contentText);
        await database_1.prisma.$executeRaw `
      INSERT INTO "ContentModeration" (
        content_type, content_id, author_id, content_text,
        ai_flagged, ai_confidence_score, ai_flag_reasons,
        ai_analyzed_at, moderation_status, severity_level
      ) VALUES (
        ${contentType}, ${contentId}, ${authorId}, ${contentText},
        ${aiAnalysis.flagged}, ${aiAnalysis.confidence}, ${aiAnalysis.reasons},
        CURRENT_TIMESTAMP, ${aiAnalysis.flagged ? 'requires_review' : 'approved'},
        ${aiAnalysis.severity}
      )
    `;
        if (aiAnalysis.flagged && aiAnalysis.severity === 'critical') {
            // Auto-remove critical content
            await this.takeModeration;
            Action(contentType, contentId, 'content_removed', authorId);
        }
        return { flagged: aiAnalysis.flagged, severity: aiAnalysis.severity };
    }
    /**
     * Simulate AI content analysis
     */
    analyzeContentWithAI(content) {
        const flagged = false;
        const confidence = 0;
        const reasons = [];
        let severity = 'low';
        // Simple keyword-based detection (replace with actual AI in production)
        const inappropriateWords = ['spam', 'scam', 'fake'];
        const medicalMisinformation = ['cure cancer with', 'miracle cure'];
        inappropriateWords.forEach(word => {
            if (content.toLowerCase().includes(word)) {
                reasons.push('inappropriate_language');
                severity = 'medium';
            }
        });
        medicalMisinformation.forEach(phrase => {
            if (content.toLowerCase().includes(phrase)) {
                reasons.push('medical_misinformation');
                severity = 'high';
            }
        });
        return {
            flagged: reasons.length > 0,
            confidence: reasons.length > 0 ? 75 : 10,
            reasons,
            severity
        };
    }
    /**
     * Take moderation action
     */
    async takeModerationAction(contentType, contentId, action, authorId) {
        if (action === 'content_removed') {
            // Mark content as removed
            if (contentType === 'post') {
                await database_1.prisma.$executeRaw `UPDATE "Post" SET deleted = true WHERE id = ${contentId}`;
            }
            else if (contentType === 'comment') {
                await database_1.prisma.$executeRaw `UPDATE "Comment" SET deleted = true WHERE id = ${contentId}`;
            }
            // Increment violation count
            await database_1.prisma.$executeRaw `
        UPDATE "User"
        SET content_violations = content_violations + 1
        WHERE id = ${authorId}
      `;
        }
    }
    /**
     * Request peer review of medical advice
     */
    async requestPeerReview(data) {
        const { contentType, contentId, authorId, contentText, requestReason, requestedBy } = data;
        await database_1.prisma.$executeRaw `
      INSERT INTO "MedicalAdvicePeerReview" (
        content_type, content_id, author_id, content_text,
        request_reason, requested_by, review_status
      ) VALUES (
        ${contentType}, ${contentId}, ${authorId}, ${contentText},
        ${requestReason}, ${requestedBy || null}, 'pending'
      )
    `;
        return { success: true, message: 'Peer review requested' };
    }
    /**
     * Submit peer review
     */
    async submitPeerReview(reviewId, reviewerId, data) {
        const { reviewOutcome, reviewFeedback, suggestedCorrections, medicalAccuracyScore, severityLevel, requiresImmediateAction } = data;
        await database_1.prisma.$executeRaw `
      UPDATE "MedicalAdvicePeerReview"
      SET reviewer_id = ${reviewerId},
          review_status = 'completed',
          review_outcome = ${reviewOutcome},
          review_feedback = ${reviewFeedback},
          suggested_corrections = ${suggestedCorrections || null},
          medical_accuracy_score = ${medicalAccuracyScore},
          severity_level = ${severityLevel},
          requires_immediate_action = ${requiresImmediateAction},
          completed_at = CURRENT_TIMESTAMP
      WHERE id = ${reviewId}
    `;
        return { success: true };
    }
    /**
     * Flag conflicting diagnosis
     */
    async flagConflictingDiagnosis(data) {
        await database_1.prisma.$executeRaw `
      INSERT INTO "ConflictingDiagnosis" (
        post_id, patient_id,
        response_1_id, response_1_doctor_id, response_1_diagnosis,
        response_2_id, response_2_doctor_id, response_2_diagnosis,
        conflict_type, conflict_severity, resolution_status
      ) VALUES (
        ${data.postId}, ${data.patientId},
        ${data.response1Id}, ${data.response1DoctorId}, ${data.response1Diagnosis},
        ${data.response2Id}, ${data.response2DoctorId}, ${data.response2Diagnosis},
        ${data.conflictType}, ${data.conflictSeverity}, 'pending'
      )
    `;
        // Notify patient if severity is high
        if (data.conflictSeverity === 'major' || data.conflictSeverity === 'critical') {
            // Send notification (implement notification service)
        }
        return { success: true };
    }
    /**
     * Trigger doctor quality review
     */
    async triggerQualityReview(doctorId, triggerType, triggerDetails) {
        const periodEnd = new Date();
        const periodStart = new Date();
        periodStart.setMonth(periodStart.getMonth() - 3); // Last 3 months
        // Get doctor metrics
        const metrics = await database_1.prisma.$queryRaw `
      SELECT 
        u.overall_rating,
        u.total_reviews,
        u.response_time_avg,
        dr.consultation_success_rate
      FROM "User" u
      LEFT JOIN "DoctorRating" dr ON u.id = dr.doctor_id
      WHERE u.id = ${doctorId}
    `;
        const doctorMetrics = metrics[0] || {};
        await database_1.prisma.$executeRaw `
      INSERT INTO "DoctorQualityReview" (
        doctor_id, trigger_type, trigger_details,
        review_period_start, review_period_end,
        average_rating, total_reviews, response_time_avg,
        consultation_success_rate, review_status
      ) VALUES (
        ${doctorId}, ${triggerType}, ${triggerDetails},
        ${periodStart}, ${periodEnd},
        ${doctorMetrics.overall_rating || 0}, ${doctorMetrics.total_reviews || 0},
        ${doctorMetrics.response_time_avg || 0}, ${doctorMetrics.consultation_success_rate || 0},
        'pending'
      )
    `;
        return { success: true, message: 'Quality review initiated' };
    }
    /**
     * Calculate trust score
     */
    async calculateTrustScore(userId, userType) {
        const result = await database_1.prisma.$queryRaw `
      SELECT calculate_trust_score(${userId}, ${userType}) as trust_score
    `;
        return result[0]?.trust_score || 50;
    }
    /**
     * Get user trust score
     */
    async getTrustScore(userId) {
        const trustScore = await database_1.prisma.$queryRaw `
      SELECT * FROM "TrustScore" WHERE user_id = ${userId}
    `;
        return trustScore.length > 0 ? trustScore[0] : null;
    }
}
exports.TrustSafetyService = TrustSafetyService;
exports.trustSafetyService = new TrustSafetyService();
