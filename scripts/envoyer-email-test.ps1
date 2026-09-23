# Envoie UN e-mail de test par Resend, avec l'expediteur du site, a l'adresse
# donnee. Pour verifier que l'envoi marche de bout en bout.
#
#   powershell -File envoyer-email-test.ps1 -A florentivo95270@gmail.com
#
# N'envoie qu'a l'adresse passee en parametre, jamais a une liste. N'affiche
# jamais la cle : seulement l'identifiant que Resend attribue a l'e-mail.
#
# Texte en ASCII et entites HTML : PowerShell 5.1 lit ce fichier sans BOM en
# Windows-1252, et casserait tout accent ecrit en clair.

param([Parameter(Mandatory = $true)][string]$A)

$ErrorActionPreference = 'Continue'
$ProgressPreference = 'SilentlyContinue'

if ($A -notmatch '^[^@\s]+@[^@\s]+\.[^@\s]+$') { Write-Output "Adresse invalide : $A"; exit 1 }

$cle = $null
$expediteur = $null
Get-Content 'C:\web\sites\taplinkr-pg\.env' | ForEach-Object {
  if ($_ -match '^RESEND_API_KEY="?([^"]+)"?$') { $cle = $Matches[1] }
  if ($_ -match '^EMAIL_FROM="?([^"]+)"?$') { $expediteur = $Matches[1] }
}
if (-not $cle) { Write-Output 'RESEND_API_KEY absente.'; exit 1 }
if (-not $expediteur) { Write-Output 'EMAIL_FROM absent.'; exit 1 }

$heure = Get-Date -Format 'dd/MM/yyyy HH:mm'
$corps = @{
  from    = $expediteur
  to      = @($A)
  subject = 'Test TapLinkr : les e-mails fonctionnent'
  html    = "<div style=""font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#18181b"">" +
            "<p style=""font-size:20px;font-weight:700;color:#7c3aed;margin:0 0 16px"">TapLinkr</p>" +
            "<p>Si tu lis ce message, les e-mails de ton site repartent.</p>" +
            "<p>Invitations d&#39;&eacute;quipe, confirmations d&#39;inscription et mots de passe oubli&eacute;s peuvent de nouveau &ecirc;tre envoy&eacute;s.</p>" +
            "<p style=""color:#71717a;font-size:13px"">Test envoy&eacute; le $heure depuis le serveur.</p></div>"
} | ConvertTo-Json -Depth 3

try {
  $reponse = Invoke-RestMethod -Method Post -Uri 'https://api.resend.com/emails' `
    -Headers @{ Authorization = "Bearer $cle" } `
    -ContentType 'application/json; charset=utf-8' `
    -Body ([System.Text.Encoding]::UTF8.GetBytes($corps)) -TimeoutSec 30
  Write-Output ("Envoye. Identifiant Resend : " + $reponse.id)
} catch {
  $detail = $_.ErrorDetails.Message
  Write-Output ("Resend a refuse l'envoi : " + $_.Exception.Message + ' ' + $detail)
  exit 1
}
