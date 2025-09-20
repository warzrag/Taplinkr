#!/bin/bash

# Script de déploiement manuel vers Vercel
echo "🚀 Déploiement vers Vercel..."

# Vérifier si Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Installation de Vercel CLI..."
    npm install -g vercel
fi

# Déployer vers production
echo "📦 Déploiement en production..."
vercel --prod --yes

echo "✅ Déploiement terminé !"
echo "Vérifiez votre site sur : https://taplinkr.com"