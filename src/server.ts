import { app } from './app.js';
import { env } from './config/env.js';
import { ensureStorageDirectories } from './config/storage.js';
import { redisConnection } from './config/redis.js';
import { logger } from './utils/logger.js';

await ensureStorageDirectories();
const server = app.listen(env.PORT, () => logger.info(`API listening on port ${env.PORT}`));

const shutdown = async (signal: string) => {
  logger.info({ signal }, 'Shutting down API');
  server.close();
  await redisConnection.quit();
  process.exit(0);
};
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
