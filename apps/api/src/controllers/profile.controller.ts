import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { userService } from '../services/user.service';
import { fileUploadService } from '../services/file-upload.service';
import { twoFactorService } from '../services/two-factor.service';
import { ValidationError } from '../utils/errors';
import bcrypt from 'bcryptjs';
import { prisma } from '@medthread/database';

export class ProfileController {
  /**
   * Check username availability
   */
  async checkUsernameAvailability(req: AuthRequest, res: Response) {
    try {
      const { username } = req.query;

      if (!username || typeof username !== 'string') {
        throw new ValidationError('Username is required');
      }

      // Validate username format
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        return res.json({ 
          success: true, 
          data: { 
            available: false, 
            message: 'Username must be 3-20 characters and contain only letters, numbers, and underscores' 
          } 
        });
      }

      const existingUser = await prisma.user.findUnique({
        where: { username },
        select: { id: true }
      });

      res.json({ 
        success: true, 
        data: { 
          available: !existingUser,
          message: existingUser ? 'Username is already taken' : 'Username is available'
        } 
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  /**
   * Get user profile by username
   */
  async getProfileByUsername(req: AuthRequest, res: Response) {
    try {
      const { username } = req.params;
      const currentUserId = req.userId;
      
      const user = await userService.getUserByUsername(username);
      
      // Check if blocked (if user is authenticated)
      if (currentUserId && user.id !== currentUserId) {
        const { blockService } = await import('../services/block.service');
        const hasBlock = await blockService.hasBlockBetween(currentUserId, user.id);
        
        if (hasBlock) {
          return res.status(403).json({
            success: false,
            error: 'Profile not accessible',
          });
        }
      }
      
      res.json({ success: true, data: user });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentProfile(req: AuthRequest, res: Response) {
    try {
      const user = await userService.getUserById(req.userId!);
      res.json({ success: true, data: user });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  async getPatientStats(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const now = new Date();

      const [user, totalAppointments, upcomingAppointments, completedAppointments, totalPosts, totalComments] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId }, select: { createdAt: true } }),
        prisma.appointment.count({ where: { patientId: userId } }),
        prisma.appointment.count({ where: { patientId: userId, scheduledAt: { gte: now }, status: { in: ['PENDING', 'CONFIRMED'] } } }),
        prisma.appointment.count({ where: { patientId: userId, status: 'COMPLETED' } }),
        prisma.post.count({ where: { authorId: userId } }),
        prisma.comment.count({ where: { authorId: userId } }),
      ]);

      res.json({
        success: true,
        data: {
          totalAppointments,
          upcomingAppointments,
          completedAppointments,
          totalPosts,
          totalComments,
          karma: 0,
          joinedDate: user?.createdAt?.toISOString() ?? null,
        }
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const { bio, specialty, website, location, username, pincode } = req.body;
      
      // Validate bio length
      if (bio && bio.length > 500) {
        throw new ValidationError('Bio must be 500 characters or less');
      }

      // Validate website URL
      if (website && !this.isValidUrl(website)) {
        throw new ValidationError('Invalid website URL');
      }

      // Validate username if provided
      if (username) {
        if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
          throw new ValidationError('Username must be 3-20 characters and contain only letters, numbers, and underscores');
        }

        // Check if username is already taken by another user
        const existingUser = await prisma.user.findUnique({
          where: { username },
          select: { id: true }
        });

        if (existingUser && existingUser.id !== req.userId) {
          throw new ValidationError('Username is already taken');
        }
      }

      const updateData: any = {};

      if (bio !== undefined) updateData.bio = bio;
      if (specialty !== undefined) updateData.specialty = specialty;
      if (username) updateData.username = username;
      if (pincode !== undefined) updateData.pincode = pincode;

      const user = await userService.updateUser(req.userId!, updateData);

      res.json({ success: true, data: user });
    } catch (error: any) {
      console.error('[updateProfile] Error:', error?.message, error?.code, error?.meta);
      res.status(error.statusCode || 500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(req: AuthRequest, res: Response) {
    try {
      const { image } = req.body;

      if (!image) {
        throw new ValidationError('Image data is required');
      }

      // Validate file size (2MB)
      if (!fileUploadService.validateFileSize(image, 2)) {
        throw new ValidationError('Avatar must be 2MB or less');
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!fileUploadService.validateFileType(image, allowedTypes)) {
        throw new ValidationError('Only JPEG, PNG, and WebP images are allowed');
      }

      const result = await fileUploadService.uploadAvatar(image, req.userId!);
      
      const user = await userService.updateUser(req.userId!, {
        avatar: result.url
      });

      res.json({ success: true, data: { avatar: result.url } });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  /**
   * Upload banner
   */
  async uploadBanner(req: AuthRequest, res: Response) {
    try {
      const { image } = req.body;

      if (!image) {
        throw new ValidationError('Image data is required');
      }

      // Validate file size (5MB)
      if (!fileUploadService.validateFileSize(image, 5)) {
        throw new ValidationError('Banner must be 5MB or less');
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!fileUploadService.validateFileType(image, allowedTypes)) {
        throw new ValidationError('Only JPEG, PNG, and WebP images are allowed');
      }

      const result = await fileUploadService.uploadFromBase64(
        image, 
        `banner-${req.userId}`, 
        'avatars'
      );
      
      const user = await userService.updateUser(req.userId!, {
        banner: result.url
      });

      res.json({ success: true, data: { banner: result.url } });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  /**
   * Change password
   */
  async changePassword(req: AuthRequest, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        throw new ValidationError('Current and new passwords are required');
      }

      // Validate new password strength
      if (newPassword.length < 8) {
        throw new ValidationError('New password must be at least 8 characters');
      }

      // Get user with password hash
      const user = await prisma.user.findUnique({
        where: { id: req.userId! },
        select: { passwordHash: true }
      });

      if (!user) {
        throw new ValidationError('User not found');
      }

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) {
        throw new ValidationError('Current password is incorrect');
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      // Update password
      await prisma.user.update({
        where: { id: req.userId! },
        data: { passwordHash: newPasswordHash }
      });

      res.json({ success: true, message: 'Password changed successfully' });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  /**
   * Setup 2FA - Generate secret and QR code
   */
  async setup2FA(req: AuthRequest, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId! },
        select: { username: true, twoFactorEnabled: true }
      });

      if (!user) {
        throw new ValidationError('User not found');
      }

      if (user.twoFactorEnabled) {
        throw new ValidationError('2FA is already enabled');
      }

      const { secret, qrCode } = twoFactorService.generateSecret(user.username);

      res.json({ 
        success: true, 
        data: { secret, qrCode } 
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  /**
   * Enable 2FA - Verify token and enable
   */
  async enable2FA(req: AuthRequest, res: Response) {
    try {
      const { secret, token } = req.body;

      if (!secret || !token) {
        throw new ValidationError('Secret and token are required');
      }

      await twoFactorService.enable2FA(req.userId!, secret, token);

      res.json({ 
        success: true, 
        message: '2FA enabled successfully' 
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  /**
   * Disable 2FA
   */
  async disable2FA(req: AuthRequest, res: Response) {
    try {
      const { token } = req.body;

      if (!token) {
        throw new ValidationError('Token is required');
      }

      await twoFactorService.disable2FA(req.userId!, token);

      res.json({ 
        success: true, 
        message: '2FA disabled successfully' 
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  /**
   * Get user's posts
   */
  async getUserPosts(req: AuthRequest, res: Response) {
    try {
      const { username } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const user = await prisma.user.findUnique({
        where: { username },
        select: { id: true }
      });

      if (!user) {
        throw new ValidationError('User not found');
      }

      const [posts, total] = await Promise.all([
        prisma.post.findMany({
          where: { 
            authorId: user.id,
            isDraft: false,
            isRemoved: false
          },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                avatar: true,
                role: true,
                verified: true
              }
            },
            community: {
              select: {
                name: true,
                displayName: true,
                icon: true
              }
            },
            _count: {
              select: {
                comments: true,
                awards: true
              }
            }
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.post.count({ 
          where: { 
            authorId: user.id,
            isDraft: false,
            isRemoved: false
          } 
        })
      ]);

      res.json({
        success: true,
        data: {
          posts,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  /**
   * Get user's comments
   */
  async getUserComments(req: AuthRequest, res: Response) {
    try {
      const { username } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const user = await prisma.user.findUnique({
        where: { username },
        select: { id: true }
      });

      if (!user) {
        throw new ValidationError('User not found');
      }

      const [comments, total] = await Promise.all([
        prisma.comment.findMany({
          where: { 
            authorId: user.id,
            isRemoved: false
          },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                avatar: true,
                role: true,
                verified: true
              }
            },
            post: {
              select: {
                id: true,
                title: true,
                community: {
                  select: {
                    name: true,
                    displayName: true
                  }
                }
              }
            }
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.comment.count({ 
          where: { 
            authorId: user.id,
            isRemoved: false
          } 
        })
      ]);

      res.json({
        success: true,
        data: {
          comments,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  /**
   * Helper: Validate URL
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

export const profileController = new ProfileController();
