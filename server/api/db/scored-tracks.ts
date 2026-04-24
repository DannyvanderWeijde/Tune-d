// server/api/db/scored-tracks.ts
import prisma from '../../../server/utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const userId = String(query.userId)
  const page = Number(query.page) || 1
  const limit = 50

  if (!userId) return { items: [], total: 0 }

  // 1. Fetch ALL scores for this user (Sorted by Date Desc initially)
  // We fetch all because complex sorting (Score -> Rank -> Date) with Nulls
  // is very hard to do consistently in SQLite/Prisma pagination.
  const allScores = await prisma.score.findMany({
    where: { userId, value: { gte: 0 } },
    orderBy: { createdAt: 'desc' },
    include: {
      track: { include: { artists: true } }
    }
  })

  // 2. DEDUPLICATE (Keep only the latest score per track)
  const uniqueMap = new Map()
  for (const score of allScores) {
    if (!uniqueMap.has(score.trackId)) {
      uniqueMap.set(score.trackId, score)
    }
  }
  const uniqueScores = Array.from(uniqueMap.values())

  // 3. MASTER SORT (The "Perfect" Sort)
  uniqueScores.sort((a, b) => {
    // Priority A: Score (Highest First)
    if (b.value !== a.value) {
      return b.value - a.value
    }

    // Priority B: Rank (1, 2, 3...) vs Null (Bottom)
    // We convert Null to Infinity so it goes to the bottom
    const rankA = (a.rankInScore && a.rankInScore > 0) ? a.rankInScore : Infinity
    const rankB = (b.rankInScore && b.rankInScore > 0) ? b.rankInScore : Infinity

    if (rankA !== rankB) {
      return rankA - rankB
    }

    // Priority C: Date (Newest First)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  // 4. PAGINATE (Slice the array)
  const startIndex = (page - 1) * limit
  const slicedScores = uniqueScores.slice(startIndex, startIndex + limit)

  // 5. FORMAT
  const items = slicedScores.map(score => ({
    scoreId: score.id,
    score: score.value,
    rankInScore: score.rankInScore,
    date: score.createdAt,
    trackId: score.track.spotifyId,
    name: score.track.name,
    image: score.track.albumImage,
    artist: score.track.artists[0]?.name || 'Unknown',
  }))

  return {
    items,
    total: uniqueScores.length,
    hasMore: startIndex + limit < uniqueScores.length
  }
})