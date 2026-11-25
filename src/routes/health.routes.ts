import { Router } from 'express';
import { redisConnection } from '../config/redis.js';
export const healthRouter = Router();
healthRouter.get('/', async (_req, res) => {
  const redis = redisConnection.status === 'ready';
  res.status(redis ? 200 : 503).json({ status: redis ? 'ok' : 'degraded', services: { redis } });
});
