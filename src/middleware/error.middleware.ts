import type { ErrorRequestHandler } from 'express';
import { logger } from '../utils/logger.js';
export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  logger.error({ error }, 'Request failed');
  if (res.headersSent) return;
  const status = Number((error as { status?: number }).status) || 500;
  res.status(status).json({ error: status >= 500 ? 'Internal server error' : error.message || 'Request failed' });
};
