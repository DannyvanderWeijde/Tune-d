import { SpotifyApi } from '@spotify/web-api-ts-sdk'

const clientId = process.env.SPOTIFY_CLIENT_ID
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

if (!clientId || !clientSecret) {
  throw new Error('Missing Spotify Client ID or Secret in .env file')
}

// The SDK automatically handles token fetching, caching, and refreshing.
const sdk = SpotifyApi.withClientCredentials(clientId, clientSecret)

/**
 * A wrapper around the Spotify Web API SDK.
 * Provides helper methods for common tasks to keep API handlers clean.
 */
export const spotifyClient = {
  // Exposes the raw SDK instance for advanced usage not covered by helpers.
  sdk,

  /**
   * Fetches full details for a playlist, including tracks.
   *
   * @param {string} playlistId - The Spotify Playlist ID.
   *
   * @returns {Promise<any>} The playlist details.
   */
  async getPlaylist(playlistId: string) {
    return await sdk.playlists.getPlaylist(playlistId)
  },

  /**
   * Searches for Tracks, Albums, and Artists simultaneously.
   *
   * @param {string} query - The search string.
   * @param {number} [limit=15] - Number of results per category (default: 20).
   *
   * @returns {Promise<any>} The search results.
   */
  async search(query: string, limit = 15) {
    return await sdk.search(
      query,
      ['track', 'album', 'artist'],
      // Market (undefined = all available)
      undefined,
      limit
    )
  },

  /**
   * Fetches an Artist's profile and their Top Tracks in parallel.
   *
   * @param {string} id - The Spotify Artist ID.
   *
   * @returns {Promise<{artist: any, topTracks: any}>} An object containing { artist, topTracks }.
   */
  async getArtist(id: string) {
    // Run both requests at the same time for performance
    const [artist, topTracks] = await Promise.all([
      sdk.artists.get(id),
      sdk.artists.topTracks(id, 'US') // Defaulting to US market for top tracks
    ])
    return { artist, topTracks }
  },

  /**
   *
   * Used when saving scores to get images for all featured artists.
   *
   * @param {string[]} ids - Array of Artist IDs (e.g. ['id1', 'id2'])
   *
   * @returns {Promise<any>} The artist details.
   */
  async getArtists(ids: string[]) {
    // The SDK is smart: if you pass an array, it hits the batch endpoint
    return await sdk.artists.get(ids)
  },

  /**
   * Fetches full details for a specific album.
   *
   * @param {string} id - The Spotify Album ID.
   *
   * @returns {Promise<any>} The album details.
   */
  async getAlbum(id: string) {
    return await sdk.albums.get(id)
  },

  /**
   * Fetches full details for a specific track.
   *
   * @param {string} id - The Spotify Track ID.
   *
   * @returns {Promise<any>} The track details.
   */
  async getTrack(id: string) {
    return await sdk.tracks.get(id)
  },

  /**
   * Specific search for tracks only.
   *
   * @param {string} query - The search string.
   *
   * @returns {Promise<any>} The search results.
   */
  async searchTracks(query: string) {
    return await sdk.search(query, ['track'])
  }
}