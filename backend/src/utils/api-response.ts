import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
  timestamp?: string;
}

export function successResponse<T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200
): void {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
  res.status(statusCode).json(response);
}

export function errorResponse(
  res: Response,
  message: string,
  errors?: Array<{ field: string; message: string }>,
  statusCode: number = 400
): void {
  const response: ApiResponse = {
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString(),
  };
  res.status(statusCode).json(response);
}

export function validationErrorResponse(
  res: Response,
  errors: Array<{ field: string; message: string }>
): void {
  errorResponse(res, 'Validation failed', errors, 400);
}

export function unauthorizedResponse(
  res: Response,
  message: string = 'Unauthorized'
): void {
  errorResponse(res, message, undefined, 401);
}

export function forbiddenResponse(
  res: Response,
  message: string = 'Forbidden'
): void {
  errorResponse(res, message, undefined, 403);
}

export function notFoundResponse(
  res: Response,
  message: string = 'Resource not found'
): void {
  errorResponse(res, message, undefined, 404);
}

export function conflictResponse(
  res: Response,
  message: string = 'Conflict'
): void {
  errorResponse(res, message, undefined, 409);
}

export function internalErrorResponse(
  res: Response,
  message: string = 'Internal server error'
): void {
  errorResponse(res, message, undefined, 500);
}

export class ValidationError extends Error {
  constructor(
    public errors: Array<{ field: string; message: string }>,
    message: string = 'Validation failed'
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message: string = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends Error {
  constructor(message: string = 'Conflict') {
    super(message);
    this.name = 'ConflictError';
  }
}

export class InsufficientStockError extends Error {
  constructor(message: string = 'Insufficient stock') {
    super(message);
    this.name = 'InsufficientStockError';
  }
}

export class BadRequestError extends Error {
  constructor(message: string = 'Bad request') {
    super(message);
    this.name = 'BadRequestError';
  }
}

export class DatabaseError extends Error {
  constructor(message: string = 'Database error') {
    super(message);
    this.name = 'DatabaseError';
  }
}
