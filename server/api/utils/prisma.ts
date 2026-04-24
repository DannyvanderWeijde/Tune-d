import { createRequire } from 'module'
import { resolve } from 'path'

const require = createRequire(import.meta.url)
const { PrismaClient } = require('@prisma/client')
const Database = require('better-sqlite3')
const AdapterLib = require('@prisma/adapter-better-sqlite3')

const PrismaAdapter = AdapterLib.PrismaBetterSqlite3 || AdapterLib.default?.PrismaBetterSqlite3

if (!PrismaAdapter) {
  throw new Error('Could not find PrismaAdapter constructor')
}

const globalForPrisma = globalThis as unknown as { prisma: any }

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

function createPrismaClient() {
  let dbUrl = process.env.DATABASE_URL || 'file:./dev.db'

  // better-sqlite3 wants "dev.db", NOT "file:dev.db"
  if (dbUrl.startsWith('file:')) {
    dbUrl = dbUrl.slice(5)
  }

  const dbPath = resolve(process.cwd(), dbUrl)
  const connection = new Database(dbPath)
  const adapter = new PrismaAdapter(connection)

  return new PrismaClient({ adapter })
}

export default prisma