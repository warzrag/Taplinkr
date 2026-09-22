# Met en ligne une mise a jour de Taplinkr sur le VPS 128.
#
# Le serveur n a pas de git : les fichiers modifies y arrivent dans une
# archive, deja decompressee quand ce script demarre. Il ne fait que la suite :
# schema, client, construction, redemarrage, verification.
#
# A lancer depuis C:\web\sites\taplinkr-pg.
#
# L ordre compte. Pousser une colonne sans regenerer le client Prisma laisse
# l application demander un champ que son client ne connait pas : tout le monde
# se retrouve deconnecte, et le symptome ne ressemble pas a la cause.

$ErrorActionPreference = 'Continue'
$ProgressPreference = 'SilentlyContinue'

# Node vit a cote des sites, pas dans le PATH d une session SSH : on appelle
# npx et npm par leur chemin complet plutot que d esperer les trouver.
$npx = 'C:\web\bin\node\npx.cmd'
$npm = 'C:\web\bin\node\npm.cmd'
# npx.cmd appelle node a son tour : le dossier doit aussi etre dans le PATH.
$env:Path = 'C:\web\bin\node;' + $env:Path

$racine = 'C:\web\sites\taplinkr-pg'
$tache  = 'Taplinkr-PG'
$sonde  = 'http://127.0.0.1:3301/api/health'

function Etape($titre) { Write-Output ''; Write-Output "--- $titre ---" }

Set-Location $racine

# Le mot de passe vit dans le fichier d environnement du serveur, jamais ici.
Etape 'environnement'
Get-Content 'C:\web\data\taplinkr-db.env' | ForEach-Object {
  if ($_ -match '^([A-Za-z_]+)="(.+)"$') {
    [Environment]::SetEnvironmentVariable($Matches[1], $Matches[2], 'Process')
  }
}
if (-not $env:DATABASE_URL) { Write-Output 'ECHEC : DATABASE_URL introuvable'; exit 1 }
Write-Output 'variables chargees'

# Ajout de colonne avec valeur par defaut : rien n est efface. Une sauvegarde
# verifiee de la nuit existe de toute facon.
Etape 'schema'
$push = & $npx prisma db push 2>&1 | Out-String
Write-Output $push
if ($push -notmatch 'already in sync|in sync with your Prisma schema|Your database is now in sync') {
  Write-Output 'ECHEC : le schema n a pas ete applique'
  exit 1
}

# A partir d ici le site est arrete. C est oblige : le processus en cours
# garde ouvert le moteur de Prisma, et sa regeneration echoue en EPERM tant
# qu il tourne. La fenetre dure le temps de la construction, une minute environ.
Etape 'arret du site'
Stop-ScheduledTask -TaskName $tache
Start-Sleep -Seconds 3
Write-Output 'site arrete'

Etape 'client prisma'
$gen = & $npx prisma generate 2>&1 | Out-String
Write-Output ($gen -split "`n" | Select-Object -Last 4)
if ($gen -notmatch 'Generated Prisma Client') {
  Write-Output 'ECHEC : client non regenere'
  Start-ScheduledTask -TaskName $tache
  exit 1
}

# La construction precedente est mise de cote avant d en lancer une nouvelle.
# Une construction interrompue laisse un dossier .next incoherent : sans cette
# copie, un echec emporterait aussi la version qui marchait.
Etape 'construction'
$precedent = Join-Path $racine '.next-precedent'
if (Test-Path $precedent) { Remove-Item $precedent -Recurse -Force }
if (Test-Path (Join-Path $racine '.next')) {
  Rename-Item (Join-Path $racine '.next') '.next-precedent'
}

$build = & $npm run build 2>&1 | Out-String
if ($build -match 'Failed to compile|Build error occurred') {
  Write-Output $build
  Write-Output 'ECHEC : construction en erreur, retour a la version precedente'
  if (Test-Path (Join-Path $racine '.next')) { Remove-Item (Join-Path $racine '.next') -Recurse -Force }
  if (Test-Path $precedent) { Rename-Item $precedent '.next' }
  Start-ScheduledTask -TaskName $tache
  exit 1
}
Write-Output 'construction terminee'

Etape 'redemarrage'
Start-ScheduledTask -TaskName $tache

Etape 'verification'
$ok = $false
foreach ($essai in 1..20) {
  Start-Sleep -Seconds 3
  try {
    $reponse = Invoke-WebRequest -Uri $sonde -UseBasicParsing -TimeoutSec 5
    if ($reponse.StatusCode -eq 200) { Write-Output $reponse.Content; $ok = $true; break }
  } catch {
    # Le serveur n a pas encore repris : on reessaie.
  }
}
if (-not $ok) {
  # Une minute sans reponse : on remet la construction precedente plutot que de
  # laisser le site mort en attendant qu un humain regarde.
  Write-Output 'ECHEC : le site ne repond pas, retour a la version precedente'
  Stop-ScheduledTask -TaskName $tache
  Start-Sleep -Seconds 3
  if (Test-Path $precedent) {
    if (Test-Path (Join-Path $racine '.next')) {
      Remove-Item (Join-Path $racine '.next-echec') -Recurse -Force -ErrorAction SilentlyContinue
      Rename-Item (Join-Path $racine '.next') '.next-echec'
    }
    Rename-Item $precedent '.next'
  }
  Start-ScheduledTask -TaskName $tache
  exit 1
}

# La construction precedente reste sur le disque : c est le retour arriere
# immediat si un defaut apparait plus tard. La prochaine mise en ligne l efface.
Write-Output ''
Write-Output 'OK - mise en ligne terminee'
