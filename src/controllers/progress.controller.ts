import type { Request, Response } from 'express';
import { progressEmitter } from '../sse/progress.emitter.js';
import { downloadQueue } from '../queues/download.queue.js';

export async function streamProgress(req: Request, res: Response) {
  const jobId = req.params.jobId;
  if (typeof jobId !== 'string') {
    res.status(400).json({ error: 'Invalid job ID' });
    return;
  }
  const job = await downloadQueue.getJob(jobId);
  if (!job) { res.status(404).json({ error: 'Job not found or expired' }); return; }
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();
  const send = (data: unknown) => res.write(`data: ${JSON.stringify(data)}\n\n`);
  send({ jobId, state: await job.getState(), progress: job.progress, message: 'Connected to progress stream' });
  const listener = (event: { jobId: string }) => send(event);
  progressEmitter.on(`job:${jobId}`, listener);
  const heartbeat = setInterval(() => res.write(': heartbeat\n\n'), 15000);
  req.on('close', () => { clearInterval(heartbeat); progressEmitter.off(`job:${jobId}`, listener); res.end(); });
}
