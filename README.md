 # TapLinkr 🔗

La plateforme mobile-first pour créer des pages bio interactives. Un simple tap suffit pour accéder à tout votre univers digital.

![TapLinkr](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Next.js](https://img.shields.io/badge/Next.js-15.3-black)

## 🚀 Fonctionnalités

### 🔗 Gestion de liens
- Création de liens courts personnalisés
- Liens directs ou protégés (anti-ban)
- Pages de destination personnalisables (style Linktree)
- QR codes automatiques

### 📊 Analytics avancées
- Suivi des clics en temps réel
- Graphiques et statistiques détaillées
- Données géographiques et démographiques
- Export des données

### 💳 Système de monetisation
- 3 plans : Gratuit, Pro (9.99€/mois), Enterprise (29.99€/mois)
- Intégration Stripe complète
- Gestion des abonnements
- Limites d'usage flexibles

### 🎨 Personnalisation
- Éditeur visuel pour pages de liens
- Thèmes et styles personnalisables
- Support du dark mode
- Design mobile-first

### 🔒 Sécurité
- Authentification complète avec NextAuth
- Protection anti-ban pour réseaux sociaux
- Rôles et permissions
- RGPD compliant

## 📋 Prérequis

- Node.js 18+
- npm ou yarn
- SQLite (inclus)
- Compte Stripe (pour les paiements)

## 🛠️ Installation

1. **Cloner le repository**
```bash
git clone https://github.com/votre-username/TapLinkr-app.git
cd TapLinkr-app
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
```bash
cp .env.example .env
```

Éditez `.env` et ajoutez vos clés :
- `NEXTAUTH_SECRET` : Générez avec `openssl rand -base64 32`
- `STRIPE_*` : Obtenez vos clés sur [Stripe Dashboard](https://dashboard.stripe.com)

4. **Initialiser la base de données**
```bash
npx prisma migrate dev
npx prisma generate
```

5. **Créer un compte admin (optionnel)**
```bash
npx tsx scripts/create-admin.ts
```

6. **Lancer le serveur de développement**
```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration Stripe

### 1. Créer un compte Stripe
- Allez sur [stripe.com](https://stripe.com)
- Créez un compte et activez le mode test

### 2. Récupérer les clés API
- Dashboard → Developers → API keys
- Copiez `pk_test_...` et `sk_test_...`

### 3. Créer les produits
- Dashboard → Products → Add product
- Créez "TapLinkr Standard" (9.99€/mois)
- Créez "TapLinkr Premium" (24.99€/mois)
- Copiez les IDs des prix

### 4. Configurer le webhook (production)
- Dashboard → Webhooks → Add endpoint
- URL: `https://votre-domaine.com/api/webhooks/stripe`
- Events: `checkout.session.completed`, `customer.subscription.*`

## 📱 Utilisation

### Plan Gratuit
- 5 liens maximum
- 1,000 clics par mois
- Analytics de base

### Plan Pro
- 100 liens
- 10,000 clics par mois
- Analytics avancées
- Pages personnalisables
- Support prioritaire

### Plan Enterprise
- Liens illimités
- Clics illimités
- Analytics temps réel
- API complète
- Support dédié

## 🏗️ Architecture

```
TapLinkr/
├── app/                    # Pages Next.js (App Router)
│   ├── api/               # Routes API
│   ├── auth/              # Pages d'authentification
│   ├── dashboard/         # Dashboard utilisateur
│   └── l/[shortCode]/     # Pages de redirection
├── components/            # Composants React
├── contexts/              # Contextes React
├── lib/                   # Utilitaires et configuration
├── prisma/                # Schéma et migrations
└── public/                # Assets statiques
```

## 🚀 Déploiement

### Vercel (recommandé)
```bash
npm install -g vercel
vercel
```

### Variables d'environnement de production
- Ajoutez toutes les variables de `.env`
- Changez `NEXTAUTH_URL` pour votre domaine
- Utilisez des clés Stripe de production

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 License

Ce projet est sous license MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- [Next.js](https://nextjs.org)
- [Stripe](https://stripe.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Prisma](https://prisma.io)

---

Créé avec ❤️ par [Votre Nom]

Déploiement Vercel – test de relance ✅
