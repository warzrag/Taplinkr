# Lance une requete SQL sur la base de Taplinkr, en lecture seule.
#
#   powershell -File lire-base.ps1 -Requete C:\chemin\requete.sql
#
# La session est ouverte en lecture seule par PostgreSQL lui-meme
# (default_transaction_read_only) : une requete qui tenterait d'ecrire echoue,
# quoi qu'elle contienne. Pour chercher un compte ou compter des lignes sans
# risque de rien modifier.
#
# La requete vit dans un fichier et jamais en ligne de commande : passee en
# argument, les guillemets qui protegent les noms de colonnes se perdent en
# route et PostgreSQL ne retrouve plus ses majuscules.

param([Parameter(Mandatory = $true)][string]$Requete)

$ErrorActionPreference = 'Continue'
$ProgressPreference = 'SilentlyContinue'

$pg = 'C:\web\bin\pgsql\bin\psql.exe'

if (-not (Test-Path $Requete)) { Write-Output "Fichier introuvable : $Requete"; exit 1 }

Get-Content 'C:\web\data\taplinkr-db.env' | ForEach-Object {
  if ($_ -match '^([A-Za-z_]+)="(.+)"$') {
    [Environment]::SetEnvironmentVariable($Matches[1], $Matches[2], 'Process')
  }
}
if ($env:DATABASE_URL -match '://postgres:([^@]+)@') { $env:PGPASSWORD = $Matches[1] }
else { Write-Output 'DATABASE_URL introuvable'; exit 1 }

$env:PGOPTIONS = '-c default_transaction_read_only=on'
& $pg -U postgres -h localhost -d taplinkr -f $Requete
