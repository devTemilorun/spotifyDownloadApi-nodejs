import axios from 'axios';
import * as cheerio from 'cheerio';
import { extractSpotifyTrackId } from '../utils/extract-track-id.js';

export interface SpotifyTrackMetadata {
  id: string; title: string; artist: string; album: string; coverUrl: string | null;
  durationMs: number | null; spotifyUrl: string;
}

export async function getSpotifyTrackMetadata(trackUrl: string): Promise<SpotifyTrackMetadata> {
  const id = extractSpotifyTrackId(trackUrl);
  const embedUrl = `https://open.spotify.com/embed/track/${id}`;
  const response = await axios.get<string>(embedUrl, {
    timeout: 12_000, headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TrackMetadataApp/1.0)' }
  });
  const $ = cheerio.load(response.data);
  const candidates = [
    $('meta[property="og:title"]').attr('content'),
    $('meta[name="twitter:title"]').attr('content')
  ].filter(Boolean);
  const titleText = candidates[0] ?? '';
  const description = $('meta[property="og:description"]').attr('content') ?? '';
  const coverUrl = $('meta[property="og:image"]').attr('content') ??
    $('meta[name="twitter:image"]').attr('content') ?? null;

  // Spotify's embed markup can change. Treat the page's Open Graph fields as best-effort metadata.
  const split = description.split(/\s*[·•,-]\s*/);
  const artist = split[0]?.trim() || 'Unknown artist';
  const album = split.slice(1).join(', ').trim() || 'Unknown album';
  if (!titleText) throw new Error('Spotify metadata was not available for this track.');
  return { id, title: titleText.replace(/\s*\|\s*Spotify.*$/i, '').trim(), artist, album, coverUrl,
    durationMs: null, spotifyUrl: `https://open.spotify.com/track/${id}` };
}
