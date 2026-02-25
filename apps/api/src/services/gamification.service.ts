/**
 * Gamification Service
 * Handles badges, achievements, leaderboards, and points for doctors
 */

import { prisma } from '@medthread/database';

export class GamificationService {
  /**
   * Check and award badges to a doctor
   */
  async checkAndAwardBadges(doctorId: string) {
    await prisma.$executeRaw`SELECT check_and_award_badges(${doctorId})`;
  }

  /**
   * Get doctor's badges
   */
  async getDoctorBadges(doctorId: string) {
    const badges = await prisma.$queryRaw<any[]>`
      SELECT 
        db.*,
        b.name,
        b.description,
        b.category,
        b.icon,
        b.color,
        b.rarity,
        b.points,
        b.badge_image_url
      FROM "DoctorBadge" db
      INNER JOIN "Badge" b ON db.badge_id = b.id
      WHERE db.doctor_id = ${doctorId}
      ORDER BY db.earned_at DESC
    `;

    return badges;
  }

  /**
   * Get all available badges
   */
  async getAllBadges() {
    const badges = await prisma.$queryRaw<any[]>`
      SELECT * FROM "Badge"
      WHERE is_active = true
        AND is_secret = false
      ORDER BY display_order ASC, rarity DESC
    `;

    return badges;
  }

  /**
   * Get doctor's achievements with progress
   */
  async getDoctorAchievements(doctorId: string) {
    const achievements = await prisma.$queryRaw<any[]>`
      SELECT 
        da.*,
        a.name,
        a.description,
        a.category,
        a.has_tiers,
        a.tier_requirements,
        a.points_per_tier,
        a.icon,
        a.color
      FROM "DoctorAchievement" da
      INNER JOIN "Achievement" a ON da.achievement_id = a.id
      WHERE da.doctor_id = ${doctorId}
      ORDER BY da.is_completed ASC, da.current_value DESC
    `;

    return achievements;
  }

  /**
   * Update achievement progress
   */
  async updateAchievementProgress(doctorId: string, achievementKey: string, newValue: number) {
    const achievement = await prisma.$queryRaw<any[]>`
      SELECT * FROM "Achievement" WHERE achievement_key = ${achievementKey}
    `;

    if (achievement.length === 0) return;

    const ach = achievement[0];
    
    // Determine current tier
    let currentTier = null;
    let pointsEarned = 0;

    if (ach.has_tiers && ach.tier_requirements) {
      const tiers = ach.tier_requirements as any[];
      for (const tier of tiers.sort((a, b) => b.value - a.value)) {
        if (newValue >= tier.value) {
          currentTier = tier.tier;
          pointsEarned = ach.points_per_tier[tier.tier] || 0;
          break;
        }
      }
    }

    // Upsert achievement progress
    await prisma.$executeRaw`
      INSERT INTO "DoctorAchievement" (
        doctor_id, achievement_id, current_value, current_tier,
        is_completed, total_points_earned, last_updated
      ) VALUES (
        ${doctorId}, ${ach.id}, ${newValue}, ${currentTier},
        ${currentTier === 'platinum'}, ${pointsEarned}, CURRENT_TIMESTAMP
      )
      ON CONFLICT (doctor_id, achievement_id) DO UPDATE
      SET current_value = ${newValue},
          current_tier = ${currentTier},
          is_completed = ${currentTier === 'platinum'},
          total_points_earned = ${pointsEarned},
          last_updated = CURRENT_TIMESTAMP
    `;

    // Award points if tier changed
    if (currentTier && pointsEarned > 0) {
      await this.awardPoints(doctorId, pointsEarned, 'achievement', ach.id.toString(), `Achievement: ${ach.name} - ${currentTier}`);
    }
  }

  /**
   * Award points to a doctor
   */
  async awardPoints(
    doctorId: string,
    points: number,
    transactionType: string,
    referenceId?: string,
    description?: string
  ) {
    // Get current points
    const current = await prisma.$queryRaw<any[]>`
      SELECT total_points FROM "DoctorPoints" WHERE doctor_id = ${doctorId}
    `;

    const currentPoints = current.length > 0 ? current[0].total_points : 0;
    const newTotal = currentPoints + points;

    // Calculate level
    const newLevel = Math.floor(newTotal / 100) + 1;
    const pointsToNextLevel = (newLevel * 100) - newTotal;

    // Update points
    await prisma.$executeRaw`
      INSERT INTO "DoctorPoints" (
        doctor_id, total_points, activity_points, current_level, points_to_next_level
      ) VALUES (
        ${doctorId}, ${points}, ${points}, ${newLevel}, ${pointsToNextLevel}
      )
      ON CONFLICT (doctor_id) DO UPDATE
      SET total_points = ${newTotal},
          activity_points = "DoctorPoints".activity_points + ${points},
          current_level = ${newLevel},
          points_to_next_level = ${pointsToNextLevel},
          updated_at = CURRENT_TIMESTAMP
    `;

    // Record transaction
    await prisma.$executeRaw`
      INSERT INTO "PointsTransaction" (
        doctor_id, transaction_type, points_change, reference_type,
        reference_id, description, balance_after
      ) VALUES (
        ${doctorId}, ${transactionType}, ${points}, ${transactionType},
        ${referenceId || null}, ${description || null}, ${newTotal}
      )
    `;

    // Update user table
    await prisma.$executeRaw`
      UPDATE "User"
      SET total_gamification_points = ${newTotal},
          gamification_level = ${newLevel}
      WHERE id = ${doctorId}
    `;

    return { newTotal, newLevel, pointsToNextLevel };
  }

  /**
   * Update activity streak
   */
  async updateActivityStreak(doctorId: string) {
    const today = new Date().toISOString().split('T')[0];
    
    const points = await prisma.$queryRaw<any[]>`
      SELECT last_activity_date, current_streak_days, longest_streak_days
      FROM "DoctorPoints"
      WHERE doctor_id = ${doctorId}
    `;

    let currentStreak = 0;
    let longestStreak = 0;

    if (points.length > 0) {
      const lastActivity = points[0].last_activity_date;
      currentStreak = points[0].current_streak_days || 0;
      longestStreak = points[0].longest_streak_days || 0;

      if (lastActivity) {
        const lastDate = new Date(lastActivity);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Consecutive day
          currentStreak += 1;
        } else if (diffDays > 1) {
          // Streak broken
          currentStreak = 1;
        }
        // If diffDays === 0, same day, don't change streak
      } else {
        currentStreak = 1;
      }

      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
      longestStreak = 1;
    }

    // Update streak
    await prisma.$executeRaw`
      INSERT INTO "DoctorPoints" (
        doctor_id, current_streak_days, longest_streak_days, last_activity_date
      ) VALUES (
        ${doctorId}, ${currentStreak}, ${longestStreak}, ${today}::date
      )
      ON CONFLICT (doctor_id) DO UPDATE
      SET current_streak_days = ${currentStreak},
          longest_streak_days = ${longestStreak},
          last_activity_date = ${today}::date,
          updated_at = CURRENT_TIMESTAMP
    `;

    // Update user table
    await prisma.$executeRaw`
      UPDATE "User"
      SET current_streak_days = ${currentStreak}
      WHERE id = ${doctorId}
    `;

    // Award streak milestone badges
    if (currentStreak === 7 || currentStreak === 30 || currentStreak === 100) {
      await this.checkAndAwardBadges(doctorId);
    }

    return { currentStreak, longestStreak };
  }

  /**
   * Get doctor's points and level
   */
  async getDoctorPoints(doctorId: string) {
    const points = await prisma.$queryRaw<any[]>`
      SELECT * FROM "DoctorPoints" WHERE doctor_id = ${doctorId}
    `;

    if (points.length === 0) {
      return {
        total_points: 0,
        current_level: 1,
        points_to_next_level: 100,
        current_streak_days: 0,
        longest_streak_days: 0
      };
    }

    return points[0];
  }

  /**
   * Get points transaction history
   */
  async getPointsHistory(doctorId: string, limit = 50) {
    const history = await prisma.$queryRaw<any[]>`
      SELECT * FROM "PointsTransaction"
      WHERE doctor_id = ${doctorId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    return history;
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(leaderboardKey: string, limit = 100) {
    const leaderboard = await prisma.$queryRaw<any[]>`
      SELECT 
        le.*,
        u.username,
        u.avatar,
        u.specialty,
        u.verified
      FROM "LeaderboardEntry" le
      INNER JOIN "User" u ON le.doctor_id = u.id
      WHERE le.leaderboard_id = (
        SELECT id FROM "Leaderboard" WHERE leaderboard_key = ${leaderboardKey}
      )
      ORDER BY le.rank_position ASC
      LIMIT ${limit}
    `;

    return leaderboard;
  }

  /**
   * Get all active leaderboards
   */
  async getAllLeaderboards() {
    const leaderboards = await prisma.$queryRaw<any[]>`
      SELECT * FROM "Leaderboard"
      WHERE is_active = true
      ORDER BY display_order ASC
    `;

    return leaderboards;
  }

  /**
   * Update all leaderboards
   */
  async updateLeaderboards() {
    await prisma.$executeRaw`SELECT update_leaderboards()`;
  }

  /**
   * Get doctor's rank in leaderboard
   */
  async getDoctorRank(doctorId: string, leaderboardKey: string) {
    const rank = await prisma.$queryRaw<any[]>`
      SELECT * FROM "LeaderboardEntry"
      WHERE doctor_id = ${doctorId}
        AND leaderboard_id = (
          SELECT id FROM "Leaderboard" WHERE leaderboard_key = ${leaderboardKey}
        )
    `;

    return rank.length > 0 ? rank[0] : null;
  }

  /**
   * Get gamification summary for doctor
   */
  async getGamificationSummary(doctorId: string) {
    const [points, badges, achievements, weeklyRank, satisfactionRank] = await Promise.all([
      this.getDoctorPoints(doctorId),
      this.getDoctorBadges(doctorId),
      this.getDoctorAchievements(doctorId),
      this.getDoctorRank(doctorId, 'weekly_top_doctors'),
      this.getDoctorRank(doctorId, 'highest_satisfaction')
    ]);

    return {
      points,
      badges: {
        total: badges.length,
        recent: badges.slice(0, 5),
        byRarity: {
          common: badges.filter(b => b.rarity === 'common').length,
          rare: badges.filter(b => b.rarity === 'rare').length,
          epic: badges.filter(b => b.rarity === 'epic').length,
          legendary: badges.filter(b => b.rarity === 'legendary').length
        }
      },
      achievements: {
        total: achievements.length,
        completed: achievements.filter(a => a.is_completed).length,
        inProgress: achievements.filter(a => !a.is_completed).length
      },
      leaderboards: {
        weeklyRank: weeklyRank?.rank_position || null,
        satisfactionRank: satisfactionRank?.rank_position || null
      }
    };
  }

  /**
   * Award points for activity
   */
  async awardActivityPoints(doctorId: string, activityType: string, referenceId?: string) {
    const pointsMap: { [key: string]: number } = {
      'reply': 5,
      'helpful_vote': 10,
      'consultation_completed': 20,
      'review_received': 15,
      'profile_updated': 5
    };

    const points = pointsMap[activityType] || 0;
    if (points > 0) {
      await this.awardPoints(doctorId, points, activityType, referenceId, `Activity: ${activityType}`);
      await this.updateActivityStreak(doctorId);
    }
  }
}

export const gamificationService = new GamificationService();
