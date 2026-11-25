import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { QUEUE_NAME } from '../config/constants.js';
import { getSpotifyTrackMetadata } from '../services/spotify.service.js';
import { processAuthorizedAudio } from '../services/download.service.js';
import { emitProgress } from '../sse/progress.emitter.js';
import { logger } from '../utils/logger.js';
import { removeFile } from '../utils/file-cleanup.js';
import type { AudioJobData } from './download.queue.js';

export function startDownloadWorker() {
  const worker = new Worker<AudioJobData>(QUEUE_NAME, async (job) => {
    emitProgress({ jobId: job.id!, state: 'active', progress: 10, message: 'Fetching track metadata' });
    const metadata = await getSpotifyTrackMetadata(job.data.spotifyUrl);
    emitProgress({ jobId: job.id!, state: 'active', progress: 35, message: 'Validating authorized audio file' });
    try {
      const result = await processAuthorizedAudio(job.data.sourcePath, metadata);
      emitProgress({ jobId: job.id!, state: 'completed', progress: 100, message: 'Audio processing completed', downloadUrl: result.downloadUrl });
      return result;
    } finally {
      await removeFile(job.data.sourcePath);
    }
  }, { connection: redisConnection, concurrency: 3 });

  worker.on('failed', (job, error) => {
    if (job) emitProgress({ jobId: job.id!, state: 'failed', progress: 0, message: error.message });
    logger.error({ jobId: job?.id, error }, 'Audio processing job failed');
  });
  worker.on('error', (error) => logger.error({ error }, 'Worker error'));
  logger.info('Download worker started');
  return worker;
}
