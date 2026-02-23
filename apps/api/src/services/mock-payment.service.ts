import { prisma } from '@medthread/database';

/**
 * Mock Payment Service - Works without any external payment gateway
 * Perfect for development and testing
 */

interface CreatePaymentInput {
  userId: string;
  amount: number;
  currency?: string;
  type: 'CONSULTATION' | 'SUBSCRIPTION' | 'PREMIUM_FEATURE';
  description?: string;
  metadata?: Record<string, any>;
}

interface CreateSubscriptionInput {
  userId: string;
  planName: string;
  planPrice: number;
}

interface CreateRefundInput {
  paymentId: string;
  userId: string;
  amount?: number;
  reason: string;
}

export class MockPaymentService {
  /**
   * Create a mock payment (simulates payment gateway)
   */
  async createPayment(input: CreatePaymentInput) {
    const { userId, amount, currency = 'usd', type, description, metadata } = input;

    const paymentId = this.generateId();
    const mockPaymentIntentId = `pi_mock_${Date.now()}`;

    // Create payment record
    await prisma.$executeRaw`
      INSERT INTO "Payment" (
        "id", "userId", "amount", "currency", "status", "type",
        "stripePaymentIntentId", "description", "metadata"
      ) VALUES (
        ${paymentId},
        ${userId},
        ${amount},
        ${currency},
        'PENDING'::"PaymentStatus",
        ${type}::"PaymentType",
        ${mockPaymentIntentId},
        ${description || null},
        ${JSON.stringify(metadata || {})}::jsonb
      )
    `;

    // Auto-complete payment after 2 seconds (simulate processing)
    setTimeout(async () => {
      await this.completePayment(mockPaymentIntentId);
    }, 2000);

    return {
      paymentId,
      clientSecret: `mock_secret_${mockPaymentIntentId}`,
      paymentIntentId: mockPaymentIntentId,
      status: 'PENDING',
    };
  }

  /**
   * Complete payment (simulates successful payment)
   */
  async completePayment(paymentIntentId: string) {
    const mockChargeId = `ch_mock_${Date.now()}`;

    await prisma.$executeRaw`
      UPDATE "Payment"
      SET 
        "status" = 'COMPLETED'::"PaymentStatus",
        "stripeChargeId" = ${mockChargeId},
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE "stripePaymentIntentId" = ${paymentIntentId}
    `;

    // Create payment history
    const payment = await prisma.$queryRaw<any[]>`
      SELECT * FROM "Payment" WHERE "stripePaymentIntentId" = ${paymentIntentId}
    `;

    if (payment[0]) {
      await this.createPaymentHistory({
        userId: payment[0].userId,
        paymentId: payment[0].id,
        action: 'PAYMENT_COMPLETED',
        amount: payment[0].amount,
        status: 'COMPLETED',
        description: `Mock payment of $${payment[0].amount} completed`,
      });
    }

    return { success: true, payment: payment[0] };
  }

  /**
   * Create mock subscription
   */
  async createSubscription(input: CreateSubscriptionInput) {
    const { userId, planName, planPrice } = input;

    const subscriptionId = this.generateId();
    const mockStripeSubId = `sub_mock_${Date.now()}`;
    const mockCustomerId = `cus_mock_${Date.now()}`;

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await prisma.$executeRaw`
      INSERT INTO "Subscription" (
        "id", "userId", "planName", "planPrice", "status",
        "stripeSubscriptionId", "stripeCustomerId",
        "currentPeriodStart", "currentPeriodEnd"
      ) VALUES (
        ${subscriptionId},
        ${userId},
        ${planName},
        ${planPrice},
        'ACTIVE'::"SubscriptionStatus",
        ${mockStripeSubId},
        ${mockCustomerId},
        ${now},
        ${periodEnd}
      )
    `;

    return {
      subscriptionId: mockStripeSubId,
      clientSecret: `mock_secret_${mockStripeSubId}`,
      status: 'ACTIVE',
    };
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true) {
    await prisma.$executeRaw`
      UPDATE "Subscription"
      SET 
        "cancelAtPeriodEnd" = ${cancelAtPeriodEnd},
        "status" = ${cancelAtPeriodEnd ? 'CANCELLED' : 'ACTIVE'}::"SubscriptionStatus",
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE "stripeSubscriptionId" = ${subscriptionId}
    `;

    return { success: true, status: cancelAtPeriodEnd ? 'CANCELLED' : 'ACTIVE' };
  }

  /**
   * Create consultation fee
   */
  async createConsultationFee(data: {
    doctorId: string;
    patientId: string;
    appointmentId?: string;
    amount: number;
    currency?: string;
  }) {
    const { doctorId, patientId, appointmentId, amount, currency = 'usd' } = data;

    const feeId = this.generateId();

    await prisma.$executeRaw`
      INSERT INTO "ConsultationFee" (
        "id", "doctorId", "patientId", "appointmentId", "amount", "currency", "status"
      ) VALUES (
        ${feeId},
        ${doctorId},
        ${patientId},
        ${appointmentId || null},
        ${amount},
        ${currency},
        'PENDING'::"PaymentStatus"
      )
    `;

    return { id: feeId, amount, currency };
  }

  /**
   * Pay consultation fee
   */
  async payConsultationFee(feeId: string, paymentId: string) {
    await prisma.$executeRaw`
      UPDATE "ConsultationFee"
      SET 
        "paymentId" = ${paymentId},
        "status" = 'COMPLETED'::"PaymentStatus",
        "paidAt" = CURRENT_TIMESTAMP,
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = ${feeId}
    `;

    return { success: true };
  }

  /**
   * Request refund
   */
  async requestRefund(input: CreateRefundInput) {
    const { paymentId, userId, amount, reason } = input;

    const refundId = this.generateId();

    await prisma.$executeRaw`
      INSERT INTO "Refund" (
        "id", "paymentId", "userId", "amount", "reason", "status"
      ) VALUES (
        ${refundId},
        ${paymentId},
        ${userId},
        ${amount || 0},
        ${reason},
        'PENDING'::"RefundStatus"
      )
    `;

    return { id: refundId, status: 'PENDING' };
  }

  /**
   * Process refund (Admin action)
   */
  async processRefund(refundId: string, adminId: string, approve: boolean, adminNotes?: string) {
    const refund = await prisma.$queryRaw<any[]>`
      SELECT r.*, p."amount" as "paymentAmount"
      FROM "Refund" r
      JOIN "Payment" p ON r."paymentId" = p."id"
      WHERE r."id" = ${refundId}
    `;

    if (!refund[0]) {
      throw new Error('Refund not found');
    }

    if (!approve) {
      await prisma.$executeRaw`
        UPDATE "Refund"
        SET 
          "status" = 'REJECTED'::"RefundStatus",
          "processedBy" = ${adminId},
          "processedAt" = CURRENT_TIMESTAMP,
          "adminNotes" = ${adminNotes || null},
          "updatedAt" = CURRENT_TIMESTAMP
        WHERE "id" = ${refundId}
      `;

      return { success: true, status: 'REJECTED' };
    }

    // Process mock refund
    const mockRefundId = `re_mock_${Date.now()}`;

    await prisma.$executeRaw`
      UPDATE "Refund"
      SET 
        "status" = 'PROCESSED'::"RefundStatus",
        "stripeRefundId" = ${mockRefundId},
        "processedBy" = ${adminId},
        "processedAt" = CURRENT_TIMESTAMP,
        "adminNotes" = ${adminNotes || null},
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = ${refundId}
    `;

    // Update payment status
    await prisma.$executeRaw`
      UPDATE "Payment"
      SET 
        "status" = 'REFUNDED'::"PaymentStatus",
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = ${refund[0].paymentId}
    `;

    return { success: true, status: 'PROCESSED', refundId: mockRefundId };
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(userId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const payments = await prisma.$queryRaw<any[]>`
      SELECT * FROM "Payment"
      WHERE "userId" = ${userId}
      ORDER BY "createdAt" DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const total = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM "Payment" WHERE "userId" = ${userId}
    `;

    return {
      payments,
      pagination: {
        page,
        limit,
        total: parseInt(total[0]?.count || '0'),
        totalPages: Math.ceil(parseInt(total[0]?.count || '0') / limit),
      },
    };
  }

  /**
   * Get user subscriptions
   */
  async getUserSubscriptions(userId: string) {
    const subscriptions = await prisma.$queryRaw<any[]>`
      SELECT * FROM "Subscription"
      WHERE "userId" = ${userId}
      ORDER BY "createdAt" DESC
    `;

    return subscriptions;
  }

  /**
   * Create payment history entry
   */
  private async createPaymentHistory(data: {
    userId: string;
    paymentId: string;
    action: string;
    amount?: number;
    status?: string;
    description?: string;
  }) {
    await prisma.$executeRaw`
      INSERT INTO "PaymentHistory" (
        "id", "userId", "paymentId", "action", "amount", "status", "description"
      ) VALUES (
        ${this.generateId()},
        ${data.userId},
        ${data.paymentId},
        ${data.action},
        ${data.amount || null},
        ${data.status || null},
        ${data.description || null}
      )
    `;
  }

  private generateId(): string {
    return `pay_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}

export const mockPaymentService = new MockPaymentService();
