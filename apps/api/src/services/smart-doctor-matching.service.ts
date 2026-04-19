/**
 * 🎯 SMART DOCTOR MATCHING SERVICE
 * 
 * This is a GAME-CHANGER that sets MedThread apart from Practo.
 * Matches patients with doctors based on PROVEN success rates, not just specialty.
 */

import { prisma } from '@medthread/database';

interface MatchCriteria {
  symptoms: string[];
  condition?: string;
  location?: string;
  pincode?: string;
  language?: string[];
  maxDistance?: number; // in km
  urgency?: 'URGENT' | 'NORMAL' | 'LOW';
  preferredGender?: string;
  minExperience?: number;
  maxPrice?: number;
}

interface DoctorMatch {
  doctorId: string;
  matchScore: number; // 0-100
  doctor: any;
  reasons: string[];
  specialization?: any;
  availability?: string;
  estimatedResponseTime?: number;
}

export class SmartDoctorMatchingService {

  /**
   * Find the best matching doctors for a patient
   */
  async findBestMatches(
    patientId: string,
    criteria: MatchCriteria
  ): Promise<DoctorMatch[]> {
    // Get patient's medical history for better matching
    const patient = await prisma.user.findUnique({
      where: { id: patientId },
      include: {
        healthProfile: true,
        patientHealthProfile: true
      }
    });

    // Get all verified doctors
    const doctors = await prisma.user.findMany({
      where: {
        role: 'DOCTOR',
        doctorVerificationStatus: 'APPROVED',
        isSuspended: false,
        ...(criteria.location && {
          OR: [
            { clinicAddress: { contains: criteria.location, mode: 'insensitive' } },
            { pincode: criteria.pincode }
          ]
        })
      },
      include: {
        doctorPerformance: true,
        doctorActivityMetrics: true,
        availabilities: {
          where: {
            isBooked: false,
            startTime: { gte: new Date() }
          },
          take: 1
        }
      }
    });

    // Calculate match scores for each doctor
    const matches: DoctorMatch[] = [];

    for (const doctor of doctors) {
      const matchResult = await this.calculateMatchScore(doctor, criteria, patient);
      
      if (matchResult.matchScore > 30) { // Only include reasonable matches
        matches.push(matchResult);
      }
    }

    // Sort by match score
    matches.sort((a, b) => b.matchScore - a.matchScore);

    // Save the match results
    await this.saveMatchResults(patientId, criteria, matches);

    return matches.slice(0, 10); // Return top 10 matches
  }

  /**
   * Calculate match score between patient and doctor
   */
  private async calculateMatchScore(
    doctor: any,
    criteria: MatchCriteria,
    patient: any
  ): Promise<DoctorMatch> {
    let score = 0;
    const reasons: string[] = [];
    const maxScore = 100;

    // 1. Specialization Match (30 points)
    const specializationScore = await this.calculateSpecializationScore(
      doctor.id,
      criteria.symptoms,
      criteria.condition
    );
    score += specializationScore.score;
    if (specializationScore.reason) reasons.push(specializationScore.reason);

    // 2. Success Rate (25 points)
    const successScore = this.calculateSuccessScore(doctor, criteria.condition);
    score += successScore.score;
    if (successScore.reason) reasons.push(successScore.reason);

    // 3. Response Time (15 points)
    const responseScore = this.calculateResponseScore(doctor);
    score += responseScore.score;
    if (responseScore.reason) reasons.push(responseScore.reason);

    // 4. Patient Satisfaction (15 points)
    const satisfactionScore = this.calculateSatisfactionScore(doctor);
    score += satisfactionScore.score;
    if (satisfactionScore.reason) reasons.push(satisfactionScore.reason);

    // 5. Availability (10 points)
    const availabilityScore = this.calculateAvailabilityScore(doctor, criteria.urgency);
    score += availabilityScore.score;
    if (availabilityScore.reason) reasons.push(availabilityScore.reason);

    // 6. Language Match (5 points)
    if (criteria.language && criteria.language.length > 0) {
      // Assume doctor bio contains language info (you can add a languages field)
      const languageMatch = criteria.language.some(lang => 
        doctor.bio?.toLowerCase().includes(lang.toLowerCase())
      );
      if (languageMatch) {
        score += 5;
        reasons.push(`Speaks ${criteria.language.join(', ')}`);
      }
    }

    // Get specialization details if available
    let specialization = null;
    if (criteria.condition) {
      specialization = await prisma.doctorSpecialization.findUnique({
        where: {
          doctorId_condition: {
            doctorId: doctor.id,
            condition: criteria.condition
          }
        }
      });
    }

    return {
      doctorId: doctor.id,
      matchScore: Math.min(score, maxScore),
      doctor: {
        id: doctor.id,
        username: doctor.username,
        bio: doctor.bio,
        avatar: doctor.avatar,
        specialty: doctor.specialty,
        subSpecialty: doctor.subSpecialty,
        yearsOfExperience: doctor.yearsOfExperience,
        hospitalAffiliation: doctor.hospitalAffiliation,
        clinicAddress: doctor.clinicAddress,
        totalKarma: doctor.totalKarma
      },
      reasons,
      specialization,
      availability: doctor.availabilities?.[0] ? 'Available soon' : 'Check schedule',
      estimatedResponseTime: doctor.doctorActivityMetrics?.avgReplyTimeHours
    };
  }

  /**
   * Calculate specialization match score
   */
  private async calculateSpecializationScore(
    doctorId: string,
    symptoms: string[],
    condition?: string
  ): Promise<{ score: number; reason?: string }> {
    if (condition) {
      // Check if doctor has treated this specific condition
      const specialization = await prisma.doctorSpecialization.findUnique({
        where: {
          doctorId_condition: {
            doctorId,
            condition
          }
        }
      });

      if (specialization && specialization.patientCount > 0) {
        const score = Math.min(30, 15 + (specialization.patientCount / 10) * 15);
        return {
          score,
          reason: `Treated ${specialization.patientCount} patients with ${condition} (${specialization.successRate.toFixed(0)}% success rate)`
        };
      }
    }

    // Check general specialty match based on symptoms
    const doctor = await prisma.user.findUnique({
      where: { id: doctorId },
      select: { specialty: true, subSpecialty: true }
    });

    if (doctor?.specialty) {
      // Basic specialty match
      return {
        score: 15,
        reason: `Specializes in ${doctor.specialty}`
      };
    }

    return { score: 0 };
  }

  /**
   * Calculate success rate score
   */
  private calculateSuccessScore(
    doctor: any,
    condition?: string
  ): { score: number; reason?: string } {
    const performance = doctor.doctorPerformance;
    
    if (!performance) {
      return { score: 0 };
    }

    const cureRate = performance.totalPatientsHelped > 0
      ? (performance.curedPatientCount / performance.totalPatientsHelped) * 100
      : 0;

    if (cureRate > 80) {
      return {
        score: 25,
        reason: `${cureRate.toFixed(0)}% patient cure rate (${performance.curedPatientCount} cured)`
      };
    } else if (cureRate > 60) {
      return {
        score: 20,
        reason: `${cureRate.toFixed(0)}% patient cure rate`
      };
    } else if (cureRate > 40) {
      return {
        score: 15,
        reason: `Helped ${performance.totalPatientsHelped} patients`
      };
    }

    return { score: 10 };
  }

  /**
   * Calculate response time score
   */
  private calculateResponseScore(doctor: any): { score: number; reason?: string } {
    const metrics = doctor.doctorActivityMetrics;
    
    if (!metrics?.avgReplyTimeHours) {
      return { score: 5 };
    }

    const hours = metrics.avgReplyTimeHours;

    if (hours < 1) {
      return {
        score: 15,
        reason: `Avg response time: ${Math.round(hours * 60)} minutes`
      };
    } else if (hours < 4) {
      return {
        score: 12,
        reason: `Avg response time: ${Math.round(hours)} hours`
      };
    } else if (hours < 24) {
      return {
        score: 8,
        reason: `Responds within ${Math.round(hours)} hours`
      };
    }

    return { score: 3 };
  }

  /**
   * Calculate patient satisfaction score
   * Now includes sentiment analysis from patient reviews
   */
  private calculateSatisfactionScore(doctor: any): { score: number; reason?: string } {
    const performance = doctor.doctorPerformance;
    
    if (!performance?.helpfulnessScore) {
      return { score: 5 };
    }

    // helpfulnessScore now includes sentiment analysis (0-5 scale)
    // This is the combined score: 70% star rating + 30% sentiment
    const score = (performance.helpfulnessScore / 5) * 15;
    
    return {
      score,
      reason: `${performance.helpfulnessScore.toFixed(1)}/5 rating with sentiment analysis (${performance.totalRatings} reviews)`
    };
  }

  /**
   * Calculate availability score
   */
  private calculateAvailabilityScore(
    doctor: any,
    urgency?: string
  ): { score: number; reason?: string } {
    const hasAvailability = doctor.availabilities && doctor.availabilities.length > 0;
    
    if (!hasAvailability) {
      return { score: 0 };
    }

    const nextSlot = doctor.availabilities[0];
    const hoursUntil = (new Date(nextSlot.startTime).getTime() - Date.now()) / (1000 * 60 * 60);

    if (hoursUntil < 2) {
      return {
        score: 10,
        reason: 'Available now'
      };
    } else if (hoursUntil < 24) {
      return {
        score: 8,
        reason: 'Available today'
      };
    } else if (hoursUntil < 72) {
      return {
        score: 6,
        reason: 'Available this week'
      };
    }

    return { score: 3, reason: 'Check schedule' };
  }

  /**
   * Save match results for analytics
   */
  private async saveMatchResults(
    patientId: string,
    criteria: MatchCriteria,
    matches: DoctorMatch[]
  ): Promise<void> {
    await prisma.smartMatch.create({
      data: {
        patientId,
        symptoms: criteria.symptoms,
        medicalHistory: null, // Can be populated from patient profile
        preferences: {
          location: criteria.location,
          language: criteria.language,
          urgency: criteria.urgency
        },
        matchedDoctors: matches.map(m => ({
          doctorId: m.doctorId,
          matchScore: m.matchScore,
          reasons: m.reasons
        })),
        matchCriteria: criteria,
        topMatchId: matches[0]?.doctorId
      }
    });
  }

  /**
   * Update doctor specialization based on patient outcomes
   */
  async updateDoctorSpecialization(
    doctorId: string,
    condition: string,
    outcome: 'CURED' | 'IMPROVED' | 'NO_CHANGE'
  ): Promise<void> {
    const specialization = await prisma.doctorSpecialization.findUnique({
      where: {
        doctorId_condition: {
          doctorId,
          condition
        }
      }
    });

    if (specialization) {
      const newTotalTreatments = specialization.totalTreatments + 1;
      const newCuredCount = outcome === 'CURED' 
        ? specialization.curedCount + 1 
        : specialization.curedCount;
      const newImprovedCount = outcome === 'IMPROVED'
        ? specialization.improvedCount + 1
        : specialization.improvedCount;
      const newSuccessRate = ((newCuredCount + newImprovedCount * 0.5) / newTotalTreatments) * 100;

      await prisma.doctorSpecialization.update({
        where: {
          doctorId_condition: {
            doctorId,
            condition
          }
        },
        data: {
          totalTreatments: newTotalTreatments,
          curedCount: newCuredCount,
          improvedCount: newImprovedCount,
          successRate: newSuccessRate,
          patientCount: newTotalTreatments
        }
      });
    } else {
      // Create new specialization record
      await prisma.doctorSpecialization.create({
        data: {
          doctorId,
          condition,
          totalTreatments: 1,
          curedCount: outcome === 'CURED' ? 1 : 0,
          improvedCount: outcome === 'IMPROVED' ? 1 : 0,
          successRate: outcome === 'CURED' ? 100 : (outcome === 'IMPROVED' ? 50 : 0),
          patientCount: 1
        }
      });
    }
  }

  /**
   * Get doctor's specialization details
   */
  async getDoctorSpecializations(doctorId: string): Promise<any[]> {
    return await prisma.doctorSpecialization.findMany({
      where: { doctorId },
      orderBy: [
        { successRate: 'desc' },
        { patientCount: 'desc' }
      ]
    });
  }

  /**
   * Get top doctors for a specific condition
   */
  async getTopDoctorsForCondition(
    condition: string,
    location?: string,
    limit: number = 10
  ): Promise<any[]> {
    const specializations = await prisma.doctorSpecialization.findMany({
      where: {
        condition,
        patientCount: { gte: 5 } // At least 5 patients treated
      },
      include: {
        doctor: {
          select: {
            id: true,
            username: true,
            bio: true,
            avatar: true,
            specialty: true,
            yearsOfExperience: true,
            clinicAddress: true,
            pincode: true,
            totalKarma: true
          }
        }
      },
      orderBy: [
        { successRate: 'desc' },
        { patientCount: 'desc' }
      ],
      take: limit
    });

    return specializations.map(s => ({
      ...s.doctor,
      specialization: {
        condition: s.condition,
        successRate: s.successRate,
        patientCount: s.patientCount,
        avgRecoveryDays: s.avgRecoveryDays
      }
    }));
  }
}

export default new SmartDoctorMatchingService();
