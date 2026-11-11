# Telecharge la base gratuite DB-IP "City Lite" (pays + ville par adresse IP)
# et la pose dans C:\web\data\geoip\dbip-city-lite.mmdb.
# Taplinkr la lit au demarrage : la nouvelle version sert apres la prochaine
# mise en ligne ou le prochain redemarrage.
# Licence CC BY 4.0 : "IP Geolocation by DB-IP" (https://db-ip.com).
# Fichier 100 % ASCII (PowerShell 5 lit mal l'UTF-8 sans BOM).

$ErrorActionPreference = 'Stop'
$dossier = 'C:\web\data\geoip'
$cible = Join-Path $dossier 'dbip-city-lite.mmdb'
New-Item -ItemType Directory -Force -Path $dossier | Out-Null

# La base du mois est publiee le 1er ; en cas d'absence on prend le mois d'avant.
$mois = @((Get-Date).ToString('yyyy-MM'), (Get-Date).AddMonths(-1).ToString('yyyy-MM'))
$gz = Join-Path $dossier 'telechargement.mmdb.gz'
$tmp = Join-Path $dossier 'telechargement.mmdb'
$ok = $false
foreach ($m in $mois) {
  $url = "https://download.db-ip.com/free/dbip-city-lite-$m.mmdb.gz"
  & curl.exe -s -f -o $gz $url
  if ($LASTEXITCODE -eq 0) { $ok = $true; Write-Host "Telecharge : $url"; break }
}
if (-not $ok) { throw 'Aucune base DB-IP telechargeable.' }

$entree = [System.IO.File]::OpenRead($gz)
$sortie = [System.IO.File]::Create($tmp)
try {
  $flux = New-Object System.IO.Compression.GZipStream($entree, [System.IO.Compression.CompressionMode]::Decompress)
  $flux.CopyTo($sortie)
} finally {
  $sortie.Close()
  $entree.Close()
}
Remove-Item $gz

# Garde-fou : une base complete pese plus de 50 Mo.
$taille = (Get-Item $tmp).Length
if ($taille -lt 50MB) { Remove-Item $tmp; throw "Base trop petite ($taille octets), on garde l'ancienne." }

Move-Item -Force $tmp $cible
Write-Host ("Base posee : {0} ({1} Mo)" -f $cible, [int]($taille / 1MB))
