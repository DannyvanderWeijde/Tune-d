/**
 * GET /api/spotify/artist
 * Retrieves detailed information about a specific artist from Spotify.
 *
 * @param {string} id - The Spotify Artist ID passed as a query parameter.
 * @returns {Promise<Object>} The artist details object.
 * @throws {400} If the 'id' parameter is missing.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const id = String(query.id)

  if (!query.id || id === 'undefined') {
    throw createError({
      statusCode: 400,
      message: 'Artist ID is required'
    })
  }

  try {
    return await spotifyClient.getArtist(id)
  } catch (err: any) {
    console.error('Spotify API Error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      message: 'Failed to fetch artist details'
    })
  }
})