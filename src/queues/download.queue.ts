import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { QUEUE_NAME, JOB_NAME } from '../config/constants.js';
export interface AudioJobData { sourcePath: string; spotifyUrl: string }
export const downloadQueue = new Queue<AudioJobData>(QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 3000 },
    removeOnComplete: { age: 3600, count: 500 }, removeOnFail: { age: 86400, count: 1000 } }
});
export async function enqueueAudioJob(data: AudioJobData) {
  return downloadQueue.add(JOB_NAME, data);
}
