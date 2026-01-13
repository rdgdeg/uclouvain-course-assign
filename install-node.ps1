# Script d'installation automatique de Node.js
# Exécutez ce script en tant qu'administrateur

Write-Host "🚀 Installation de Node.js..." -ForegroundColor Cyan

# Vérifier si Node.js est déjà installé
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "✅ Node.js est déjà installé : $nodeVersion" -ForegroundColor Green
    exit 0
}

# URL de téléchargement de Node.js LTS
$nodeUrl = "https://nodejs.org/dist/v20.11.1/node-v20.11.1-x64.msi"
$installerPath = "$env:TEMP\nodejs-installer.msi"

Write-Host "📥 Téléchargement de Node.js LTS..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri $nodeUrl -OutFile $installerPath -UseBasicParsing
    Write-Host "✅ Téléchargement terminé" -ForegroundColor Green
    
    Write-Host "🔧 Installation en cours..." -ForegroundColor Yellow
    Write-Host "⚠️  Une fenêtre d'installation va s'ouvrir. Suivez les instructions." -ForegroundColor Yellow
    
    # Lancer l'installateur
    Start-Process msiexec.exe -ArgumentList "/i `"$installerPath`" /quiet /norestart" -Wait
    
    Write-Host "✅ Installation terminée !" -ForegroundColor Green
    Write-Host "🔄 Redémarrez votre terminal PowerShell pour utiliser Node.js" -ForegroundColor Cyan
    
    # Nettoyer
    Remove-Item $installerPath -ErrorAction SilentlyContinue
    
} catch {
    Write-Host "❌ Erreur lors de l'installation : $_" -ForegroundColor Red
    Write-Host "💡 Vous pouvez installer Node.js manuellement depuis : https://nodejs.org/" -ForegroundColor Yellow
}
