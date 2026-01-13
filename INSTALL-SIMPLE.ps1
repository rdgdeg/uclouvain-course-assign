# Script d'installation simplifie
Write-Host ""
Write-Host "=== Installation du projet ===" -ForegroundColor Cyan
Write-Host ""

# Verifier Node.js
Write-Host "Verification de Node.js..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "OK - Node.js installe : $nodeVersion" -ForegroundColor Green
    
    # Verifier npm
    if (Get-Command npm -ErrorAction SilentlyContinue) {
        $npmVersion = npm --version
        Write-Host "OK - npm installe : $npmVersion" -ForegroundColor Green
        
        # Installer les dependances
        Write-Host ""
        Write-Host "Installation des dependances npm..." -ForegroundColor Yellow
        npm install
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "=== Installation terminee ===" -ForegroundColor Green
            Write-Host ""
            Write-Host "Pour lancer l'application :" -ForegroundColor Cyan
            Write-Host "  npm run dev" -ForegroundColor White
            Write-Host ""
        }
    }
} else {
    Write-Host "ERREUR - Node.js n'est pas installe" -ForegroundColor Red
    Write-Host ""
    Write-Host "Veuillez installer Node.js depuis :" -ForegroundColor Yellow
    Write-Host "  https://nodejs.org/" -ForegroundColor White
    Write-Host ""
    Write-Host "Puis relancez ce script" -ForegroundColor Yellow
}
