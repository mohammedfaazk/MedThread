"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RAZORPAY_CONFIG = exports.razorpay = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
if (!process.env.RAZORPAY_KEY_ID) {
    console.warn('⚠️  RAZORPAY_KEY_ID not set. Payment features will not work.');
}
exports.razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});
exports.RAZORPAY_CONFIG = {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    currency: 'INR',
};
