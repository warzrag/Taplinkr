# Demande a Resend de reverifier les enregistrements DNS de taplinkr.com.
#
# A lancer apres avoir ajoute ou corrige les enregistrements chez IONOS : sans
# cette demande, Resend peut laisser le domaine en « failed » longtemps. Ne
# change rien d'autre et n'envoie aucun e-mail. N'affiche jamais la cle.
#
# L'etat se relit ensuite avec etat-emails.ps1 (« pending », puis « verified »).

$ErrorActionPreference = 'Continue'
$ProgressPreference = 'SilentlyContinue'

$cle = $null
Get-Content 'C:\web\sites\taplinkr-pg\.env' | ForEach-Object {
  if ($_ -match '^RESEND_API_KEY="?([^"]+)"?$') { $cle = $Matches[1] }
}
if (-not $cle) { Write-Output 'RESEND_API_KEY absente.'; exit 1 }
$entetes = @{ Authorization = "Bearer $cle" }

$domaine = @((Invoke-RestMethod -Uri 'https://api.resend.com/domains' -Headers $entetes -TimeoutSec 20).data) |
  Where-Object { $_.name -eq 'taplinkr.com' } | Select-Object -First 1
if (-not $domaine) { Write-Output 'taplinkr.com introuvable chez Resend.'; exit 1 }

try {
  Invoke-RestMethod -Method Post -Uri ("https://api.resend.com/domains/" + $domaine.id + "/verify") -Headers $entetes -TimeoutSec 20 | Out-Null
  Write-Output 'Verification demandee a Resend.'
} catch {
  Write-Output ("Resend a refuse la demande : " + $_.Exception.Message)
  exit 1
}
