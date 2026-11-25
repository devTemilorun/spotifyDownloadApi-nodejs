import { mkdir } from 'node:fs/promises';
import { env } from './env.js';

export async function ensureStorageDirectories(): Promise<void> {
  await Promise.all([env.UPLOAD_DIR, env.DOWNLOAD_DIR, env.TEMP_DIR].map((dir) => mkdir(dir, { recursive: true })));
}
