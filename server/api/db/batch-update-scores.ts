import prisma from '../../../server/utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { updates } = body

  if (!updates || !Array.isArray(updates) || updates.length === 0) {
    return { success: true, message: 'No changes to save' }
  }

  // Use a Transaction to save all or nothing
  // This is much faster than running 50 separate update calls
  await prisma.$transaction(
    updates.map((u: any) =>
      prisma.score.update({
        where: { id: u.scoreId },
        data: {
          value: u.score,
          rankInScore: u.rankInScore
        }
      })
    )
  )

  return { success: true }
})