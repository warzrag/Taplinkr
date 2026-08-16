import crypto from 'crypto'

import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

/**
 * Consultation des clics par jeton VenusBot.
 *
 * VenusBot depose un jeton anonyme dans l'adresse du lien (?vb=). Cet endpoint
 * repond, pour une liste de jetons, combien de fois chacun a ete ouvert et
 * quand. C'est ce qui permet au tableau de bord VenusBot de distinguer le fan
 * parti cliquer du fan parti tout court.
 *
 * Appele uniquement de serveur a serveur, par le backend VenusBot : la cle ne
 * doit jamais se retrouver dans un navigateur.
 *
 * Aucune donnee personnelle ne transite : ni pseudo, ni adresse IP, ni
 * identifiant de fan. Seulement des jetons opaques et des compteurs.
 */

const MAX_TOKENS = 500
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{1,32}$/

const empreinte = (value: string) => crypto.createHash('sha256').update(value).digest()

const cleValide = (fournie: string | null): boolean => {
  const attendue = process.env.VENUSBOT_API_KEY
  if (!attendue || !fournie) return false
  // Comparaison a duree constante : sans elle, le temps de reponse laisse
  // deviner la cle caractere par caractere.
  return crypto.timingSafeEqual(empreinte(fournie), empreinte(attendue))
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.VENUSBOT_API_KEY) {
      // Mieux vaut refuser que d'ouvrir l'endpoint parce que la cle manque.
      return NextResponse.json({ ok: false, error: 'Endpoint non configure' }, { status: 503 })
    }
    if (!cleValide(request.headers.get('x-venusbot-key'))) {
      return NextResponse.json({ ok: false, error: 'Cle invalide' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const bruts = Array.isArray(body?.tokens) ? body.tokens : null
    if (!bruts) {
      return NextResponse.json({ ok: false, error: 'Liste de jetons requise' }, { status: 400 })
    }

    const tokens = Array.from(
      new Set(
        bruts
          .filter((t: unknown): t is string => typeof t === 'string')
          .map((t: string) => t.trim())
          .filter((t: string) => TOKEN_PATTERN.test(t))
      )
    ).slice(0, MAX_TOKENS)

    if (tokens.length === 0) {
      return NextResponse.json({ ok: true, clicks: {}, tokensDemandes: 0 })
    }

    const lignes = await prisma.click.groupBy({
      by: ['fanToken'],
      where: { fanToken: { in: tokens } },
      _count: { _all: true },
      _min: { createdAt: true },
      _max: { createdAt: true },
    })

    const clicks: Record<string, { count: number; firstAt: string; lastAt: string }> = {}
    for (const ligne of lignes) {
      if (!ligne.fanToken) continue
      clicks[ligne.fanToken] = {
        count: ligne._count._all,
        firstAt: ligne._min.createdAt?.toISOString() ?? '',
        lastAt: ligne._max.createdAt?.toISOString() ?? '',
      }
    }

    return NextResponse.json({
      ok: true,
      tokensDemandes: tokens.length,
      tokensAvecClic: Object.keys(clicks).length,
      clicks,
    })
  } catch (error) {
    console.error('[venusbot/clicks]', error)
    return NextResponse.json({ ok: false, error: 'Erreur interne' }, { status: 500 })
  }
}
