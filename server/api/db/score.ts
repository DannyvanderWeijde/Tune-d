// server/api/db/score.ts
import prisma from '../../utils/prisma'
import type { ScoreBody, RatingResponse } from '~/types/api'

export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  // --------------------------------------------------------
  // GET: Fetch latest rating for a user/track combo
  // --------------------------------------------------------
  if (method === 'GET') {
    const query = getQuery(event)

    const trackId = String(query.trackId)
    const userId = parseInt(query.userId as string)

    if (!query.trackId || isNaN(userId)) {
      return { score: null, rankingTime: 0 } as RatingResponse
    }

    try {
      const latestRating = await prisma.trackScore.findFirst({
        where: { userId, trackId },
        orderBy: { rankingTime: 'desc' }
      })

      return {
        score: latestRating?.score ?? null,
        rankingTime: latestRating?.rankingTime ?? 0
      } as RatingResponse

    } catch (err) {
      console.error('Database GET Error:', err)
      return { score: null, rankingTime: 0 } as RatingResponse
    }
  }

  // --------------------------------------------------------
  // POST: Save a new rating
  // --------------------------------------------------------
  if (method === 'POST') {
    const body = await readBody<ScoreBody>(event)

    if (!body.userId || !body.trackId || body.score === undefined) {
      throw createError({
        statusCode: 400,
        message: 'Missing required fields: userId, trackId, or score.'
      })
    }

    const userId = Number(body.userId)
    const trackId = String(body.trackId)
    const scoreVal = parseFloat(String(body.score))

    if (scoreVal < 1 || scoreVal > 10) {
      throw createError({ statusCode: 400, message: 'Score must be between 1 and 10' })
    }

    try {
      const count = await prisma.trackScore.count({
        where: { userId, trackId }
      })

      return await prisma.trackScore.create({
        data: {
          userId,
          trackId,
          score: scoreVal,
          rankingTime: count + 1
        }
      })
    } catch (err: any) {
      console.error('Database POST Error:', err)
      throw createError({
        statusCode: 500,
        message: 'Failed to save score.'
      })
    }
  }

  // Handle unsupported methods
  throw createError({ statusCode: 405, message: 'Method Not Allowed' })
})