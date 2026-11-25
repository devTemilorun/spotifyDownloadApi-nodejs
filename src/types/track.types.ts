export interface TrackRecord { 
    id: string; 
    title: string; 
    artist: string; 
    album: string; 
    coverUrl: string | null; 
    durationMs: number | null; 
    spotifyUrl: string; 
}
