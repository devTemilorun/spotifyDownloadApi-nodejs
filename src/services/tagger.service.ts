import NodeID3 from 'node-id3';
import { readFile } from 'node:fs/promises';
import type { SpotifyTrackMetadata } from './spotify.service.js';

export async function tagMp3WithArtwork(audioPath: string, metadata: SpotifyTrackMetadata): Promise<void> {
  if (!metadata.coverUrl) throw new Error('No cover artwork was available for this track.');
  const imageResponse = await fetch(metadata.coverUrl, { signal: AbortSignal.timeout(15_000) });
  if (!imageResponse.ok) throw new Error('Could not retrieve cover artwork.');
  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
  const mime = imageResponse.headers.get('content-type') || 'image/jpeg';
  const success = NodeID3.write({
    title: metadata.title, artist: metadata.artist, album: metadata.album,
    image: { mime, type: { id: 3, name: 'front cover' }, description: 'Album cover', imageBuffer }
  }, audioPath);
  if (!success) throw new Error('Could not write ID3 tags to the MP3 file.');
  
  // Ensure the resulting file remains readable.
  await readFile(audioPath);
}
