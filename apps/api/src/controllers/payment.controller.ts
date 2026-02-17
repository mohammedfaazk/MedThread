import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.refactored';
import { mockPaymentService } from '../services/mock-payment.service';
import { asyncHandler } from '../middleware/asyncHandler';

export class PaymentController {
  /**
   * Create payment intent
   */
  createPaymentIntent = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { amount, type, description, metadata } = req.body;

    if (!amount || !type) {
      return res.status(400).json({
        success: false,
        error: 'Amount and type are required',
      });
    }

    const result = await mockPaymentService.createPayment({
      userId: req.userId,
      amount: parseFloat(amount),
      type,
      description,
      metadata,
    });

    res.json({
      success: true,
      data: result,
      message: 'Mock payment created (auto-completes in 2 seconds)',
    });
  });

  /**
   * Confirm payment
   */
  confirmPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: 'Payment intent ID is required',
      });
    }

    const result = await mockPaymentService.completePayment(paymentIntentId);

    res.json({
      success: result.success,
      data: result,
      message: 'Mock payment confirmed',
    });
  });

  /**
   * Create subscription
   */
  createSubscription = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { planName, planPrice } = req.body;

    if (!planName || !planPrice) {
      return res.status(400).json({
        success: false,
        error: 'Plan name and price are required',
      });
    }

    const result = await mockPaymentService.createSubscription({
      userId: req.userId,
      planName,
      planPrice: parseFloat(planPrice),
    });

    res.json({
      success: true,
      data: result,
      message: 'Mock subscription created',
    });
  });

  /**
   * Cancel subscription
   */
  cancelSubscription = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { subscriptionId } = req.params;
    const { cancelAtPeriodEnd = true } = req.body;

    const result = await mockPaymentService.cancelSubscription(subscriptionId, cancelAtPeriodEnd);

    res.json({
      success: true,
      data: result,
    });
  });

  /**
   * Create consultation fee
   */
  createConsultationFee = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { doctorId, patientId, appointmentId, amount } = req.body;

    if (!doctorId || !patientId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Doctor ID, patient ID, and amount are required',
      });
    }

    const result = await mockPaymentService.createConsultationFee({
      doctorId,
      patientId,
      appointmentId,
      amount: parseFloat(amount),
    });

    res.json({
      success: true,
      data: result,
    });
  });

  /**
   * Pay consultation fee
   */
  payConsultationFee = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { feeId, paymentId } = req.body;

    if (!feeId || !paymentId) {
      return res.status(400).json({
        success: false,
        error: 'Fee ID and payment ID are required',
      });
    }

    const result = await mockPaymentService.payConsultationFee(feeId, paymentId);

    res.json({
      success: true,
      data: result,
    });
  });

  /**
   * Request refund
   */
  requestRefund = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { paymentId, amount, reason } = req.body;

    if (!paymentId || !reason) {
      return res.status(400).json({
        success: false,
        error: 'Payment ID and reason are required',
      });
    }

    const result = await mockPaymentService.requestRefund({
      paymentId,
      userId: req.userId,
      amount: amount ? parseFloat(amount) : undefined,
      reason,
    });

    res.json({
      success: true,
      data: result,
    });
  });

  /**
   * Process refund (Admin only)
   */
  processRefund = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId || req.userRole !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const { refundId } = req.params;
    const { approve, adminNotes } = req.body;

    if (approve === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Approve status is required',
      });
    }

    const result = await mockPaymentService.processRefund(refundId, req.userId, approve, adminNotes);

    res.json({
      success: true,
      data: result,
    });
  });

  /**
   * Get payment history
   */
  getPaymentHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await mockPaymentService.getPaymentHistory(req.userId, page, limit);

    res.json({
      success: true,
      data: result,
    });
  });

  /**
   * Get user subscriptions
   */
  getUserSubscriptions = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const subscriptions = await mockPaymentService.getUserSubscriptions(req.userId);

    res.json({
      success: true,
      data: subscriptions,
    });
  });
}

export const paymentController = new PaymentController();
