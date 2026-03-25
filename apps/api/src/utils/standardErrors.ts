export class StandardError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'StandardError';
  }
}

export const ErrorCodes = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Resources
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  
  // Medical Safety
  EMERGENCY_DETECTED: 'EMERGENCY_DETECTED',
  MEDICAL_VERIFICATION_FAILED: 'MEDICAL_VERIFICATION_FAILED',
  CONTENT_MODERATION_FAILED: 'CONTENT_MODERATION_FAILED',
  CONTENT_BLOCKED: 'CONTENT_BLOCKED',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
};

export const standardErrors = {
  unauthorized: (message = 'Authentication required') =>
    new StandardError(401, message, ErrorCodes.UNAUTHORIZED),
  
  forbidden: (message = 'Access denied') =>
    new StandardError(403, message, ErrorCodes.FORBIDDEN),
  
  notFound: (resource = 'Resource', message?: string) =>
    new StandardError(404, message || `${resource} not found`, ErrorCodes.NOT_FOUND),
  
  validation: (message: string, details?: any) =>
    new StandardError(400, message, ErrorCodes.VALIDATION_ERROR, details),
  
  alreadyExists: (resource = 'Resource') =>
    new StandardError(409, `${resource} already exists`, ErrorCodes.ALREADY_EXISTS),
  
  rateLimit: (retryAfter: number) =>
    new StandardError(429, 'Too many requests', ErrorCodes.RATE_LIMIT_EXCEEDED, { retryAfter }),
  
  contentBlocked: (reason: string, categories?: any) =>
    new StandardError(400, 'Content violates guidelines', ErrorCodes.CONTENT_BLOCKED, { reason, categories }),
  
  emergencyDetected: (level: string) =>
    new StandardError(400, 'Emergency detected - please call emergency services', ErrorCodes.EMERGENCY_DETECTED, { level }),
  
  internal: (message = 'Internal server error') =>
    new StandardError(500, message, ErrorCodes.INTERNAL_ERROR),
  
  serviceUnavailable: (service: string) =>
    new StandardError(503, `${service} is currently unavailable`, ErrorCodes.SERVICE_UNAVAILABLE),
};

export function formatErrorResponse(error: any) {
  if (error instanceof StandardError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
        details: error.details,
        timestamp: new Date().toISOString()
      }
    };
  }

  // Handle Prisma errors
  if (error.code?.startsWith('P')) {
    return {
      success: false,
      error: {
        code: ErrorCodes.DATABASE_ERROR,
        message: 'Database operation failed',
        statusCode: 500,
        details: { prismaCode: error.code },
        timestamp: new Date().toISOString()
      }
    };
  }

  // Generic error
  return {
    success: false,
    error: {
      code: ErrorCodes.INTERNAL_ERROR,
      message: error.message || 'An unexpected error occurred',
      statusCode: 500,
      timestamp: new Date().toISOString()
    }
  };
}
