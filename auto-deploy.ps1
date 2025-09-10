# Script PowerShell pour auto-commit et push
# Cela declenchera automatiquement un redeploiement sur Vercel

param(
    [string]$message = "Mise a jour automatique"
)

Write-Host "Preparation du deploiement..." -ForegroundColor Green

# Ajouter tous les changements
git add -A

# Verifier s'il y a des changements
$status = git status --porcelain
if ($status) {
    Write-Host "Changements detectes" -ForegroundColor Yellow
    
    # Commit avec le message
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $fullMessage = "$message - $timestamp"
    git commit -m $fullMessage
    
    Write-Host "Push vers GitHub..." -ForegroundColor Green
    git push origin main
    
    Write-Host "Deploiement lance ! Vercel va automatiquement redeployer." -ForegroundColor Green
    Write-Host "Verifiez le statut sur: https://vercel.com/dashboard" -ForegroundColor Cyan
} else {
    Write-Host "Aucun changement detecte" -ForegroundColor Red
}