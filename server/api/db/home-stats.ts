import prisma from '../../../server/utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const userId = String(query.userId)

  if (!userId) return { artists: [], albums: [], tracks: [] }

  // 1. Fetch Global Stats (For Variable 'C')
  const globalAgg = await prisma.score.aggregate({
    where: { userId },
    _avg: { value: true },
    _count: { value: true }
  })

  let C = 70
  if (globalAgg._count.value >= 10 && globalAgg._avg.value) {
    C = globalAgg._avg.value
  }
  const m = 5

  // 2. Fetch ALL scores
  const allScores = await prisma.score.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      track: {
        include: { artists: true }
      }
    }
  })

  // 3. DEDUPLICATE: Keep only latest score per track
  const trackMap = new Map()

  for (const score of allScores) {
    if (!trackMap.has(score.trackId)) {
      trackMap.set(score.trackId, {
        id: score.track.spotifyId,
        name: score.track.name,
        image: score.track.albumImage,
        score: score.value,
        artists: score.track.artists,

        scoreId: score.id,

        albumName: score.track.albumName,
        // 🆕 READ NEW FIELDS FROM DB
        albumId: score.track.albumSpotifyId,
        albumType: score.track.albumType,

        // Fallback key for grouping
        albumKey: score.track.albumSpotifyId || `${score.track.albumName}:${score.track.albumImage}`
      })
    }
  }
  const uniqueTracks = Array.from(trackMap.values())

  // 4. AGGREGATE & CALCULATE
  const calcWeighted = (totalScore: number, count: number) => {
    const simpleAvg = count > 0 ? (totalScore / count) : 0
    return ( (count / (count + m)) * simpleAvg ) + ( (m / (count + m)) * C )
  }

  // A. Artists
  const artistStats = new Map()
  uniqueTracks.forEach(track => {
    track.artists.forEach((artist: any) => {
      if (!artistStats.has(artist.spotifyId)) {
        artistStats.set(artist.spotifyId, {
          id: artist.spotifyId,
          name: artist.name,
          image: artist.imageUrl,
          totalScore: 0,
          count: 0
        })
      }
      const stats = artistStats.get(artist.spotifyId)
      stats.totalScore += track.score
      stats.count += 1
    })
  })

  // B. Albums (Strict Filter)
  const albumStats = new Map()

  uniqueTracks.forEach(track => {
    // 🚫 FILTER 1: NO SINGLES
    if (track.albumType === 'single') return

    // 🚫 FILTER 2: NO BROKEN LINKS
    // If we don't have the ID (old data), don't show it in the top list
    if (!track.albumId) return

    if (!albumStats.has(track.albumKey)) {
      albumStats.set(track.albumKey, {
        id: track.albumId, // <--- This enables the NuxtLink
        name: track.albumName,
        image: track.image,
        totalScore: 0,
        count: 0
      })
    }
    const stats = albumStats.get(track.albumKey)
    stats.totalScore += track.score
    stats.count += 1
  })

  // 5. SORT & FORMAT
  const formatList = (list: any[], limit: number) => {
    return list
      .map(item => ({
        ...item,
        weightedAvg: calcWeighted(item.totalScore, item.count),
        rawAvg: item.count > 0 ? (item.totalScore / item.count) : 0
      }))
      .sort((a, b) => b.weightedAvg - a.weightedAvg)
      .slice(0, limit)
      .map(item => ({
        ...item,
        average: Math.round(item.weightedAvg)
      }))
  }

  return {
    artists: formatList(Array.from(artistStats.values()), 5),
    albums: formatList(Array.from(albumStats.values()), 5),
    tracks: uniqueTracks
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
  }
})