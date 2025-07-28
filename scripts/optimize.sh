#!/bin/bash

# 🚀 Script d'Optimisation - Projet ATTRIB
# Ce script automatise le processus de correction des erreurs et vulnérabilités

set -e  # Arrêter en cas d'erreur

echo "🔧 Début de l'optimisation du projet ATTRIB..."
echo "================================================"

# Phase 1: Sécurité - Correction des vulnérabilités
echo ""
echo "🔴 PHASE 1: Correction des vulnérabilités de sécurité"
echo "----------------------------------------------------"

echo "📦 Mise à jour automatique des dépendances..."
npm audit fix

echo "🔍 Vérification des vulnérabilités restantes..."
npm audit

echo "📈 Mise à jour des dépendances principales..."
npm update @babel/runtime @eslint/plugin-kit esbuild nanoid

echo "✅ Phase 1 terminée!"

# Phase 2: Vérification de la compilation
echo ""
echo "🟡 PHASE 2: Vérification de la compilation"
echo "------------------------------------------"

echo "🔨 Test de compilation..."
npm run build

echo "✅ Phase 2 terminée!"

# Phase 3: Analyse des erreurs de linting
echo ""
echo "🟢 PHASE 3: Analyse des erreurs de linting"
echo "------------------------------------------"

echo "🔍 Exécution du linter..."
npm run lint || {
    echo "⚠️  Des erreurs de linting ont été détectées."
    echo "📋 Consultez le fichier PLAN_OPTIMISATION.md pour les corriger."
}

echo "✅ Phase 3 terminée!"

# Phase 4: Rapport final
echo ""
echo "📊 RAPPORT FINAL"
echo "================"

echo "🔒 Vulnérabilités de sécurité:"
npm audit --audit-level=moderate

echo ""
echo "📝 Erreurs de linting:"
npm run lint 2>&1 | grep -E "(error|warning)" | wc -l | xargs echo "Nombre d'erreurs/warnings:"

echo ""
echo "🎯 Prochaines étapes:"
echo "1. Corriger les types 'any' selon le plan d'optimisation"
echo "2. Créer les interfaces TypeScript manquantes"
echo "3. Optimiser les composants UI"
echo "4. Tester l'application après chaque modification"

echo ""
echo "✅ Script d'optimisation terminé!"
echo "📋 Consultez PLAN_OPTIMISATION.md pour les détails" 