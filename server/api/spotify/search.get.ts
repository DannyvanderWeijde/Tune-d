/**
 * GET /api/spotify/search
 * Searches for Artists, Albums, and Tracks on Spotify.
 *
 * applies custom post-processing to:
 * 1. Filter out "Singles" from the Album results (albums with 1 track).
 * 2. Deduplicate Tracks (removes same song by same artist).
 * 3. Limit the number of Artists and Albums returned to reduce noise.
 *
 * @param {string} value - The search query string.
 * @returns {Promise<Object>} A combined object containing filtered artists, albums, and tracks.
 * @throws {400} If the 'value' parameter is missing.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const searchValue = String(query.value)

  if (!query.value || searchValue === 'undefined' || searchValue.trim() === '') {
    throw createError({
      statusCode: 400,
      message: 'Search query is required'
    })
  }

  try {
    const results = await spotifyClient.search(searchValue)

    // Filter Albums: Remove "Singles" to show only real albums/EPs
    // (Heuristic: Albums must have more than 1 track)
    const realAlbums = results.albums.items.filter(
      (album: any) => album.total_tracks > 1
    )

    // Filter Tracks: Deduplicate (Same Name + Same Artist)
    // This prevents seeing the same song 4 times (Original, Remaster, Deluxe, Greatest Hits)
    const uniqueTracks = []
    const seenTracks = new Set<string>()

    for (const track of results.tracks.items) {
      const key = `${track.name.toLowerCase()}:${track.artists[0].name.toLowerCase()}`

      if (!seenTracks.has(key)) {
        seenTracks.add(key)
        uniqueTracks.push(track)
      }
    }

    return {
      artists: {
        ...results.artists,
        items: results.artists.items.slice(0, 5)
      },
      albums: {
        ...results.albums,
        items: realAlbums.slice(0, 5)
      },
      tracks: {
        ...results.tracks,
        items: uniqueTracks
      }
    }
  } catch (err: any) {
    console.error('Spotify Search Error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      message: 'Search failed'
    })
  }
})