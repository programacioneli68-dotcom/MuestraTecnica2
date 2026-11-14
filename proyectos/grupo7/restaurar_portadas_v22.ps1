param([switch]$Forzar)
$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$coverDir = Join-Path $root 'assets\portadas'
$backupV20 = Join-Path $coverDir 'originales_v20'
$backupV21 = Join-Path $coverDir 'originales_v21'
$backupDL = Join-Path $coverDir 'originales_descarga_v21'
$csvPath = Join-Path $root 'assets\ajustes_portadas_v21.csv'
if (-not (Test-Path $csvPath)) { Write-Host 'No se encontro el listado de portadas V21.' -ForegroundColor Red; exit 1 }
New-Item -ItemType Directory -Force -Path $coverDir | Out-Null
$targets = Import-Csv -Path $csvPath
$restored = 0; $missing = @(); $untouched = 0
function Find-Original([string]$Folder,[string]$Id) {
  if (-not (Test-Path $Folder)) { return $null }
  foreach ($ext in @('jpg','jpeg','png','bmp','gif','webp')) {
    $candidate = Join-Path $Folder ($Id+'.'+$ext)
    if (Test-Path $candidate) { return $candidate }
  }
  return $null
}
foreach ($row in $targets) {
  $id = [string]$row.id
  if ([double]$row.recorte_superior_porcentaje -eq 0 -and [double]$row.recorte_inferior_porcentaje -eq 0) { $untouched++; continue }
  $marker = Join-Path $coverDir ($id+'.v21-ok')
  $live = $null
  foreach ($ext in @('jpg','jpeg','png','bmp','gif','webp')) { $p=Join-Path $coverDir ($id+'.'+$ext); if(Test-Path $p){$live=$p;break} }
  if (-not $live) { $missing += "$id - $($row.juego) - no hay portada local"; continue }
  $original = Find-Original $backupV20 $id
  if (-not $original) { $original = Find-Original $backupV21 $id }
  if (-not $original -and $Forzar) { $original = Find-Original $backupDL $id }
  if (-not $original) {
    if (Test-Path $marker) { $missing += "$id - $($row.juego) - falta respaldo original; no se toca la portada" }
    else { $untouched++ }
    continue
  }
  try {
    $ext = [IO.Path]::GetExtension($original)
    $target = Join-Path $coverDir ($id+$ext)
    Copy-Item $original $target -Force -ErrorAction Stop
    Get-ChildItem $coverDir -Filter ($id+'.*') -File | Where-Object { $_.FullName -ne $target -and $_.Name -notmatch '\.v21-ok$' } | Remove-Item -Force -ErrorAction SilentlyContinue
    if (Test-Path $marker) { Remove-Item $marker -Force -ErrorAction SilentlyContinue }
    $restored++
    Write-Host "RESTAURADA: $id - $($row.juego)" -ForegroundColor Green
  } catch { $missing += "$id - $($row.juego) - $($_.Exception.Message)" }
}
$report = @("PORTADAS RESTAURADAS: $restored", "Sin cambio: $untouched", '', 'PENDIENTES:') + $missing
$report | Set-Content -Path (Join-Path $coverDir 'restauracion_portadas_v22.txt') -Encoding UTF8
Write-Host "`nRestauracion V22: $restored restauradas; $($missing.Count) pendientes; $untouched sin recorte." -ForegroundColor Cyan
if ($missing.Count -gt 0) { Write-Host 'Las pendientes se conservan intactas; no se inventan originales.' -ForegroundColor Yellow }
