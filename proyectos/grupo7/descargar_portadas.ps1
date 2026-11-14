param([switch]$Actualizar, [switch]$ActualizarSeleccionadas)
$ErrorActionPreference = 'Continue'
$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$manifest = Join-Path $root 'assets\manifest_portadas.csv'
$destination = Join-Path $root 'assets\portadas'
New-Item -ItemType Directory -Force -Path $destination | Out-Null
# V25: refresca las portadas faltantes solicitadas y mantiene respaldos antes de reemplazar.
# Limpia portadas locales de juegos retirados del catalogo V23 (no toca respaldos).
$retiredGameIds = @('201870','287700','700072','738060','700027','700032','700080')
foreach ($retiredId in $retiredGameIds) {
  Get-ChildItem -Path $destination -Filter ($retiredId + '.*') -File -ErrorAction SilentlyContinue |
    Where-Object { $_.DirectoryName -eq $destination } |
    Remove-Item -Force -ErrorAction SilentlyContinue
}
$rows = Import-Csv -Path $manifest
$refreshIds = @('99999101','911400','13570','33220','235600','319510','332800','354140','388090','700051','700077','99999902','99998802','1599660')
if ($ActualizarSeleccionadas) { $rows = @($rows | Where-Object { $refreshIds -contains [string]$_.id }) }
$ok = 0
$failures = @()

function Normalize-GameName([string]$Value) {
  $normalized = $Value.Normalize([Text.NormalizationForm]::FormD)
  $builder = New-Object System.Text.StringBuilder
  foreach ($character in $normalized.ToCharArray()) {
    $category = [Globalization.CharUnicodeInfo]::GetUnicodeCategory($character)
    if ($category -ne [Globalization.UnicodeCategory]::NonSpacingMark) { [void]$builder.Append($character) }
  }
  return ([regex]::Replace($builder.ToString().ToLowerInvariant(), '[^a-z0-9]', ''))
}

function Test-ValidImageFile([string]$Path) {
  if ([string]::IsNullOrWhiteSpace($Path) -or -not (Test-Path $Path)) { return $false }
  try {
    $item = Get-Item $Path -ErrorAction Stop
    if ($item.Length -le 1200) { return $false }
    $bytes = [IO.File]::ReadAllBytes($Path)
    if ($bytes.Length -lt 16) { return $false }
    $signatureOk = (($bytes[0] -eq 0xFF -and $bytes[1] -eq 0xD8 -and $bytes[2] -eq 0xFF) -or ($bytes[0] -eq 0x89 -and $bytes[1] -eq 0x50 -and $bytes[2] -eq 0x4E -and $bytes[3] -eq 0x47) -or ([Text.Encoding]::ASCII.GetString($bytes,0,4) -eq 'RIFF' -and [Text.Encoding]::ASCII.GetString($bytes,8,4) -eq 'WEBP') -or ([Text.Encoding]::ASCII.GetString($bytes,0,3) -eq 'GIF'))
    if (-not $signatureOk) { return $false }
    Add-Type -AssemblyName System.Drawing -ErrorAction SilentlyContinue
    $image = [System.Drawing.Image]::FromFile($Path)
    try { return ($image.Width -ge 180 -and $image.Height -ge 180 -and $image.Width -le 10000 -and $image.Height -le 10000) } finally { $image.Dispose() }
  } catch { return $false }
  return $false
}

function Resolve-SteamAppId([string]$SearchName) {
  if ([string]::IsNullOrWhiteSpace($SearchName)) { return $null }
  $term = [Uri]::EscapeDataString($SearchName)
  $searchUri = "https://store.steampowered.com/api/storesearch/?term=$term&l=english&cc=US"
  try {
    $result = Invoke-RestMethod -Uri $searchUri -TimeoutSec 20 -Headers @{ 'User-Agent' = 'Mozilla/5.0 MUESTRA-TRIVIA/23.0' }
    $target = Normalize-GameName $SearchName
    foreach ($item in ($result.items | Where-Object { $_.type -eq 'app' })) {
      if ((Normalize-GameName ([string]$item.name)) -eq $target) { return [string]$item.id }
    }
  } catch { }
  return $null
}

Write-Host ''
Write-Host 'MUESTRA INSTITUCIONAL 2026 - DESCARGA DE PORTADAS V25' -ForegroundColor Cyan
Write-Host 'Las portadas se guardan localmente para jugar sin Wi-Fi.' -ForegroundColor Gray
Write-Host 'Las busquedas automaticas solo aceptan coincidencias exactas para evitar caratulas equivocadas.' -ForegroundColor Gray
if ($ActualizarSeleccionadas) { Write-Host 'Modo V25: se renuevan las portadas solicitadas; una descarga nueva solo reemplaza a la anterior si es una imagen valida.' -ForegroundColor Yellow }
$coverFallbackUrls = @{
  '99999902' = @('https://multimedia.bbycastatic.ca/multimedia/products/1500x1500/104/10440/10440780.jpg')
  '99998802' = @('https://gameplay.com.co/cdn/shop/files/AstroPS5.jpg?v=1746201439')
  '1599660' = @('https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1599660/library_600x900.jpg','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1599660/library_600x900.jpg')
}
Write-Host ''
foreach ($row in $rows) {
  $id = [string]$row.id
  $mainUrl = [string]$row.url
  $existingFiles = @(Get-ChildItem -Path $destination -Filter ($id + '.*') -File -ErrorAction SilentlyContinue)
  foreach ($candidate in $existingFiles) {
    if (-not (Test-ValidImageFile $candidate.FullName)) {
      Remove-Item $candidate.FullName -Force -ErrorAction SilentlyContinue
    }
  }
  $existing = Get-ChildItem -Path $destination -Filter ($id + '.*') -File -ErrorAction SilentlyContinue | Where-Object { Test-ValidImageFile $_.FullName } | Select-Object -First 1
  if ($existing -and -not $Actualizar -and -not $ActualizarSeleccionadas -and (Test-ValidImageFile $existing.FullName)) { $ok++; continue }

  $urls = @()
  if ($mainUrl.StartsWith('steam-search:')) {
    $searchName = $mainUrl.Substring('steam-search:'.Length)
    $appId = Resolve-SteamAppId $searchName
    if ($appId) {
      $urls += "https://cdn.akamai.steamstatic.com/steam/apps/$appId/library_600x900.jpg"
      $urls += "https://cdn.akamai.steamstatic.com/steam/apps/$appId/library_600x900_2x.jpg"
      $urls += "https://cdn.akamai.steamstatic.com/steam/apps/$appId/library_600x900.jpg"
      $urls += "https://cdn.akamai.steamstatic.com/steam/apps/$appId/library_600x900_2x.jpg"
      $urls += "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/$appId/library_600x900.jpg"
      $urls += "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/$appId/library_600x900_2x.jpg"
      $urls += "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/$appId/portrait.png"
      $urls += "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/$appId/library_600x900.jpg"
      $urls += "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/$appId/library_600x900_2x.jpg"
      $urls += "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/$appId/portrait.png"
      $urls += "https://cdn.cloudflare.steamstatic.com/steam/apps/$appId/library_600x900.jpg"
      $urls += "https://cdn.cloudflare.steamstatic.com/steam/apps/$appId/library_600x900_2x.jpg"
    }
  } elseif (-not [string]::IsNullOrWhiteSpace($mainUrl)) {
    $urls += $mainUrl
    if ($row.modo -ne 'icon' -and [long]$id -lt 99999000 -and $mainUrl -match 'steam/apps/(\d+)/') {
      $appId = $Matches[1]
      $urls += "https://cdn.akamai.steamstatic.com/steam/apps/$appId/library_600x900.jpg"
      $urls += "https://cdn.akamai.steamstatic.com/steam/apps/$appId/library_600x900_2x.jpg"
      $urls += "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/$appId/library_600x900.jpg"
      $urls += "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/$appId/library_600x900_2x.jpg"
      $urls += "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/$appId/portrait.png"
      $urls += "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/$appId/library_600x900.jpg"
      $urls += "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/$appId/library_600x900_2x.jpg"
      $urls += "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/$appId/portrait.png"
      $urls += "https://cdn.cloudflare.steamstatic.com/steam/apps/$appId/library_600x900.jpg"
      $urls += "https://cdn.cloudflare.steamstatic.com/steam/apps/$appId/library_600x900_2x.jpg"
    }
  }
  if ($id -eq '242550') { $urls += 'https://raymanpc.com/wiki/script-en/images/f/f6/Rayman_Legends_Box_Art.jpg' }
  if ($id -eq '2280') { $urls += 'https://images.launchbox-app.com/c9b5ca69-2515-4c4b-a90d-18ac0c5bca11.jpg' }
  if ($id -eq '207490') { $urls += 'https://images.launchbox-app.com/d47866df-92d3-4690-b819-23d80b5d3b71.jpg' }
  if ($id -eq '15100') { $urls += 'https://images.launchbox-app.com/2055f844-6016-4884-9369-d1e0ae139239.jpg' }
  if ($coverFallbackUrls.ContainsKey($id)) { $urls += $coverFallbackUrls[$id] }

  $downloaded = $false
  foreach ($url in ($urls | Select-Object -Unique)) {
    $temp = Join-Path $destination ($id + '.download')
    for ($attempt = 1; $attempt -le 2 -and -not $downloaded; $attempt++) {
      try {
        Invoke-WebRequest -Uri $url -OutFile $temp -UseBasicParsing -TimeoutSec 30 -Headers @{ 'User-Agent'='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36'; 'Accept'='image/avif,image/webp,image/apng,image/*,*/*;q=0.8' } -ErrorAction Stop
        $file = Get-Item $temp
        if ($file.Length -gt 1200) {
          $bytes = [IO.File]::ReadAllBytes($temp)
          $detectedExt = $null
          if ($bytes.Length -gt 12 -and $bytes[0] -eq 0xFF -and $bytes[1] -eq 0xD8) { $detectedExt = '.jpg' }
          elseif ($bytes.Length -gt 12 -and $bytes[0] -eq 0x89 -and $bytes[1] -eq 0x50 -and $bytes[2] -eq 0x4E -and $bytes[3] -eq 0x47) { $detectedExt = '.png' }
          elseif ($bytes.Length -gt 12 -and [Text.Encoding]::ASCII.GetString($bytes,0,4) -eq 'RIFF' -and [Text.Encoding]::ASCII.GetString($bytes,8,4) -eq 'WEBP') { $detectedExt = '.webp' }
          elseif ($bytes.Length -gt 12 -and [Text.Encoding]::ASCII.GetString($bytes,0,3) -eq 'GIF') { $detectedExt = '.gif' }
          if ($detectedExt -and (Test-ValidImageFile $temp)) {
            $finalTarget = Join-Path $destination ($id + $detectedExt)
            # Respalda la caratula anterior antes de reemplazarla; no pisa el respaldo en futuras ejecuciones.
            if ($existing -and (Test-Path $existing.FullName)) {
              $downloadBackupDir = Join-Path $destination 'originales_descarga_v25'
              New-Item -ItemType Directory -Force -Path $downloadBackupDir | Out-Null
              $downloadBackup = Join-Path $downloadBackupDir $existing.Name
              if (-not (Test-Path $downloadBackup)) { Copy-Item $existing.FullName $downloadBackup -Force -ErrorAction Stop }
            }
            # Solo reemplaza tras confirmar cabecera, decodificacion y dimensiones minimas.
            Move-Item $temp $finalTarget -Force -ErrorAction Stop
            if ($existing -and (Test-Path $existing.FullName) -and ($existing.FullName -ne $finalTarget)) {
              Remove-Item $existing.FullName -Force -ErrorAction SilentlyContinue
            }
            $downloaded = $true
            break
          }
        }
      } catch { }
      if (Test-Path $temp) { Remove-Item $temp -Force -ErrorAction SilentlyContinue }
      if (-not $downloaded -and $attempt -eq 1) { Start-Sleep -Milliseconds 700 }
    }
  }
  if ($downloaded) {
    $ok++
    Write-Host ("OK   {0} - {1}" -f $id, $row.nombre) -ForegroundColor Green
  } else {
    $failures += ("{0} - {1} - {2}" -f $id, $row.nombre, $mainUrl)
    if ($existing) { Write-Host ("NO ACTUALIZADA (se conserva la anterior): {0} - {1}" -f $id, $row.nombre) -ForegroundColor Yellow }
    else { Write-Host ("FALTA {0} - {1}" -f $id, $row.nombre) -ForegroundColor Yellow }
  }
}
$reportName = if ($ActualizarSeleccionadas) { 'portadas_actualizacion_pendiente_v25.txt' } else { 'portadas_pendientes.txt' }
$report = Join-Path $destination $reportName
if ($failures.Count -gt 0) { $failures | Set-Content -Path $report -Encoding UTF8 }
elseif (Test-Path $report) { Remove-Item $report -Force }
Write-Host ''
Write-Host ("Resultado: {0} de {1} portadas descargadas." -f $ok, $rows.Count) -ForegroundColor Cyan
if ($failures.Count -gt 0) { Write-Host ("Hay {0} pendientes. Revisa assets\portadas\{1}." -f $failures.Count, $reportName) -ForegroundColor Yellow }
else { Write-Host 'Catalogo completo. El juego ya puede funcionar sin Wi-Fi.' -ForegroundColor Green }
Write-Host ''
Read-Host 'Presiona Enter para cerrar'
