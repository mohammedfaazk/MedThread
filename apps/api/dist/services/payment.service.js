"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = exports.PaymentService = void 0;
const database_1 = require("@medthread/database");
const stripe_1 = require("../config/stripe");
class PaymentService {
    /**
     * Create a payment intent
     */
    async createPaymentIntent(input) {
        const { userId, amount, currency = 'usd', type, description, metadata } = input;
        // Create Stripe payment intent
        const paymentIntent = await stripe_1.stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency,
            metadata: {
                userId,
                type,
                ...metadata,
            },
            description,
        });
        // Create payment record
        const payment = await database_1.prisma.$executeRaw `
      INSERT INTO "Payment" (
        "id", "userId", "amount", "currency", "status", "type",
        "stripePaymentIntentId", "description", "metadata"
      ) VALUES (
        ${this.generateId()},
        ${userId},
        ${amount},
        ${currency},
        'PENDING'::"PaymentStatus",
        ${type}::"PaymentType",
        ${paymentIntent.id},
        ${description || null},
        ${JSON.stringify(metadata || {})}::jsonb
      )
    `;
        return {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        };
    }
    /**
     * Confirm payment
     */
    async confirmPayment(paymentIntentId) {
        const paymentIntent = await stripe_1.stripe.paymentIntents.retrieve(paymentIntentId);
        if (paymentIntent.status === 'succeeded') {
            // Update payment status
            await database_1.prisma.$executeRaw `
        UPDATE "Payment"
        SET 
          "status" = 'COMPLETED'::"PaymentStatus",
          "stripeChargeId" = ${paymentIntent.latest_charge},
          "updatedAt" = CURRENT_TIMESTAMP
        WHERE "stripePaymentIntentId" = ${paymentIntentId}
      `;
            // Create payment history
            const payment = await database_1.prisma.$queryRaw `
        SELECT * FROM "Payment" WHERE "stripePaymentIntentId" = ${paymentIntentId}
      `;
            if (payment[0]) {
                await this.createPaymentHistory({
                    userId: payment[0].userId,
                    paymentId: payment[0].id,
                    action: 'PAYMENT_COMPLETED',
                    amount: payment[0].amount,
                    status: 'COMPLETED',
                    description: `Payment of $${payment[0].amount} completed`,
                });
            }
            return { success: true, payment: payment[0] };
        }
        return { success: false, status: paymentIntent.status };
    }
    /**
     * Create subscription
     */
    async createSubscription(input) {
        const { userId, planName, planPrice, priceId } = input;
        // Get or create Stripe customer
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, username: true },
        });
        if (!user) {
            throw new Error('User not found');
        }
        const customer = await stripe_1.stripe.customers.create({
            email: user.email,
            metadata: { userId, username: user.username },
        });
        // Create subscription
        const subscription = await stripe_1.stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: priceId }],
            payment_behavior: 'default_incomplete',
            expand: ['latest_invoice.payment_intent'],
        });
        const invoice = subscription.latest_invoice;
        const paymentIntent = invoice.payment_intent;
        // Save subscription to database
        await database_1.prisma.$executeRaw `
      INSERT INTO "Subscription" (
        "id", "userId", "planName", "planPrice", "status",
        "stripeSubscriptionId", "stripeCustomerId",
        "currentPeriodStart", "currentPeriodEnd"
      ) VALUES (
        ${this.generateId()},
        ${userId},
        ${planName},
        ${planPrice},
        'ACTIVE'::"SubscriptionStatus",
        ${subscription.id},
        ${customer.id},
        to_timestamp(${subscription.current_period_start}),
        to_timestamp(${subscription.current_period_end})
      )
    `;
        return {
            subscriptionId: subscription.id,
            clientSecret: paymentIntent.client_secret,
        };
    }
    /**
     * Cancel subscription
     */
    async cancelSubscription(subscriptionId, cancelAtPeriodEnd = true) {
        const subscription = await stripe_1.stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: cancelAtPeriodEnd,
        });
        await database_1.prisma.$executeRaw `
      UPDATE "Subscription"
      SET 
        "cancelAtPeriodEnd" = ${cancelAtPeriodEnd},
        "status" = ${cancelAtPeriodEnd ? 'CANCELLED' : 'ACTIVE'}::"SubscriptionStatus",
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE "stripeSubscriptionId" = ${subscriptionId}
    `;
        return { success: true, subscription };
    }
    /**
     * Create consultation fee
     */
    async createConsultationFee(data) {
        const { doctorId, patientId, appointmentId, amount, currency = 'usd' } = data;
        const feeId = this.generateId();
        await database_1.prisma.$executeRaw `
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
    async payConsultationFee(feeId, paymentId) {
        await database_1.prisma.$executeRaw `
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
    async requestRefund(input) {
        const { paymentId, userId, amount, reason } = input;
        const refundId = this.generateId();
        await database_1.prisma.$executeRaw `
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
    async processRefund(refundId, adminId, approve, adminNotes) {
        const refund = await database_1.prisma.$queryRaw `
      SELECT r.*, p."stripeChargeId", p."amount" as "paymentAmount"
      FROM "Refund" r
      JOIN "Payment" p ON r."paymentId" = p."id"
      WHERE r."id" = ${refundId}
    `;
        if (!refund[0]) {
            throw new Error('Refund not found');
        }
        if (!approve) {
            await database_1.prisma.$executeRaw `
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
        // Process refund with Stripe
        const stripeRefund = await stripe_1.stripe.refunds.create({
            charge: refund[0].stripeChargeId,
            amount: Math.round((refund[0].amount || refund[0].paymentAmount) * 100),
        });
        await database_1.prisma.$executeRaw `
      UPDATE "Refund"
      SET 
        "status" = 'PROCESSED'::"RefundStatus",
        "stripeRefundId" = ${stripeRefund.id},
        "processedBy" = ${adminId},
        "processedAt" = CURRENT_TIMESTAMP,
        "adminNotes" = ${adminNotes || null},
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = ${refundId}
    `;
        // Update payment status
        await database_1.prisma.$executeRaw `
      UPDATE "Payment"
      SET 
        "status" = 'REFUNDED'::"PaymentStatus",
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = ${refund[0].paymentId}
    `;
        return { success: true, status: 'PROCESSED', stripeRefundId: stripeRefund.id };
    }
    /**
     * Get payment history
     */
    async getPaymentHistory(userId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const payments = await database_1.prisma.$queryRaw `
      SELECT * FROM "Payment"
      WHERE "userId" = ${userId}
      ORDER BY "createdAt" DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
        const total = await database_1.prisma.$queryRaw `
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
    async getUserSubscriptions(userId) {
        const subscriptions = await database_1.prisma.$queryRaw `
      SELECT * FROM "Subscription"
      WHERE "userId" = ${userId}
      ORDER BY "createdAt" DESC
    `;
        return subscriptions;
    }
    /**
     * Create payment history entry
     */
    async createPaymentHistory(data) {
        await database_1.prisma.$executeRaw `
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
    generateId() {
        return `pay_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }
}
exports.PaymentService = PaymentService;
exports.paymentService = new PaymentService();
