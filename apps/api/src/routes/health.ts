import { Router } from 'express';

export const healthRouter = Router();

/**
 * GET /api/health
 * Health check endpoint - no authentication required
 */
healthRouter.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3001
  });
});

/**
 * GET /api/health/token
 * Test token verification
 */
healthRouter.get('/token', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'No token provided',
      instruction: 'Send token in Authorization header: Bearer YOUR_TOKEN'
    });
  }

  try {
    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_SECRET || 'dev-secret-change-in-production';
    const decoded = jwt.verify(token, secret);
    
    res.json({
      success: true,
      message: 'Token is valid',
      decoded: {
        userId: decoded.userId,
        role: decoded.role,
        iat: new Date(decoded.iat * 1000).toISOString(),
        exp: new Date(decoded.exp * 1000).toISOString()
      }
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: 'Token verification failed',
      error: error.message
    });
  }
});

export default healthRouter;
