# Script PowerShell pour auto-commit et push
# Cela déclenchera automatiquement un redéploiement sur Vercel

param(
    [string]$message = "🚀 Mise à jour automatique"
)

Write-Host "📦 Préparation du déploiement..." -ForegroundColor Green

# Ajouter tous les changements
git add -A

# Vérifier s'il y a des changements
$status = git status --porcelain
if ($status) {
    Write-Host "✅ Changements détectés" -ForegroundColor Yellow
    
    # Commit avec le message
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $fullMessage = "$message - $timestamp"
    git commit -m $fullMessage
    
    Write-Host "📤 Push vers GitHub..." -ForegroundColor Green
    git push origin main
    
    Write-Host "✨ Déploiement lancé ! Vercel va automatiquement redéployer." -ForegroundColor Green
    Write-Host "🔗 Vérifiez le statut sur: https://vercel.com/dashboard" -ForegroundColor Cyan
} else {
    Write-Host "❌ Aucun changement détecté" -ForegroundColor Red
}