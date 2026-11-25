import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { env } from '../config/env.js';
import { assertMp3File } from './audio.service.js';
import { tagMp3WithArtwork } from './tagger.service.js';
import { storeCompletedFile } from './storage.service.js';
import type { SpotifyTrackMetadata } from './spotify.service.js';

export async function processAuthorizedAudio(sourcePath: string, metadata: SpotifyTrackMetadata) {
  await assertMp3File(sourcePath);
  await mkdir(env.TEMP_DIR, { recursive: true });
  const workingPath = path.join(env.TEMP_DIR, `${randomUUID()}.mp3`);
  await copyFile(sourcePath, workingPath);
  await tagMp3WithArtwork(workingPath, metadata);
  const stored = await storeCompletedFile(workingPath);
  return stored;
}
