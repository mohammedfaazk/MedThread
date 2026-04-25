import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { ZodError } from 'zod';
import { StandardError, formatErrorResponse } from '../utils/standardErrors';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error for debugging
  console.error('[ErrorHandler] Caught error:', {
    type: err.constructor.name,
    message: err.message,
    statusCode: (err as any).statusCode,
    path: req.path,
    method: req.method,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Handle StandardError (new standardized errors)
  if (err instanceof StandardError) {
    console.log('[ErrorHandler] Handling StandardError with status:', err.statusCode);
    return res.status(err.statusCode).json(formatErrorResponse(err));
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    console.log('[ErrorHandler] Handling ZodError');
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        statusCode: 400,
        details: err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
        timestamp: new Date().toISOString()
      }
    });
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    console.log('[ErrorHandler] Handling AppError with status:', err.statusCode);
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: 'APP_ERROR',
        message: err.message,
        statusCode: err.statusCode,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Handle Prisma errors
  if ((err as any).code?.startsWith('P')) {
    console.log('[ErrorHandler] Handling Prisma error');
    return res.status(500).json(formatErrorResponse(err));
  }

  // Handle unknown errors
  console.log('[ErrorHandler] Handling unknown error');
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    }
  });
};

