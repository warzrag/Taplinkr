import { prisma } from './prisma'

let schemaPromise: Promise<void> | null = null

export function ensureFolderAttributionSchema() {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      await prisma.$executeRawUnsafe(
        'ALTER TABLE "clicks" ADD COLUMN IF NOT EXISTS "folderIdAtClick" TEXT',
      )
      await prisma.$executeRawUnsafe(
        'CREATE INDEX IF NOT EXISTS "clicks_folderIdAtClick_createdAt_idx" ON "clicks" ("folderIdAtClick", "createdAt")',
      )
    })().catch(error => {
      schemaPromise = null
      throw error
    })
  }

  return schemaPromise
}
