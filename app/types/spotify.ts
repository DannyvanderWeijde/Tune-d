export interface SpotifyImage {
  url: string
  height?: number
  width?: number
}

export interface Artist {
  id: string
  name: string
  images: SpotifyImage[]
  genres?: string[]
}

export interface Album {
  id: string
  name: string
  artists: Artist[]
  images: SpotifyImage[]
  release_date?: string
}

export interface TrackItem {
  id: string
  name: string
  duration_ms: number
  artists: Artist[]
  album: Album
  preview_url?: string | null
  popularity: number
}

export interface SearchResponse {
  artists?: { items: Artist[] }
  albums?: { items: Album[] }
  tracks?: { items: TrackItem[] }
}

export interface AlbumDetails extends Album {
  total_tracks: number
  release_date: string
  label?: string
  tracks: {
    items: TrackItem[]
  }
}

export interface ArtistPageResponse {
  artist: {
    id: string
    name: string
    images: SpotifyImage[]
    followers: { total: number }
    genres: string[]
  }
  topTracks: {
    tracks: TrackItem[]
  }
}

export interface PlaylistDetails {
  id: string
  name: string
  description: string | null
  images: SpotifyImage[]
  owner: { display_name: string }
  followers: { total: number }
  tracks: {
    total: number
    items: {
      added_at: string
      track: TrackItem // Reuses your existing TrackItem type
    }[]
  }
}

export interface RatingResponse {
  score: number | null
  rankingTime: number
}