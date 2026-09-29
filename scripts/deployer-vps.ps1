# Met en ligne une mise a jour de Taplinkr sur le VPS 128, SANS COUPURE.
#
#   powershell -File C:\web\sites\taplinkr-pg\deployer-vps.ps1 -Archive C:\web\maj.zip [-Schema]
#
# Le serveur n'a pas git : les fichiers modifies arrivent dans une archive zip,
# chemins relatifs a la racine du site. -Schema pousse aussi le schema Prisma en
# base (ajouts seulement : l'ancienne version tourne encore pendant la mise en
# ligne et doit supporter la nouvelle base).
#
# DEUX COPIES du site tournent en permanence :
#   A : C:\web\sites\taplinkr-pg    port 3301  tache Taplinkr-PG
#   B : C:\web\sites\taplinkr-pg-b  port 3302  tache Taplinkr-PG-B
# Caddy envoie les visiteurs a A tant qu'elle repond, sinon a B, et rejoue sur
# l'autre une requete qui n'a pas abouti (voir le Caddyfile). Le script met a
# jour une copie pendant que l'autre sert, puis l'inverse : a aucun moment le
# site ne s'arrete. Mesure le 29 septembre 2026 : 75 visites pendant l'arret
# d'une copie, 75 reussies.
#
# En cas d'echec :
#   - sur la premiere copie : l'autre n'a pas ete touchee, le site reste
#     entierement sur l'ancienne version. Rien a faire.
#   - sur la seconde : la nouvelle version tourne sur la premiere et sert ;
#     la seconde reprend son ancienne construction, par securite.
#
# Les deux constructions recoivent le meme numero (TAPLINKR_BUILD_ID, lu par
# next.config.js) : un visiteur qui passe d'une copie a l'autre trouve les
# memes fichiers.

param(
  [Parameter(Mandatory = $true)][string]$Archive,
  [switch]$Schema
)

$ErrorActionPreference = 'Continue'
# Write-Host et non Write-Output : dans une fonction PowerShell, tout ce qui est
# ecrit par Write-Output fait partie de la valeur renvoyee. Mettre-A-Jour
# renverrait alors un tableau de messages, toujours "vrai", et un echec
# passerait pour une reussite.
$ProgressPreference = 'SilentlyContinue'

# Node vit a cote des sites, pas dans le PATH d'une session SSH. npx.cmd
# rappelle node a son tour : le dossier doit etre dans le PATH.
$env:Path = 'C:\web\bin\node;' + $env:Path
$npx = 'C:\web\bin\node\npx.cmd'
$npm = 'C:\web\bin\node\npm.cmd'

$copies = @(
  @{ Nom = 'A'; Dossier = 'C:\web\sites\taplinkr-pg';   Port = 3301; Tache = 'Taplinkr-PG' },
  @{ Nom = 'B'; Dossier = 'C:\web\sites\taplinkr-pg-b'; Port = 3302; Tache = 'Taplinkr-PG-B' }
)

function Etape($titre) { Write-Host ''; Write-Host "--- $titre ---" }

function Repond($port) {
  try {
    $r = Invoke-WebRequest -Uri "http://127.0.0.1:$port/robots.txt" -UseBasicParsing -TimeoutSec 5
    return $r.StatusCode -eq 200
  } catch { return $false }
}

function Attendre-Reponse($port, $secondes) {
  foreach ($i in 1..([math]::Ceiling($secondes / 2))) {
    if (Repond $port) { return $true }
    Start-Sleep -Seconds 2
  }
  return $false
}

function Arreter($copie) {
  Stop-ScheduledTask -TaskName $copie.Tache
  # Le port doit etre libre avant de reconstruire : sinon le moteur Prisma
  # reste verrouille (EPERM) et la copie redemarree ne peut pas ecouter.
  foreach ($i in 1..15) {
    if (-not (Get-NetTCPConnection -LocalPort $copie.Port -State Listen -ErrorAction SilentlyContinue)) { return }
    Start-Sleep -Seconds 1
  }
  Write-Host "le port $($copie.Port) est encore occupe apres 15 s"
}

function Mettre-A-Jour($copie) {
  Etape "copie $($copie.Nom) (port $($copie.Port))"
  Arreter $copie
  Write-Host 'arretee (l autre copie sert les visiteurs)'

  Expand-Archive -Path $Archive -DestinationPath $copie.Dossier -Force
  Set-Location $copie.Dossier

  $gen = & $npx prisma generate 2>&1 | Out-String
  if ($gen -notmatch 'Generated Prisma Client') {
    Write-Host $gen
    Write-Host 'ECHEC : client Prisma non regenere'
    Start-ScheduledTask -TaskName $copie.Tache
    return $false
  }

  # L'ancienne construction est mise de cote : une construction interrompue
  # laisse un .next incoherent, et on doit pouvoir revenir en arriere.
  $precedent = Join-Path $copie.Dossier '.next-precedent'
  $courant = Join-Path $copie.Dossier '.next'
  if (Test-Path $precedent) { Remove-Item $precedent -Recurse -Force }
  if (Test-Path $courant) { Rename-Item $courant '.next-precedent' }

  $build = & $npm run build 2>&1 | Out-String
  if ($build -match 'Failed to compile|Build error occurred' -or -not (Test-Path (Join-Path $courant 'BUILD_ID'))) {
    Write-Host $build
    Write-Host 'ECHEC : construction en erreur, retour a la construction precedente'
    if (Test-Path $courant) { Remove-Item $courant -Recurse -Force }
    if (Test-Path $precedent) { Rename-Item $precedent '.next' }
    Start-ScheduledTask -TaskName $copie.Tache
    return $false
  }
  Write-Host 'construite'

  Start-ScheduledTask -TaskName $copie.Tache
  if (-not (Attendre-Reponse $copie.Port 60)) {
    Write-Host 'ECHEC : la nouvelle version ne repond pas, retour a la precedente'
    Arreter $copie
    if (Test-Path $courant) {
      Remove-Item (Join-Path $copie.Dossier '.next-echec') -Recurse -Force -ErrorAction SilentlyContinue
      Rename-Item $courant '.next-echec'
    }
    if (Test-Path $precedent) { Rename-Item $precedent '.next' }
    Start-ScheduledTask -TaskName $copie.Tache
    return $false
  }
  Write-Host 'redemarree et repond'
  return $true
}

if (-not (Test-Path $Archive)) { Write-Host "Archive introuvable : $Archive"; exit 1 }

# La copie qui sert en ce moment est mise a jour en DERNIER.
$a = $copies[0]; $b = $copies[1]
if (Repond $a.Port) { $ordre = @($b, $a) }
elseif (Repond $b.Port) { $ordre = @($a, $b) }
else { Write-Host 'ECHEC : aucune copie ne repond, mise en ligne annulee'; exit 1 }
Write-Host ("ordre : copie {0}, puis copie {1}" -f $ordre[0].Nom, $ordre[1].Nom)

$env:TAPLINKR_BUILD_ID = 'taplinkr-' + (Get-Date -Format 'yyyyMMdd-HHmmss')
Write-Host "numero de construction : $env:TAPLINKR_BUILD_ID"

if ($Schema) {
  Etape 'schema de la base'
  Expand-Archive -Path $Archive -DestinationPath $ordre[0].Dossier -Force
  Set-Location $ordre[0].Dossier
  $push = & $npx prisma db push --skip-generate 2>&1 | Out-String
  Write-Host $push
  if ($push -notmatch 'already in sync|in sync with your Prisma schema|Your database is now in sync') {
    Write-Host 'ECHEC : schema non applique, mise en ligne annulee (rien n a change)'
    exit 1
  }
}

if (-not (Mettre-A-Jour $ordre[0])) {
  Write-Host ''
  Write-Host 'ECHEC sur la premiere copie : l autre n a pas ete touchee, le site reste sur l ancienne version.'
  exit 1
}

if (-not (Mettre-A-Jour $ordre[1])) {
  Write-Host ''
  Write-Host ("ECHEC sur la seconde copie : la nouvelle version tourne sur la copie {0} et sert les visiteurs." -f $ordre[0].Nom)
  exit 1
}

# Construites dans deux dossiers, les copies ne donnent pas toujours le meme nom
# aux fichiers du navigateur (mesure : 110 sur 204 differaient). Un visiteur
# qui change de copie pendant une mise en ligne pourrait demander a l'une un
# fichier que seule l'autre possede. Chaque copie recoit donc les fichiers de
# l'autre qui lui manquent : les noms dependent du contenu, rien ne s'ecrase.
Etape 'fichiers du navigateur partages'
foreach ($sens in @(@($a, $b), @($b, $a))) {
  $source = Join-Path $sens[0].Dossier '.next\static'
  $cible = Join-Path $sens[1].Dossier '.next\static'
  & robocopy $source $cible /E /XC /XN /XO /NFL /NDL /NJH /NJS /NP | Out-Null
  Write-Host ("copie {0} -> copie {1} : code {2}" -f $sens[0].Nom, $sens[1].Nom, $LASTEXITCODE)
}

Etape 'verification a travers Caddy'
try {
  $r = Invoke-WebRequest -Uri 'http://127.0.0.1:8082/api/health' -UseBasicParsing -TimeoutSec 10
  Write-Host $r.Content
} catch { Write-Host ('Caddy ne repond pas : ' + $_.Exception.Message); exit 1 }

Write-Host ''
Write-Host 'OK - mise en ligne terminee, sans coupure'
