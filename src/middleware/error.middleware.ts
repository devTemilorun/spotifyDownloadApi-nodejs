
import type { ErrorRequestHandler } from 'express';
import { logger } from '../utils/logger.js';

export const errorMiddleware: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next
) => {
  logger.error({ err: error }, 'Request failed');

  if (res.headersSent) return;

  const err = error as {
    status?: number;
    statusCode?: number;
    message?: string;
  };

  const status = err.status || err.statusCode || 500;

  res.status(status).json({
    error:
      status >= 500
        ? 'Internal server error'
        : err.message || 'Request failed',
  });
};
