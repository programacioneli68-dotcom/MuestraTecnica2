<?php
$manifest = __DIR__ . '/assets/manifest_portadas.csv';
$rows = array_map('str_getcsv', file($manifest));
$headers = array_shift($rows);
$items = [];
foreach ($rows as $row) {
  if (count($row) < 5) continue;
  $id = $row[0]; $name = $row[1];
  $found = null;
  foreach (['jpg','jpeg','png','webp','gif'] as $ext) {
    $path = __DIR__ . '/assets/portadas/' . $id . '.' . $ext;
    if (is_file($path) && filesize($path) > 1200 && @getimagesize($path) !== false) { $found = $ext; break; }
  }
  $items[] = ['id'=>$id,'name'=>$name,'found'=>$found];
}
$ready = count(array_filter($items, fn($x)=>$x['found'] !== null));
$downloadScript = @file_get_contents(__DIR__ . '/descargar_siluetas.ps1') ?: '';
preg_match_all("/@\{ Id='([^']+)'/", $downloadScript, $matches);
$catalogIds = array_values(array_unique($matches[1] ?? []));
$downloadSourceCount = count($catalogIds);
$availableCharacters = 0;
foreach ($catalogIds as $characterId) {
  $blackFile = __DIR__ . '/assets/siluetas/generated/' . $characterId . '.png';
  $colorFile = __DIR__ . '/assets/siluetas/color/' . $characterId . '.png';
  $blackOk = is_file($blackFile) && filesize($blackFile) > 1500 && @getimagesize($blackFile) !== false;
  $colorOk = is_file($colorFile) && filesize($colorFile) > 1500 && @getimagesize($colorFile) !== false;
  if ($blackOk && $colorOk) $availableCharacters++;
}
$pacmanBlack = __DIR__ . '/assets/siluetas/generated/pacman.png';
$pacmanColor = __DIR__ . '/assets/siluetas/color/pacman.png';
$pacmanReady = is_file($pacmanBlack) && is_file($pacmanColor) && @getimagesize($pacmanBlack) !== false && @getimagesize($pacmanColor) !== false;
$totalCharacters = $downloadSourceCount + 1;
if ($pacmanReady) $availableCharacters++;
$requiredCharacters = ['leon-kennedy'=>'Leon S. Kennedy','sackboy'=>'Sackboy','john-marston'=>'John Marston'];
$requiredGames = ['99999902'=>'The Legend of Zelda: Breath of the Wild','99998802'=>'Astro Bot','1599660'=>'Sackboy: A Big Adventure'];
$requiredResourceStatus = [];
foreach ($requiredCharacters as $rid=>$label) {
  $blackFile = __DIR__ . '/assets/siluetas/generated/' . $rid . '.png';
  $colorFile = __DIR__ . '/assets/siluetas/color/' . $rid . '.png';
  $ok = is_file($blackFile) && is_file($colorFile) && filesize($blackFile)>1500 && filesize($colorFile)>1500 && @getimagesize($blackFile)!==false && @getimagesize($colorFile)!==false;
  $requiredResourceStatus[] = ['label'=>$label . ' (silueta)','ok'=>$ok];
}
foreach ($requiredGames as $rid=>$label) {
  $ok = false;
  foreach (['jpg','jpeg','png','webp','gif'] as $ext) {
    $cover = __DIR__ . '/assets/portadas/' . $rid . '.' . $ext;
    if (is_file($cover) && filesize($cover)>1200 && @getimagesize($cover)!==false) { $ok=true; break; }
  }
  $requiredResourceStatus[] = ['label'=>$label . ' (portada)','ok'=>$ok];
}
?>
<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Verificar recursos - Muestra Institucional 2026</title>
<style>body{margin:0;background:#0b0d1b;color:#eef;font:14px Consolas,monospace;padding:28px}main{max-width:920px;margin:auto;border:1px solid #655ba0;padding:24px;background:#12162b}h1{color:#5ce1e6}strong{color:#ffce69}.list{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:7px}.item{padding:8px;border:1px solid #34395a}.ok{color:#61e6a7}.bad{color:#ff7188}.muted{color:#aab2cf}.notice{padding:12px;border:1px solid #655ba0;background:#191e38;line-height:1.65}</style><main>
<h1>MUESTRA INSTITUCIONAL 2026 // RECURSOS</h1>
<h2><strong><?= $ready ?> / <?= count($items) ?></strong> portadas descargadas</h2>
<p class="muted">Las portadas se guardan localmente. Para iniciar Portadas bastan cuatro archivos validos y solo se usan los juegos que tienen una imagen correcta.</p>
<div class="list"><?php foreach($items as $item): ?><div class="item"><span class="<?= $item['found'] ? 'ok' : 'bad' ?>"><?= $item['found'] ? 'OK' : 'FALTA' ?></span> · <?= htmlspecialchars($item['name'], ENT_QUOTES, 'UTF-8') ?></div><?php endforeach; ?></div>
<p><strong>Umbral para Portadas:</strong> 4 caratulas validas.</p>
<h2><strong><?= (int)$availableCharacters ?> / <?= (int)$totalCharacters ?></strong> personajes listos</h2>
<h2>Recursos solicitados en V25</h2><div class="list"><?php foreach($requiredResourceStatus as $required): ?><div class="item"><span class="<?= $required['ok'] ? 'ok' : 'bad' ?>"><?= $required['ok'] ? 'OK' : 'FALTA' ?></span> · <?= htmlspecialchars($required['label'], ENT_QUOTES, 'UTF-8') ?></div><?php endforeach; ?></div>
<p class="muted">Catálogo de personajes V25: <?= (int)$totalCharacters ?> configurados (<?= (int)$downloadSourceCount ?> fuentes descargables + Pac-Man local). Solo se cuentan los pares de PNG validos que existen en las carpetas de siluetas y color.</p>
<div class="notice"><strong>Para iniciar Siluetas:</strong> se necesitan 20 personajes listos, porque la partida tiene 20 rondas sin repetir. Ejecuta <strong>descargar_siluetas.bat</strong> con Internet y revisa <strong>assets/siluetas/siluetas_pendientes.txt</strong> si falta alguno.</div>
<p>Los renders originales se guardan en <strong>assets/siluetas/originales</strong>, las siluetas en <strong>assets/siluetas/generated</strong> y las versiones a color en <strong>assets/siluetas/color</strong>.</p>
<p><strong>Portadas:</strong> como ya tenes tus 400 imagenes descargadas, no ejecutes de nuevo el descargador para esta correccion. Usa <strong>ajustar_portadas_v20.bat</strong> para recortar las bandas de consola y los bordes de los juegos seleccionados. El proceso crea copias de seguridad antes de modificar nada.</p>
<p class="muted">Las siluetas se generan a partir de la transparencia de cada render; no se rellenan huecos ni se unen extremidades. Los PNG locales permiten jugar sin Wi-Fi una vez descargados. Apache y MySQL deben seguir iniciados desde XAMPP.</p>
</main></html>
