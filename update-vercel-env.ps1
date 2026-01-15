# Script pour mettre à jour les variables d'environnement Vercel
# Utilise npx pour exécuter Vercel CLI sans installation globale

Write-Host "🔧 Mise à jour des variables d'environnement Vercel..." -ForegroundColor Cyan
Write-Host ""

# Vérifier si on est dans le bon répertoire
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erreur: Ce script doit être exécuté depuis la racine du projet" -ForegroundColor Red
    exit 1
}

# Variables d'environnement à mettre à jour
$supabaseUrl = "https://dhuuduphwvxrecfqvbbw.supabase.co"
$supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRodXVkdXBod3Z4cmVjZnF2YmJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMTEyODksImV4cCI6MjA4Mzc4NzI4OX0.RyURwma808AT0PqFIWXpe6NIdIdoscYN5GiC8Dh7Ktk"

Write-Host "📝 Variables à mettre à jour:" -ForegroundColor Yellow
Write-Host "  - VITE_SUPABASE_URL = $supabaseUrl" -ForegroundColor Gray
Write-Host "  - VITE_SUPABASE_ANON_KEY = $($supabaseAnonKey.Substring(0, 50))..." -ForegroundColor Gray
Write-Host ""

# Vérifier si l'utilisateur est connecté à Vercel
Write-Host "🔐 Vérification de la connexion Vercel..." -ForegroundColor Cyan
$whoami = npx vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Vous n'êtes pas connecté à Vercel" -ForegroundColor Yellow
    Write-Host "Exécution de: npx vercel login" -ForegroundColor Yellow
    npx vercel login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Échec de la connexion" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Connecté à Vercel" -ForegroundColor Green
Write-Host ""

# Supprimer les anciennes variables
Write-Host "🗑️  Suppression des anciennes variables..." -ForegroundColor Cyan
Write-Host "  Suppression de VITE_SUPABASE_URL..." -ForegroundColor Gray
npx vercel env rm VITE_SUPABASE_URL production --yes 2>&1 | Out-Null
npx vercel env rm VITE_SUPABASE_URL preview --yes 2>&1 | Out-Null
npx vercel env rm VITE_SUPABASE_URL development --yes 2>&1 | Out-Null

Write-Host "  Suppression de VITE_SUPABASE_ANON_KEY..." -ForegroundColor Gray
npx vercel env rm VITE_SUPABASE_ANON_KEY production --yes 2>&1 | Out-Null
npx vercel env rm VITE_SUPABASE_ANON_KEY preview --yes 2>&1 | Out-Null
npx vercel env rm VITE_SUPABASE_ANON_KEY development --yes 2>&1 | Out-Null

Write-Host "✅ Anciennes variables supprimées" -ForegroundColor Green
Write-Host ""

# Ajouter les nouvelles variables
Write-Host "➕ Ajout des nouvelles variables..." -ForegroundColor Cyan

# Pour VITE_SUPABASE_URL
Write-Host "  Ajout de VITE_SUPABASE_URL (Production)..." -ForegroundColor Gray
echo $supabaseUrl | npx vercel env add VITE_SUPABASE_URL production

Write-Host "  Ajout de VITE_SUPABASE_URL (Preview)..." -ForegroundColor Gray
echo $supabaseUrl | npx vercel env add VITE_SUPABASE_URL preview

Write-Host "  Ajout de VITE_SUPABASE_URL (Development)..." -ForegroundColor Gray
echo $supabaseUrl | npx vercel env add VITE_SUPABASE_URL development

# Pour VITE_SUPABASE_ANON_KEY
Write-Host "  Ajout de VITE_SUPABASE_ANON_KEY (Production)..." -ForegroundColor Gray
echo $supabaseAnonKey | npx vercel env add VITE_SUPABASE_ANON_KEY production

Write-Host "  Ajout de VITE_SUPABASE_ANON_KEY (Preview)..." -ForegroundColor Gray
echo $supabaseAnonKey | npx vercel env add VITE_SUPABASE_ANON_KEY preview

Write-Host "  Ajout de VITE_SUPABASE_ANON_KEY (Development)..." -ForegroundColor Gray
echo $supabaseAnonKey | npx vercel env add VITE_SUPABASE_ANON_KEY development

Write-Host ""
Write-Host "✅ Variables d'environnement mises à jour !" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Pour redéployer avec les nouvelles variables:" -ForegroundColor Yellow
Write-Host "   npx vercel --prod" -ForegroundColor White
Write-Host ""
Write-Host "Ou attendez le prochain déploiement automatique depuis Git." -ForegroundColor Gray
