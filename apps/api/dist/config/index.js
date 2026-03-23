"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const getConfig = () => {
    const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    if (missingEnvVars.length > 0 && process.env.NODE_ENV === 'production') {
        throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    }
    return {
        port: parseInt(process.env.PORT || '3001', 10),
        nodeEnv: process.env.NODE_ENV || 'development',
        jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
        cors: {
            origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
            credentials: true,
        },
        database: {
            url: process.env.DATABASE_URL || '',
        },
        cloudinary: {
            cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
            apiKey: process.env.CLOUDINARY_API_KEY || '',
            apiSecret: process.env.CLOUDINARY_API_SECRET || '',
        },
    };
};
exports.config = getConfig();
