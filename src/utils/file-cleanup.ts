import { unlink } from 'node:fs/promises';
import { logger } from './logger.js';
export async function removeFile(path: string): Promise<void> {
  try { await unlink(path); } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') logger.warn({ error, path }, 'Could not remove temporary file');
  }
}
