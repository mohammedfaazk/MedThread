import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.refactored';
import { authService } from '../services/auth.service';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { asyncHandler } from '../middleware/asyncHandler';

export class AuthController {
  register = asyncHandler(async (req: AuthRequest, res: Response) => {
    const validatedData = registerSchema.parse(req.body);
    const result = await authService.register(validatedData);

    res.status(201).json({
      success: true,
      data: result,
      message: 'Registration successful'
    });
  });

  login = asyncHandler(async (req: AuthRequest, res: Response) => {
    const validatedData = loginSchema.parse(req.body);
    const result = await authService.login(validatedData);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Login successful'
    });
  });

  refreshToken = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const token = await authService.refreshToken(req.userId);

    res.status(200).json({
      success: true,
      data: { token },
      message: 'Token refreshed successfully'
    });
  });

  me = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // This would typically call a user service to get full user details
    res.status(200).json({
      success: true,
      data: {
        userId: req.userId,
        role: req.userRole
      }
    });
  });

  logout = asyncHandler(async (req: AuthRequest, res: Response) => {
    // In a stateless JWT system, logout is handled client-side
    // If using refresh tokens, you would invalidate them here
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  });
}

export const authController = new AuthController();
