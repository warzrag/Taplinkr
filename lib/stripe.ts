import Stripe from 'stripe'

// Mode test Stripe si pas de clé configurée
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy'

export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-10-28.acacia',
    })
  : null as any

export const STRIPE_PLANS = {
  FREE: {
    name: 'Gratuit',
    price: 0,
    priceId: null,
    features: [
      '5 liens maximum',
      '1,000 clics par mois',
      'Analytics de base',
      'Pages personnalisées basiques'
    ],
    limits: {
      links: 5,
      clicks: 1000
    }
  },
  PRO: {
    name: 'Pro',
    price: 9.99,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      '100 liens',
      '10,000 clics par mois',
      'Analytics avancées',
      'Pages ultra-personnalisées',
      'Domaines personnalisés',
      'Support prioritaire'
    ],
    limits: {
      links: 100,
      clicks: 10000
    }
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 29.99,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    features: [
      'Liens illimités',
      'Clics illimités',
      'Analytics en temps réel',
      'API complète',
      'Intégrations avancées',
      'Support dédié',
      'SLA garanti'
    ],
    limits: {
      links: Infinity,
      clicks: Infinity
    }
  }
} as const

export type PlanType = keyof typeof STRIPE_PLANS