# Sauvegarde quotidienne de Taplinkr : base de donnees et fichiers televerses.
#
# Depuis le depart de Firestore, tout vit sur ce serveur. Il n y a plus de
# replication faite par un tiers : sans cette tache, une panne de disque ferait
# perdre les clics, les comptes et les images d un seul coup.
#
# Ecrit sur D: alors que le site vit sur C: : un probleme de systeme de fichiers
# sur un volume ne touche pas l autre. Cela ne protege pas de la perte de la
# machine entiere - voir la note en fin de fichier.
#
# Une sauvegarde qui n a jamais ete relue n est pas une sauvegarde : le script
# verifie que le fichier produit est lisible par pg_restore avant de le garder.

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$destination = 'D:\sauvegardes\taplinkr'
$journal     = Join-Path $destination 'journal.log'
$pg          = 'C:\web\bin\pgsql\bin'
$media       = 'C:\web\data\taplinkr-media'
$joursGardes = 14

function Noter($message) {
  $ligne = (Get-Date -Format 'yyyy-MM-dd HH:mm:ss') + '  ' + $message
  Write-Output $ligne
  Add-Content -Path $journal -Value $ligne -Encoding UTF8
}

New-Item -ItemType Directory -Force -Path $destination | Out-Null
$horodatage = Get-Date -Format 'yyyyMMdd-HHmm'

try {
  # Le mot de passe reste dans le fichier d environnement, jamais en clair ici.
  Get-Content 'C:\web\data\taplinkr-db.env' | ForEach-Object {
    if ($_ -match '^(\w+)="(.+)"$') { [Environment]::SetEnvironmentVariable($Matches[1], $Matches[2], 'Process') }
  }
  if ($env:DATABASE_URL -match '://postgres:([^@]+)@') { $env:PGPASSWORD = $Matches[1] }
  else { throw "DATABASE_URL introuvable ou illisible" }

  # --- Base de donnees ---
  $dump = Join-Path $destination "taplinkr-base-$horodatage.dump"
  # Format personnalise : compresse, et restaurable table par table au besoin.
  & "$pg\pg_dump.exe" -U postgres -h localhost -d taplinkr -Fc -f $dump
  if (-not (Test-Path $dump) -or (Get-Item $dump).Length -lt 1024) { throw "Sauvegarde de la base vide ou absente" }

  # Verification reelle : un fichier corrompu se lit mal ici, pas le jour ou on
  # en a besoin.
  $tables = (& "$pg\pg_restore.exe" --list $dump | Select-String 'TABLE DATA' | Measure-Object).Count
  if ($tables -lt 20) { throw "Sauvegarde suspecte : seulement $tables tables lisibles" }

  $tailleBase = [math]::Round((Get-Item $dump).Length / 1MB, 2)
  Noter "base sauvegardee : $tailleBase Mo, $tables tables"

  # --- Fichiers televerses ---
  if (Test-Path $media) {
    $zip = Join-Path $destination "taplinkr-images-$horodatage.zip"
    Compress-Archive -Path (Join-Path $media '*') -DestinationPath $zip -Force
    $nbImages = (Get-ChildItem $media -Recurse -File | Measure-Object).Count
    Noter ("images sauvegardees : " + [math]::Round((Get-Item $zip).Length / 1MB, 2) + " Mo, $nbImages fichiers")
  } else {
    Noter "dossier des images introuvable, ignore"
  }

  # --- Rotation ---
  # Les fichiers plus anciens que la duree de conservation sont supprimes, mais
  # jamais le plus recent : si les sauvegardes echouaient depuis longtemps, on
  # ne veut pas effacer la derniere qui a fonctionne.
  $anciens = Get-ChildItem $destination -File |
    Where-Object { $_.Name -like 'taplinkr-*' -and $_.LastWriteTime -lt (Get-Date).AddDays(-$joursGardes) } |
    Sort-Object LastWriteTime
  $recent = Get-ChildItem $destination -Filter 'taplinkr-base-*.dump' | Sort-Object LastWriteTime -Descending | Select-Object -First 1
  $supprimes = 0
  foreach ($fichier in $anciens) {
    if ($recent -and $fichier.FullName -eq $recent.FullName) { continue }
    Remove-Item $fichier.FullName -Force
    $supprimes++
  }
  if ($supprimes) { Noter "$supprimes fichier(s) de plus de $joursGardes jours supprimes" }

  $total = (Get-ChildItem $destination -Filter 'taplinkr-base-*.dump' | Measure-Object).Count
  Noter "OK - $total sauvegardes conservees"
}
catch {
  Noter "ECHEC : $($_.Exception.Message)"
  exit 1
}

# Note : ces fichiers restent sur la meme machine. Ils protegent d une erreur
# humaine, d une corruption de base ou d une panne du volume C:, mais pas de la
# perte du serveur. Une copie reguliere vers un autre endroit reste souhaitable.
