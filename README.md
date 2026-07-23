# TapLinkr

TapLinkr est une application Next.js permettant de créer des pages de liens personnalisées, de suivre leur audience et de gérer des équipes, des protections et des abonnements.

## Environnement technique

- Next.js 15 et React 18
- TypeScript et Tailwind CSS
- Firebase Admin / Firestore
- NextAuth
- Stripe
- Resend
- Vercel Blob

## Installation locale

Prérequis : Node.js 20 ou supérieur et un projet Firebase.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Renseignez au minimum `APP_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET` et `FIREBASE_SERVICE_ACCOUNT_JSON` dans `.env.local`. Les fonctionnalités d’e-mail, de paiement et d’upload nécessitent également les variables Resend, Stripe et Vercel Blob décrites dans [.env.example](./.env.example).

## Contrôles qualité

```bash
npm run check
npm run build
npm audit --omit=dev
```

`npm run check` exécute ESLint, TypeScript et les tests automatisés.

## Déploiement

Le projet est prévu pour Vercel. Copiez les variables de [.env.production.example](./.env.production.example) dans les variables d’environnement du projet, sans jamais versionner leurs vraies valeurs.

Après modification d’un secret exposé, renouvelez-le dans le service concerné avant de redéployer. Supprimer un secret d’un fichier ne le retire pas de l’historique Git.
