# Script pour tout lancer automatiquement
Write-Host "`n🚀 DÉMARRAGE DE TAPLINKR`n" -ForegroundColor Cyan

# Vérifier si npm est installé
if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm n'est pas installé. Installez Node.js d'abord !" -ForegroundColor Red
    exit
}

# Vérifier si les modules sont installés
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
    npm install
}

# Régénérer Prisma
Write-Host "`n🔧 Configuration de la base de données..." -ForegroundColor Yellow
npm run db:generate

# Tester la connexion
Write-Host "`n🔍 Test de connexion à Supabase..." -ForegroundColor Yellow
node test-supabase-connection.js

# Configurer Git
Write-Host "`n📝 Configuration Git..." -ForegroundColor Yellow
git config user.email "flore@taplinkr.com"
git config user.name "Flore"

# Faire un commit initial si nécessaire
$status = git status --porcelain
if ($status) {
    Write-Host "`n📤 Commit initial des changements..." -ForegroundColor Yellow
    git add -A
    git commit -m "🚀 Configuration initiale avec Supabase"
    git push origin main
}

# Lancer l'application et la surveillance en parallèle
Write-Host "`n✨ LANCEMENT DE L'APPLICATION`n" -ForegroundColor Green
Write-Host "📍 Application locale : http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔄 Auto-déploiement activé - Modifiez et sauvegardez !" -ForegroundColor Cyan
Write-Host "❌ Appuyez sur Ctrl+C pour arrêter`n" -ForegroundColor Red

# Créer des jobs pour les deux processus
$devJob = Start-Job -ScriptBlock {
    Set-Location $using:PSScriptRoot
    npm run dev
}

$watchJob = Start-Job -ScriptBlock {
    Set-Location $using:PSScriptRoot
    Start-Sleep -Seconds 5  # Attendre que le serveur démarre
    & ".\watch-deploy.ps1"
}

# Afficher les logs en temps réel
try {
    while ($true) {
        # Récupérer et afficher les nouveaux logs
        Receive-Job $devJob -Keep
        Receive-Job $watchJob -Keep
        Start-Sleep -Milliseconds 500
        
        # Vérifier si les jobs sont toujours actifs
        if ($devJob.State -eq 'Failed' -or $watchJob.State -eq 'Failed') {
            Write-Host "`n❌ Une erreur s'est produite !" -ForegroundColor Red
            break
        }
    }
} finally {
    # Nettoyer en cas d'arrêt
    Write-Host "`n🛑 Arrêt en cours..." -ForegroundColor Yellow
    Stop-Job $devJob, $watchJob
    Remove-Job $devJob, $watchJob
    Write-Host "✅ Arrêt terminé" -ForegroundColor Green
}