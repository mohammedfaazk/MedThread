"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentController = exports.PaymentController = void 0;
const mock_payment_service_1 = require("../services/mock-payment.service");
const asyncHandler_1 = require("../middleware/asyncHandler");
class PaymentController {
    constructor() {
        /**
         * Create payment intent
         */
        this.createPaymentIntent = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
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
            const result = await mock_payment_service_1.mockPaymentService.createPayment({
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
        this.confirmPayment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { paymentIntentId } = req.body;
            if (!paymentIntentId) {
                return res.status(400).json({
                    success: false,
                    error: 'Payment intent ID is required',
                });
            }
            const result = await mock_payment_service_1.mockPaymentService.completePayment(paymentIntentId);
            res.json({
                success: result.success,
                data: result,
                message: 'Mock payment confirmed',
            });
        });
        /**
         * Create subscription
         */
        this.createSubscription = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
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
            const result = await mock_payment_service_1.mockPaymentService.createSubscription({
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
        this.cancelSubscription = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { subscriptionId } = req.params;
            const { cancelAtPeriodEnd = true } = req.body;
            const result = await mock_payment_service_1.mockPaymentService.cancelSubscription(subscriptionId, cancelAtPeriodEnd);
            res.json({
                success: true,
                data: result,
            });
        });
        /**
         * Create consultation fee
         */
        this.createConsultationFee = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
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
            const result = await mock_payment_service_1.mockPaymentService.createConsultationFee({
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
        this.payConsultationFee = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { feeId, paymentId } = req.body;
            if (!feeId || !paymentId) {
                return res.status(400).json({
                    success: false,
                    error: 'Fee ID and payment ID are required',
                });
            }
            const result = await mock_payment_service_1.mockPaymentService.payConsultationFee(feeId, paymentId);
            res.json({
                success: true,
                data: result,
            });
        });
        /**
         * Request refund
         */
        this.requestRefund = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
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
            const result = await mock_payment_service_1.mockPaymentService.requestRefund({
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
        this.processRefund = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
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
            const result = await mock_payment_service_1.mockPaymentService.processRefund(refundId, req.userId, approve, adminNotes);
            res.json({
                success: true,
                data: result,
            });
        });
        /**
         * Get payment history
         */
        this.getPaymentHistory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (!req.userId) {
                return res.status(401).json({ success: false, error: 'Unauthorized' });
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const result = await mock_payment_service_1.mockPaymentService.getPaymentHistory(req.userId, page, limit);
            res.json({
                success: true,
                data: result,
            });
        });
        /**
         * Get user subscriptions
         */
        this.getUserSubscriptions = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (!req.userId) {
                return res.status(401).json({ success: false, error: 'Unauthorized' });
            }
            const subscriptions = await mock_payment_service_1.mockPaymentService.getUserSubscriptions(req.userId);
            res.json({
                success: true,
                data: subscriptions,
            });
        });
    }
}
exports.PaymentController = PaymentController;
exports.paymentController = new PaymentController();
