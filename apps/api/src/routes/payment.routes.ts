import { Router } from 'express';
import { paymentService } from '../services/payment.service';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

export const paymentRouter = Router();

/**
 * POST /api/payment/create-intent
 * Create payment intent for consultation
 */
paymentRouter.post(
  '/create-intent',
  authenticate,
  asyncHandler(async (req: any, res) => {
    const { amount, currency, consultationId, consultationType } = req.body;

    const result = await paymentService.createPaymentIntent(
      amount,
      currency || 'usd',
      {
        userId: req.user.userId,
        consultationId,
        consultationType
      }
    );

    res.json(result);
  })
);

/**
 * POST /api/payment/confirm
 * Confirm payment
 */
paymentRouter.post(
  '/confirm',
  authenticate,
  asyncHandler(async (req, res) => {
    const { paymentIntentId } = req.body;

    const result = await paymentService.confirmPayment(paymentIntentId);

    res.json(result);
  })
);

/**
 * POST /api/payment/refund
 * Process refund
 */
paymentRouter.post(
  '/refund',
  authenticate,
  asyncHandler(async (req, res) => {
    const { paymentIntentId, amount, reason } = req.body;

    const result = await paymentService.processRefund(paymentIntentId, amount, reason);

    res.json(result);
  })
);

/**
 * GET /api/payment/:paymentIntentId
 * Get payment details
 */
paymentRouter.get(
  '/:paymentIntentId',
  authenticate,
  asyncHandler(async (req, res) => {
    const { paymentIntentId } = req.params;

    const details = await paymentService.getPaymentDetails(paymentIntentId);

    if (!details) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(details);
  })
);

/**
 * POST /api/payment/create-checkout-session
 * Create Stripe checkout session
 */
paymentRouter.post(
  '/create-checkout-session',
  authenticate,
  asyncHandler(async (req: any, res) => {
    const { amount, consultationId, consultationType } = req.body;

    const successUrl = `${process.env.FRONTEND_URL}/consultations/${consultationId}/success`;
    const cancelUrl = `${process.env.FRONTEND_URL}/consultations/${consultationId}/cancel`;

    const result = await paymentService.createCheckoutSession(
      amount,
      successUrl,
      cancelUrl,
      {
        userId: req.user.userId,
        consultationId,
        consultationType
      }
    );

    res.json(result);
  })
);

/**
 * GET /api/payment/consultation-fee/:type
 * Get consultation fee for type
 */
paymentRouter.get(
  '/consultation-fee/:type',
  asyncHandler(async (req, res) => {
    const { type } = req.params;
    const fee = paymentService.calculateConsultationFee(type);
    res.json({ fee, currency: 'usd' });
  })
);
