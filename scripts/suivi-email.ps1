# Lecture seule : ou en est un e-mail envoye par Resend ?
#
#   powershell -File suivi-email.ps1 -Id <identifiant rendu par Resend>
#
# Affiche le dernier evenement connu : « delivered » (livre dans la boite),
# « bounced » (adresse refusee), « complained » (marque comme spam)...
# N'envoie rien et n'affiche jamais la cle.

param([Parameter(Mandatory = $true)][string]$Id)

$ErrorActionPreference = 'Continue'
$ProgressPreference = 'SilentlyContinue'

$cle = $null
Get-Content 'C:\web\sites\taplinkr-pg\.env' | ForEach-Object {
  if ($_ -match '^RESEND_API_KEY="?([^"]+)"?$') { $cle = $Matches[1] }
}
if (-not $cle) { Write-Output 'RESEND_API_KEY absente.'; exit 1 }

try {
  $e = Invoke-RestMethod -Uri ("https://api.resend.com/emails/" + $Id) -Headers @{ Authorization = "Bearer $cle" } -TimeoutSec 20
  Write-Output ("etat : {0}   envoye le {1}   sujet : {2}" -f $e.last_event, $e.created_at, $e.subject)
} catch {
  Write-Output ("Resend a refuse la lecture : " + $_.Exception.Message)
  exit 1
}
