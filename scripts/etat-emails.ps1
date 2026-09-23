# Lecture seule : l'envoi d'e-mails de Taplinkr peut-il fonctionner ?
#
# Interroge Resend (le service d'envoi) sur les domaines declares et leur
# etat. Un e-mail parti de @taplinkr.com n'est livre que si le domaine est
# « verified » chez Resend ; sinon Resend le refuse, et l'invitation d'equipe
# repond « the email could not be sent ».
#
# N'envoie rien. N'affiche jamais la cle : seulement les noms de domaine et
# leur etat.

$ErrorActionPreference = 'Continue'
$ProgressPreference = 'SilentlyContinue'

$cle = $null
Get-Content 'C:\web\sites\taplinkr-pg\.env' | ForEach-Object {
  if ($_ -match '^RESEND_API_KEY="?([^"]+)"?$') { $cle = $Matches[1] }
}
if (-not $cle) { Write-Output 'RESEND_API_KEY absente : aucun e-mail ne peut partir.'; exit 1 }

try {
  $reponse = Invoke-RestMethod -Uri 'https://api.resend.com/domains' -Headers @{ Authorization = "Bearer $cle" } -TimeoutSec 20
  $domaines = @($reponse.data)
  if (-not $domaines.Count) { Write-Output 'Aucun domaine declare chez Resend.' }
  foreach ($d in $domaines) {
    Write-Output ("{0,-28} {1,-12} cree le {2}" -f $d.name, $d.status, ([string]$d.created_at).Substring(0, 10))

    # Le detail donne chaque enregistrement DNS attendu et son etat : c'est ce
    # qu'il faut recopier chez l'hebergeur du domaine. Ces valeurs sont
    # publiques une fois en place (n'importe qui peut les lire dans le DNS).
    $detail = Invoke-RestMethod -Uri ("https://api.resend.com/domains/" + $d.id) -Headers @{ Authorization = "Bearer $cle" } -TimeoutSec 20
    foreach ($r in @($detail.records)) {
      Write-Output ''
      Write-Output ("  [{0}] type {1}  nom {2}  etat {3}" -f $r.record, $r.type, $r.name, $r.status)
      if ($r.priority) { Write-Output ("      priorite : {0}" -f $r.priority) }
      Write-Output ("      valeur   : {0}" -f $r.value)
    }
  }
} catch {
  Write-Output ("Resend a refuse la lecture : " + $_.Exception.Message)
}
