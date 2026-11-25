import { z } from 'zod';
export const spotifyUrlSchema = z.string().url().max(2048).refine((value) => {
  try {
    const url = new URL(value);
    return ['open.spotify.com', 'www.open.spotify.com', 'spotify.link'].includes(url.hostname);
  } catch { return false; }
}, 'Must be a Spotify URL');
