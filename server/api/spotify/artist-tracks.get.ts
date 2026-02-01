import { spotifyClient } from '../../utils/spotifyClient'

/**
 * GET /api/spotify/artist-tracks
 * Fetches all tracks associated with an artist, filtering out duplicates and
 * tracks where the artist is not explicitly credited.
 * * NOTE: This endpoint performs multiple heavy API calls to build a complete discography.
 *
 * @param {string} id - The Spotify Artist ID.
 * @returns {Promise<Array>} A sorted, deduplicated list of tracks with album metadata.
 * @throws {400} If the 'id' parameter is missing.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const artistId = String(query.id)

  if (!query.id || artistId === 'undefined') {
    throw createError({ statusCode: 400, message: 'Artist ID is required' })
  }

  try {
    // =====================================================================
    // STEP 1: Fetch all Album/Single IDs (Pagination loop)
    // =====================================================================
    const allAlbumIds: string[] = []
    let offset = 0
    let keepFetching = true

    while (keepFetching) {
      // Fetch only 'album' and 'single' types to avoid "Various Artists" noise
      const response = await spotifyClient.sdk.artists.albums(
        artistId,
        'album,single',
        'US',
        50,
        offset
      )

      const ids = response.items.map((album) => album.id)
      allAlbumIds.push(...ids)

      if (response.next) {
        offset += 50
      } else {
        keepFetching = false
      }
    }

    if (allAlbumIds.length === 0) return []

    // =====================================================================
    // STEP 2: Fetch Full Album Details (in chunks of 20)
    // =====================================================================
    const fullAlbums = []
    const chunkSize = 20

    for (let i = 0; i < allAlbumIds.length; i += chunkSize) {
      const chunk = allAlbumIds.slice(i, i + chunkSize)
      const albumsBatch = await spotifyClient.sdk.albums.get(chunk)
      fullAlbums.push(...albumsBatch)
    }

    // =====================================================================
    // STEP 3: Extract & Strict Filter
    // =====================================================================
    const allTracks = []

    for (const album of fullAlbums) {
      for (const track of album.tracks.items) {
        // Ensure the artist is actually credited on this specific track.
        // This handles "Various Artists" albums or compilations correctly.
        const isArtistOnTrack = track.artists.some((a) => a.id === artistId)

        if (isArtistOnTrack) {
          allTracks.push({
            ...track,
            // Inject album metadata needed for the UI
            album: {
              id: album.id,
              name: album.name,
              images: album.images,
              release_date: album.release_date,
              type: album.type
            }
          })
        }
      }
    }

    // =====================================================================
    // STEP 4: Sort & Deduplicate
    // =====================================================================
    // Sort Newest -> Oldest first so we keep the latest version if duplicates exist
    allTracks.sort((a, b) => b.album.release_date.localeCompare(a.album.release_date))

    const uniqueTracks = []
    const seenNames = new Set<string>()

    for (const track of allTracks) {
      // Normalize name to catch "Song Title" vs "Song Title - Remastered"
      // (Simple deduplication by exact name match for now)
      const key = track.name.toLowerCase().trim()

      if (!seenNames.has(key)) {
        seenNames.add(key)
        uniqueTracks.push(track)
      }
    }

    return uniqueTracks
  } catch (err: any) {
    console.error('Error fetching artist tracks:', err)
    throw createError({
      statusCode: 500,
      message: 'Failed to generate discography'
    })
  }
})