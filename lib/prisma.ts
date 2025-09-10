import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Nettoyer l'URL de la base de données des espaces et retours à la ligne
const cleanDatabaseUrl = (url: string | undefined): string | undefined => {
  if (!url) return url
  // Supprimer tous les espaces, retours à la ligne, tabulations et caractères invisibles
  return url.replace(/[\s\n\r\t]+/g, '').trim()
}

// Configuration Prisma avec URL nettoyée
const prismaClientSingleton = () => {
  const cleanedUrl = cleanDatabaseUrl(process.env.DATABASE_URL)
  
  if (!cleanedUrl) {
    throw new Error('DATABASE_URL is not defined')
  }
  
  // Ajouter pgbouncer=true si pas déjà présent
  let finalUrl = cleanedUrl
  if (!finalUrl.includes('pgbouncer=true')) {
    finalUrl = finalUrl.includes('?') 
      ? `${finalUrl}&pgbouncer=true&connection_limit=1`
      : `${finalUrl}?pgbouncer=true&connection_limit=1`
  }
  
  return new PrismaClient({
    datasources: {
      db: {
        url: finalUrl
      }
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma