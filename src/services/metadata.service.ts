import { parseFile } from 'music-metadata';
export async function readAudioMetadata(filePath: string) {
  const metadata = await parseFile(filePath);
  return { title: metadata.common.title ?? null, artist: metadata.common.artist ?? null,
    album: metadata.common.album ?? null, duration: metadata.format.duration ?? null,
    mimeType: metadata.format.container ?? null };
}
