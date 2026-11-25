import { EventEmitter } from 'node:events';
export interface ProgressEvent { jobId: string; state: string; progress: number; message: string; downloadUrl?: string }
class JobProgressEmitter extends EventEmitter {}
export const progressEmitter = new JobProgressEmitter();
export function emitProgress(event: ProgressEvent): void { progressEmitter.emit(`job:${event.jobId}`, event); }
