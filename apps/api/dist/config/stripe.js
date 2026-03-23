"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.STRIPE_CONFIG = exports.stripe = void 0;
const stripe_1 = __importDefault(require("stripe"));
if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('⚠️  STRIPE_SECRET_KEY not set. Payment features will not work.');
}
exports.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
    apiVersion: '2024-12-18.acacia',
    typescript: true,
});
exports.STRIPE_CONFIG = {
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    currency: 'usd',
    successUrl: process.env.STRIPE_SUCCESS_URL || 'http://localhost:3000/payment/success',
    cancelUrl: process.env.STRIPE_CANCEL_URL || 'http://localhost:3000/payment/cancel',
};
