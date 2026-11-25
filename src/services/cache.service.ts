import { redisConnection } from '../config/redis.js';
import type { SpotifyTrackMetadata } from './spotify.service.js';
const TTL_SECONDS = 60 * 60;
export async function getCachedTrack(id: string): Promise<SpotifyTrackMetadata | null> {
  const value = await redisConnection.get(`track:${id}`);
  return value ? JSON.parse(value) as SpotifyTrackMetadata : null;
}
export async function cacheTrack(metadata: SpotifyTrackMetadata): Promise<void> {
  await redisConnection.set(`track:${metadata.id}`, JSON.stringify(metadata), 'EX', TTL_SECONDS);
}
