/**
 * GET /api/spotify/track
 * Retrieves detailed information about a specific track from Spotify.
 *
 * @param {string} id - The Spotify Track ID passed as a query parameter.
 * @returns {Promise<Object>} The track details object including album and artist info.
 * @throws {400} If the 'id' parameter is missing.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const id = String(query.id)

  if (!query.id || id === 'undefined') {
    throw createError({
      statusCode: 400,
      message: 'Track ID is required'
    })
  }

  try {
    return await spotifyClient.getTrack(id)
  } catch (err: any) {
    console.error('Spotify API Error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      message: 'Failed to fetch track details'
    })
  }
})