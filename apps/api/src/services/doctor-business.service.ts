/**
 * Doctor Business Service
 * Handles business analytics and marketing tools for doctors
 */

import { prisma } from '@medthread/database';

interface AnalyticsFilter {
  startDate?: Date;
  endDate?: Date;
  period?: 'day' | 'week' | 'month' | 'year';
}

export class DoctorBusinessService {
  /**
   * Get comprehensive business analytics for a doctor
   */
  async getDoctorAnalytics(doctorId: string, filter: AnalyticsFilter = {}) {
    const { startDate, endDate, period = 'month' } = filter;
    
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    // Get analytics data
    const analytics = await prisma.$queryRaw<any[]>`
      SELECT 
        date,
        profile_views_total,
        profile_views_seo,
        profile_views_platform,
        consultation_requests,
        consultations_completed,
        conversion_rate,
        revenue_total,
        revenue_consultations,
        platform_fee,
        net_revenue,
        new_patients,
        returning_patients,
        patient_retention_rate,
        average_rating,
        rating_trend,
        replies_posted,
        helpful_votes_received
      FROM "DoctorBusinessAnalytics"
      WHERE doctor_id = ${doctorId}
        AND date >= ${start}::date
        AND date <= ${end}::date
      ORDER BY date DESC
    `;

    // Calculate totals and averages
    const totals = {
      profileViews: analytics.reduce((sum, a) => sum + (a.profile_views_total || 0), 0),
      consultationRequests: analytics.reduce((sum, a) => sum + (a.consultation_requests || 0), 0),
      consultationsCompleted: analytics.reduce((sum, a) => sum + (a.consultations_completed || 0), 0),
      revenue: analytics.reduce((sum, a) => sum + parseFloat(a.revenue_total || 0), 0),
      netRevenue: analytics.reduce((sum, a) => sum + parseFloat(a.net_revenue || 0), 0),
      newPatients: analytics.reduce((sum, a) => sum + (a.new_patients || 0), 0),
      returningPatients: analytics.reduce((sum, a) => sum + (a.returning_patients || 0), 0),
    };

    const averages = {
      conversionRate: analytics.length > 0
        ? analytics.reduce((sum, a) => sum + parseFloat(a.conversion_rate || 0), 0) / analytics.length
        : 0,
      rating: analytics.length > 0
        ? analytics.reduce((sum, a) => sum + parseFloat(a.average_rating || 0), 0) / analytics.length
        : 0,
      retentionRate: analytics.length > 0
        ? analytics.reduce((sum, a) => sum + parseFloat(a.patient_retention_rate || 0), 0) / analytics.length
        : 0,
    };

    // Get rating trend
    const ratingTrend = await this.calculateRatingTrend(doctorId, start, end);

    return {
      analytics,
      totals,
      averages,
      ratingTrend,
      period: { start, end }
    };
  }

  /**
   * Calculate rating trend over time
   */
  async calculateRatingTrend(doctorId: string, startDate: Date, endDate: Date) {
    const ratings = await prisma.$queryRaw<any[]>`
      SELECT 
        date,
        average_rating
      FROM "DoctorBusinessAnalytics"
      WHERE doctor_id = ${doctorId}
        AND date >= ${startDate}::date
        AND date <= ${endDate}::date
        AND average_rating > 0
      ORDER BY date ASC
    `;

    if (ratings.length < 2) {
      return { trend: 'stable', change: 0, data: ratings };
    }

    const firstRating = parseFloat(ratings[0].average_rating);
    const lastRating = parseFloat(ratings[ratings.length - 1].average_rating);
    const change = lastRating - firstRating;

    let trend = 'stable';
    if (change > 0.1) trend = 'increasing';
    if (change < -0.1) trend = 'decreasing';

    return { trend, change: change.toFixed(2), data: ratings };
  }

  /**
   * Get revenue breakdown
   */
  async getRevenueBreakdown(doctorId: string, startDate: Date, endDate: Date) {
    const revenue = await prisma.$queryRaw<any[]>`
      SELECT 
        transaction_type,
        COUNT(*) as transaction_count,
        SUM(gross_amount) as gross_total,
        SUM(platform_fee_amount) as platform_fee_total,
        SUM(net_amount) as net_total
      FROM "DoctorRevenue"
      WHERE doctor_id = ${doctorId}
        AND transaction_date >= ${startDate}
        AND transaction_date <= ${endDate}
        AND payment_status = 'completed'
      GROUP BY transaction_type
      ORDER BY net_total DESC
    `;

    const total = revenue.reduce((sum, r) => sum + parseFloat(r.net_total || 0), 0);

    return {
      breakdown: revenue.map(r => ({
        type: r.transaction_type,
        count: parseInt(r.transaction_count),
        gross: parseFloat(r.gross_total),
        platformFee: parseFloat(r.platform_fee_total),
        net: parseFloat(r.net_total),
        percentage: total > 0 ? ((parseFloat(r.net_total) / total) * 100).toFixed(2) : 0
      })),
      total
    };
  }

  /**
   * Get patient retention metrics
   */
  async getPatientRetention(doctorId: string) {
    const retention = await prisma.$queryRaw<any[]>`
      SELECT 
        retention_status,
        COUNT(*) as patient_count,
        AVG(total_consultations) as avg_consultations,
        AVG(total_revenue) as avg_revenue,
        AVG(days_since_last_visit) as avg_days_since_visit
      FROM "PatientRetention"
      WHERE doctor_id = ${doctorId}
      GROUP BY retention_status
      ORDER BY 
        CASE retention_status
          WHEN 'active' THEN 1
          WHEN 'at_risk' THEN 2
          WHEN 'dormant' THEN 3
          WHEN 'churned' THEN 4
        END
    `;

    const totalPatients = retention.reduce((sum, r) => sum + parseInt(r.patient_count), 0);

    return {
      breakdown: retention.map(r => ({
        status: r.retention_status,
        count: parseInt(r.patient_count),
        percentage: totalPatients > 0 ? ((parseInt(r.patient_count) / totalPatients) * 100).toFixed(2) : 0,
        avgConsultations: parseFloat(r.avg_consultations).toFixed(1),
        avgRevenue: parseFloat(r.avg_revenue).toFixed(2),
        avgDaysSinceVisit: Math.round(r.avg_days_since_visit)
      })),
      totalPatients
    };
  }

  /**
   * Create promotion campaign
   */
  async createPromotion(doctorId: string, data: {
    promotionType: 'top_search' | 'featured_badge' | 'sponsored_answer';
    title: string;
    description?: string;
    targetSpecialty?: string;
    targetLocation?: string;
    targetKeywords?: string[];
    pricePerDay: number;
    startDate: Date;
    endDate: Date;
  }) {
    const { promotionType, startDate, endDate, pricePerDay } = data;
    
    // Calculate total price
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = pricePerDay * days;

    // Create promotion
    const promotion = await prisma.$queryRaw<any[]>`
      INSERT INTO "DoctorPromotion" (
        doctor_id, promotion_type, title, description,
        target_specialty, target_location, target_keywords,
        price_per_day, total_price, start_date, end_date
      ) VALUES (
        ${doctorId}, ${promotionType}, ${data.title}, ${data.description || null},
        ${data.targetSpecialty || null}, ${data.targetLocation || null},
        ${data.targetKeywords ? `{${data.targetKeywords.join(',')}}` : null}::TEXT[],
        ${pricePerDay}, ${totalPrice}, ${startDate}::date, ${endDate}::date
      )
      RETURNING *
    `;

    return promotion[0];
  }

  /**
   * Activate promotion after payment
   */
  async activatePromotion(promotionId: number, paymentId: string) {
    await prisma.$executeRaw`
      UPDATE "DoctorPromotion"
      SET payment_status = 'paid',
          payment_id = ${paymentId},
          is_active = true,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${promotionId}
    `;

    // Get promotion details
    const promotion = await prisma.$queryRaw<any[]>`
      SELECT * FROM "DoctorPromotion" WHERE id = ${promotionId}
    `;

    if (promotion.length === 0) return null;

    const promo = promotion[0];

    // Create specific promotion records based on type
    if (promo.promotion_type === 'featured_badge') {
      await prisma.$executeRaw`
        INSERT INTO "FeaturedDoctor" (
          doctor_id, promotion_id, start_date, end_date, is_active
        ) VALUES (
          ${promo.doctor_id}, ${promotionId}, ${promo.start_date}, ${promo.end_date}, true
        )
      `;

      // Update user featured status
      await prisma.$executeRaw`
        UPDATE "User"
        SET is_featured = true,
            featured_until = ${promo.end_date},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${promo.doctor_id}
      `;
    } else if (promo.promotion_type === 'top_search') {
      await prisma.$executeRaw`
        INSERT INTO "TopSearchPromotion" (
          doctor_id, promotion_id, search_keywords, search_location,
          search_specialty, start_date, end_date, is_active
        ) VALUES (
          ${promo.doctor_id}, ${promotionId}, ${promo.target_keywords},
          ${promo.target_location}, ${promo.target_specialty},
          ${promo.start_date}, ${promo.end_date}, true
        )
      `;
    }

    return promo;
  }

  /**
   * Get active promotions for a doctor
   */
  async getActivePromotions(doctorId: string) {
    const promotions = await prisma.$queryRaw<any[]>`
      SELECT 
        dp.*,
        CASE 
          WHEN dp.promotion_type = 'featured_badge' THEN fd.is_active
          WHEN dp.promotion_type = 'top_search' THEN tsp.is_active
          ELSE true
        END as is_currently_active
      FROM "DoctorPromotion" dp
      LEFT JOIN "FeaturedDoctor" fd ON dp.id = fd.promotion_id
      LEFT JOIN "TopSearchPromotion" tsp ON dp.id = tsp.promotion_id
      WHERE dp.doctor_id = ${doctorId}
        AND dp.is_active = true
        AND dp.end_date >= CURRENT_DATE
      ORDER BY dp.created_at DESC
    `;

    return promotions;
  }

  /**
   * Get promotion performance metrics
   */
  async getPromotionPerformance(promotionId: number) {
    const promotion = await prisma.$queryRaw<any[]>`
      SELECT * FROM "DoctorPromotion" WHERE id = ${promotionId}
    `;

    if (promotion.length === 0) return null;

    const promo = promotion[0];
    let performance: any = {
      impressions: promo.impressions,
      clicks: promo.clicks,
      conversions: promo.conversions,
      ctr: promo.ctr,
      conversionRate: promo.conversion_rate
    };

    // Get type-specific metrics
    if (promo.promotion_type === 'top_search') {
      const topSearch = await prisma.$queryRaw<any[]>`
        SELECT * FROM "TopSearchPromotion" WHERE promotion_id = ${promotionId}
      `;
      if (topSearch.length > 0) {
        performance = {
          ...performance,
          searchImpressions: topSearch[0].search_impressions,
          profileClicks: topSearch[0].profile_clicks,
          totalSpent: topSearch[0].total_spent
        };
      }
    } else if (promo.promotion_type === 'sponsored_answer') {
      const sponsored = await prisma.$queryRaw<any[]>`
        SELECT 
          SUM(impressions) as total_impressions,
          SUM(clicks) as total_clicks,
          SUM(total_spent) as total_spent,
          AVG(engagement_rate) as avg_engagement
        FROM "SponsoredAnswer"
        WHERE promotion_id = ${promotionId}
      `;
      if (sponsored.length > 0) {
        performance = {
          ...performance,
          totalImpressions: sponsored[0].total_impressions,
          totalClicks: sponsored[0].total_clicks,
          totalSpent: sponsored[0].total_spent,
          avgEngagement: sponsored[0].avg_engagement
        };
      }
    }

    return {
      promotion: promo,
      performance
    };
  }

  /**
   * Track promotion impression
   */
  async trackPromotionImpression(promotionId: number, type: 'search' | 'answer' | 'badge') {
    await prisma.$executeRaw`
      UPDATE "DoctorPromotion"
      SET impressions = impressions + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${promotionId}
    `;

    if (type === 'search') {
      await prisma.$executeRaw`
        UPDATE "TopSearchPromotion"
        SET search_impressions = search_impressions + 1
        WHERE promotion_id = ${promotionId}
      `;
    }
  }

  /**
   * Track promotion click
   */
  async trackPromotionClick(promotionId: number, type: 'search' | 'answer' | 'badge') {
    await prisma.$executeRaw`
      UPDATE "DoctorPromotion"
      SET clicks = clicks + 1,
          ctr = CASE 
            WHEN impressions > 0 THEN (clicks + 1)::DECIMAL / impressions * 100
            ELSE 0
          END,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${promotionId}
    `;

    if (type === 'search') {
      await prisma.$executeRaw`
        UPDATE "TopSearchPromotion"
        SET profile_clicks = profile_clicks + 1,
            ctr = CASE 
              WHEN search_impressions > 0 THEN (profile_clicks + 1)::DECIMAL / search_impressions * 100
              ELSE 0
            END
        WHERE promotion_id = ${promotionId}
      `;
    }
  }

  /**
   * Get featured doctors for display
   */
  async getFeaturedDoctors(limit = 10) {
    const featured = await prisma.$queryRaw<any[]>`
      SELECT 
        u.id,
        u.username,
        u.avatar,
        u.specialty,
        u."yearsOfExperience",
        u.verified,
        u.overall_rating,
        u.total_reviews,
        fd.badge_type,
        fd.badge_color,
        fd.display_priority
      FROM "FeaturedDoctor" fd
      INNER JOIN "User" u ON fd.doctor_id = u.id
      WHERE fd.is_active = true
        AND fd.start_date <= CURRENT_DATE
        AND fd.end_date >= CURRENT_DATE
      ORDER BY fd.display_priority DESC, u.overall_rating DESC
      LIMIT ${limit}
    `;

    return featured;
  }

  /**
   * Update daily analytics
   */
  async updateDailyAnalytics(doctorId: string, date: Date = new Date()) {
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);

    // Get profile views from SEO
    const seoViews = await prisma.$queryRaw<any[]>`
      SELECT COALESCE(SUM(organic_views), 0) as views
      FROM "SEOAnalytics"
      WHERE entity_type = 'doctor_profile'
        AND entity_id = ${doctorId}
        AND date = ${yesterday}::date
    `;

    // Get consultation metrics
    const consultations = await prisma.$queryRaw<any[]>`
      SELECT 
        COUNT(*) FILTER (WHERE created_at::date = ${yesterday}::date) as requests,
        COUNT(*) FILTER (WHERE status = 'COMPLETED' AND updated_at::date = ${yesterday}::date) as completed
      FROM "Appointment"
      WHERE "doctorId" = ${doctorId}
    `;

    // Get revenue
    const revenue = await prisma.$queryRaw<any[]>`
      SELECT 
        COALESCE(SUM(gross_amount), 0) as gross,
        COALESCE(SUM(platform_fee_amount), 0) as fee,
        COALESCE(SUM(net_amount), 0) as net
      FROM "DoctorRevenue"
      WHERE doctor_id = ${doctorId}
        AND transaction_date::date = ${yesterday}::date
    `;

    // Get patient metrics
    const patients = await prisma.$queryRaw<any[]>`
      SELECT 
        COUNT(*) FILTER (WHERE first_consultation_date = ${yesterday}::date) as new_patients,
        COUNT(*) FILTER (WHERE last_consultation_date = ${yesterday}::date AND total_consultations > 1) as returning
      FROM "PatientRetention"
      WHERE doctor_id = ${doctorId}
    `;

    // Calculate conversion rate
    const requests = consultations[0]?.requests || 0;
    const completed = consultations[0]?.completed || 0;
    const conversionRate = requests > 0 ? (completed / requests) * 100 : 0;

    // Upsert analytics
    await prisma.$executeRaw`
      INSERT INTO "DoctorBusinessAnalytics" (
        doctor_id, date, profile_views_seo, consultation_requests,
        consultations_completed, conversion_rate, revenue_total,
        platform_fee, net_revenue, new_patients, returning_patients
      ) VALUES (
        ${doctorId}, ${yesterday}::date, ${seoViews[0]?.views || 0},
        ${requests}, ${completed}, ${conversionRate},
        ${revenue[0]?.gross || 0}, ${revenue[0]?.fee || 0}, ${revenue[0]?.net || 0},
        ${patients[0]?.new_patients || 0}, ${patients[0]?.returning || 0}
      )
      ON CONFLICT (doctor_id, date) DO UPDATE
      SET profile_views_seo = ${seoViews[0]?.views || 0},
          consultation_requests = ${requests},
          consultations_completed = ${completed},
          conversion_rate = ${conversionRate},
          revenue_total = ${revenue[0]?.gross || 0},
          platform_fee = ${revenue[0]?.fee || 0},
          net_revenue = ${revenue[0]?.net || 0},
          new_patients = ${patients[0]?.new_patients || 0},
          returning_patients = ${patients[0]?.returning || 0},
          updated_at = CURRENT_TIMESTAMP
    `;
  }
}

export const doctorBusinessService = new DoctorBusinessService();
