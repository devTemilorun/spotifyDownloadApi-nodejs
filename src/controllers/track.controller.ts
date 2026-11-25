import type { Request, Response } from 'express';
import { getSpotifyTrackMetadata } from '../services/spotify.service.js';
import { getCachedTrack, cacheTrack } from '../services/cache.service.js';
import { extractSpotifyTrackId } from '../utils/extract-track-id.js';

export async function getTrack(req: Request, res: Response) {
  const url = String(req.query.url ?? '');
  const id = extractSpotifyTrackId(url);
  const cached = await getCachedTrack(id);
  if (cached) { res.json({ data: cached, cached: true }); return; }
  const metadata = await getSpotifyTrackMetadata(url);
  await cacheTrack(metadata);
  res.json({ data: metadata, cached: false });
}
