"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRouter = void 0;
const express_1 = require("express");
const payment_service_1 = require("../services/payment.service");
const auth_1 = require("../middleware/auth");
const asyncHandler_1 = require("../middleware/asyncHandler");
exports.paymentRouter = (0, express_1.Router)();
/**
 * POST /api/payment/create-intent
 * Create payment intent for consultation
 */
exports.paymentRouter.post('/create-intent', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { amount, currency, consultationId, consultationType } = req.body;
    const result = await payment_service_1.paymentService.createPaymentIntent(amount, currency || 'usd', {
        userId: req.user.userId,
        consultationId,
        consultationType
    });
    res.json(result);
}));
/**
 * POST /api/payment/confirm
 * Confirm payment
 */
exports.paymentRouter.post('/confirm', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { paymentIntentId } = req.body;
    const result = await payment_service_1.paymentService.confirmPayment(paymentIntentId);
    res.json(result);
}));
/**
 * POST /api/payment/refund
 * Process refund
 */
exports.paymentRouter.post('/refund', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { paymentIntentId, amount, reason } = req.body;
    const result = await payment_service_1.paymentService.processRefund(paymentIntentId, amount, reason);
    res.json(result);
}));
/**
 * GET /api/payment/:paymentIntentId
 * Get payment details
 */
exports.paymentRouter.get('/:paymentIntentId', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { paymentIntentId } = req.params;
    const details = await payment_service_1.paymentService.getPaymentDetails(paymentIntentId);
    if (!details) {
        return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(details);
}));
/**
 * POST /api/payment/create-checkout-session
 * Create Stripe checkout session
 */
exports.paymentRouter.post('/create-checkout-session', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { amount, consultationId, consultationType } = req.body;
    const successUrl = `${process.env.FRONTEND_URL}/consultations/${consultationId}/success`;
    const cancelUrl = `${process.env.FRONTEND_URL}/consultations/${consultationId}/cancel`;
    const result = await payment_service_1.paymentService.createCheckoutSession(amount, successUrl, cancelUrl, {
        userId: req.user.userId,
        consultationId,
        consultationType
    });
    res.json(result);
}));
/**
 * GET /api/payment/consultation-fee/:type
 * Get consultation fee for type
 */
exports.paymentRouter.get('/consultation-fee/:type', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { type } = req.params;
    const fee = payment_service_1.paymentService.calculateConsultationFee(type);
    res.json({ fee, currency: 'usd' });
}));
