
import axios from 'axios';
import { env } from '../config/env.js';
import { extractSpotifyTrackId } from '../utils/extract-track-id.js';

export interface SpotifyTrackMetadata {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string | null;
  durationMs: number | null;
  spotifyUrl: string;
}

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyApiTrack {
  id: string;
  name: string;
  artists: Array<{
    name: string;
  }>;
  album: {
    name: string;
    images: Array<{
      url: string;
    }>;
  };
  duration_ms: number;
  external_urls: {
    spotify: string;
  };
}

interface SpotifyOEmbedResponse {
  title: string;
  thumbnail_url?: string | null;
}

// Cache Spotify access token in memory.
let accessToken = '';
let tokenExpiresAt = 0;

/**
 * Get Spotify API access token using Client Credentials.
 */
async function getSpotifyAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiresAt) {
    return accessToken;
  }

  if (!env.SPOTIFY_CLIENT_ID || !env.SPOTIFY_CLIENT_SECRET) {
    throw new Error('Spotify API credentials are not configured.');
  }

  const response = await axios.post<SpotifyTokenResponse>(
    'https://accounts.spotify.com/api/token',
    new URLSearchParams({
      grant_type: 'client_credentials',
    }),
    {
      auth: {
        username: env.SPOTIFY_CLIENT_ID,
        password: env.SPOTIFY_CLIENT_SECRET,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 12000,
    }
  );

  accessToken = response.data.access_token;

  // Refresh the token 60 seconds before expiration.
  tokenExpiresAt =
    Date.now() + Math.max(response.data.expires_in - 60, 0) * 1000;

  return accessToken;
}

/**
 * Retrieve complete track metadata using Spotify Web API.
 */
async function getTrackFromSpotifyApi(
  id: string
): Promise<SpotifyTrackMetadata> {
  const token = await getSpotifyAccessToken();

  const response = await axios.get<SpotifyApiTrack>(
    `https://api.spotify.com/v1/tracks/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 12000,
    }
  );

  const track = response.data;

  return {
    id: track.id,
    title: track.name,
    artist:
      track.artists.map((artist) => artist.name).join(', ') ||
      'Unknown artist',
    album: track.album.name || 'Unknown album',
    coverUrl: track.album.images?.[0]?.url ?? null,
    durationMs: track.duration_ms ?? null,
    spotifyUrl:
      track.external_urls?.spotify ??
      `https://open.spotify.com/track/${id}`,
  };
}

/**
 * Fallback metadata retrieval using Spotify oEmbed.
 */
async function getTrackFromOEmbed(
  id: string
): Promise<SpotifyTrackMetadata> {
  const spotifyUrl = `https://open.spotify.com/track/${id}`;

  const response = await axios.get<SpotifyOEmbedResponse>(
    'https://open.spotify.com/oembed',
    {
      params: {
        url: spotifyUrl,
      },
      timeout: 12000,
      headers: {
        'User-Agent': 'Mozilla/5.0 TrackMetadataApp/1.0',
      },
    }
  );

  const data = response.data;

  if (!data.title) {
    throw new Error('Spotify did not return track metadata.');
  }

  return {
    id,
    title: data.title,
    artist: 'Unknown artist',
    album: 'Unknown album',
    coverUrl: data.thumbnail_url ?? null,
    durationMs: null,
    spotifyUrl,
  };
}

/**
 * Main function used by the track controller.
 */
export async function getSpotifyTrackMetadata(
  trackUrl: string
): Promise<SpotifyTrackMetadata> {
  const id = extractSpotifyTrackId(trackUrl);

  // First attempt: Spotify Web API.
  if (env.SPOTIFY_CLIENT_ID && env.SPOTIFY_CLIENT_SECRET) {
    try {
      return await getTrackFromSpotifyApi(id);
    } catch (error) {
      console.error(
        'Spotify Web API request failed. Trying oEmbed fallback:',
        axios.isAxiosError(error)
          ? {
              status: error.response?.status,
              message: error.message,
              response: error.response?.data,
            }
          : error
      );
    }
  }

  // Second attempt: Spotify oEmbed.
  try {
    return await getTrackFromOEmbed(id);
  } catch (error) {
    console.error(
      'Spotify oEmbed request failed:',
      axios.isAxiosError(error)
        ? {
            status: error.response?.status,
            message: error.message,
            response: error.response?.data,
          }
        : error
    );

    throw new Error(
      'Unable to retrieve this Spotify track. Please check the URL and try again.'
    );
  }
}
