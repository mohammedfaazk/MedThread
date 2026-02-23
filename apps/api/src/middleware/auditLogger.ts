import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.refactored';
import { auditLogService, AuditAction } from '../services/audit-log.service';

/**
 * Middleware to automatically log admin actions
 */
export const auditLogger = (action: AuditAction, getDetails?: (req: AuthRequest) => any) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to log after successful response
    res.json = function (body: any) {
      // Only log if response is successful (2xx status)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Log asynchronously (don't wait)
        if (req.userId && req.userRole === 'ADMIN') {
          const details = getDetails ? getDetails(req) : undefined;
          
          auditLogService.createLog({
            action,
            adminId: req.userId,
            targetType: req.params.id ? getTargetType(req.path) : undefined,
            targetId: req.params.id,
            details,
            ipAddress: getClientIp(req),
            userAgent: req.headers['user-agent'],
          }).catch(err => {
            console.error('Audit log failed:', err);
          });
        }
      }

      return originalJson(body);
    };

    next();
  };
};

/**
 * Helper to determine target type from path
 */
function getTargetType(path: string): string | undefined {
  if (path.includes('/users/')) return 'USER';
  if (path.includes('/posts/')) return 'POST';
  if (path.includes('/comments/')) return 'COMMENT';
  if (path.includes('/reports/')) return 'REPORT';
  return undefined;
}

/**
 * Helper to get client IP address
 */
function getClientIp(req: AuthRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}
