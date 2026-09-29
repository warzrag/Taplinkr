# Lecture seule : les paiements Stripe arrivent-ils bien jusqu'au site ?
#
# Stripe previent le site de chaque paiement par un « webhook » : une adresse
# qu'il appelle. Si cette adresse est fausse ou en panne, un client paie mais
# son compte ne passe jamais en Premium, et personne ne le voit.
#
# Affiche : le mode (reel ou test), les adresses de webhook et leur etat, les
# derniers evenements et ceux que Stripe n'a PAS reussi a livrer, et le nombre
# d'abonnements actifs. Uniquement des lectures (GET). N'affiche jamais la cle.

$ErrorActionPreference = 'Continue'
$ProgressPreference = 'SilentlyContinue'

$cle = $null
Get-Content 'C:\web\sites\taplinkr-pg\.env' | ForEach-Object {
  if ($_ -match '^STRIPE_SECRET_KEY="?([^"]+)"?$') { $cle = $Matches[1] }
}
if (-not $cle) { Write-Output 'STRIPE_SECRET_KEY absente.'; exit 1 }
$mode = if ($cle.StartsWith('sk_live')) { 'REEL (vrais paiements)' } elseif ($cle.StartsWith('sk_test')) { 'TEST' } else { 'inconnu' }
Write-Output "Mode Stripe : $mode"
$h = @{ Authorization = "Bearer $cle" }

function Lire($chemin) { Invoke-RestMethod -Uri ("https://api.stripe.com/v1/" + $chemin) -Headers $h -TimeoutSec 30 }

try {
  Write-Output ''
  Write-Output '--- Adresses ou Stripe previent le site ---'
  foreach ($w in @((Lire 'webhook_endpoints?limit=20').data)) {
    Write-Output ("{0}  etat {1}  ({2} types d'evenements)" -f $w.url, $w.status, @($w.enabled_events).Count)
  }

  Write-Output ''
  Write-Output '--- Derniers evenements (pending = pas encore livre au site) ---'
  $evts = @((Lire 'events?limit=40').data)
  foreach ($e in $evts | Select-Object -First 15) {
    $date = [DateTimeOffset]::FromUnixTimeSeconds($e.created).UtcDateTime.ToString('dd/MM HH:mm')
    Write-Output ("{0}  {1,-40} pending={2}" -f $date, $e.type, $e.pending_webhooks)
  }
  $echecs = @($evts | Where-Object { $_.pending_webhooks -gt 0 })
  Write-Output ("=> sur les {0} derniers evenements, {1} jamais livres au site" -f $evts.Count, $echecs.Count)

  Write-Output ''
  $abos = @((Lire 'subscriptions?status=active&limit=100').data)
  Write-Output ("Abonnements actifs chez Stripe : {0}" -f $abos.Count)
} catch {
  Write-Output ("Stripe a refuse la lecture : " + $_.Exception.Message)
  exit 1
}
