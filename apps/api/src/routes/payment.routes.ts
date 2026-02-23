import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.refactored';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Payment Intent
router.post('/create-intent', paymentController.createPaymentIntent);
router.post('/confirm', paymentController.confirmPayment);

// Subscriptions
router.post('/subscription', paymentController.createSubscription);
router.post('/subscription/:subscriptionId/cancel', paymentController.cancelSubscription);
router.get('/subscriptions', paymentController.getUserSubscriptions);

// Consultation Fees
router.post('/consultation-fee', paymentController.createConsultationFee);
router.post('/consultation-fee/pay', paymentController.payConsultationFee);

// Refunds
router.post('/refund', paymentController.requestRefund);
router.post('/refund/:refundId/process', paymentController.processRefund);

// Payment History
router.get('/history', paymentController.getPaymentHistory);

export { router as paymentRouter };
