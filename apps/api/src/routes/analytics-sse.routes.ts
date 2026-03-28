import { Router, Request, Response } from 'express';
import { analyticsEvents, AnalyticsEvent } from '../services/analytics-events.service';
import * as jwt from 'jsonwebtoken';

const router = Router();

// SSE endpoint for real-time analytics updates
router.get('/events', (req: Request, res: Response) => {
  // Authenticate via token in Authorization header or query param
  const token = req.headers.authorization?.split(' ')[1] || req.query.token as string;
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    
    // Check if user is admin
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    // Send initial connection message
    res.write('data: {"type":"connected","message":"Analytics events stream connected"}\n\n');

    // Event listener
    const eventListener = (event: AnalyticsEvent) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    };

    // Register listener
    analyticsEvents.on('analytics', eventListener);

    // Send heartbeat every 30 seconds to keep connection alive
    const heartbeat = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 30000);

    // Cleanup on client disconnect
    req.on('close', () => {
      clearInterval(heartbeat);
      analyticsEvents.removeListener('analytics', eventListener);
      res.end();
    });
  } catch (error) {
    console.error('SSE authentication error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
