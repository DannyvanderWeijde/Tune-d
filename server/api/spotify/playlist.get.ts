/**
 * GET /api/spotify/playlist
 * Retrieves full details for a specific Spotify playlist, including its tracks.
 *
 * @param {string} id - The Spotify Playlist ID passed as a query parameter.
 * @returns {Promise<Object>} The playlist object containing metadata and track items.
 * @throws {400} If the 'id' parameter is missing.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const id = String(query.id)

  if (!query.id || id === 'undefined') {
    throw createError({
      statusCode: 400,
      message: 'Playlist ID is required'
    })
  }

  try {
    return await spotifyClient.getPlaylist(id)
  } catch (err: any) {
    console.error('Spotify API Error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      message: 'Failed to fetch playlist details'
    })
  }
})