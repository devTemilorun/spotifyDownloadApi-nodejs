
import type { Request, Response } from 'express';
import { getSpotifyTrackMetadata } from '../services/spotify.service.js';
import {
  getCachedTrack,
  cacheTrack,
} from '../services/cache.service.js';
import { extractSpotifyTrackId } from '../utils/extract-track-id.js';
import { logger } from '../utils/logger.js';

export async function getTrack(req: Request, res: Response) {
  let stage = 'validate-url';
  let id = '';

  try {
    const url = String(req.query.url ?? '');

    if (!url) {
      res.status(400).json({
        error: 'Spotify track URL is required.',
      });
      return;
    }

    id = extractSpotifyTrackId(url);

    stage = 'redis-cache-read';

    const cached = await getCachedTrack(id);

    if (cached) {
      res.json({
        data: cached,
        cached: true,
      });
      return;
    }

    stage = 'spotify-metadata-fetch';

    const metadata = await getSpotifyTrackMetadata(url);

    stage = 'redis-cache-write';

    await cacheTrack(metadata);

    res.json({
      data: metadata,
      cached: false,
    });
  } catch (error) {
    logger.error(
      {
        err: error,
        stage,
        trackId: id || undefined,
      },
      'Spotify track lookup failed'
    );

    throw error;
  }
}
