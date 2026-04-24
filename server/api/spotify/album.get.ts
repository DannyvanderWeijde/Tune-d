// server/api/spotify/album.ts
import { spotifyClient } from '../../../server/utils/spotifyClient'
import prisma from '../../../server/utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const albumId = String(query.id)
  const userId = 'user-1' // Replace with dynamic session user

  // 1. Fetch Album (Standard Call)
  const album = await spotifyClient.getAlbum(albumId)

  const mainArtistId = album.artists[0]?.id
  const trackIds = album.tracks.items.map((t: any) => t.id)

  // 2. PARALLEL FETCH:
  //    a. Artist Images
  //    b. User Scores for this album
  //    c. GLOBAL User Stats (Needed for "C" in the formula)
  const [artistDetails, myScores, globalStats] = await Promise.all([
    mainArtistId ? spotifyClient.sdk.artists.get(mainArtistId) : null,

    prisma.score.findMany({
      where: {
        userId: userId,
        track: { spotifyId: { in: trackIds } },

        // Ensure we ignore 'null' values if you have favorites
        value: { not: null }
      },

      // 🚨 FIX 1: Sort by newest first
      orderBy: { createdAt: 'desc' },

      // 🚨 FIX 2: Only return one row per track (the newest one)
      distinct: ['trackId'],

      select: {
        value: true,
        track: { select: { spotifyId: true } }
      }
    }),

    // 🆕 Fetch Global Average for the Bayesian Formula
    prisma.score.aggregate({
      where: { userId: userId },
      _avg: { value: true },
      _count: { value: true }
    })
  ])

  // 3. Inject Artist Image
  if (artistDetails && artistDetails.images) {
    album.artists[0].images = artistDetails.images
  }

  // 4. Inject Scores into Tracks
  const scoreMap = new Map(myScores.map(s => [s.track.spotifyId, s.value]))
  const tracksWithScores = album.tracks.items.map((track: any) => ({
      ...track,
      myScore: scoreMap.get(track.id) ?? null
    }))
  ;(album.tracks.items as any) = tracksWithScores

  // ---------------------------------------------------------
  // 5. CALCULATE WEIGHTED ALBUM SCORE (Bayesian Average)
  // ---------------------------------------------------------

  const count = myScores.length
  let weightedScore = 0

  if (count > 0) {
    // A. Simple Average of the tracks you rated
    const simpleTotal = myScores.reduce((sum, s) => sum + s.value, 0)
    const simpleAverage = simpleTotal / count

    // B. Determine C (Global Average)
    let C = 70 // Default if not enough data
    const totalUserRatings = globalStats._count.value
    if (totalUserRatings >= 10 && globalStats._avg.value) {
      C = globalStats._avg.value
    }

    // C. Apply Formula: (n / n+m) * Avg + (m / n+m) * C
    const m = 5 // Dampening factor
    weightedScore = ( (count / (count + m)) * simpleAverage ) +
      ( (m / (count + m)) * C )
  }

  // Attach the calculated stats to the response
  return {
    ...album,
    albumStats: {
      score: Math.round(weightedScore), // e.g. 78
      count: count,
      total: album.total_tracks
    }
  }
})