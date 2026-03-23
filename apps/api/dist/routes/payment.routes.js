"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRouter = void 0;
const express_1 = require("express");
const payment_controller_1 = require("../controllers/payment.controller");
const auth_refactored_1 = require("../middleware/auth.refactored");
const router = (0, express_1.Router)();
exports.paymentRouter = router;
// All routes require authentication
router.use(auth_refactored_1.authenticate);
// Payment Intent
router.post('/create-intent', payment_controller_1.paymentController.createPaymentIntent);
router.post('/confirm', payment_controller_1.paymentController.confirmPayment);
// Subscriptions
router.post('/subscription', payment_controller_1.paymentController.createSubscription);
router.post('/subscription/:subscriptionId/cancel', payment_controller_1.paymentController.cancelSubscription);
router.get('/subscriptions', payment_controller_1.paymentController.getUserSubscriptions);
// Consultation Fees
router.post('/consultation-fee', payment_controller_1.paymentController.createConsultationFee);
router.post('/consultation-fee/pay', payment_controller_1.paymentController.payConsultationFee);
// Refunds
router.post('/refund', payment_controller_1.paymentController.requestRefund);
router.post('/refund/:refundId/process', payment_controller_1.paymentController.processRefund);
// Payment History
router.get('/history', payment_controller_1.paymentController.getPaymentHistory);
