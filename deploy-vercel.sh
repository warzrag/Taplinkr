#!/bin/bash

echo "🚀 Déploiement sur Vercel"
echo "========================"

# Vérifier si Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI n'est pas installé"
    echo "Installation : npm i -g vercel"
    exit 1
fi

# Build local pour vérifier
echo "📦 Test du build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build réussi !"
    echo ""
    echo "📋 Prochaines étapes :"
    echo "1. Exécutez : vercel"
    echo "2. Suivez les instructions"
    echo "3. Configurez les variables d'environnement dans Vercel :"
    echo "   - DATABASE_URL"
    echo "   - NEXTAUTH_URL (https://votredomaine.com)"
    echo "   - NEXTAUTH_SECRET"
    echo ""
    echo "4. Dans IONOS, configurez votre domaine :"
    echo "   - Type : CNAME"
    echo "   - Nom : @ ou www"
    echo "   - Valeur : cname.vercel-dns.com"
else
    echo "❌ Erreur lors du build"
    exit 1
fi