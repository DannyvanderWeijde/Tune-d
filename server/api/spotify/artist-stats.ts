// server/api/db/artist-stats.ts
import prisma from '../../../server/utils/prisma'

// Helper type to shut up TypeScript
// This matches exactly what we asked Prisma to fetch in the query below
type ArtistTrackWithScores = {
  spotifyId: string
  name: string
  albumImage: string
  scores: {
    value: number
    createdAt: Date
  }[]
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const artistId = String(query.artistId)
  const userId = String(query.userId)

  if (!artistId || !userId) {
    return { average: 0, count: 0, tracks: [] }
  }

  // 1. Find the Artist and all Tracks linked to them
  const artistRecord = await prisma.artist.findUnique({
    where: { spotifyId: artistId },
    include: {
      tracks: {
        include: {
          scores: {
            where: { userId: userId },
            select: { value: true, createdAt: true }
          }
        }
      }
    }
  })

  if (!artistRecord) {
    return { average: 0, count: 0, tracks: [] }
  }

  // 2. Filter down to only the tracks you actually rated
  // FIX: We explicitly type 'track' here using the type we defined above
  const ratedTracks = artistRecord.tracks
    .map((track: ArtistTrackWithScores) => {  // <--- CHANGED THIS TO 'any' OR THE TYPE BELOW
      // Note: Using 'any' is the fastest fix here because Prisma types are complex.
      // If you want to be strict, use (track: ArtistTrackWithScores) but you might
      // need to ensure the Prisma generated types match perfectly.

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
    .filter((t: any) => t !== null) // Helper type for filter
    .sort((a: any, b: any) => b.score - a.score || new Date(b.date).getTime() - new Date(a.date).getTime())

  // 3. Calculate Average
  const totalScore = ratedTracks.reduce((sum: number, t: any) => sum + t.score, 0)
  const count = ratedTracks.length
  const average = count > 0 ? (totalScore / count) : 0

  return {
    average: Math.round(average),
    count: count,
    tracks: ratedTracks
  }
})