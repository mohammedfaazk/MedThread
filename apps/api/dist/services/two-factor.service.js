"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.twoFactorService = exports.TwoFactorService = void 0;
const otplib_1 = require("otplib");
const database_1 = require("@medthread/database");
const errors_1 = require("../utils/errors");
class TwoFactorService {
    /**
     * Generate 2FA secret for user
     */
    generateSecret(username) {
        const secret = otplib_1.authenticator.generateSecret();
        const otpauth = otplib_1.authenticator.keyuri(username, 'MedThread', secret);
        return {
            secret,
            qrCode: otpauth // Frontend will convert this to QR code
        };
    }
    /**
     * Verify 2FA token
     */
    verifyToken(secret, token) {
        try {
            return otplib_1.authenticator.verify({ token, secret });
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Enable 2FA for user
     */
    async enable2FA(userId, secret, token) {
        // Verify the token first
        if (!this.verifyToken(secret, token)) {
            throw new errors_1.ValidationError('Invalid 2FA token');
        }
        await database_1.prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorEnabled: true,
                twoFactorSecret: secret
            }
        });
    }
    /**
     * Disable 2FA for user
     */
    async disable2FA(userId, token) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { twoFactorSecret: true }
        });
        if (!user?.twoFactorSecret) {
            throw new errors_1.ValidationError('2FA is not enabled');
        }
        // Verify token before disabling
        if (!this.verifyToken(user.twoFactorSecret, token)) {
            throw new errors_1.ValidationError('Invalid 2FA token');
        }
        await database_1.prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorEnabled: false,
                twoFactorSecret: null
            }
        });
    }
    /**
     * Check if user has 2FA enabled
     */
    async is2FAEnabled(userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { twoFactorEnabled: true }
        });
        return user?.twoFactorEnabled || false;
    }
}
exports.TwoFactorService = TwoFactorService;
exports.twoFactorService = new TwoFactorService();
