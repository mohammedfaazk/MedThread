/**
 * Validation utilities for API request parameters
 */

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Safely parse integer from query parameter with bounds checking
 */
export function parseIntSafe(
  value: any,
  defaultValue: number,
  options?: {
    min?: number;
    max?: number;
    fieldName?: string;
  }
): number {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  const parsed = parseInt(value as string, 10);

  if (isNaN(parsed)) {
    throw new ValidationError(
      `Invalid ${options?.fieldName || 'number'}: must be a valid integer`
    );
  }

  if (options?.min !== undefined && parsed < options.min) {
    throw new ValidationError(
      `${options?.fieldName || 'Value'} must be at least ${options.min}`
    );
  }

  if (options?.max !== undefined && parsed > options.max) {
    throw new ValidationError(
      `${options?.fieldName || 'Value'} must be at most ${options.max}`
    );
  }

  return parsed;
}

/**
 * Safely parse float from query parameter with bounds checking
 */
export function parseFloatSafe(
  value: any,
  defaultValue: number,
  options?: {
    min?: number;
    max?: number;
    fieldName?: string;
  }
): number {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  const parsed = parseFloat(value as string);

  if (isNaN(parsed)) {
    throw new ValidationError(
      `Invalid ${options?.fieldName || 'number'}: must be a valid number`
    );
  }

  if (options?.min !== undefined && parsed < options.min) {
    throw new ValidationError(
      `${options?.fieldName || 'Value'} must be at least ${options.min}`
    );
  }

  if (options?.max !== undefined && parsed > options.max) {
    throw new ValidationError(
      `${options?.fieldName || 'Value'} must be at most ${options.max}`
    );
  }

  return parsed;
}

/**
 * Validate pagination parameters
 */
export function validatePagination(query: any): { page: number; limit: number } {
  const page = parseIntSafe(query.page, 1, {
    min: 1,
    max: 10000,
    fieldName: 'page',
  });

  const limit = parseIntSafe(query.limit, 20, {
    min: 1,
    max: 100,
    fieldName: 'limit',
  });

  return { page, limit };
}

/**
 * Validate required string field
 */
export function validateRequiredString(
  value: any,
  fieldName: string,
  options?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  }
): string {
  if (!value || typeof value !== 'string') {
    throw new ValidationError(`${fieldName} is required and must be a string`);
  }

  const trimmed = value.trim();

  if (trimmed.length === 0) {
    throw new ValidationError(`${fieldName} cannot be empty`);
  }

  if (options?.minLength && trimmed.length < options.minLength) {
    throw new ValidationError(
      `${fieldName} must be at least ${options.minLength} characters`
    );
  }

  if (options?.maxLength && trimmed.length > options.maxLength) {
    throw new ValidationError(
      `${fieldName} must be at most ${options.maxLength} characters`
    );
  }

  if (options?.pattern && !options.pattern.test(trimmed)) {
    throw new ValidationError(`${fieldName} has invalid format`);
  }

  return trimmed;
}

/**
 * Validate email format
 */
export function validateEmail(email: any): string {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return validateRequiredString(email, 'Email', {
    pattern: emailRegex,
    maxLength: 255,
  });
}

/**
 * Validate enum value
 */
export function validateEnum<T extends string>(
  value: any,
  allowedValues: readonly T[],
  fieldName: string,
  defaultValue?: T
): T {
  if (value === undefined || value === null || value === '') {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new ValidationError(
      `${fieldName} is required. Allowed values: ${allowedValues.join(', ')}`
    );
  }

  if (!allowedValues.includes(value as T)) {
    throw new ValidationError(
      `Invalid ${fieldName}. Allowed values: ${allowedValues.join(', ')}`
    );
  }

  return value as T;
}

/**
 * Validate array of strings
 */
export function validateStringArray(
  value: any,
  fieldName: string,
  options?: {
    minLength?: number;
    maxLength?: number;
    maxItems?: number;
  }
): string[] {
  if (!value) {
    return [];
  }

  let arr: string[];

  if (typeof value === 'string') {
    arr = value.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
  } else if (Array.isArray(value)) {
    arr = value.filter((v) => typeof v === 'string' && v.trim().length > 0);
  } else {
    throw new ValidationError(`${fieldName} must be a string or array`);
  }

  if (options?.maxItems && arr.length > options.maxItems) {
    throw new ValidationError(
      `${fieldName} cannot have more than ${options.maxItems} items`
    );
  }

  if (options?.minLength || options?.maxLength) {
    arr.forEach((item) => {
      if (options.minLength && item.length < options.minLength) {
        throw new ValidationError(
          `Each ${fieldName} item must be at least ${options.minLength} characters`
        );
      }
      if (options.maxLength && item.length > options.maxLength) {
        throw new ValidationError(
          `Each ${fieldName} item must be at most ${options.maxLength} characters`
        );
      }
    });
  }

  return arr;
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHtml(html: string): string {
  // Basic sanitization - in production, use a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '');
}

/**
 * Validate boolean value
 */
export function validateBoolean(
  value: any,
  fieldName: string,
  defaultValue?: boolean
): boolean {
  if (value === undefined || value === null || value === '') {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new ValidationError(`${fieldName} is required`);
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (lower === 'true' || lower === '1' || lower === 'yes') {
      return true;
    }
    if (lower === 'false' || lower === '0' || lower === 'no') {
      return false;
    }
  }

  throw new ValidationError(`${fieldName} must be a boolean value`);
}

/**
 * Validate date string
 */
export function validateDate(
  value: any,
  fieldName: string,
  options?: {
    minDate?: Date;
    maxDate?: Date;
  }
): Date {
  if (!value) {
    throw new ValidationError(`${fieldName} is required`);
  }

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    throw new ValidationError(`${fieldName} must be a valid date`);
  }

  if (options?.minDate && date < options.minDate) {
    throw new ValidationError(
      `${fieldName} must be after ${options.minDate.toISOString()}`
    );
  }

  if (options?.maxDate && date > options.maxDate) {
    throw new ValidationError(
      `${fieldName} must be before ${options.maxDate.toISOString()}`
    );
  }

  return date;
}
