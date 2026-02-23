import { PrismaClient } from '@medthread/database';
import { getSocketInstance } from '../socket';

const prisma = new PrismaClient();

export enum BadgeType {
  // Appointment Badges
  FIRST_APPOINTMENT = 'FIRST_APPOINTMENT',
  TEN_APPOINTMENTS = 'TEN_APPOINTMENTS',
  FIFTY_APPOINTMENTS = 'FIFTY_APPOINTMENTS',
  HUNDRED_APPOINTMENTS = 'HUNDRED_APPOINTMENTS',
  
  // Consultation Badges (Doctor)
  FIRST_CONSULTATION = 'FIRST_CONSULTATION',
  TEN_CONSULTATIONS = 'TEN_CONSULTATIONS',
  FIFTY_CONSULTATIONS = 'FIFTY_CONSULTATIONS',
  HUNDRED_CONSULTATIONS = 'HUNDRED_CONSULTATIONS',
  
  // Social Badges
  FIRST_FOLLOWER = 'FIRST_FOLLOWER',
  TEN_FOLLOWERS = 'TEN_FOLLOWERS',
  FIFTY_FOLLOWERS = 'FIFTY_FOLLOWERS',
  HUNDRED_FOLLOWERS = 'HUNDRED_FOLLOWERS',
  FIVE_HUNDRED_FOLLOWERS = 'FIVE_HUNDRED_FOLLOWERS',
  
  // Verification Badges
  VERIFIED_DOCTOR = 'VERIFIED_DOCTOR',
  VERIFIED_SPECIALIST = 'VERIFIED_SPECIALIST',
  
  // Engagement Badges
  FIRST_POST = 'FIRST_POST',
  TEN_POSTS = 'TEN_POSTS',
  FIFTY_POSTS = 'FIFTY_POSTS',
  HELPFUL_CONTRIBUTOR = 'HELPFUL_CONTRIBUTOR', // 100+ upvotes
  COMMUNITY_LEADER = 'COMMUNITY_LEADER', // 500+ karma
  
  // Streak Badges
  SEVEN_DAY_STREAK = 'SEVEN_DAY_STREAK',
  THIRTY_DAY_STREAK = 'THIRTY_DAY_STREAK',
  HUNDRED_DAY_STREAK = 'HUNDRED_DAY_STREAK',
}

interface BadgeDefinition {
  type: BadgeType;
  name: string;
  description: string;
  icon: string;
  category: 'APPOINTMENT' | 'CONSULTATION' | 'SOCIAL' | 'VERIFICATION' | 'ENGAGEMENT' | 'STREAK';
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  points: number;
}

const BADGE_DEFINITIONS: Record<BadgeType, BadgeDefinition> = {
  // Appointment Badges
  [BadgeType.FIRST_APPOINTMENT]: {
    type: BadgeType.FIRST_APPOINTMENT,
    name: 'First Appointment',
    description: 'Booked your first appointment',
    icon: '📅',
    category: 'APPOINTMENT',
    rarity: 'COMMON',
    points: 10
  },
  [BadgeType.TEN_APPOINTMENTS]: {
    type: BadgeType.TEN_APPOINTMENTS,
    name: 'Regular Patient',
    description: 'Completed 10 appointments',
    icon: '🏥',
    category: 'APPOINTMENT',
    rarity: 'RARE',
    points: 50
  },
  [BadgeType.FIFTY_APPOINTMENTS]: {
    type: BadgeType.FIFTY_APPOINTMENTS,
    name: 'Health Conscious',
    description: 'Completed 50 appointments',
    icon: '💪',
    category: 'APPOINTMENT',
    rarity: 'EPIC',
    points: 200
  },
  [BadgeType.HUNDRED_APPOINTMENTS]: {
    type: BadgeType.HUNDRED_APPOINTMENTS,
    name: 'Healthcare Champion',
    description: 'Completed 100 appointments',
    icon: '🏆',
    category: 'APPOINTMENT',
    rarity: 'LEGENDARY',
    points: 500
  },
  
  // Consultation Badges
  [BadgeType.FIRST_CONSULTATION]: {
    type: BadgeType.FIRST_CONSULTATION,
    name: 'First Consultation',
    description: 'Completed your first consultation',
    icon: '🩺',
    category: 'CONSULTATION',
    rarity: 'COMMON',
    points: 10
  },
  [BadgeType.TEN_CONSULTATIONS]: {
    type: BadgeType.TEN_CONSULTATIONS,
    name: 'Helping Hand',
    description: 'Completed 10 consultations',
    icon: '🤝',
    category: 'CONSULTATION',
    rarity: 'RARE',
    points: 50
  },
  [BadgeType.FIFTY_CONSULTATIONS]: {
    type: BadgeType.FIFTY_CONSULTATIONS,
    name: 'Dedicated Healer',
    description: 'Completed 50 consultations',
    icon: '⚕️',
    category: 'CONSULTATION',
    rarity: 'EPIC',
    points: 200
  },
  [BadgeType.HUNDRED_CONSULTATIONS]: {
    type: BadgeType.HUNDRED_CONSULTATIONS,
    name: 'Master Physician',
    description: 'Completed 100 consultations',
    icon: '👨‍⚕️',
    category: 'CONSULTATION',
    rarity: 'LEGENDARY',
    points: 500
  },
  
  // Social Badges
  [BadgeType.FIRST_FOLLOWER]: {
    type: BadgeType.FIRST_FOLLOWER,
    name: 'First Follower',
    description: 'Got your first follower',
    icon: '👤',
    category: 'SOCIAL',
    rarity: 'COMMON',
    points: 10
  },
  [BadgeType.TEN_FOLLOWERS]: {
    type: BadgeType.TEN_FOLLOWERS,
    name: 'Rising Star',
    description: 'Reached 10 followers',
    icon: '⭐',
    category: 'SOCIAL',
    rarity: 'RARE',
    points: 50
  },
  [BadgeType.FIFTY_FOLLOWERS]: {
    type: BadgeType.FIFTY_FOLLOWERS,
    name: 'Popular Doctor',
    description: 'Reached 50 followers',
    icon: '🌟',
    category: 'SOCIAL',
    rarity: 'EPIC',
    points: 200
  },
  [BadgeType.HUNDRED_FOLLOWERS]: {
    type: BadgeType.HUNDRED_FOLLOWERS,
    name: 'Community Favorite',
    description: 'Reached 100 followers',
    icon: '💫',
    category: 'SOCIAL',
    rarity: 'LEGENDARY',
    points: 500
  },
  [BadgeType.FIVE_HUNDRED_FOLLOWERS]: {
    type: BadgeType.FIVE_HUNDRED_FOLLOWERS,
    name: 'Medical Influencer',
    description: 'Reached 500 followers',
    icon: '🔥',
    category: 'SOCIAL',
    rarity: 'LEGENDARY',
    points: 1000
  },
  
  // Verification Badges
  [BadgeType.VERIFIED_DOCTOR]: {
    type: BadgeType.VERIFIED_DOCTOR,
    name: 'Verified Doctor',
    description: 'Successfully verified as a medical professional',
    icon: '✅',
    category: 'VERIFICATION',
    rarity: 'EPIC',
    points: 100
  },
  [BadgeType.VERIFIED_SPECIALIST]: {
    type: BadgeType.VERIFIED_SPECIALIST,
    name: 'Verified Specialist',
    description: 'Verified specialist in your field',
    icon: '🎓',
    category: 'VERIFICATION',
    rarity: 'LEGENDARY',
    points: 200
  },
  
  // Engagement Badges
  [BadgeType.FIRST_POST]: {
    type: BadgeType.FIRST_POST,
    name: 'First Post',
    description: 'Created your first post',
    icon: '📝',
    category: 'ENGAGEMENT',
    rarity: 'COMMON',
    points: 10
  },
  [BadgeType.TEN_POSTS]: {
    type: BadgeType.TEN_POSTS,
    name: 'Active Contributor',
    description: 'Created 10 posts',
    icon: '✍️',
    category: 'ENGAGEMENT',
    rarity: 'RARE',
    points: 50
  },
  [BadgeType.FIFTY_POSTS]: {
    type: BadgeType.FIFTY_POSTS,
    name: 'Prolific Writer',
    description: 'Created 50 posts',
    icon: '📚',
    category: 'ENGAGEMENT',
    rarity: 'EPIC',
    points: 200
  },
  [BadgeType.HELPFUL_CONTRIBUTOR]: {
    type: BadgeType.HELPFUL_CONTRIBUTOR,
    name: 'Helpful Contributor',
    description: 'Received 100+ upvotes',
    icon: '👍',
    category: 'ENGAGEMENT',
    rarity: 'EPIC',
    points: 150
  },
  [BadgeType.COMMUNITY_LEADER]: {
    type: BadgeType.COMMUNITY_LEADER,
    name: 'Community Leader',
    description: 'Earned 500+ karma points',
    icon: '👑',
    category: 'ENGAGEMENT',
    rarity: 'LEGENDARY',
    points: 300
  },
  
  // Streak Badges
  [BadgeType.SEVEN_DAY_STREAK]: {
    type: BadgeType.SEVEN_DAY_STREAK,
    name: '7-Day Streak',
    description: 'Active for 7 consecutive days',
    icon: '🔥',
    category: 'STREAK',
    rarity: 'RARE',
    points: 50
  },
  [BadgeType.THIRTY_DAY_STREAK]: {
    type: BadgeType.THIRTY_DAY_STREAK,
    name: '30-Day Streak',
    description: 'Active for 30 consecutive days',
    icon: '🌟',
    category: 'STREAK',
    rarity: 'EPIC',
    points: 200
  },
  [BadgeType.HUNDRED_DAY_STREAK]: {
    type: BadgeType.HUNDRED_DAY_STREAK,
    name: '100-Day Streak',
    description: 'Active for 100 consecutive days',
    icon: '💎',
    category: 'STREAK',
    rarity: 'LEGENDARY',
    points: 500
  },
};

class BadgeService {
  /**
   * Award a badge to a user
   */
  async awardBadge(userId: string, badgeType: BadgeType): Promise<boolean> {
    try {
      const badgeDefinition = BADGE_DEFINITIONS[badgeType];
      
      // Check if user already has this badge
      const existingBadge = await prisma.userBadge.findUnique({
        where: {
          userId_badgeType: {
            userId,
            badgeType
          }
        }
      });

      if (existingBadge) {
        console.log(`[BADGE] User ${userId} already has badge ${badgeType}`);
        return false;
      }

      // Award the badge
      const userBadge = await prisma.userBadge.create({
        data: {
          userId,
          badgeType,
          earnedAt: new Date()
        }
      });

      console.log(`[BADGE] Awarded ${badgeType} to user ${userId}`);

      // Update user's badge points
      await prisma.user.update({
        where: { id: userId },
        data: {
          badgePoints: {
            increment: badgeDefinition.points
          }
        }
      });

      // Send real-time notification
      try {
        const io = getSocketInstance();
        io.to(`user:${userId}`).emit('badge_earned', {
          badge: {
            ...badgeDefinition,
            earnedAt: userBadge.earnedAt
          }
        });
      } catch (socketError) {
        console.error('[BADGE] Socket notification failed:', socketError);
      }

      // Create notification
      try {
        const { notificationService } = await import('./notification.service');
        await notificationService.createNotification({
          type: 'BADGE_EARNED',
          recipientIds: [userId],
          actorId: userId,
          contentId: badgeType,
          contentType: 'POST',
          metadata: {
            badgeName: badgeDefinition.name,
            badgeIcon: badgeDefinition.icon,
            badgeDescription: badgeDefinition.description,
            points: badgeDefinition.points
          }
        });
      } catch (notifError) {
        console.error('[BADGE] Notification creation failed:', notifError);
      }

      return true;
    } catch (error) {
      console.error('[BADGE] Error awarding badge:', error);
      return false;
    }
  }

  /**
   * Check and award appointment badges
   */
  async checkAppointmentBadges(userId: string): Promise<void> {
    try {
      const appointmentCount = await prisma.appointment.count({
        where: {
          OR: [
            { patientId: userId },
            { doctorId: userId }
          ],
          status: 'COMPLETED'
        }
      });

      console.log(`[BADGE] User ${userId} has ${appointmentCount} completed appointments`);

      if (appointmentCount >= 100) {
        await this.awardBadge(userId, BadgeType.HUNDRED_APPOINTMENTS);
      } else if (appointmentCount >= 50) {
        await this.awardBadge(userId, BadgeType.FIFTY_APPOINTMENTS);
      } else if (appointmentCount >= 10) {
        await this.awardBadge(userId, BadgeType.TEN_APPOINTMENTS);
      } else if (appointmentCount >= 1) {
        await this.awardBadge(userId, BadgeType.FIRST_APPOINTMENT);
      }
    } catch (error) {
      console.error('[BADGE] Error checking appointment badges:', error);
    }
  }

  /**
   * Check and award consultation badges (for doctors)
   */
  async checkConsultationBadges(doctorId: string): Promise<void> {
    try {
      const consultationCount = await prisma.appointment.count({
        where: {
          doctorId,
          status: 'COMPLETED'
        }
      });

      console.log(`[BADGE] Doctor ${doctorId} has ${consultationCount} completed consultations`);

      if (consultationCount >= 100) {
        await this.awardBadge(doctorId, BadgeType.HUNDRED_CONSULTATIONS);
      } else if (consultationCount >= 50) {
        await this.awardBadge(doctorId, BadgeType.FIFTY_CONSULTATIONS);
      } else if (consultationCount >= 10) {
        await this.awardBadge(doctorId, BadgeType.TEN_CONSULTATIONS);
      } else if (consultationCount >= 1) {
        await this.awardBadge(doctorId, BadgeType.FIRST_CONSULTATION);
      }
    } catch (error) {
      console.error('[BADGE] Error checking consultation badges:', error);
    }
  }

  /**
   * Check and award follower badges
   */
  async checkFollowerBadges(userId: string): Promise<void> {
    try {
      const followerCount = await prisma.follow.count({
        where: {
          followingId: userId
        }
      });

      console.log(`[BADGE] User ${userId} has ${followerCount} followers`);

      if (followerCount >= 500) {
        await this.awardBadge(userId, BadgeType.FIVE_HUNDRED_FOLLOWERS);
      } else if (followerCount >= 100) {
        await this.awardBadge(userId, BadgeType.HUNDRED_FOLLOWERS);
      } else if (followerCount >= 50) {
        await this.awardBadge(userId, BadgeType.FIFTY_FOLLOWERS);
      } else if (followerCount >= 10) {
        await this.awardBadge(userId, BadgeType.TEN_FOLLOWERS);
      } else if (followerCount >= 1) {
        await this.awardBadge(userId, BadgeType.FIRST_FOLLOWER);
      }
    } catch (error) {
      console.error('[BADGE] Error checking follower badges:', error);
    }
  }

  /**
   * Check and award verification badges
   */
  async checkVerificationBadges(userId: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          role: true,
          doctorVerificationStatus: true,
          specialty: true
        }
      });

      if (!user) return;

      if (user.role === 'DOCTOR' && user.doctorVerificationStatus === 'APPROVED') {
        await this.awardBadge(userId, BadgeType.VERIFIED_DOCTOR);
        
        // Award specialist badge if they have a specialty
        if (user.specialty) {
          await this.awardBadge(userId, BadgeType.VERIFIED_SPECIALIST);
        }
      }
    } catch (error) {
      console.error('[BADGE] Error checking verification badges:', error);
    }
  }

  /**
   * Check and award engagement badges
   */
  async checkEngagementBadges(userId: string): Promise<void> {
    try {
      // Check post count
      const postCount = await prisma.post.count({
        where: { authorId: userId }
      });

      if (postCount >= 50) {
        await this.awardBadge(userId, BadgeType.FIFTY_POSTS);
      } else if (postCount >= 10) {
        await this.awardBadge(userId, BadgeType.TEN_POSTS);
      } else if (postCount >= 1) {
        await this.awardBadge(userId, BadgeType.FIRST_POST);
      }

      // Check karma
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { totalKarma: true }
      });

      if (user && user.totalKarma >= 500) {
        await this.awardBadge(userId, BadgeType.COMMUNITY_LEADER);
      } else if (user && user.totalKarma >= 100) {
        await this.awardBadge(userId, BadgeType.HELPFUL_CONTRIBUTOR);
      }
    } catch (error) {
      console.error('[BADGE] Error checking engagement badges:', error);
    }
  }

  /**
   * Get all badges for a user
   */
  async getUserBadges(userId: string) {
    try {
      const userBadges = await prisma.userBadge.findMany({
        where: { userId },
        orderBy: { earnedAt: 'desc' }
      });

      return userBadges.map(ub => ({
        ...BADGE_DEFINITIONS[ub.badgeType as BadgeType],
        earnedAt: ub.earnedAt
      }));
    } catch (error) {
      console.error('[BADGE] Error getting user badges:', error);
      return [];
    }
  }

  /**
   * Get badge statistics for a user
   */
  async getUserBadgeStats(userId: string) {
    try {
      const badges = await prisma.userBadge.findMany({
        where: { userId }
      });

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { badgePoints: true }
      });

      const byCategory = badges.reduce((acc, badge) => {
        const def = BADGE_DEFINITIONS[badge.badgeType as BadgeType];
        acc[def.category] = (acc[def.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const byRarity = badges.reduce((acc, badge) => {
        const def = BADGE_DEFINITIONS[badge.badgeType as BadgeType];
        acc[def.rarity] = (acc[def.rarity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalBadges: badges.length,
        totalPoints: user?.badgePoints || 0,
        byCategory,
        byRarity,
        recentBadges: badges
          .sort((a, b) => b.earnedAt.getTime() - a.earnedAt.getTime())
          .slice(0, 5)
          .map(b => ({
            ...BADGE_DEFINITIONS[b.badgeType as BadgeType],
            earnedAt: b.earnedAt
          }))
      };
    } catch (error) {
      console.error('[BADGE] Error getting badge stats:', error);
      return null;
    }
  }

  /**
   * Get all available badges
   */
  getAllBadges() {
    return Object.values(BADGE_DEFINITIONS);
  }

  /**
   * Background job to check all badges for a user
   */
  async evaluateAllBadges(userId: string): Promise<void> {
    console.log(`[BADGE] Evaluating all badges for user ${userId}`);
    
    try {
      await Promise.all([
        this.checkAppointmentBadges(userId),
        this.checkConsultationBadges(userId),
        this.checkFollowerBadges(userId),
        this.checkVerificationBadges(userId),
        this.checkEngagementBadges(userId)
      ]);
      
      console.log(`[BADGE] Completed badge evaluation for user ${userId}`);
    } catch (error) {
      console.error('[BADGE] Error evaluating badges:', error);
    }
  }
}

export const badgeService = new BadgeService();
export { BADGE_DEFINITIONS };
