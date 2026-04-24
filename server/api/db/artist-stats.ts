// server/api/db/artist-stats.ts
import prisma from '../../../server/utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const artistId = String(query.artistId)
  const userId = String(query.userId)

  if (!artistId || !userId) {
    return { average: 0, count: 0, tracks: [] }
  }

  const [artistRecord, globalAgg] = await Promise.all([
    // 1. Fetch Artist & Tracks
    prisma.artist.findUnique({
      where: { spotifyId: artistId },
      include: {
        tracks: {
          include: {
            scores: {
              where: { userId: userId },
              // -------------------------------------------------
              // FIX: Only fetch the NEWEST score for calculation
              // -------------------------------------------------
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: { value: true, createdAt: true }
            }
          }
        }
      }
    }),
    // 2. Fetch Global Stats for "C" (Bayesian Constant)
    prisma.score.aggregate({
      where: { userId: userId },
      _avg: { value: true },
      _count: { value: true }
    })
  ])

  if (!artistRecord) {
    return { average: 0, count: 0, tracks: [] }
  }

  // 3. Process Tracks
  const ratedTracks = artistRecord.tracks
    .map((track: any) => {
      // Now this is guaranteed to be the latest score because of 'take: 1' above
      const userScore = track.scores[0]
      if (!userScore) return null

      return {
        id: track.spotifyId,
        name: track.name,
        image: track.albumImage,
        score: userScore.value,
        date: userScore.createdAt
      }
    })
    .filter((t: any) => t !== null)
    .sort((a: any, b: any) => b.score - a.score)

  // 4. Calculate Stats
  const count = ratedTracks.length
  const simpleTotal = ratedTracks.reduce((sum: number, t: any) => sum + t.score, 0)
  const simpleAverage = count > 0 ? (simpleTotal / count) : 0

  // 5. Bayesian Logic (Weighted Average)
  const totalUserRatings = globalAgg._count.value
  let C = 70

  // Only use real global average if we have enough data (e.g. 10 ratings)
  if (totalUserRatings >= 10 && globalAgg._avg.value) {
    C = globalAgg._avg.value
  }

  const m = 5
  const weightedScore = ( (count / (count + m)) * simpleAverage ) +
    ( (m / (count + m)) * C )

  return {
    average: Math.round(weightedScore),
    rawAverage: Math.round(simpleAverage),
    count: count,
    tracks: ratedTracks
  }
})