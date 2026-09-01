/**
 * Point d acces unique a la base.
 *
 * L application a d abord tourne sur PostgreSQL, puis sur Firestore derriere un
 * adaptateur qui imite l API de Prisma. Le nom `prisma` a ete conserve partout
 * pour ne pas reecrire le code appelant.
 *
 * Le choix se fait ici, par la variable DATA_BACKEND :
 *   - absente ou toute autre valeur -> Firestore, comportement actuel
 *   - "postgres"                    -> vrai client Prisma sur PostgreSQL
 *
 * Le chargement est volontairement paresseux : chaque module refuse de
 * s initialiser sans ses propres identifiants. L adaptateur Firestore echoue
 * des l import si FIREBASE_SERVICE_ACCOUNT_JSON manque, et le client Prisma
 * exige DATABASE_URL. N en charger qu un seul permet de faire tourner une copie
 * sur PostgreSQL sans avoir a fournir les cles de l autre.
 */

const usePostgres = process.env.DATA_BACKEND === 'postgres'

function createClient(): any {
  if (usePostgres) {
    // require et non import : un import serait resolu au chargement du module et
    // initialiserait les deux bases, ce que l on cherche precisement a eviter.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaClient } = require('@prisma/client')
    // En developpement, Next recharge les modules a chaud : sans ce cache
    // global, chaque rechargement ouvrirait un nouveau pool de connexions.
    const store = globalThis as any
    if (!store.__prismaPg) store.__prismaPg = new PrismaClient()
    return store.__prismaPg
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('@/lib/firestore-adapter').prisma
}

export const prisma = createClient()
export default prisma
