/**
 * GET /api/spotify/album
 * * Fetches detailed information about a specific album from Spotify.
 * * @param {string} id - The Spotify Album ID passed as a query parameter.
 * @returns {Promise<Object>} The album details object from Spotify.
 * @throws {400} If the 'id' parameter is missing.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const id = String(query.id)

  if (!query.id || id === 'undefined') {
    throw createError({
      statusCode: 400,
      message: 'Album ID is required'
    })
  }

  try {
    return await spotifyClient.getAlbum(id)
  } catch (err: any) {
    console.error('Spotify API Error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      message: 'Failed to fetch album details'
    })
  }
})