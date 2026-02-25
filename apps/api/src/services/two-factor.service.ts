// TODO: Fix otplib import - package may need to be reinstalled
// import { authenticator } from 'otplib';
import { prisma } from '@medthread/database';
import { ValidationError } from '../utils/errors';

// Placeholder authenticator until otplib is fixed
const authenticator = {
  generateSecret: () => 'PLACEHOLDER_SECRET',
  keyuri: (username: string, service: string, secret: string) => `otpauth://totp/${service}:${username}?secret=${secret}`,
  verify: ({ token, secret }: { token: string; secret: string }) => false
};

export class TwoFactorService {
  /**
   * Generate 2FA secret for user
   */
  generateSecret(username: string): { secret: string; qrCode: string } {
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(username, 'MedThread', secret);
    
    return {
      secret,
      qrCode: otpauth // Frontend will convert this to QR code
    };
  }

  /**
   * Verify 2FA token
   */
  verifyToken(secret: string, token: string): boolean {
    try {
      return authenticator.verify({ token, secret });
    } catch (error) {
      return false;
    }
  }

  /**
   * Enable 2FA for user
   */
  async enable2FA(userId: string, secret: string, token: string): Promise<void> {
    // Verify the token first
    if (!this.verifyToken(secret, token)) {
      throw new ValidationError('Invalid 2FA token');
    }

    await prisma.user.update({
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
  async disable2FA(userId: string, token: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true }
    });

    if (!user?.twoFactorSecret) {
      throw new ValidationError('2FA is not enabled');
    }

    // Verify token before disabling
    if (!this.verifyToken(user.twoFactorSecret, token)) {
      throw new ValidationError('Invalid 2FA token');
    }

    await prisma.user.update({
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
  async is2FAEnabled(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorEnabled: true }
    });

    return user?.twoFactorEnabled || false;
  }
}

export const twoFactorService = new TwoFactorService();
