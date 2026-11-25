import { Redis as IORedis } from 'ioredis';
import { env } from './env.js';

export const redisConnection = new IORedis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: true
});

redisConnection.on('error', (error) => console.error('Redis connection error:', error.message));
