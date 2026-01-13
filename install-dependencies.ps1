# Script d'installation des dépendances npm
# Ce script vérifie Node.js et installe les dépendances

Write-Host "🔍 Vérification de Node.js..." -ForegroundColor Cyan

# Vérifier si Node.js est installé
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js n'est pas installé !" -ForegroundColor Red
    Write-Host "📥 Veuillez installer Node.js d'abord :" -ForegroundColor Yellow
    Write-Host "   1. Téléchargez depuis : https://nodejs.org/" -ForegroundColor White
    Write-Host "   2. Ou exécutez : .\install-node.ps1 (en tant qu'administrateur)" -ForegroundColor White
    exit 1
}

$nodeVersion = node --version
$npmVersion = npm --version

Write-Host "✅ Node.js installé : $nodeVersion" -ForegroundColor Green
Write-Host "✅ npm installé : $npmVersion" -ForegroundColor Green

Write-Host "`n📦 Installation des dépendances..." -ForegroundColor Cyan
Write-Host "⏳ Cela peut prendre quelques minutes..." -ForegroundColor Yellow

try {
    npm install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Dépendances installées avec succès !" -ForegroundColor Green
        Write-Host "`n🚀 Vous pouvez maintenant lancer l'application avec :" -ForegroundColor Cyan
        Write-Host "   npm run dev" -ForegroundColor White
    } else {
        Write-Host "`n❌ Erreur lors de l'installation des dépendances" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "`n❌ Erreur : $_" -ForegroundColor Red
    exit 1
}
