# Script PowerShell pour surveiller les changements et auto-déployer
# Lance ce script pour un déploiement automatique à chaque modification

Write-Host "👀 Surveillance des changements activée..." -ForegroundColor Green
Write-Host "📝 Modifiez vos fichiers, ils seront automatiquement déployés" -ForegroundColor Yellow
Write-Host "❌ Appuyez sur Ctrl+C pour arrêter" -ForegroundColor Red

# Fonction pour déployer
function Deploy-Changes {
    param($Path)
    
    # Ignorer certains fichiers/dossiers
    if ($Path -match "node_modules|\.git|\.next|prisma.*\.db|\.env\.local") {
        return
    }
    
    Write-Host "`n🔄 Changement détecté: $Path" -ForegroundColor Yellow
    
    # Attendre un peu pour éviter les déploiements multiples
    Start-Sleep -Seconds 2
    
    # Lancer le déploiement
    & "$PSScriptRoot\auto-deploy.ps1" -message "✨ Mise à jour: $(Split-Path $Path -Leaf)"
}

# Créer le FileSystemWatcher
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $PSScriptRoot
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true

# Définir les actions
$action = {
    $path = $Event.SourceEventArgs.FullPath
    Deploy-Changes -Path $path
}

# Enregistrer les événements
Register-ObjectEvent -InputObject $watcher -EventName "Changed" -Action $action
Register-ObjectEvent -InputObject $watcher -EventName "Created" -Action $action
Register-ObjectEvent -InputObject $watcher -EventName "Deleted" -Action $action
Register-ObjectEvent -InputObject $watcher -EventName "Renamed" -Action $action

# Garder le script en cours d'exécution
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    # Nettoyer
    Get-EventSubscriber | Unregister-Event
    $watcher.Dispose()
    Write-Host "`n🛑 Surveillance arrêtée" -ForegroundColor Red
}