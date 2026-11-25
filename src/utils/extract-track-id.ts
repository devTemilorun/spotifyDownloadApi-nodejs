export function extractSpotifyTrackId(input: string): string {
  let url: URL;
  try { url = new URL(input); } catch { throw new Error('A valid Spotify track URL is required.'); }
  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  if (!['open.spotify.com', 'spotify.link'].includes(host)) throw new Error('Only Spotify track URLs are accepted.');
  const segments = url.pathname.split('/').filter(Boolean);
  const trackIndex = segments.indexOf('track');
  const id = trackIndex >= 0 ? segments[trackIndex + 1] : undefined;
  if (!id || !/^[A-Za-z0-9]{22}$/.test(id)) throw new Error('The URL does not contain a valid Spotify track ID.');
  return id;
}
