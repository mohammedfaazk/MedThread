/**
 * Doctor Ranking Service
 * Handles doctor ratings, rankings, and leaderboards
 */

import { prisma } from '@medthread/database';

interface RankingCriteria {
  overallRating?: boolean;
  responseTime?: boolean;
  successRate?: boolean;
  satisfaction?: boolean;
  experience?: boolean;
  specializationMatch?: boolean;
}

interface RegionalFilter {
  regionType?: 'city' | 'state' | 'country' | 'overall';
  regionName?: string;
  specialty?: string;
}

export class DoctorRankingService {
  /**
   * Calculate overall rank score for a doctor
   */
  calculateRankScore(rating: any, weights = {
    overallRating: 0.30,
    responseTime: 0.15,
    successRate: 0.20,
    satisfaction: 0.20,
    helpfulReplies: 0.10,
    experience: 0.05
  }): number {
    const overallScore = (parseFloat(rating.overall_rating) / 5) * 100;
    const responseScore = Math.max(0, 100 - (rating.response_time_minutes / 60) * 10);
    const successScore = parseFloat(rating.consultation_success_rate);
    const satisfactionScore = (parseFloat(rating.patient_satisfaction_score) / 5) * 100;
    const helpfulScore = rating.total_replies_count > 0 
      ? (rating.helpful_replies_count / rating.total_replies_count) * 100 
      : 0;
    const experienceScore = Math.min(100, (rating.years_of_experience || 0) * 5);

    const rankScore = 
      (overallScore * weights.overallRating) +
      (responseScore * weights.responseTime) +
      (successScore * weights.successRate) +
      (satisfactionScore * weights.satisfaction) +
      (helpfulScore * weights.helpfulReplies) +
      (experienceScore * weights.experience);

    return Math.round(rankScore * 100) / 100;
  }

  /**
   * Get top doctors with filtering
   */
  async getTopDoctors(options: {
    limit?: number;
    offset?: number;
    regionType?: string;
    regionName?: string;
    specialty?: string;
    criteria?: RankingCriteria;
  }) {
    const { limit = 20, offset = 0, regionType, regionName, specialty, criteria } = options;

    let query = `
      SELECT 
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
        dr.overall_rating as rating_overall,
        dr.total_reviews as review_count,
        dr.response_time_minutes,
        dr.consultation_success_rate,
        dr.patient_satisfaction_score,
        dr.specialization_match_score,
        dr.helpful_replies_count,
        dr.total_replies_count,
        dr.last_active_at
    `;

    // Add regional rank if filtering by region
    if (regionType && regionName) {
      query += `,
        drr.rank_position as regional_rank,
        drr.rank_score as regional_score
      `;
    }

    query += `
      FROM "User" u
      INNER JOIN "DoctorRating" dr ON u.id = dr.doctor_id
    `;

    if (regionType && regionName) {
      query += `
        LEFT JOIN "DoctorRegionalRank" drr ON u.id = drr.doctor_id 
          AND drr.region_type = $1 
          AND drr.region_name = $2
      `;
    }

    query += `
      WHERE u.role IN ('DOCTOR', 'NURSE', 'PHARMACIST')
        AND u.verified = true
    `;

    if (specialty) {
      query += ` AND u.specialty ILIKE $${regionType && regionName ? 3 : 1}`;
    }

    // Order by criteria
    if (criteria?.overallRating) {
      query += ` ORDER BY dr.overall_rating DESC`;
    } else if (criteria?.responseTime) {
      query += ` ORDER BY dr.response_time_minutes ASC`;
    } else if (criteria?.successRate) {
      query += ` ORDER BY dr.consultation_success_rate DESC`;
    } else if (criteria?.satisfaction) {
      query += ` ORDER BY dr.patient_satisfaction_score DESC`;
    } else if (regionType && regionName) {
      query += ` ORDER BY drr.rank_position ASC NULLS LAST`;
    } else {
      query += ` ORDER BY dr.overall_rating DESC, dr.total_reviews DESC`;
    }

    query += ` LIMIT $${specialty ? (regionType && regionName ? 4 : 2) : (regionType && regionName ? 3 : 1)}`;
    query += ` OFFSET $${specialty ? (regionType && regionName ? 5 : 3) : (regionType && regionName ? 4 : 2)}`;

    const params: any[] = [];
    if (regionType && regionName) {
      params.push(regionType, regionName);
    }
    if (specialty) {
      params.push(`%${specialty}%`);
    }
    params.push(limit, offset);

    const doctors = await prisma.$queryRawUnsafe(query, ...params);
    return doctors;
  }

  /**
   * Get rising star doctors (new doctors with high ratings)
   */
  async getRisingStars(limit = 10) {
    const doctors = await prisma.$queryRaw`
      SELECT 
        u.id,
        u.username,
        u.avatar,
        u.specialty,
        u."yearsOfExperience",
        u.verified,
        u.overall_rating,
        u.total_reviews,
        drs.rising_star_score,
        drs.account_age_days,
        drs.rating_velocity,
        drs.reply_velocity,
        dr.overall_rating as current_rating,
        dr.total_reviews as review_count
      FROM "User" u
      INNER JOIN "DoctorRisingStar" drs ON u.id = drs.doctor_id
      INNER JOIN "DoctorRating" dr ON u.id = dr.doctor_id
      WHERE u.role IN ('DOCTOR', 'NURSE', 'PHARMACIST')
        AND u.verified = true
        AND drs.account_age_days <= 180
      ORDER BY drs.rising_star_score DESC
      LIMIT ${limit}
    `;

    return doctors;
  }

  /**
   * Get trending doctors (based on recent activity)
   */
  async getTrendingDoctors(limit = 10) {
    const doctors = await prisma.$queryRaw`
      SELECT 
        u.id,
        u.username,
        u.avatar,
        u.specialty,
        u."yearsOfExperience",
        u.verified,
        u.overall_rating,
        u.total_reviews,
        dt.trending_score,
        dt.reply_count_7d,
        dt.helpful_count_7d,
        dt.view_count_7d,
        dt.rating_change_7d,
        dr.overall_rating as current_rating
      FROM "User" u
      INNER JOIN "DoctorTrending" dt ON u.id = dt.doctor_id
      INNER JOIN "DoctorRating" dr ON u.id = dr.doctor_id
      WHERE u.role IN ('DOCTOR', 'NURSE', 'PHARMACIST')
        AND u.verified = true
        AND dt.week_start_date = DATE_TRUNC('week', CURRENT_DATE)
      ORDER BY dt.trending_score DESC
      LIMIT ${limit}
    `;

    return doctors;
  }

  /**
   * Get most helpful doctors in a specialty
   */
  async getMostHelpfulInSpecialty(specialty: string, limit = 10) {
    const doctors = await prisma.$queryRaw`
      SELECT 
        u.id,
        u.username,
        u.avatar,
        u.specialty,
        u."yearsOfExperience",
        u.verified,
        u.overall_rating,
        u.total_reviews,
        dsr.helpful_count,
        dsr.total_replies,
        dsr.helpful_percentage,
        dsr.avg_rating,
        dsr.rank_position
      FROM "User" u
      INNER JOIN "DoctorSpecialtyRank" dsr ON u.id = dsr.doctor_id
      WHERE u.role IN ('DOCTOR', 'NURSE', 'PHARMACIST')
        AND u.verified = true
        AND dsr.specialty = ${specialty}
      ORDER BY dsr.rank_position ASC
      LIMIT ${limit}
    `;

    return doctors;
  }

  /**
   * Update doctor rating statistics
   */
  async updateDoctorRating(doctorId: string) {
    // Calculate average rating from reviews
    const reviewStats = await prisma.$queryRaw<any[]>`
      SELECT 
        AVG(rating) as avg_rating,
        COUNT(*) as total_reviews,
        AVG(response_time_rating) as avg_response_rating,
        AVG(professionalism_rating) as avg_professionalism,
        AVG(communication_rating) as avg_communication
      FROM "DoctorReview"
      WHERE doctor_id = ${doctorId}
        AND is_verified = true
    `;

    const stats = reviewStats[0];

    // Calculate response time from comments
    const responseTime = await prisma.$queryRaw<any[]>`
      SELECT 
        AVG(EXTRACT(EPOCH FROM (c.created_at - p.created_at)) / 60) as avg_response_minutes
      FROM "Comment" c
      INNER JOIN "Post" p ON c."postId" = p.id
      WHERE c."authorId" = ${doctorId}
        AND c."parentId" IS NULL
    `;

    const avgResponseMinutes = responseTime[0]?.avg_response_minutes || 0;

    // Calculate helpful replies
    const helpfulStats = await prisma.$queryRaw<any[]>`
      SELECT 
        COUNT(*) FILTER (WHERE upvotes > 5) as helpful_count,
        COUNT(*) as total_replies
      FROM "Comment"
      WHERE "authorId" = ${doctorId}
    `;

    const helpful = helpfulStats[0];

    // Calculate consultation success rate (based on completed appointments)
    const consultationStats = await prisma.$queryRaw<any[]>`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed,
        COUNT(*) as total
      FROM "Appointment"
      WHERE "doctorId" = ${doctorId}
    `;

    const consultation = consultationStats[0];
    const successRate = consultation.total > 0 
      ? (consultation.completed / consultation.total) * 100 
      : 0;

    // Upsert doctor rating
    await prisma.$executeRaw`
      INSERT INTO "DoctorRating" (
        doctor_id, overall_rating, total_reviews, response_time_minutes,
        consultation_success_rate, patient_satisfaction_score,
        helpful_replies_count, total_replies_count, last_active_at, updated_at
      ) VALUES (
        ${doctorId}, ${stats.avg_rating || 0}, ${stats.total_reviews || 0},
        ${Math.round(avgResponseMinutes)}, ${successRate}, ${stats.avg_rating || 0},
        ${helpful.helpful_count || 0}, ${helpful.total_replies || 0},
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      ON CONFLICT (doctor_id) DO UPDATE
      SET overall_rating = ${stats.avg_rating || 0},
          total_reviews = ${stats.total_reviews || 0},
          response_time_minutes = ${Math.round(avgResponseMinutes)},
          consultation_success_rate = ${successRate},
          patient_satisfaction_score = ${stats.avg_rating || 0},
          helpful_replies_count = ${helpful.helpful_count || 0},
          total_replies_count = ${helpful.total_replies || 0},
          last_active_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
    `;

    // Update User table
    await prisma.$executeRaw`
      UPDATE "User"
      SET overall_rating = ${stats.avg_rating || 0},
          total_reviews = ${stats.total_reviews || 0},
          response_time_avg = ${Math.round(avgResponseMinutes)},
          consultation_count = ${consultation.total || 0}
      WHERE id = ${doctorId}
    `;
  }

  /**
   * Calculate and update regional rankings
   */
  async updateRegionalRankings() {
    // Get all doctors with ratings
    const doctors = await prisma.$queryRaw<any[]>`
      SELECT 
        u.id,
        u.specialty,
        dc.city,
        dc.state,
        dc.country,
        dr.overall_rating,
        dr.total_reviews,
        dr.response_time_minutes,
        dr.consultation_success_rate,
        dr.patient_satisfaction_score,
        dr.helpful_replies_count,
        dr.total_replies_count,
        u."yearsOfExperience"
      FROM "User" u
      INNER JOIN "DoctorRating" dr ON u.id = dr.doctor_id
      LEFT JOIN "DoctorClinic" dc ON u.id = dc.doctor_id AND dc.is_primary = true
      WHERE u.role IN ('DOCTOR', 'NURSE', 'PHARMACIST')
        AND u.verified = true
    `;

    // Group by regions and calculate ranks
    const regionGroups = new Map<string, any[]>();

    doctors.forEach(doctor => {
      const rankScore = this.calculateRankScore(doctor);
      doctor.rank_score = rankScore;

      // Group by city
      if (doctor.city) {
        const cityKey = `city:${doctor.city}:${doctor.specialty || 'all'}`;
        if (!regionGroups.has(cityKey)) regionGroups.set(cityKey, []);
        regionGroups.get(cityKey)!.push({ ...doctor, region_type: 'city', region_name: doctor.city });
      }

      // Group by state
      if (doctor.state) {
        const stateKey = `state:${doctor.state}:${doctor.specialty || 'all'}`;
        if (!regionGroups.has(stateKey)) regionGroups.set(stateKey, []);
        regionGroups.get(stateKey)!.push({ ...doctor, region_type: 'state', region_name: doctor.state });
      }

      // Group by country
      if (doctor.country) {
        const countryKey = `country:${doctor.country}:${doctor.specialty || 'all'}`;
        if (!regionGroups.has(countryKey)) regionGroups.set(countryKey, []);
        regionGroups.get(countryKey)!.push({ ...doctor, region_type: 'country', region_name: doctor.country });
      }
    });

    // Clear existing rankings
    await prisma.$executeRaw`DELETE FROM "DoctorRegionalRank"`;

    // Insert new rankings
    for (const [key, group] of regionGroups) {
      const sorted = group.sort((a, b) => b.rank_score - a.rank_score);
      
      for (let i = 0; i < sorted.length; i++) {
        const doctor = sorted[i];
        await prisma.$executeRaw`
          INSERT INTO "DoctorRegionalRank" (
            doctor_id, region_type, region_name, rank_position, rank_score, specialty
          ) VALUES (
            ${doctor.id}, ${doctor.region_type}, ${doctor.region_name},
            ${i + 1}, ${doctor.rank_score}, ${doctor.specialty || null}
          )
          ON CONFLICT (doctor_id, region_type, region_name, specialty) DO UPDATE
          SET rank_position = ${i + 1},
              rank_score = ${doctor.rank_score},
              calculated_at = CURRENT_TIMESTAMP
        `;
      }
    }
  }

  /**
   * Calculate and update trending doctors
   */
  async updateTrendingDoctors() {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const doctors = await prisma.$queryRaw<any[]>`
      SELECT 
        c."authorId" as doctor_id,
        COUNT(*) as reply_count_7d,
        COUNT(*) FILTER (WHERE c.upvotes > 5) as helpful_count_7d,
        SUM(pa.views) as view_count_7d
      FROM "Comment" c
      LEFT JOIN "Post" p ON c."postId" = p.id
      LEFT JOIN "PostAnalytics" pa ON p.id = pa."postId"
      WHERE c.created_at >= ${weekStart}
        AND c."authorId" IN (
          SELECT id FROM "User" WHERE role IN ('DOCTOR', 'NURSE', 'PHARMACIST')
        )
      GROUP BY c."authorId"
      HAVING COUNT(*) >= 5
    `;

    // Clear existing trending
    await prisma.$executeRaw`DELETE FROM "DoctorTrending" WHERE week_start_date = ${weekStart}`;

    // Calculate trending scores and insert
    for (const doctor of doctors) {
      const trendingScore = 
        (doctor.reply_count_7d * 10) +
        (doctor.helpful_count_7d * 20) +
        ((doctor.view_count_7d || 0) * 0.1);

      await prisma.$executeRaw`
        INSERT INTO "DoctorTrending" (
          doctor_id, trending_score, reply_count_7d, helpful_count_7d,
          view_count_7d, week_start_date
        ) VALUES (
          ${doctor.doctor_id}, ${trendingScore}, ${doctor.reply_count_7d},
          ${doctor.helpful_count_7d}, ${doctor.view_count_7d || 0}, ${weekStart}
        )
      `;
    }

    // Update User table
    await prisma.$executeRaw`
      UPDATE "User"
      SET is_trending = true
      WHERE id IN (
        SELECT doctor_id FROM "DoctorTrending"
        WHERE week_start_date = ${weekStart}
        ORDER BY trending_score DESC
        LIMIT 20
      )
    `;

    await prisma.$executeRaw`
      UPDATE "User"
      SET is_trending = false
      WHERE id NOT IN (
        SELECT doctor_id FROM "DoctorTrending"
        WHERE week_start_date = ${weekStart}
        ORDER BY trending_score DESC
        LIMIT 20
      )
    `;
  }

  /**
   * Calculate and update rising stars
   */
  async updateRisingStars() {
    const doctors = await prisma.$queryRaw<any[]>`
      SELECT 
        u.id,
        EXTRACT(DAY FROM (CURRENT_DATE - u.created_at)) as account_age_days,
        dr.overall_rating,
        dr.total_reviews,
        dr.helpful_replies_count,
        dr.total_replies_count
      FROM "User" u
      INNER JOIN "DoctorRating" dr ON u.id = dr.doctor_id
      WHERE u.role IN ('DOCTOR', 'NURSE', 'PHARMACIST')
        AND u.verified = true
        AND EXTRACT(DAY FROM (CURRENT_DATE - u.created_at)) <= 180
        AND dr.total_reviews >= 5
        AND dr.overall_rating >= 4.0
    `;

    // Clear existing rising stars
    await prisma.$executeRaw`DELETE FROM "DoctorRisingStar"`;

    for (const doctor of doctors) {
      const accountAgeWeeks = doctor.account_age_days / 7;
      const ratingVelocity = doctor.overall_rating / accountAgeWeeks;
      const replyVelocity = doctor.total_replies_count / accountAgeWeeks;
      
      const risingStarScore = 
        (doctor.overall_rating * 20) +
        (ratingVelocity * 30) +
        (replyVelocity * 10) +
        (doctor.total_reviews * 5);

      await prisma.$executeRaw`
        INSERT INTO "DoctorRisingStar" (
          doctor_id, rising_star_score, account_age_days,
          rating_velocity, reply_velocity
        ) VALUES (
          ${doctor.id}, ${risingStarScore}, ${doctor.account_age_days},
          ${ratingVelocity}, ${replyVelocity}
        )
      `;
    }

    // Update User table
    await prisma.$executeRaw`
      UPDATE "User"
      SET is_rising_star = true
      WHERE id IN (
        SELECT doctor_id FROM "DoctorRisingStar"
        ORDER BY rising_star_score DESC
        LIMIT 20
      )
    `;

    await prisma.$executeRaw`
      UPDATE "User"
      SET is_rising_star = false
      WHERE id NOT IN (
        SELECT doctor_id FROM "DoctorRisingStar"
        ORDER BY rising_star_score DESC
        LIMIT 20
      )
    `;
  }
}

export const doctorRankingService = new DoctorRankingService();
