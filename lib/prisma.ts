/**
 * Compatibility shim: keep `import { prisma } from '@/lib/prisma'` working
 * while the database is now Firestore (via the firestore-adapter).
 *
 * The adapter implements the subset of the Prisma client API used in this codebase.
 */
export { prisma } from '@/lib/firestore-adapter'
export { default } from '@/lib/firestore-adapter'
