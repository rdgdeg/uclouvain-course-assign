# Script d'installation complète
# Ce script orchestre toute l'installation

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Installation complète du projet" -ForegroundColor Cyan
Write-Host "  uclouvain-course-assign" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Étape 1 : Vérifier Node.js
Write-Host "📋 Étape 1/3 : Vérification de Node.js..." -ForegroundColor Yellow
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js n'est pas installé" -ForegroundColor Red
    Write-Host "`n📥 Installation de Node.js..." -ForegroundColor Cyan
    Write-Host "⚠️  Vous pouvez :" -ForegroundColor Yellow
    Write-Host "   1. Télécharger manuellement depuis https://nodejs.org/" -ForegroundColor White
    Write-Host "   2. Ou executer : .\install-node.ps1 (en tant qu'administrateur)" -ForegroundColor White
    Write-Host ""
    
    $continue = Read-Host "Continuer avec l'installation des dépendances après avoir installé Node.js ? (O/N)"
    if ($continue -ne "O" -and $continue -ne "o") {
        Write-Host "`n❌ Installation annulée" -ForegroundColor Red
        exit 1
    }
} else {
    $nodeVersion = node --version
    Write-Host "✅ Node.js installé : $nodeVersion" -ForegroundColor Green
}

# Étape 2 : Configurer l'environnement
Write-Host "`n📋 Étape 2/3 : Configuration de l'environnement..." -ForegroundColor Yellow
if (-not (Test-Path ".env.local")) {
    Write-Host "📝 Création du fichier .env.local..." -ForegroundColor Cyan
    .\setup-env.ps1
} else {
    Write-Host "✅ Fichier .env.local existe déjà" -ForegroundColor Green
}

# Étape 3 : Installer les dépendances
Write-Host "`n📋 Étape 3/3 : Installation des dépendances..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    .\install-dependencies.ps1
} else {
    Write-Host "❌ Impossible d'installer les dépendances sans Node.js" -ForegroundColor Red
    Write-Host "💡 Installez Node.js puis exécutez : npm install" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  ✅ Installation terminée !" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "🚀 Pour lancer l'application :" -ForegroundColor Cyan
Write-Host "   npm run dev`n" -ForegroundColor White

Write-Host "📝 N'oubliez pas de :" -ForegroundColor Yellow
Write-Host "   - Configurer VITE_RESEND_API_KEY dans .env.local" -ForegroundColor White
Write-Host "   - Vérifier les migrations Supabase`n" -ForegroundColor White
