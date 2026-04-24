// server/api/db/update-score-value.ts
import prisma from '../../../server/utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { scoreId, value } = body

  if (!scoreId || value === undefined) {
    return { error: 'Missing ID or Value' }
  }

  // Update the score value in the database
  const updated = await prisma.score.update({
    where: { id: scoreId },
    data: {
      value: parseInt(value)
    }
  })

  return { success: true, newValue: updated.value }
})