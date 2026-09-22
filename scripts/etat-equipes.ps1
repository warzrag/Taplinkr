# Lecture seule : ou en sont les equipes et l attribution des liens.
#
# Sert a repondre avant d allumer l acces exclusif : un membre sans lien
# attribue verra un tableau de bord vide. Mieux vaut le savoir avant.

$ErrorActionPreference = 'Continue'
$ProgressPreference = 'SilentlyContinue'

$pg = 'C:\web\bin\pgsql\bin\psql.exe'

Get-Content 'C:\web\data\taplinkr-db.env' | ForEach-Object {
  if ($_ -match '^([A-Za-z_]+)="(.+)"$') {
    [Environment]::SetEnvironmentVariable($Matches[1], $Matches[2], 'Process')
  }
}
if ($env:DATABASE_URL -match '://postgres:([^@]+)@') { $env:PGPASSWORD = $Matches[1] }
else { Write-Output 'DATABASE_URL introuvable'; exit 1 }

# La requete vit dans un fichier a cote : passee en ligne de commande, les
# guillemets qui protegent les noms de colonnes se perdent en route et
# PostgreSQL ne retrouve plus ses majuscules.
& $pg -U postgres -h localhost -d taplinkr -f (Join-Path $PSScriptRoot 'etat-equipes.sql')
