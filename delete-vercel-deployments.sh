#!/bin/bash

echo "🧹 Suppression des anciens déploiements Vercel..."

# Installer Vercel CLI si nécessaire
if ! command -v vercel &> /dev/null; then
    echo "Installation de Vercel CLI..."
    npm install -g vercel
fi

echo "📋 Connexion à Vercel..."
echo "Entrez votre email Vercel quand demandé."
vercel login

echo "🗑️ Récupération et suppression des déploiements..."

# Récupérer la liste des déploiements et garder seulement les 5 derniers
vercel ls taplinkr --json | jq -r '.deployments[5:][].uid' | while read uid; do
    if [ ! -z "$uid" ]; then
        echo "Suppression de: $uid"
        vercel rm "$uid" --yes
    fi
done

echo "✅ Nettoyage terminé !"
echo "Gardé : 5 derniers déploiements"
echo ""
echo "🚀 Pour redéployer maintenant :"
echo "vercel --prod"