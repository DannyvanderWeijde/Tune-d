// server/api/db/top-100.ts
import prisma from '../../../server/utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const userId = String(query.userId)

  // 1. Fetch UNIQUE scores (Latest version of each track)
  // We remove 'take' so we don't miss old favorites.
  const uniqueScores = await prisma.score.findMany({
    where: {
      userId,
      // Ensure we only look at actual rated songs (ignore just favorites)
      value: { not: null }
    },

    // 🚨 KEY FIX: Sort by Date Descending first
    orderBy: { createdAt: 'desc' },

    // 🚨 KEY FIX: Deduplicate directly in the database
    // This keeps the FIRST record found for each trackId (which is the Newest one)
    distinct: ['trackId'],

    include: {
      track: { include: { artists: true } }
    }
  })

  // 2. Format List
  // (We no longer need the manual Map loop because 'distinct' did the work)
  let finalList = uniqueScores.map(score => ({
    scoreId: score.id,
    score: score.value,
    rankInScore: score.rankInScore,
    createdAt: score.createdAt,
    trackId: score.track.spotifyId,
    name: score.track.name,
    image: score.track.albumImage,
    artist: score.track.artists[0]?.name || 'Unknown',
  }))

  // 3. THE FINAL SORT (JavaScript Logic)
  finalList.sort((a, b) => {
    // Priority 1: Score (Highest First)
    // Note: TypeScript knows 'score' is number because we filtered nulls in the DB query
    if (b.score !== a.score) {
      return (b.score || 0) - (a.score || 0)
    }

    // Priority 2: Manual Rank (Lowest Number First, NULLS LAST)
    const rankA = (a.rankInScore && a.rankInScore > 0) ? a.rankInScore : Infinity
    const rankB = (b.rankInScore && b.rankInScore > 0) ? b.rankInScore : Infinity

    if (rankA !== rankB) {
      return rankA - rankB
    }

    // Priority 3: Date (Newest First)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  // 4. Slice to top 100
  return finalList.slice(0, 100)
})