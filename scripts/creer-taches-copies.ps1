# Cree (ou met a jour) les taches planifiees des deux copies de Taplinkr.
#
#   A : C:\web\sites\taplinkr-pg    port 3301  tache Taplinkr-PG
#   B : C:\web\sites\taplinkr-pg-b  port 3302  tache Taplinkr-PG-B
#
# Caddy envoie les visiteurs a A tant qu'elle repond, sinon a B. Une mise en
# ligne (deployer-vps.ps1) reconstruit une copie pendant que l'autre sert.
#
# Chaque copie :
#   - demarre au lancement du serveur. Avant le 29 septembre 2026, la tache
#     Taplinkr-PG n'avait AUCUN declencheur : apres un redemarrage de Windows,
#     le site restait arrete jusqu'a ce que quelqu'un le relance a la main ;
#   - redemarre seule si elle s'arrete en erreur ;
#   - n'ecoute que sur 127.0.0.1 : seul Caddy peut la joindre.
#
# Mettre a jour la definition d'une tache n'arrete pas la copie en cours ; le
# changement s'applique a son prochain demarrage.

function Enregistrer($nom, $dossier, $port, $description) {
  $xml = @"
<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.3" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <RegistrationInfo>
    <URI>\$nom</URI>
    <Description>$description</Description>
  </RegistrationInfo>
  <Principals>
    <Principal id="Author">
      <UserId>S-1-5-18</UserId>
      <RunLevel>HighestAvailable</RunLevel>
    </Principal>
  </Principals>
  <Settings>
    <DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries>
    <StopIfGoingOnBatteries>false</StopIfGoingOnBatteries>
    <ExecutionTimeLimit>PT0S</ExecutionTimeLimit>
    <MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy>
    <RestartOnFailure>
      <Interval>PT1M</Interval>
      <Count>999</Count>
    </RestartOnFailure>
    <UseUnifiedSchedulingEngine>true</UseUnifiedSchedulingEngine>
  </Settings>
  <Triggers>
    <BootTrigger>
      <Enabled>true</Enabled>
      <Delay>PT30S</Delay>
    </BootTrigger>
  </Triggers>
  <Actions Context="Author">
    <Exec>
      <Command>C:\web\bin\node\node.exe</Command>
      <Arguments>--env-file="$dossier\.env" node_modules\next\dist\bin\next start -p $port -H 127.0.0.1</Arguments>
      <WorkingDirectory>$dossier</WorkingDirectory>
    </Exec>
  </Actions>
</Task>
"@
  Register-ScheduledTask -TaskName $nom -Xml $xml -Force | Out-Null
  $t = Get-ScheduledTask -TaskName $nom
  Write-Host ("{0,-15} etat {1,-8} declencheur au demarrage : {2}" -f $nom, $t.State, [bool]($t.Triggers | Where-Object { $_.CimClass.CimClassName -eq 'MSFT_TaskBootTrigger' }))
}

Enregistrer 'Taplinkr-PG'   'C:\web\sites\taplinkr-pg'   3301 'Taplinkr, premiere copie (port 3301). Caddy la prefere tant qu elle repond.'
Enregistrer 'Taplinkr-PG-B' 'C:\web\sites\taplinkr-pg-b' 3302 'Taplinkr, deuxieme copie (port 3302). Caddy bascule dessus quand la premiere ne repond pas.'
