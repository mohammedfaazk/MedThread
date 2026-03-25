import { prisma } from '@medthread/database';

interface LiabilityWaiver {
  doctorId: string;
  patientId: string;
  interactionType: 'CONSULTATION' | 'ADVICE' | 'COMMENT' | 'POST_REPLY';
  waiverText: string;
  acceptedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

interface LiabilityDisclaimer {
  type: 'GENERAL' | 'EMERGENCY' | 'PRESCRIPTION' | 'DIAGNOSIS';
  content: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiresAcknowledment: boolean;
}

export class LiabilityProtectionService {
  private readonly disclaimers: Record<string, LiabilityDisclaimer> = {
    GENERAL: {
      type: 'GENERAL',
      content: `IMPORTANT MEDICAL DISCLAIMER: This platform provides general health information only and is NOT a substitute for professional medical advice, diagnosis, or treatment. Healthcare professionals on this platform are providing educational information only and are NOT establishing a doctor-patient relationship. Always seek the advice of your physician or qualified health provider with any questions regarding a medical condition. Never disregard professional medical advice or delay seeking it because of something you read here.`,
      severity: 'HIGH',
      requiresAcknowledment: true
    },
    EMERGENCY: {
      type: 'EMERGENCY',
      content: `🚨 EMERGENCY DISCLAIMER: If you are experiencing a medical emergency, call emergency services immediately (India: 112, US: 911, UK: 999). Do NOT rely on this platform for emergency medical assistance. Healthcare professionals on this platform cannot provide emergency care through online interactions.`,
      severity: 'CRITICAL',
      requiresAcknowledment: true
    },
    PRESCRIPTION: {
      type: 'PRESCRIPTION',
      content: `PRESCRIPTION DISCLAIMER: Healthcare professionals on this platform cannot prescribe medications or provide specific treatment plans through online interactions. Any medication suggestions are for educational purposes only. Always consult with your licensed healthcare provider before starting, stopping, or changing any medication.`,
      severity: 'HIGH',
      requiresAcknowledment: true
    },
    DIAGNOSIS: {
      type: 'DIAGNOSIS',
      content: `DIAGNOSIS DISCLAIMER: Healthcare professionals on this platform cannot provide medical diagnoses through online interactions. Any health assessments or symptom discussions are for educational purposes only. Proper medical diagnosis requires in-person examination by a qualified healthcare provider.`,
      severity: 'HIGH',
      requiresAcknowledment: true
    }
  };

  /**
   * Generate liability waiver for doctor-patient interaction
   */
  async generateLiabilityWaiver(
    doctorId: string,
    patientId: string,
    interactionType: 'CONSULTATION' | 'ADVICE' | 'COMMENT' | 'POST_REPLY'
  ): Promise<string> {
    const doctor = await prisma.user.findUnique({
      where: { id: doctorId },
      select: { username: true, specialty: true, medicalLicenseNumber: true }
    });

    if (!doctor) {
      throw new Error('Doctor not found');
    }

    const waiverText = `
MEDICAL LIABILITY WAIVER AND DISCLAIMER

Patient Acknowledgment and Waiver of Claims

I, the patient/user, understand and acknowledge the following:

1. NATURE OF ONLINE INTERACTION
   - This is an online health information platform, NOT a medical practice
   - Dr. ${doctor.username} (${doctor.specialty || 'Healthcare Professional'}) is providing general health information only
   - No doctor-patient relationship is established through this interaction
   - This interaction does NOT constitute medical advice, diagnosis, or treatment

2. LIMITATIONS OF ONLINE CONSULTATION
   - Online interactions cannot replace in-person medical examination
   - Dr. ${doctor.username} cannot perform physical examinations or diagnostic tests
   - Important medical information may be missed in online communications
   - Technical issues may affect the quality of communication

3. EMERGENCY SITUATIONS
   - This platform is NOT for medical emergencies
   - I will call emergency services (112 in India) for any medical emergency
   - I will not rely on this platform for urgent medical needs

4. PROFESSIONAL RESPONSIBILITY
   - Dr. ${doctor.username} is licensed to practice medicine (License: ${doctor.medicalLicenseNumber || 'Verified'})
   - Dr. ${doctor.username} is providing information within their professional knowledge
   - Dr. ${doctor.username} recommends I consult with my local healthcare provider for proper medical care

5. PATIENT RESPONSIBILITIES
   - I will provide accurate and complete health information
   - I will not misrepresent my medical condition or symptoms
   - I will seek appropriate medical care from qualified local healthcare providers
   - I will not rely solely on information provided through this platform

6. LIMITATION OF LIABILITY
   - I understand that Dr. ${doctor.username} and MedThread platform are not liable for:
     * Any adverse health outcomes resulting from information provided
     * Delays in seeking appropriate medical care
     * Misunderstanding or misinterpretation of information provided
     * Technical issues affecting communication
     * Any decisions I make based on information received

7. WAIVER OF CLAIMS
   - I voluntarily waive any claims against Dr. ${doctor.username} and MedThread
   - I release Dr. ${doctor.username} from any liability related to this interaction
   - I understand this waiver applies to the fullest extent permitted by law

8. ACKNOWLEDGMENT
   - I have read and understood this waiver
   - I voluntarily accept the risks and limitations described
   - I agree to hold Dr. ${doctor.username} and MedThread harmless

Interaction Type: ${interactionType}
Generated: ${new Date().toISOString()}
Platform: MedThread Medical Information Platform

BY PROCEEDING WITH THIS INTERACTION, I ACKNOWLEDGE THAT I HAVE READ, UNDERSTOOD, AND AGREE TO THIS WAIVER.
`;

    return waiverText;
  }

  /**
   * Record liability waiver acceptance
   */
  async recordWaiverAcceptance(waiver: LiabilityWaiver): Promise<void> {
    try {
      await prisma.liabilityWaiver.create({
        data: {
          doctorId: waiver.doctorId,
          patientId: waiver.patientId,
          interactionType: waiver.interactionType,
          waiverText: waiver.waiverText,
          acceptedAt: waiver.acceptedAt,
          ipAddress: waiver.ipAddress,
          userAgent: waiver.userAgent,
        }
      });

      console.log(`[LiabilityProtection] Waiver recorded for doctor ${waiver.doctorId} and patient ${waiver.patientId}`);
    } catch (error) {
      console.error('[LiabilityProtection] Failed to record waiver:', error);
      throw error;
    }
  }

  /**
   * Check if liability waiver is required
   */
  async isWaiverRequired(
    doctorId: string,
    patientId: string,
    interactionType: string
  ): Promise<boolean> {
    // Check if waiver already exists for this interaction type
    const existingWaiver = await prisma.liabilityWaiver.findFirst({
      where: {
        doctorId,
        patientId,
        interactionType,
        acceptedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Within last 30 days
        }
      }
    });

    return !existingWaiver;
  }

  /**
   * Get appropriate disclaimer for content type
   */
  getDisclaimer(contentType: 'GENERAL' | 'EMERGENCY' | 'PRESCRIPTION' | 'DIAGNOSIS'): LiabilityDisclaimer {
    return this.disclaimers[contentType];
  }

  /**
   * Add liability disclaimer to doctor's response
   */
  async addDisclaimerToResponse(
    response: string,
    disclaimerType: 'GENERAL' | 'EMERGENCY' | 'PRESCRIPTION' | 'DIAGNOSIS'
  ): Promise<string> {
    const disclaimer = this.getDisclaimer(disclaimerType);
    
    return `${response}

---
⚠️ **MEDICAL DISCLAIMER**
${disclaimer.content}
---`;
  }

  /**
   * Validate doctor's professional status
   */
  async validateDoctorStatus(doctorId: string): Promise<{
    isValid: boolean;
    licenseStatus: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'UNKNOWN';
    verificationStatus: string;
    restrictions?: string[];
  }> {
    const doctor = await prisma.user.findUnique({
      where: { id: doctorId },
      select: {
        doctorVerificationStatus: true,
        medicalLicenseNumber: true,
        licenseExpiryDate: true,
        verificationNotes: true,
        isSuspended: true
      }
    });

    if (!doctor) {
      return {
        isValid: false,
        licenseStatus: 'UNKNOWN',
        verificationStatus: 'NOT_FOUND'
      };
    }

    let licenseStatus: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'UNKNOWN' = 'UNKNOWN';
    
    if (doctor.isSuspended) {
      licenseStatus = 'SUSPENDED';
    } else if (doctor.licenseExpiryDate && doctor.licenseExpiryDate < new Date()) {
      licenseStatus = 'EXPIRED';
    } else if (doctor.medicalLicenseNumber) {
      licenseStatus = 'ACTIVE';
    }

    const restrictions: string[] = [];
    if (doctor.isSuspended) {
      restrictions.push('Account suspended');
    }
    if (doctor.doctorVerificationStatus !== 'APPROVED') {
      restrictions.push('Verification pending');
    }

    return {
      isValid: licenseStatus === 'ACTIVE' && doctor.doctorVerificationStatus === 'APPROVED' && !doctor.isSuspended,
      licenseStatus,
      verificationStatus: doctor.doctorVerificationStatus || 'UNKNOWN',
      restrictions: restrictions.length > 0 ? restrictions : undefined
    };
  }

  /**
   * Generate professional liability report
   */
  async generateLiabilityReport(doctorId: string, dateRange: {
    from: Date;
    to: Date;
  }): Promise<{
    doctorInfo: any;
    totalInteractions: number;
    waiversCovered: number;
    riskAssessment: 'LOW' | 'MEDIUM' | 'HIGH';
    recommendations: string[];
    interactions: any[];
  }> {
    const doctor = await prisma.user.findUnique({
      where: { id: doctorId },
      select: {
        username: true,
        specialty: true,
        medicalLicenseNumber: true,
        yearsOfExperience: true,
        doctorVerificationStatus: true
      }
    });

    if (!doctor) {
      throw new Error('Doctor not found');
    }

    // Get all interactions in date range
    const [posts, comments, waivers] = await Promise.all([
      prisma.post.count({
        where: {
          authorId: doctorId,
          createdAt: { gte: dateRange.from, lte: dateRange.to }
        }
      }),
      prisma.comment.count({
        where: {
          authorId: doctorId,
          createdAt: { gte: dateRange.from, lte: dateRange.to }
        }
      }),
      prisma.liabilityWaiver.findMany({
        where: {
          doctorId,
          acceptedAt: { gte: dateRange.from, lte: dateRange.to }
        }
      })
    ]);

    const totalInteractions = posts + comments;
    const waiversCovered = waivers.length;
    const coverageRatio = totalInteractions > 0 ? waiversCovered / totalInteractions : 1;

    // Risk assessment
    let riskAssessment: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (coverageRatio < 0.5) {
      riskAssessment = 'HIGH';
    } else if (coverageRatio < 0.8) {
      riskAssessment = 'MEDIUM';
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (coverageRatio < 0.8) {
      recommendations.push('Increase liability waiver coverage for patient interactions');
    }
    if (doctor.doctorVerificationStatus !== 'APPROVED') {
      recommendations.push('Complete doctor verification process');
    }
    if (!doctor.medicalLicenseNumber) {
      recommendations.push('Update medical license information');
    }

    return {
      doctorInfo: doctor,
      totalInteractions,
      waiversCovered,
      riskAssessment,
      recommendations,
      interactions: waivers.map(w => ({
        patientId: w.patientId,
        interactionType: w.interactionType,
        acceptedAt: w.acceptedAt
      }))
    };
  }

  /**
   * Auto-add disclaimers to doctor responses based on content analysis
   */
  async analyzeAndAddDisclaimers(content: string, doctorId: string): Promise<string> {
    const lowerContent = content.toLowerCase();
    let modifiedContent = content;
    const disclaimersToAdd: string[] = [];

    // Check for emergency-related content
    const emergencyKeywords = ['emergency', 'urgent', 'immediately', 'call 911', 'hospital', 'ambulance'];
    if (emergencyKeywords.some(keyword => lowerContent.includes(keyword))) {
      disclaimersToAdd.push('EMERGENCY');
    }

    // Check for prescription-related content
    const prescriptionKeywords = ['take medication', 'prescribe', 'dosage', 'mg', 'pills', 'tablets'];
    if (prescriptionKeywords.some(keyword => lowerContent.includes(keyword))) {
      disclaimersToAdd.push('PRESCRIPTION');
    }

    // Check for diagnosis-related content
    const diagnosisKeywords = ['you have', 'diagnosed with', 'condition is', 'disease', 'disorder'];
    if (diagnosisKeywords.some(keyword => lowerContent.includes(keyword))) {
      disclaimersToAdd.push('DIAGNOSIS');
    }

    // Always add general disclaimer
    disclaimersToAdd.push('GENERAL');

    // Add unique disclaimers
    const uniqueDisclaimers = [...new Set(disclaimersToAdd)];
    
    for (const disclaimerType of uniqueDisclaimers) {
      modifiedContent = await this.addDisclaimerToResponse(
        modifiedContent,
        disclaimerType as 'GENERAL' | 'EMERGENCY' | 'PRESCRIPTION' | 'DIAGNOSIS'
      );
    }

    return modifiedContent;
  }
}

export const liabilityProtectionService = new LiabilityProtectionService();