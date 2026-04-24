// types/api.ts

// 1. The data we need from Spotify to create a "Track" in our DB
export interface TrackMetadata {
  name: string
  // Changed from string to Array
  artists: { name: string; id: string }[]
  albumName: string
  albumImage: string
  albumId: string
  albumType: string
}

// 2. The payload for POST /api/db/score
export interface ScoreBody {
  spotifyId: string
  score: number | string // Allow string in case input is text, handled in backend
  trackMetadata: TrackMetadata
  userId: string
}

// 3. The response from GET /api/db/score
export interface ScoreResponse {
  score: number | null
}