"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogger = void 0;
const audit_log_service_1 = require("../services/audit-log.service");
/**
 * Middleware to automatically log admin actions
 */
const auditLogger = (action, getDetails) => {
    return async (req, res, next) => {
        // Store original json method
        const originalJson = res.json.bind(res);
        // Override json method to log after successful response
        res.json = function (body) {
            // Only log if response is successful (2xx status)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                // Log asynchronously (don't wait)
                if (req.userId && req.userRole === 'ADMIN') {
                    const details = getDetails ? getDetails(req) : undefined;
                    audit_log_service_1.auditLogService.createLog({
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
exports.auditLogger = auditLogger;
/**
 * Helper to determine target type from path
 */
function getTargetType(path) {
    if (path.includes('/users/'))
        return 'USER';
    if (path.includes('/posts/'))
        return 'POST';
    if (path.includes('/comments/'))
        return 'COMMENT';
    if (path.includes('/reports/'))
        return 'REPORT';
    return undefined;
}
/**
 * Helper to get client IP address
 */
function getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
        return forwarded.split(',')[0].trim();
    }
    return req.socket.remoteAddress || 'unknown';
}
