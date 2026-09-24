# Lecture seule : les derniers e-mails envoyes par Resend, et ce qu'ils sont
# devenus (delivered = livre, bounced = adresse refusee...).
#
#   powershell -File derniers-emails.ps1 [-Nombre 10]
#
# Les adresses sont masquees a l'affichage. N'envoie rien, n'affiche jamais
# la cle.

param([int]$Nombre = 10)

$ErrorActionPreference = 'Continue'
$ProgressPreference = 'SilentlyContinue'

$cle = $null
Get-Content 'C:\web\sites\taplinkr-pg\.env' | ForEach-Object {
  if ($_ -match '^RESEND_API_KEY="?([^"]+)"?$') { $cle = $Matches[1] }
}
if (-not $cle) { Write-Output 'RESEND_API_KEY absente.'; exit 1 }

function Masquer($adresse) { return ([string]$adresse -replace '^(.{3})[^@]*(@.*)$', '$1***$2') }

try {
  $liste = Invoke-RestMethod -Uri ("https://api.resend.com/emails?limit=" + $Nombre) -Headers @{ Authorization = "Bearer $cle" } -TimeoutSec 20
  foreach ($e in @($liste.data)) {
    $a = (@($e.to) | ForEach-Object { Masquer $_ }) -join ', '
    Write-Output ("{0}  {1,-10}  a {2,-28}  {3}" -f ([string]$e.created_at).Substring(0, 19), $e.last_event, $a, $e.subject)
  }
} catch {
  Write-Output ("Resend a refuse la lecture : " + $_.Exception.Message + ' ' + $_.ErrorDetails.Message)
  exit 1
}
