import { prisma } from '@medthread/database';

export class HealthChallengesService {
  async getChallenges(filters?: {
    category?: string;
    difficulty?: string;
    status?: string;
  }) {
    const where: any = {};
    
    if (filters?.category) where.category = filters.category;
    if (filters?.difficulty) where.difficulty = filters.difficulty;
    if (filters?.status) {
      if (filters.status === 'active') {
        where.startDate = { lte: new Date() };
        where.endDate = { gte: new Date() };
      }
    }

    return prisma.healthChallenge.findMany({
      where,
      include: {
        _count: {
          select: { participants: true }
        }
      },
      orderBy: { startDate: 'desc' }
    });
  }

  async getChallenge(challengeId: string) {
    return prisma.healthChallenge.findUnique({
      where: { id: challengeId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                profilePicture: true
              }
            }
          },
          orderBy: { points: 'desc' },
          take: 10
        },
        _count: {
          select: { participants: true }
        }
      }
    });
  }

  async joinChallenge(userId: string, challengeId: string) {
    // Check if already joined
    const existing = await prisma.challengeParticipant.findUnique({
      where: {
        userId_challengeId: { userId, challengeId }
      }
    });

    if (existing) {
      throw new Error('Already joined this challenge');
    }

    return prisma.challengeParticipant.create({
      data: {
        userId,
        challengeId,
        points: 0,
        progress: 0
      }
    });
  }

  async leaveChallenge(userId: string, challengeId: string) {
    return prisma.challengeParticipant.delete({
      where: {
        userId_challengeId: { userId, challengeId }
      }
    });
  }

  async updateProgress(userId: string, challengeId: string, data: {
    points?: number;
    progress?: number;
    completedTasks?: string[];
  }) {
    const participant = await prisma.challengeParticipant.findUnique({
      where: {
        userId_challengeId: { userId, challengeId }
      }
    });

    if (!participant) {
      throw new Error('Not participating in this challenge');
    }

    return prisma.challengeParticipant.update({
      where: {
        userId_challengeId: { userId, challengeId }
      },
      data: {
        points: data.points !== undefined ? participant.points + data.points : undefined,
        progress: data.progress,
        completedTasks: data.completedTasks
      }
    });
  }

  async getLeaderboard(challengeId: string, limit: number = 50) {
    return prisma.challengeParticipant.findMany({
      where: { challengeId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            profilePicture: true
          }
        }
      },
      orderBy: [
        { points: 'desc' },
        { progress: 'desc' }
      ],
      take: limit
    });
  }

  async getUserChallenges(userId: string) {
    return prisma.challengeParticipant.findMany({
      where: { userId },
      include: {
        challenge: {
          include: {
            _count: {
              select: { participants: true }
            }
          }
        }
      },
      orderBy: { joinedAt: 'desc' }
    });
  }

  async createChallenge(data: {
    title: string;
    description: string;
    category: string;
    difficulty: string;
    startDate: Date;
    endDate: Date;
    goals: any;
    rewards: any;
  }) {
    return prisma.healthChallenge.create({
      data
    });
  }

  async getStats(challengeId: string) {
    const participants = await prisma.challengeParticipant.findMany({
      where: { challengeId }
    });

    const totalPoints = participants.reduce((sum, p) => sum + p.points, 0);
    const avgProgress = participants.length > 0
      ? participants.reduce((sum, p) => sum + p.progress, 0) / participants.length
      : 0;
    const completed = participants.filter(p => p.progress >= 100).length;

    return {
      totalParticipants: participants.length,
      totalPoints,
      averageProgress: Math.round(avgProgress),
      completedCount: completed,
      completionRate: participants.length > 0
        ? Math.round((completed / participants.length) * 100)
        : 0
    };
  }
}

export const healthChallengesService = new HealthChallengesService();
