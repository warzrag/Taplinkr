import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PLAN_LIMITS } from '@/lib/permissions'

/**
 * Audit des comptes : sont-ils reels, et pourquoi ne paient-ils pas.
 *
 * La page d administration donne deja le plan et le nombre de liens. Ce qui
 * manquait, c est l usage reel : un compte sans lien n a jamais commence, un
 * compte avec des liens mais sans clic n a jamais diffuse, et un compte qui a
 * atteint la limite gratuite est le seul a avoir eu une raison de payer.
 *
 * Lecture seule. Reserve aux administrateurs.
 */

const FREE_MAX_PAGES = PLAN_LIMITS.free.maxPages

// Domaines d adresses jetables les plus courants : un signe parmi d autres,
// jamais une preuve a lui seul.
const DISPOSABLE = new Set([
  'mailinator.com', 'yopmail.com', 'guerrillamail.com', 'tempmail.com',
  '10minutemail.com', 'trashmail.com', 'sharklasers.com', 'getnada.com',
  'temp-mail.org', 'throwawaymail.com', 'maildrop.cc', 'fakeinbox.com',
])

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Non autorise' }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        emailVerified: true,
        createdAt: true,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const now = Date.now()
    const day = 24 * 60 * 60 * 1000

    const rows = await Promise.all(users.map(async user => {
      // Le comptage est delegue a la base : aucun document transfere.
      const [linkCount, clickCount, lastClick] = await Promise.all([
        prisma.link.count({ where: { userId: user.id } }),
        prisma.click.count({ where: { userId: user.id } }),
        prisma.click.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { createdAt: true },
        }),
      ])

      const domain = (user.email || '').split('@')[1]?.toLowerCase() || ''
      const createdAt = new Date(user.createdAt)
      const lastClickAt = lastClick[0]?.createdAt ? new Date(lastClick[0].createdAt) : null

      // Trois etats, dans l ordre du parcours : jamais commence, commence mais
      // jamais diffuse, reellement utilise.
      const etat = linkCount === 0
        ? 'jamais-commence'
        : clickCount === 0
          ? 'sans-audience'
          : 'actif'

      return {
        email: user.email,
        name: user.name || null,
        plan: user.plan || 'free',
        emailVerifie: Boolean(user.emailVerified),
        domaineJetable: DISPOSABLE.has(domain),
        domaine: domain,
        inscritLe: createdAt.toISOString().slice(0, 10),
        joursDepuisInscription: Math.floor((now - createdAt.getTime()) / day),
        liens: linkCount,
        clics: clickCount,
        dernierClic: lastClickAt ? lastClickAt.toISOString().slice(0, 10) : null,
        etat,
        // Seul cas ou le compte s est heurte au mur payant.
        aAtteintLaLimiteGratuite: (user.plan || 'free') === 'free' && linkCount >= FREE_MAX_PAGES,
      }
    }))

    const count = (predicate: (row: typeof rows[number]) => boolean) => rows.filter(predicate).length

    return NextResponse.json({
      limiteGratuite: `${FREE_MAX_PAGES} page`,
      resume: {
        comptes: rows.length,
        payants: count(r => r.plan !== 'free'),
        jamaisCommence: count(r => r.etat === 'jamais-commence'),
        sansAudience: count(r => r.etat === 'sans-audience'),
        actifs: count(r => r.etat === 'actif'),
        emailNonVerifie: count(r => !r.emailVerifie),
        domaineJetable: count(r => r.domaineJetable),
        // Ceux qui ont eu une vraie raison de payer, et ne l ont pas fait.
        bloquesParLaLimite: count(r => r.aAtteintLaLimiteGratuite),
        bloquesEtAvecAudience: count(r => r.aAtteintLaLimiteGratuite && r.etat === 'actif'),
      },
      comptes: rows,
    }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    console.error('[admin/audit]', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
