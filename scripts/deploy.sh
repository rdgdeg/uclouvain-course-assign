#!/bin/bash

# Script de déploiement pour Vercel
echo "🚀 Déploiement ATTRIB sur Vercel..."

# Vérifier que Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI n'est pas installé. Installation..."
    npm install -g vercel
fi

# Build du projet
echo "📦 Build du projet..."
npm run build

# Vérifier que le build a réussi
if [ ! -d "dist" ]; then
    echo "❌ Le build a échoué. Vérifiez les erreurs."
    exit 1
fi

# Déploiement sur Vercel
echo "🌐 Déploiement sur Vercel..."
vercel --prod

echo "✅ Déploiement terminé !"
echo "🔗 Votre application est maintenant en ligne." 