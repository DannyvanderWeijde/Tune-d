import prisma from '../../../server/utils/prisma'
import { spotifyClient } from '../../utils/spotifyClient'
import type { ScoreBody, ScoreResponse } from '~/types/api'

export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  // --------------------------------------------------------
  // GET: Fetch latest rating for a specific Spotify Track
  // --------------------------------------------------------
  if (method === 'GET') {
    const query = getQuery(event)
    const spotifyId = String(query.spotifyId)
    const userId = String(query.userId)

    if (!spotifyId) {
      throw createError({ statusCode: 400, message: 'Spotify Track ID required' })
    }

    try {
      // Find the track first, then get its most recent score
      const trackWithScore = await prisma.track.findUnique({
        where: { spotifyId },
        include: {
          scores: {
            where: { userId: userId },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      })

      // If track doesn't exist or has no scores, return nulls
      if (!trackWithScore || trackWithScore.scores.length === 0) {
        return { score: null } as ScoreResponse
      }

      const latest = trackWithScore.scores[0]

      return {
        score: latest.value,
      } as ScoreResponse

    } catch (err) {
      console.error('Database GET Error:', err)
      throw createError({ statusCode: 500, message: 'Failed to fetch score' })
    }
  }

  // --------------------------------------------------------
  // POST: Save a new rating
  // --------------------------------------------------------
  if (method === 'POST') {
    const body = await readBody<ScoreBody>(event)
    const { spotifyId, score, trackMetadata, userId } = body

    // 1. Validation
    if (!spotifyId || score === undefined || !trackMetadata) {
      throw createError({
        statusCode: 400,
        message: 'Missing required fields: spotifyId, score, or trackMetadata.'
      })
    }

    const scoreVal = typeof score === 'string' ? parseInt(score) : score

    // Safety check: ensure score is 0-100 (Integer Strategy)
    if (scoreVal < 0 || scoreVal > 100) {
      throw createError({ statusCode: 400, message: 'Score must be between 0 and 100' })
    }

    try {
      // -------------------------------------------------------
      // 2. FETCH ARTIST IMAGES
      // -------------------------------------------------------
      // The frontend sends IDs, but not images. We fetch them here.
      const artistIds = trackMetadata.artists.map(a => a.id)

      // Map to store images: { 'artist_id': 'https://...' }
      const artistImageMap = new Map<string, string>()

      try {
        // Ensure your spotifyClient has this method.
        // If not, see the "Helper" block below.
        const spotifyArtists = await spotifyClient.getArtists(artistIds)

        spotifyArtists.forEach((artist: any) => {
          if (artist.images && artist.images.length > 0) {
            // Prefer medium image (index 1), fallback to large (index 0)
            const imgUrl = artist.images[1]?.url || artist.images[0]?.url
            artistImageMap.set(artist.id, imgUrl)
          }
        })
      } catch (spotifyErr) {
        console.warn('Failed to fetch artist images, saving without them.', spotifyErr)
        // We continue; don't block saving the score just because images failed.
      }

      // -------------------------------------------------------
      // 3. SAVE TO DB (Atomic Transaction)
      // -------------------------------------------------------
      const newScore = await prisma.score.create({
        data: {
          value: scoreVal,

          // 🚀 HERE IS THE CHANGE: LINK OR CREATE USER
          user: {
            connectOrCreate: {
              where: { spotifyId: userId }, // Check if user exists by Spotify ID
              create: {
                spotifyId: userId,
                name: 'Unknown User', // Placeholder name until they log in properly
                // We can't know their email/image yet, that comes from Auth
              }
            }
          },

          track: {
            connectOrCreate: {
              where: { spotifyId: spotifyId },
              create: {
                spotifyId: spotifyId,
                name: trackMetadata.name,
                albumName: trackMetadata.albumName,
                albumImage: trackMetadata.albumImage,
                albumSpotifyId: trackMetadata.albumId,
                albumType: trackMetadata.albumType,
                artists: {
                  connectOrCreate: trackMetadata.artists.map(artist => ({
                    where: { spotifyId: artist.id },
                    create: {
                      name: artist.name,
                      spotifyId: artist.id,
                      imageUrl: artistImageMap.get(artist.id) || null
                    }
                  }))
                }
              }
            }
          }
        }
      })

      return { success: true, id: newScore.id }

    } catch (err: any) {
      console.error('Database POST Error:', err)
      throw createError({
        statusCode: 500,
        message: 'Failed to save score.'
      })
    }
  }

  throw createError({ statusCode: 405, message: 'Method Not Allowed' })
})