/**
 * Trust & Safety Service
 * Handles verification, moderation, and quality control
 */

import { prisma } from '@medthread/database';

interface LicenseVerificationData {
  doctorId: string;
  licenseNumber: string;
  licenseType: string;
  issuingAuthority: string;
  issuingCountry: string;
  issuingState?: string;
  issueDate: Date;
  expiryDate: Date;
  licenseDocumentUrl?: string;
}

interface HospitalAffiliationData {
  doctorId: string;
  hospitalName: string;
  hospitalAddress?: string;
  hospitalCity?: string;
  hospitalState?: string;
  hospitalCountry?: string;
  affiliationType: string;
  department?: string;
  position?: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
}

export class TrustSafetyService {
  /**
   * Submit medical license for verification
   */
  async submitLicenseVerification(data: LicenseVerificationData) {
    const {
      doctorId,
      licenseNumber,
      licenseType,
      issuingAuthority,
      issuingCountry,
      issuingState,
      issueDate,
      expiryDate,
      licenseDocumentUrl
    } = data;

    await prisma.$executeRaw`
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
  async verifyLicense(licenseId: number, verifiedBy: string, approved: boolean, notes?: string) {
    const status = approved ? 'verified' : 'rejected';

    await prisma.$executeRaw`
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
      const license = await prisma.$queryRaw<any[]>`
        SELECT doctor_id FROM "MedicalLicenseVerification" WHERE id = ${licenseId}
      `;

      if (license.length > 0) {
        await prisma.$executeRaw`
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
  async submitHospitalAffiliation(data: HospitalAffiliationData) {
    const {
      doctorId,
      hospitalName,
      hospitalAddress,
      hospitalCity,
      hospitalState,
      hospitalCountry,
      affiliationType,
      department,
      position,
      startDate,
      endDate,
      isCurrent
    } = data;

    await prisma.$executeRaw`
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
  async verifyHospitalAffiliation(affiliationId: number, verifiedBy: string, approved: boolean, notes?: string) {
    const status = approved ? 'verified' : 'rejected';

    await prisma.$executeRaw`
      UPDATE "HospitalAffiliationVerification"
      SET verification_status = ${status},
          verified_by = ${verifiedBy},
          verified_at = CURRENT_TIMESTAMP,
          verification_notes = ${notes || null},
          rejection_reason = ${!approved ? notes : null}
      WHERE id = ${affiliationId}
    `;

    if (approved) {
      const affiliation = await prisma.$queryRaw<any[]>`
        SELECT doctor_id FROM "HospitalAffiliationVerification" WHERE id = ${affiliationId}
      `;

      if (affiliation.length > 0) {
        await prisma.$executeRaw`
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
  async createPeerEndorsement(data: {
    endorserId: string;
    endorsedId: string;
    endorsementType: string;
    specialtyArea?: string;
    endorsementText?: string;
    relationshipType: string;
    yearsKnown?: number;
    workedTogether: boolean;
  }) {
    const {
      endorserId,
      endorsedId,
      endorsementType,
      specialtyArea,
      endorsementText,
      relationshipType,
      yearsKnown,
      workedTogether
    } = data;

    // Check if endorser is a verified doctor
    const endorser = await prisma.$queryRaw<any[]>`
      SELECT role, license_verified FROM "User" WHERE id = ${endorserId}
    `;

    if (endorser.length === 0 || !['DOCTOR', 'NURSE', 'PHARMACIST'].includes(endorser[0].role)) {
      throw new Error('Only verified healthcare professionals can endorse');
    }

    await prisma.$executeRaw`
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
    await prisma.$executeRaw`
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
  async verifyPatientIdentity(data: {
    patientId: string;
    verificationMethod: string;
    appointmentId?: string;
    fullName?: string;
    dateOfBirth?: Date;
    phoneNumber?: string;
    email?: string;
  }) {
    const {
      patientId,
      verificationMethod,
      appointmentId,
      fullName,
      dateOfBirth,
      phoneNumber,
      email
    } = data;

    let verificationLevel = 'basic';
    let verificationStatus = 'pending';

    // Auto-verify if appointment exists
    if (verificationMethod === 'appointment_history' && appointmentId) {
      const appointment = await prisma.$queryRaw<any[]>`
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

    await prisma.$executeRaw`
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
      await prisma.$executeRaw`
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
  async moderateContent(data: {
    contentType: string;
    contentId: string;
    authorId: string;
    contentText: string;
  }) {
    const { contentType, contentId, authorId, contentText } = data;

    // Simulate AI analysis (in production, call actual AI service)
    const aiAnalysis = this.analyzeContentWithAI(contentText);

    await prisma.$executeRaw`
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
      await this.takeModerationAction(contentType, contentId, 'content_removed', authorId);
    }

    return { flagged: aiAnalysis.flagged, severity: aiAnalysis.severity };
  }

  /**
   * Simulate AI content analysis
   */
  private analyzeContentWithAI(content: string) {
    const flagged = false;
    const confidence = 0;
    const reasons: string[] = [];
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
  private async takeModerationAction(contentType: string, contentId: string, action: string, authorId: string) {
    if (action === 'content_removed') {
      // Mark content as removed
      if (contentType === 'post') {
        await prisma.$executeRaw`UPDATE "Post" SET deleted = true WHERE id = ${contentId}`;
      } else if (contentType === 'comment') {
        await prisma.$executeRaw`UPDATE "Comment" SET deleted = true WHERE id = ${contentId}`;
      }

      // Increment violation count
      await prisma.$executeRaw`
        UPDATE "User"
        SET content_violations = content_violations + 1
        WHERE id = ${authorId}
      `;
    }
  }

  /**
   * Request peer review of medical advice
   */
  async requestPeerReview(data: {
    contentType: string;
    contentId: string;
    authorId: string;
    contentText: string;
    requestReason: string;
    requestedBy?: string;
  }) {
    const { contentType, contentId, authorId, contentText, requestReason, requestedBy } = data;

    await prisma.$executeRaw`
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
  async submitPeerReview(reviewId: number, reviewerId: string, data: {
    reviewOutcome: string;
    reviewFeedback: string;
    suggestedCorrections?: string;
    medicalAccuracyScore: number;
    severityLevel: string;
    requiresImmediateAction: boolean;
  }) {
    const {
      reviewOutcome,
      reviewFeedback,
      suggestedCorrections,
      medicalAccuracyScore,
      severityLevel,
      requiresImmediateAction
    } = data;

    await prisma.$executeRaw`
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
  async flagConflictingDiagnosis(data: {
    postId: string;
    patientId: string;
    response1Id: string;
    response1DoctorId: string;
    response1Diagnosis: string;
    response2Id: string;
    response2DoctorId: string;
    response2Diagnosis: string;
    conflictType: string;
    conflictSeverity: string;
  }) {
    await prisma.$executeRaw`
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
  async triggerQualityReview(doctorId: string, triggerType: string, triggerDetails: string) {
    const periodEnd = new Date();
    const periodStart = new Date();
    periodStart.setMonth(periodStart.getMonth() - 3); // Last 3 months

    // Get doctor metrics
    const metrics = await prisma.$queryRaw<any[]>`
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

    await prisma.$executeRaw`
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
  async calculateTrustScore(userId: string, userType: string) {
    const result = await prisma.$queryRaw<any[]>`
      SELECT calculate_trust_score(${userId}, ${userType}) as trust_score
    `;

    return result[0]?.trust_score || 50;
  }

  /**
   * Get user trust score
   */
  async getTrustScore(userId: string) {
    const trustScore = await prisma.$queryRaw<any[]>`
      SELECT * FROM "TrustScore" WHERE user_id = ${userId}
    `;

    return trustScore.length > 0 ? trustScore[0] : null;
  }
}

export const trustSafetyService = new TrustSafetyService();
