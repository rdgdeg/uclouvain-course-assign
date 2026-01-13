# Script de configuration de l'environnement
# Ce script configure automatiquement le fichier .env.local

Write-Host "🔧 Configuration de l'environnement..." -ForegroundColor Cyan

$envFile = ".env.local"
$envContent = @"
# Configuration Supabase
VITE_SUPABASE_URL=https://dhuuduphwvxrecfqvbbw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRodXVkdXBod3Z4cmVjZnF2YmJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMTEyODksImV4cCI6MjA4Mzc4NzI4OX0.RyURwma808AT0PqFIWXpe6NIdIdoscYN5GiC8Dh7Ktk

# Configuration Resend (Email) - À compléter avec votre clé
VITE_RESEND_API_KEY=your-resend-api-key

# Configuration de l'application
VITE_APP_NAME=ATTRIB UCLouvain
VITE_APP_VERSION=1.0.0
"@

if (Test-Path $envFile) {
    Write-Host "⚠️  Le fichier .env.local existe déjà" -ForegroundColor Yellow
    $overwrite = Read-Host "Voulez-vous le remplacer ? (O/N)"
    if ($overwrite -ne "O" -and $overwrite -ne "o") {
        Write-Host "❌ Configuration annulée" -ForegroundColor Red
        exit 0
    }
}

$envContent | Out-File -FilePath $envFile -Encoding UTF8
Write-Host "✅ Fichier .env.local créé avec succès !" -ForegroundColor Green
Write-Host "📝 N'oubliez pas de remplacer 'your-resend-api-key' par votre vraie clé Resend" -ForegroundColor Yellow
