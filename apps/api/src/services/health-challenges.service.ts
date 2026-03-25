import { prisma } from '@medthread/database';

interface CreateChallengeData {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  riskLevel: 'LOW' | 'HIGH';
  startDate: Date;
  endDate: Date;
  goals: {
    type: string;
    value: number;
  };
  rewards: {
    points: number;
  };
}

export class HealthChallengesService {
  /**
   * Create a new health challenge
   */
  async createChallenge(data: CreateChallengeData, creatorId: string) {
    try {
      const challenge = await prisma.healthChallenge.create({
        data: {
          title: data.title,
          description: data.description,
          category: data.category,
          difficulty: data.difficulty,
          riskLevel: data.riskLevel,
          requiresDoctorApproval: data.riskLevel === 'HIGH',
          isDoctorApproved: data.riskLevel === 'LOW', // LOW-RISK auto-approved, HIGH-RISK needs doctor approval
          approvedByDoctors: [],
          type: data.goals.type.toUpperCase(),
          goal: data.goals.value,
          unit: data.goals.type,
          startDate: data.startDate,
          endDate: data.endDate,
          rewards: data.rewards,
          participants: [],
          leaderboard: [],
          createdBy: creatorId,
          isActive: true,
          participantCount: 0
        }
      });

      return challenge;
    } catch (error) {
      console.error('[HealthChallenges] Error creating challenge:', error);
      throw error;
    }
  }

  /**
   * Get all active challenges
   * Shows ALL challenges to everyone, but patients can only join approved ones
   */
  async getActiveChallenges(filters?: {
    category?: string;
    difficulty?: string;
    page?: number;
    limit?: number;
    userRole?: string;
  }) {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const skip = (page - 1) * limit;

      const where: any = { isActive: true };

      if (filters?.category) {
        where.category = filters.category;
      }

      if (filters?.difficulty) {
        where.difficulty = filters.difficulty;
      }

      const [challenges, total] = await Promise.all([
        prisma.healthChallenge.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.healthChallenge.count({ where })
      ]);

      return {
        challenges,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('[HealthChallenges] Error getting challenges:', error);
      throw error;
    }
  }

  /**
   * Get single challenge
   */
  async getChallenge(challengeId: string) {
    try {
      const challenge = await prisma.healthChallenge.findUnique({
        where: { id: challengeId }
      });

      return challenge;
    } catch (error) {
      console.error('[HealthChallenges] Error getting challenge:', error);
      throw error;
    }
  }

  /**
   * Join a challenge
   * Patients can only join approved challenges (LOW-RISK or doctor-approved HIGH-RISK)
   */
  async joinChallenge(challengeId: string, userId: string) {
    try {
      // Check if already joined
      const existing = await prisma.challengeParticipant.findFirst({
        where: {
          challengeId,
          userId
        }
      });

      if (existing) {
        throw new Error('Already joined this challenge');
      }

      // Get challenge
      const challenge = await prisma.healthChallenge.findUnique({
        where: { id: challengeId },
        select: { 
          title: true, 
          riskLevel: true, 
          requiresDoctorApproval: true,
          isDoctorApproved: true
        }
      });

      if (!challenge) {
        throw new Error('Challenge not found');
      }

      // Check if challenge is approved (for HIGH-RISK challenges)
      if (challenge.requiresDoctorApproval && !challenge.isDoctorApproved) {
        throw new Error('This challenge has not been approved by a doctor yet');
      }

      // Join the challenge
      const participant = await prisma.challengeParticipant.create({
        data: {
          challengeId,
          userId,
          progress: 0,
          points: 0,
          isApproved: true
        }
      });

      // Update participant count
      await prisma.healthChallenge.update({
        where: { id: challengeId },
        data: { participantCount: { increment: 1 } }
      });

      return participant;
    } catch (error) {
      console.error('[HealthChallenges] Error joining challenge:', error);
      throw error;
    }
  }

  /**
   * Leave a challenge
   */
  async leaveChallenge(challengeId: string, userId: string) {
    try {
      await prisma.challengeParticipant.deleteMany({
        where: {
          challengeId,
          userId
        }
      });

      // Update participant count
      await prisma.healthChallenge.update({
        where: { id: challengeId },
        data: { participantCount: { decrement: 1 } }
      });
    } catch (error) {
      console.error('[HealthChallenges] Error leaving challenge:', error);
      throw error;
    }
  }

  /**
   * Update progress
   */
  async updateProgress(challengeId: string, userId: string, progress: number) {
    try {
      const participant = await prisma.challengeParticipant.updateMany({
        where: {
          challengeId,
          userId
        },
        data: { progress }
      });

      return participant;
    } catch (error) {
      console.error('[HealthChallenges] Error updating progress:', error);
      throw error;
    }
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(challengeId: string, limit: number = 50) {
    try {
      const participants = await prisma.challengeParticipant.findMany({
        where: { challengeId },
        orderBy: [
          { progress: 'desc' },
          { joinedAt: 'asc' }
        ],
        take: limit
      });

      return participants;
    } catch (error) {
      console.error('[HealthChallenges] Error getting leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get user's challenges with full challenge details
   */
  async getUserChallenges(userId: string) {
    try {
      const participants = await prisma.challengeParticipant.findMany({
        where: { userId }
      });

      // Fetch challenge details for each participant
      const challengesWithDetails = await Promise.all(
        participants.map(async (p) => {
          const challenge = await prisma.healthChallenge.findUnique({
            where: { id: p.challengeId }
          });

          return {
            id: p.challengeId,
            participantId: p.id,
            progress: p.progress,
            points: p.points,
            joinedAt: p.joinedAt,
            isCompleted: p.isCompleted,
            completedAt: p.completedAt,
            title: challenge?.title,
            description: challenge?.description,
            category: challenge?.category,
            difficulty: challenge?.difficulty,
            riskLevel: challenge?.riskLevel,
            goal: challenge?.goal,
            unit: challenge?.unit,
            startDate: challenge?.startDate,
            endDate: challenge?.endDate
          };
        })
      );

      return challengesWithDetails;
    } catch (error) {
      console.error('[HealthChallenges] Error getting user challenges:', error);
      throw error;
    }
  }

  /**
   * Get popular challenges
   */
  async getPopularChallenges(limit: number = 10) {
    try {
      const challenges = await prisma.healthChallenge.findMany({
        where: { isActive: true },
        orderBy: { participantCount: 'desc' },
        take: limit
      });

      return challenges;
    } catch (error) {
      console.error('[HealthChallenges] Error getting popular challenges:', error);
      throw error;
    }
  }

  /**
   * Doctor approves a challenge (makes HIGH-RISK challenges visible to patients)
   */
  async approveChallengeByDoctor(challengeId: string, doctorId: string, doctorName: string) {
    try {
      const challenge = await prisma.healthChallenge.findUnique({
        where: { id: challengeId }
      });

      if (!challenge) {
        throw new Error('Challenge not found');
      }

      // Get current approvals
      const approvals = Array.isArray(challenge.approvedByDoctors) 
        ? challenge.approvedByDoctors 
        : [];

      // Check if doctor already approved
      if (approvals.some((a: any) => a.doctorId === doctorId)) {
        throw new Error('You have already approved this challenge');
      }

      // Add doctor approval
      const newApproval = {
        doctorId,
        doctorName,
        approvedAt: new Date().toISOString()
      };

      const updatedChallenge = await prisma.healthChallenge.update({
        where: { id: challengeId },
        data: {
          isDoctorApproved: true,
          approvedByDoctors: [...approvals, newApproval]
        }
      });

      return updatedChallenge;
    } catch (error) {
      console.error('[HealthChallenges] Error approving challenge:', error);
      throw error;
    }
  }

  /**
   * Get challenges pending doctor approval (HIGH-RISK challenges not yet approved)
   */
  async getChallengesPendingApproval() {
    try {
      const challenges = await prisma.healthChallenge.findMany({
        where: {
          riskLevel: 'HIGH',
          isDoctorApproved: false,
          isActive: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return challenges;
    } catch (error) {
      console.error('[HealthChallenges] Error getting pending challenges:', error);
      throw error;
    }
  }

  /**
   * Get pending approval requests for a doctor
   * @deprecated - No longer used with new approval flow
   */
  async getPendingApprovals(doctorId: string) {
    try {
      const requests = await prisma.challengeApprovalRequest.findMany({
        where: {
          status: 'PENDING'
        },
        orderBy: { createdAt: 'asc' }
      });

      return requests;
    } catch (error) {
      console.error('[HealthChallenges] Error getting pending approvals:', error);
      throw error;
    }
  }

  /**
   * Approve a challenge request (doctor only)
   * @deprecated - No longer used with new approval flow
   */
  async approveRequest(requestId: string, doctorId: string, notes?: string) {
    try {
      const request = await prisma.challengeApprovalRequest.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          doctorId,
          notes,
          respondedAt: new Date()
        }
      });

      // Create participant record
      await prisma.challengeParticipant.create({
        data: {
          challengeId: request.challengeId,
          userId: request.patientId,
          progress: 0,
          points: 0,
          isApproved: true,
          approvedBy: doctorId,
          approvedAt: new Date()
        }
      });

      // Update participant count
      await prisma.healthChallenge.update({
        where: { id: request.challengeId },
        data: { participantCount: { increment: 1 } }
      });

      return request;
    } catch (error) {
      console.error('[HealthChallenges] Error approving request:', error);
      throw error;
    }
  }

  /**
   * Reject a challenge request (doctor only)
   * @deprecated - No longer used with new approval flow
   */
  async rejectRequest(requestId: string, doctorId: string, notes: string) {
    try {
      const request = await prisma.challengeApprovalRequest.update({
        where: { id: requestId },
        data: {
          status: 'REJECTED',
          doctorId,
          notes,
          respondedAt: new Date()
        }
      });

      return request;
    } catch (error) {
      console.error('[HealthChallenges] Error rejecting request:', error);
      throw error;
    }
  }
}

export const healthChallengesService = new HealthChallengesService();
