// Global error handling middleware

import { Request, Response, NextFunction } from 'express';
import {
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  conflictResponse,
  internalErrorResponse,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  InsufficientStockError,
  DatabaseError,
} from '../utils/api-response';

/**
 * Global error handling middleware
 * Must be registered last in middleware chain
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error caught by error handler:', err);

  // Handle custom validation errors
  if (err instanceof ValidationError) {
    validationErrorResponse(res, err.errors);
    return;
  }

  // Handle not found errors
  if (err instanceof NotFoundError) {
    notFoundResponse(res, err.message);
    return;
  }

  // Handle unauthorized errors
  if (err instanceof UnauthorizedError) {
    unauthorizedResponse(res, err.message);
    return;
  }

  // Handle forbidden errors
  if (err instanceof ForbiddenError) {
    forbiddenResponse(res, err.message);
    return;
  }

  // Handle conflict errors
  if (err instanceof ConflictError) {
    conflictResponse(res, err.message);
    return;
  }

  // Handle insufficient stock errors
  if (err instanceof InsufficientStockError) {
    errorResponse(res, err.message, undefined, 400);
    return;
  }

  // Handle database errors
  if (err instanceof DatabaseError) {
    console.error('Database error:', err.message);
    internalErrorResponse(res, 'Database operation failed');
    return;
  }

  // Handle MySQL/database errors
  if (err.code && err.sqlState) {
    console.error('MySQL error:', err);

    if (err.code === 'ER_DUP_ENTRY') {
      conflictResponse(res, 'Duplicate entry in database');
      return;
    }

    if (err.code === 'ER_NO_REFERENCED_ROW') {
      notFoundResponse(res, 'Referenced record not found');
      return;
    }

    internalErrorResponse(res, 'Database operation failed');
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    unauthorizedResponse(res, 'Invalid token');
    return;
  }

  if (err.name === 'TokenExpiredError') {
    unauthorizedResponse(res, 'Token expired');
    return;
  }

  // Handle multer file upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      errorResponse(res, 'File too large', undefined, 400);
      return;
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
      errorResponse(res, 'Too many files', undefined, 400);
      return;
    }

    if (err.code === 'FILE_TYPE_ERROR') {
      errorResponse(res, 'Invalid file type', undefined, 400);
      return;
    }

    errorResponse(res, 'File upload error', undefined, 400);
    return;
  }

  // Handle generic errors
  if (err instanceof Error) {
    console.error('Generic error:', err.message);
    internalErrorResponse(res, err.message || 'Internal server error');
    return;
  }

  // Handle unknown errors
  console.error('Unknown error:', err);
  internalErrorResponse(res, 'An unexpected error occurred');
}

/**
 * Async error wrapper for route handlers
 * Wraps async functions to catch errors and pass to error handler
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 404 handler for undefined routes
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  notFoundResponse(res, `Route ${req.originalUrl} not found`);
}
