import type { Request, Response } from 'express';
import { enqueueAudioJob } from '../queues/download.queue.js';
import { env } from '../config/env.js';
import { removeFile } from '../utils/file-cleanup.js';

export async function createDownload(req: Request & { file?: { path: string } }, res: Response) {
  const file = req.file;
  if (!file) { res.status(400).json({ error: 'An MP3 file is required in the audio field.' }); return; }
  try {
    const job = await enqueueAudioJob({ sourcePath: file.path, spotifyUrl: req.body.spotifyUrl });
    res.status(202).json({ message: 'Audio processing queued', jobId: job.id,
      statusUrl: `${env.API_PREFIX}/downloads/${job.id}`, progressUrl: `${env.API_PREFIX}/progress/${job.id}` });
  } catch (error) { await removeFile(file.path); throw error; }
}
export async function getDownload(req: Request, res: Response) {
  const { downloadQueue } = await import('../queues/download.queue.js');
  const jobId = req.params.jobId;
  if (typeof jobId !== 'string') {
    res.status(400).json({ error: 'A job ID is required' });
    return;
  }
  const job = await downloadQueue.getJob(jobId);
  if (!job) { res.status(404).json({ error: 'Job not found or expired' }); return; }
  const state = await job.getState();
  res.json({ jobId: job.id, state, progress: job.progress, result: job.returnvalue ?? null,
    failedReason: job.failedReason ?? null });
}
