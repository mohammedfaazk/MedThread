"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transporter = exports.createEmailTransporter = exports.EMAIL_CONFIG = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
// Email configuration
exports.EMAIL_CONFIG = {
    from: process.env.EMAIL_FROM || 'MedThread <noreply@medthread.com>',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
};
// Create transporter
const createEmailTransporter = () => {
    // For development, use Ethereal (fake SMTP service)
    if (!exports.EMAIL_CONFIG.user || !exports.EMAIL_CONFIG.password) {
        console.log('⚠️  Email credentials not set. Using console logging for emails.');
        return null;
    }
    return nodemailer_1.default.createTransport({
        host: exports.EMAIL_CONFIG.host,
        port: exports.EMAIL_CONFIG.port,
        secure: exports.EMAIL_CONFIG.secure,
        auth: {
            user: exports.EMAIL_CONFIG.user,
            pass: exports.EMAIL_CONFIG.password,
        },
        tls: {
            rejectUnauthorized: false, // Allow self-signed certificates
        },
    });
};
exports.createEmailTransporter = createEmailTransporter;
exports.transporter = (0, exports.createEmailTransporter)();
