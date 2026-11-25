import { describe, expect, it } from 'vitest';
import { extractSpotifyTrackId } from '../../src/utils/extract-track-id.js';

describe('extractSpotifyTrackId', () => {
  it('extracts a Spotify track ID', () => {
    expect(extractSpotifyTrackId('https://open.spotify.com/track/1234567890123456789012')).toBe('1234567890123456789012');
  });
  it('rejects non-track URLs', () => {
    expect(() => extractSpotifyTrackId('https://example.com/track/1234567890123456789012')).toThrow();
  });
});
