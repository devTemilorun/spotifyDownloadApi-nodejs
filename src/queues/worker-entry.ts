import { startDownloadWorker } from './download.worker.js';
import { ensureStorageDirectories } from '../config/storage.js';
import { logger } from '../utils/logger.js';
await ensureStorageDirectories();
const worker = startDownloadWorker();
const shutdown = async () => { logger.info('Stopping worker'); await worker.close(); process.exit(0); };
process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());
