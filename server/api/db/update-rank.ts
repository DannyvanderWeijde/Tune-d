// server/api/db/update-rank.ts
import prisma from '../../../server/utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { scoreId, rank } = body

  if (!scoreId) return { error: 'Missing ID' }

  await prisma.score.update({
    where: { id: scoreId },
    data: {
      // Allow clearing the rank by sending null or 0
      rankInScore: (rank && rank > 0) ? parseInt(rank) : null
    }
  })

  return { success: true }
})