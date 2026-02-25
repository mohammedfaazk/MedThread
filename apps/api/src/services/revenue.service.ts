/**
 * Revenue Service
 * Handles all monetization features for doctors and platform
 */

import { prisma } from '@medthread/database';

interface SubscriptionPurchase {
  doctorId: string;
  tierId: number;
  billingCycle: 'monthly' | 'annual';
  paymentMethod: string;
  isTrial?: boolean;
}

interface CommissionCalculation {
  consultationFee: number;
  doctorId: string;
  appointmentId: string;
  patientId: string;
}

export class RevenueService {
  /**
   * Get all subscription tiers
   */
  async getSubscriptionTiers() {
    const tiers = await prisma.$queryRaw<any[]>`
      SELECT *
      FROM "SubscriptionTier"
      WHERE is_active = true
      ORDER BY sort_order ASC
    `;

    return tiers;
  }

  /**
   * Purchase subscription
   */
  async purchaseSubscription(data: SubscriptionPurchase) {
    const { doctorId, tierId, billingCycle, paymentMethod, isTrial = false } = data;

    // Get tier details
    const tier = await prisma.$queryRaw<any[]>`
      SELECT * FROM "SubscriptionTier" WHERE id = ${tierId}
    `;

    if (tier.length === 0) {
      throw new Error('Subscription tier not found');
    }

    const tierData = tier[0];
    const amount = billingCycle === 'monthly' ? tierData.monthly_price : tierData.annual_price;
    const duration = billingCycle === 'monthly' ? 30 : 365;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duration);

    const nextBillingDate = new Date(endDate);

    // Create subscription
    await prisma.$executeRaw`
      INSERT INTO "DoctorSubscription" (
        doctor_id, tier_id, status, billing_cycle,
        start_date, end_date, next_billing_date,
        amount, currency, payment_method, auto_renew, is_trial
      ) VALUES (
        ${doctorId}, ${tierId}, 'active', ${billingCycle},
        ${startDate}, ${endDate}, ${nextBillingDate},
        ${amount}, 'USD', ${paymentMethod}, true, ${isTrial}
      )
    `;

    // Update user subscription status
    await prisma.$executeRaw`
      UPDATE "User"
      SET current_subscription_tier = ${tierData.tier_name},
          subscription_status = 'active',
          subscription_end_date = ${endDate},
          is_premium_member = ${tierData.tier_name !== 'free'}
      WHERE id = ${doctorId}
    `;

    // Create premium listing if applicable
    if (tierData.featured_listing || tierData.top_search_placement) {
      await prisma.$executeRaw`
        INSERT INTO "PremiumListing" (
          doctor_id, is_premium, is_featured,
          search_priority, premium_start_date, premium_end_date,
          visibility_multiplier
        ) VALUES (
          ${doctorId}, true, ${tierData.featured_listing},
          ${tierData.top_search_placement ? 100 : 50},
          ${startDate}, ${endDate}, ${tierData.tier_name === 'enterprise' ? 2.0 : 1.5}
        )
        ON CONFLICT (doctor_id) DO UPDATE
        SET is_premium = true,
            is_featured = ${tierData.featured_listing},
            search_priority = ${tierData.top_search_placement ? 100 : 50},
            premium_start_date = ${startDate},
            premium_end_date = ${endDate},
            visibility_multiplier = ${tierData.tier_name === 'enterprise' ? 2.0 : 1.5},
            updated_at = CURRENT_TIMESTAMP
      `;
    }

    // Record revenue transaction
    const transactionId = `SUB-${Date.now()}-${doctorId.substring(0, 8)}`;
    const subscriptionId = await prisma.$queryRaw<any[]>`
      SELECT id FROM "DoctorSubscription"
      WHERE doctor_id = ${doctorId}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    await prisma.$executeRaw`
      INSERT INTO "RevenueTransaction" (
        transaction_type, transaction_id, doctor_id,
        subscription_id, amount, currency, payment_method,
        status, transaction_date, completed_at
      ) VALUES (
        'subscription', ${transactionId}, ${doctorId},
        ${subscriptionId[0].id}, ${amount}, 'USD', ${paymentMethod},
        'completed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `;

    return { success: true, transactionId };
  }

  /**
   * Calculate and record consultation commission
   */
  async recordConsultationCommission(data: CommissionCalculation) {
    const { consultationFee, doctorId, appointmentId, patientId } = data;

    // Calculate commission using database function
    const commission = await prisma.$queryRaw<any[]>`
      SELECT * FROM calculate_commission(${consultationFee}, ${doctorId})
    `;

    const { commission_rate, commission_amount, doctor_payout } = commission[0];

    // Record commission
    await prisma.$executeRaw`
      INSERT INTO "ConsultationCommission" (
        appointment_id, doctor_id, patient_id,
        consultation_fee, commission_rate, commission_amount, doctor_payout,
        currency, status, consultation_date
      ) VALUES (
        ${appointmentId}, ${doctorId}, ${patientId},
        ${consultationFee}, ${commission_rate}, ${commission_amount}, ${doctor_payout},
        'USD', 'pending', CURRENT_TIMESTAMP
      )
    `;

    // Record revenue transaction
    const transactionId = `COM-${Date.now()}-${appointmentId.substring(0, 8)}`;
    const commissionId = await prisma.$queryRaw<any[]>`
      SELECT id FROM "ConsultationCommission"
      WHERE appointment_id = ${appointmentId}
    `;

    await prisma.$executeRaw`
      INSERT INTO "RevenueTransaction" (
        transaction_type, transaction_id, doctor_id, patient_id,
        commission_id, amount, currency, status,
        transaction_date, completed_at
      ) VALUES (
        'commission', ${transactionId}, ${doctorId}, ${patientId},
        ${commissionId[0].id}, ${commission_amount}, 'USD', 'completed',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `;

    return {
      commissionRate: commission_rate,
      commissionAmount: commission_amount,
      doctorPayout: doctor_payout
    };
  }

  /**
   * Get doctor's current subscription
   */
  async getDoctorSubscription(doctorId: string) {
    const subscription = await prisma.$queryRaw<any[]>`
      SELECT 
        ds.*,
        st.tier_name,
        st.display_name,
        st.features,
        st.priority_matching,
        st.advanced_analytics,
        st.featured_listing
      FROM "DoctorSubscription" ds
      INNER JOIN "SubscriptionTier" st ON ds.tier_id = st.id
      WHERE ds.doctor_id = ${doctorId}
        AND ds.status = 'active'
      ORDER BY ds.created_at DESC
      LIMIT 1
    `;

    return subscription.length > 0 ? subscription[0] : null;
  }

  /**
   * Create advertisement
   */
  async createAdvertisement(adData: any) {
    const {
      advertiserName,
      advertiserEmail,
      adType,
      adTitle,
      adDescription,
      imageUrl,
      clickUrl,
      targetSpecialties,
      targetLocations,
      placementPages,
      pricingModel,
      costPerImpression,
      costPerClick,
      totalBudget,
      dailyBudget,
      startDate,
      endDate
    } = adData;

    await prisma.$executeRaw`
      INSERT INTO "Advertisement" (
        advertiser_name, advertiser_email, ad_type, ad_title,
        ad_description, image_url, click_url,
        target_specialties, target_locations, placement_pages,
        pricing_model, cost_per_impression, cost_per_click,
        total_budget, daily_budget, start_date, end_date, status
      ) VALUES (
        ${advertiserName}, ${advertiserEmail}, ${adType}, ${adTitle},
        ${adDescription}, ${imageUrl}, ${clickUrl},
        ${targetSpecialties}, ${targetLocations}, ${placementPages},
        ${pricingModel}, ${costPerImpression || null}, ${costPerClick || null},
        ${totalBudget}, ${dailyBudget}, ${startDate}, ${endDate || null}, 'pending'
      )
    `;

    return { success: true };
  }

  /**
   * Get active advertisements for placement
   */
  async getActiveAds(filters: {
    adType?: string;
    placementPage?: string;
    userType?: string;
    specialty?: string;
    location?: string;
  }) {
    const { adType, placementPage, userType, specialty, location } = filters;

    let query = `
      SELECT *
      FROM "Advertisement"
      WHERE status = 'active'
        AND start_date <= CURRENT_TIMESTAMP
        AND (end_date IS NULL OR end_date >= CURRENT_TIMESTAMP)
        AND total_spent < total_budget
    `;

    if (adType) {
      query += ` AND ad_type = '${adType}'`;
    }

    if (placementPage) {
      query += ` AND '${placementPage}' = ANY(placement_pages)`;
    }

    if (userType) {
      query += ` AND ('all' = ANY(target_user_types) OR '${userType}' = ANY(target_user_types))`;
    }

    if (specialty) {
      query += ` AND (target_specialties IS NULL OR '${specialty}' = ANY(target_specialties))`;
    }

    if (location) {
      query += ` AND (target_locations IS NULL OR '${location}' = ANY(target_locations))`;
    }

    query += ` ORDER BY priority DESC, RANDOM() LIMIT 5`;

    const ads = await prisma.$queryRawUnsafe<any[]>(query);
    return ads;
  }

  /**
   * Record ad impression
   */
  async recordAdImpression(data: {
    adId: number;
    userId?: string;
    userType: string;
    pageUrl: string;
    placementPosition: string;
    userAgent: string;
    ipAddress: string;
    deviceType: string;
  }) {
    const { adId, userId, userType, pageUrl, placementPosition, userAgent, ipAddress, deviceType } = data;

    // Get ad pricing
    const ad = await prisma.$queryRaw<any[]>`
      SELECT cost_per_impression, pricing_model
      FROM "Advertisement"
      WHERE id = ${adId}
    `;

    if (ad.length === 0) return;

    const cost = ad[0].pricing_model === 'cpm' ? ad[0].cost_per_impression : 0;

    // Record impression
    await prisma.$executeRaw`
      INSERT INTO "AdImpression" (
        ad_id, user_id, user_type, page_url, placement_position,
        user_agent, ip_address, device_type, viewed, cost
      ) VALUES (
        ${adId}, ${userId || null}, ${userType}, ${pageUrl}, ${placementPosition},
        ${userAgent}, ${ipAddress}, ${deviceType}, true, ${cost}
      )
    `;

    // Update ad stats
    await prisma.$executeRaw`
      UPDATE "Advertisement"
      SET impressions = impressions + 1,
          total_spent = total_spent + ${cost}
      WHERE id = ${adId}
    `;
  }

  /**
   * Record ad click
   */
  async recordAdClick(adId: number, impressionId: number) {
    // Get ad pricing
    const ad = await prisma.$queryRaw<any[]>`
      SELECT cost_per_click, pricing_model
      FROM "Advertisement"
      WHERE id = ${adId}
    `;

    if (ad.length === 0) return;

    const cost = ad[0].pricing_model === 'cpc' ? ad[0].cost_per_click : 0;

    // Update impression
    await prisma.$executeRaw`
      UPDATE "AdImpression"
      SET clicked = true,
          click_timestamp = CURRENT_TIMESTAMP,
          cost = cost + ${cost}
      WHERE id = ${impressionId}
    `;

    // Update ad stats
    await prisma.$executeRaw`
      UPDATE "Advertisement"
      SET clicks = clicks + 1,
          total_spent = total_spent + ${cost}
      WHERE id = ${adId}
    `;
  }

  /**
   * Create data insight
   */
  async createDataInsight(insightData: any) {
    const {
      insightType,
      insightTitle,
      insightDescription,
      dataSummary,
      aggregatedData,
      dataSource,
      timePeriodStart,
      timePeriodEnd,
      sampleSize,
      regionType,
      regionName,
      specialty,
      accessLevel,
      price
    } = insightData;

    await prisma.$executeRaw`
      INSERT INTO "DataInsight" (
        insight_type, insight_title, insight_description,
        data_summary, aggregated_data, data_source,
        time_period_start, time_period_end, sample_size,
        region_type, region_name, specialty,
        is_anonymized, access_level, price, status
      ) VALUES (
        ${insightType}, ${insightTitle}, ${insightDescription},
        ${JSON.stringify(dataSummary)}::jsonb, ${JSON.stringify(aggregatedData)}::jsonb,
        ${dataSource}, ${timePeriodStart}, ${timePeriodEnd}, ${sampleSize},
        ${regionType || null}, ${regionName || null}, ${specialty || null},
        true, ${accessLevel}, ${price || null}, 'published'
      )
    `;

    return { success: true };
  }

  /**
   * Get platform revenue analytics
   */
  async getPlatformRevenue(periodType: string, startDate?: Date, endDate?: Date) {
    let query = `
      SELECT *
      FROM "PlatformRevenue"
      WHERE period_type = $1
    `;

    const params: any[] = [periodType];

    if (startDate) {
      query += ` AND period_start >= $2`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND period_end <= $${params.length + 1}`;
      params.push(endDate);
    }

    query += ` ORDER BY period_start DESC LIMIT 30`;

    const revenue = await prisma.$queryRawUnsafe<any[]>(query, ...params);
    return revenue;
  }

  /**
   * Get doctor revenue summary
   */
  async getDoctorRevenueSummary(doctorId: string, startDate?: Date, endDate?: Date) {
    let query = `
      SELECT 
        COUNT(*) as total_consultations,
        SUM(consultation_fee) as total_fees,
        SUM(commission_amount) as total_commission,
        SUM(doctor_payout) as total_payout,
        AVG(commission_rate) as avg_commission_rate
      FROM "ConsultationCommission"
      WHERE doctor_id = $1
        AND status IN ('processed', 'paid')
    `;

    const params: any[] = [doctorId];

    if (startDate) {
      query += ` AND consultation_date >= $2`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND consultation_date <= $${params.length + 1}`;
      params.push(endDate);
    }

    const summary = await prisma.$queryRawUnsafe<any[]>(query, ...params);
    return summary.length > 0 ? summary[0] : null;
  }

  /**
   * Aggregate daily revenue (called by cron)
   */
  async aggregateDailyRevenue(date: Date) {
    await prisma.$executeRaw`
      SELECT aggregate_daily_revenue(${date}::date)
    `;
  }
}

export const revenueService = new RevenueService();
