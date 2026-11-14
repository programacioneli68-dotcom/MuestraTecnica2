# MUESTRA INSTITUCIONAL 2026 - genera siluetas fieles de renders originales (V25).
# Ejecutar una vez con Internet; el juego despues usa PNG locales y no necesita Wi-Fi.
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$sourceDir = Join-Path $root 'assets\siluetas\originales'
$outputDir = Join-Path $root 'assets\siluetas\generated'
$colorDir = Join-Path $root 'assets\siluetas\color'
New-Item -ItemType Directory -Force -Path $sourceDir | Out-Null
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
New-Item -ItemType Directory -Force -Path $colorDir | Out-Null
# Limpia personajes retirados del catalogo para que no queden PNG obsoletos.
foreach ($legacyId in @('goku','naruto','minecraft-chicken','minecraft-cow','minecraft-enderman','minecraft-pig','minecraft-sheep','minecraft-skeleton','minecraft-villager','minecraft-wolf','minecraft-zombie','birdo')) {
  foreach ($dir in @($sourceDir,$outputDir,$colorDir)) {
    Get-ChildItem -Path $dir -Filter ($legacyId + '.*') -File -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
  }
}
# Limpia los Pokemon retirados del catalogo; se conservan solo cuatro extras (Pikachu tiene ID propio).
$keepPokemonIds = @('pokemon-charizard','pokemon-gengar','pokemon-eevee','pokemon-lucario')
foreach ($dir in @($sourceDir,$outputDir,$colorDir)) {
  Get-ChildItem -Path $dir -Filter 'pokemon-*.*' -File -ErrorAction SilentlyContinue | Where-Object {
    $base = [IO.Path]::GetFileNameWithoutExtension($_.Name)
    $keepPokemonIds -notcontains $base
  } | Remove-Item -Force -ErrorAction SilentlyContinue
}

# Se sustituyen fuentes JPG antiguas por PNG cuando corresponde.
foreach ($legacySource in @('creeper.jpg','wario.jpg','batman.jpg')) {
  $old = Join-Path $sourceDir $legacySource
  if (Test-Path $old) { Remove-Item $old -Force -ErrorAction SilentlyContinue }
}

$assets = @(
  @{ Id='mario'; Ext='png'; Url='https://www.pngkey.com/png/detail/218-2189527_mariostanding-super-mario.png'; Page='https://www.pngkey.com/detail/u2w7e6y3y3e6u2u2_mariostanding-super-mario/'; FallbackUrl='https://pngimg.com/uploads/mario/mario_PNG124.png'; FallbackPage='https://pngimg.com/image/30595'; RefreshV20=$true },
  @{ Id='sonic'; Ext='png'; Url='https://toppng.com/uploads/preview/sonic-the-hedgehog-is-the-main-hero-of-the-story-sonic-the-hedgehog-sonic-11563225856ro57ihhgsq.png'; Page='https://toppng.com/free-image/sonic-the-hedgehog-is-the-main-hero-of-the-story-sonic-the-hedgehog-sonic-PNG-free-PNG-Images_222332' },
  @{ Id='crash'; Ext='png'; Url='https://www.pngfind.com/pngs/m/245-2457841_the-most-iconic-playstation-game-characters-crash-bandicoot.png'; Page='https://www.pngfind.com/mpng/ihRmRRw_the-most-iconic-playstation-game-characters-crash-bandicoot/' },
  @{ Id='nathan'; Ext='jpg'; Url='https://img.favpng.com/10/17/11/uncharted-drake-s-fortune-uncharted-2-among-thieves-uncharted-4-a-thief-s-end-uncharted-the-nathan-drake-collection-playstation-all-stars-battle-royale-png-favpng-9AC7qrtTpjk9x6177qD8NiAyb.jpg'; Page='https://favpng.com/png_view/uncharted-uncharted-drakes-fortune-uncharted-2-among-thieves-uncharted-4-a-thiefs-end-uncharted-the-nathan-drake-collection-playstation-all-stars-battle-royale-png/wLrDLq5G' },
  @{ Id='lara'; Ext='png'; Url='https://www.pngfind.com/pngs/m/67-678189_tomb-raider-lara-croft-render-hd-png-download.png'; Page='https://www.pngfind.com/mpng/bRoibJ_tomb-raider-lara-croft-render-hd-png-download/' },
  @{ Id='kratos'; Ext='jpg'; Url='https://cdn.imgbin.com/22/7/20/imgbin-god-of-war-iii-god-of-war-ghost-of-sparta-playstation-4-god-god-of-war-kratos-e6eHfkvc9FFtHDQBHi6dw0PNm.jpg'; Page='https://imgbin.com/png/pnUkZ1cb/god-of-war-iii-god-of-war-ghost-of-sparta-playstation-4-png' },
  @{ Id='chief'; Ext='png'; Url='https://www.pngfind.com/pngs/m/267-2674425_mjolnir-powered-assault-armor-mark-v-halo-anniversary.png'; Page='https://www.pngfind.com/mpng/ihwmxbo_mjolnir-powered-assault-armor-mark-v-halo-anniversary/' },
  @{ Id='batman'; Ext='png'; Url='https://purepng.com/public/uploads/large/purepng.com-batman-arkham-knightbatmansuperherocomicdc-comicsbob-kanebat-manbruce-wayne-1701528525529cgpia.png'; Page='https://purepng.com/photo/26162/render-batman-arkham-knight'; RefreshV24=$true },
  @{ Id='link'; Ext='jpg'; Url='https://img.favpng.com/18/14/2/the-legend-of-zelda-twilight-princess-link-princess-zelda-the-legend-of-zelda-skyward-sword-the-legend-of-zelda-the-minish-cap-png-favpng-34CTfT21GZbJ96kZ14zf8aBeP.jpg'; Page='https://favpng.com/png_view/west-link-the-legend-of-zelda-twilight-princess-link-princess-zelda-the-legend-of-zelda-skyward-sword-the-legend-of-zelda-the-minish-cap-png/6URkufqG' },
  @{ Id='pikachu'; Ext='png'; Url='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png'; Page='https://github.com/PokeAPI/sprites'; RefreshV20=$true },
  @{ Id='scorpion'; Ext='png'; Url='https://toppng.com/public/uploads/preview/mkx-scorpion-scorpion-mortal-kombat-x-11563623809fm5svacu3o.png'; Page='https://toppng.com/show_download/284153/mkx-scorpion-scorpion-mortal-kombat-x' },
  @{ Id='snake'; Ext='jpg'; Url='https://img.favpng.com/11/8/8/super-smash-bros-brawl-metal-gear-solid-4-guns-of-the-patriots-metal-gear-solid-the-twin-snakes-metal-gear-2-solid-snake-png-favpng-MSVSvsta37KdTs6Sw4CdA9c5w.jpg'; Page='https://favpng.com/png_view/metal-gear-super-smash-bros-brawl-metal-gear-solid-4-guns-of-the-patriots-metal-gear-solid-the-twin-snakes-metal-gear-2-solid-snake-png/qY3C7huT' },
  @{ Id='samus'; Ext='png'; Url='https://toppng.com/public/uploads/preview/metroid-prime-samus-png-samus-aran-metroid-prime-2-echoes-115629994573wxhaamhvh.png'; Page='https://toppng.com/show_download/190140/metroid-prime-samus-png-samus-aran-metroid-prime-2-echoes' },
  @{ Id='doomslayer'; Ext='png'; Url='https://image.pngaaa.com/577/2973577-middle.png'; Page='https://www.pngaaa.com/detail/2973577' },
  @{ Id='sackboy'; Ext='jpg'; Url='https://p7.hiclipart.com/preview/289/479/722/playstation-all-stars-battle-royale-littlebigplanet-playstation-3-xbox-360-sackboy.jpg'; Page='https://www.hiclipart.com/free-transparent-background-png-clipart-grspg'; FallbackUrl='https://image.api.playstation.com/vulcan/img/rnd/202011/0518/CwIxjYXY4rCRSCu01MMwjjL2.png'; FallbackPage='https://www.playstation.com/en-us/games/littlebigplanet-3/'; RefreshV25=$true },
  @{ Id='ratchet'; Ext='jpg'; Url='https://cdn.imgbin.com/16/11/8/imgbin-ratchet-clank-future-tools-of-destruction-ratchet-clank-size-matters-ratchet-deadlocked-ratchet-clank-all-4-one-ratchet-clank-0vs9seEL68a0ctEHzCQXehmdF.jpg'; Page='https://imgbin.com/png/NnTAGJku/ratchet-amp-clank-future-tools-of-destruction-ratchet-amp-clank-size-matters-ratchet-deadlocked-ratchet-amp-clank-all-4-one-png' },
  @{ Id='kirby'; Ext='png'; Url='https://www.clipartmax.com/png/middle/94-946193_picture-from-here-kirby-return-to-dreamland-kirby.png'; Page='https://www.clipartmax.com/middle/m2i8Z5K9K9G6d3H7_picture-from-here-kirby-return-to-dreamland-kirby/' },
  @{ Id='luigi'; Ext='png'; Url='https://www.pngfind.com/pngs/m/181-1817026_700-x-1000-1-super-mario-party-characters.png'; Page='https://www.pngfind.com/pngs/m/181-1817026_700-x-1000-1-super-mario-party-characters/' },
  @{ Id='yoshi'; Ext='png'; Url='https://www.clipartmax.com/png/middle/116-1164720_when-fighting-yoshi-you-may-find-yourself-being-eaten-yoshi-mario.png'; Page='https://www.clipartmax.com/'; RefreshV22=$true },
  @{ Id='donkey-kong'; Ext='png'; Url='https://image.pngaaa.com/152/1764152-middle.png'; Page='https://www.pngaaa.com/detail/1764152' },
  @{ Id='tails'; Ext='png'; Url='https://www.pngfind.com/pngs/m/110-1106368_tails-png-miles-tails-prower-transparent-png.png'; Page='https://www.pngfind.com/'; RefreshV22=$true },
  @{ Id='knuckles'; Ext='jpg'; Url='https://clipground.com/images/sonic-knuckles-png-1.jpg'; Page='https://clipground.com/sonic-knuckles-png.html'; RefreshV22=$true },
  @{ Id='shadow'; Ext='png'; Url='https://www.clipartmax.com/png/middle/256-2561094_newer-shadow-render-by-jaysonjeanchannel-sonic-the-hedgehog.png'; Page='https://www.clipartmax.com/middle/m2H7K9b1A0A0H7K9_newer-shadow-render-by-jaysonjeanchannel-sonic-the-hedgehog/' },
  @{ Id='ezio'; Ext='png'; Url='https://www.kindpng.com/picc/m/544-5445771_ezio-ac2-render-ezio-auditore-hd-png-download.png'; Page='https://www.kindpng.com/picc/m/544-5445771_ezio-ac2-render-ezio-auditore-hd-png-download.png'; RefreshV22=$true },
  @{ Id='cloud'; Ext='png'; Url='https://www.vhv.rs/dpng/d/414-4149699_cloud-strife-png-png-download-cloud-strife-png.png'; Page='https://www.vhv.rs/viewpic/hTwwwRR_cloud-strife-png-png-download-cloud-strife-png/' },
  @{ Id='dante'; Ext='png'; Url='https://www.kindpng.com/picc/m/303-3035025_dmc-5-dante-outfit-hd-png-download.png'; Page='https://www.kindpng.com/imgv/iwoobho_dmc-5-dante-outfit-hd-png-download/' },
  @{ Id='vergil'; Ext='png'; Url='https://image.pngaaa.com/256/131256-middle.png'; Page='https://www.pngaaa.com/detail/131256' },
  @{ Id='ryu'; Ext='png'; Url='https://www.vhv.rs/dpng/d/26-261937_street-fighter-ryu-hd-png-download.png'; Page='https://www.vhv.rs/'; RefreshV20=$true },
  @{ Id='sub-zero'; Ext='png'; Url='https://image.pngaaa.com/491/405491-middle.png'; Page='https://www.pngaaa.com/detail/405491' },
  @{ Id='wario'; Ext='png'; Url='https://image.pngaaa.com/481/219481-middle.png'; Page='https://www.pngaaa.com/detail/219481'; RefreshV20=$true },
  @{ Id='diddy-kong'; Ext='png'; Url='https://toppng.com/public/uploads/preview/donkey-kong-transparent-image-super-mario-diddy-ko-11563639835cradmrwvn3.png'; Page='https://toppng.com/show_download/285317/donkey-kong-transparent-image-super-mario-diddy-ko' },
  @{ Id='sora'; Ext='png'; Url='https://toppng.com/uploads/preview/tetsuya-nomura-kingdom-hearts-art-11549908678sh2rcjlebz.png'; Page='https://toppng.com/free-image/tetsuya-nomura-kingdom-hearts-art-PNG-free-PNG-Images_88044' },
  @{ Id='tifa'; Ext='png'; Url='https://www.vhv.rs/dpng/d/591-5919492_tifa-ff7-remake-render-hd-png-download.png'; Page='https://www.vhv.rs/viewpic/ThxRmwh_tifa-ff7-remake-render-hd-png-download/' },
  @{ Id='mega-man'; Ext='png'; Url='https://www.realclipart.com/png/middle/146-1465948_mega-man-x-official-complete-works.png'; Page='https://www.realclipart.com/'; RefreshV20=$true },
  @{ Id='spyro'; Ext='png'; Url='https://www.vhv.rs/dpng/d/451-4515801_spyro-reignited-trilogy-png-transparent-png.png'; Page='https://www.vhv.rs/viewpic/hoJbTRo_spyro-reignited-trilogy-png-transparent-png/' },
  @{ Id='gordon'; Ext='png'; Url='https://www.vhv.rs/dpng/d/59-595022_gordon-freeman-hd-model-hd-png-download.png'; Page='https://www.vhv.rs/'; RefreshV20=$true },
  @{ Id='jin'; Ext='png'; Url='https://www.kindpng.com/picc/m/167-1674423_tekken-7-render-by-yuki-jin-kazama-tekken.png'; Page='https://www.kindpng.com/imgv/iRmoJbJ_tekken-7-render-by-yuki-jin-kazama-tekken/' },
  @{ Id='waluigi'; Ext='png'; Url='https://image.pngaaa.com/623/48623-middle.png'; Page='https://www.pngaaa.com/detail/48623'; FallbackUrl='https://image.pngaaa.com/631/48631-middle.png'; FallbackPage='https://www.pngaaa.com/detail/48631'; RefreshV20=$true },
  @{ Id='aloy'; Ext='png'; Url='https://image.pngaaa.com/913/4616913-middle.png'; Page='https://www.pngaaa.com/detail/4616913'; RefreshV22=$true },
  @{ Id='bowser'; Ext='png'; Url='https://image.pngaaa.com/431/746431-middle.png'; Page='https://www.pngaaa.com/detail/746431' },
  @{ Id='princess-peach'; Ext='jpg'; Url='https://i.pinimg.com/736x/18/d7/a3/18d7a384f46a31572c2ad4fc4ea7058d.jpg'; Page='https://www.pinterest.com/pin/find-hd-mario-images-princess-peach-hd-wallpaper-and-background-peach-super-smash-bros-hd-png-download-t--802555596089804963/' },
  @{ Id='dr-eggman'; Ext='png'; Url='https://toppng.com/public/uploads/preview/dr-eggman-2018-render-by-doctor-eggma-11563157231s6aam9yvol.png'; Page='https://toppng.com/show_download/211187/dr-eggman-2018-render-by-doctor-eggma'; RefreshV20=$true },
  @{ Id='altair'; Ext='png'; Url='https://www.vhv.rs/dpng/d/504-5043032_assassins-creed-altair-hd-png-download.png'; Page='https://www.vhv.rs/viewpic/altair-assassins-creed/' },
  @{ Id='edward'; Ext='png'; Url='https://image.pngaaa.com/216/435216-middle.png'; Page='https://www.pngaaa.com/detail/435216'; RefreshV20=$true },
  @{ Id='leon-kennedy'; Ext='jpg'; Url='https://p1.hiclipart.com/preview/755/655/651/leon-2-re4-professional-render-png-clipart.jpg'; Page='https://www.hiclipart.com/free-transparent-background-png-clipart-vapgn'; RefreshV25=$true },
  @{ Id='chun-li'; Ext='png'; Url='https://toppng.com/uploads/preview/chun-li-street-fighter-chun-li-115629275940p91wbvotz.png'; Page='https://toppng.com/free-image/chun-li-street-fighter-PNG-free-PNG-Images_252817'; RefreshV22=$true },
  @{ Id='shovel-knight'; Ext='png'; Url='https://image.pngaaa.com/156/4221156-middle.png'; Page='https://www.pngaaa.com/detail/4221156' },
  @{ Id='hollow-knight'; Ext='png'; Url='https://www.vhv.rs/dpng/d/12-121066_hollow-knight-main-character-hd-png-download.png'; Page='https://www.vhv.rs/viewpic/hollow-knight/' },
  @{ Id='cuphead'; Ext='png'; Url='https://wallpapers.com/images/hd/cuphead-character-pose-c9mc7psc4eofc340.png'; Page='https://wallpapers.com/png/cuphead-character-pose-c9mc7psc4eofc340.html'; RefreshV22=$true },
  @{ Id='steve'; Ext='png'; Url='https://skinrender.dev/render/steve/body.png?size=512&bg=transparent'; Page='https://skinrender.dev/docs/'; FallbackUrl='https://www.pngkey.com/png/detail/10-101999_minecraft-steve-3d-png.png'; FallbackPage='https://www.pngkey.com/detail/u2q8a9e6t4w7e6y3_minecraft-steve-3d-png/'; FallbackUrls=@(@{Url='https://skinrender.dev/render/steve/body?size=512&bg=transparent';Page='https://skinrender.dev/docs/'}); RefreshV22=$true },
  @{ Id='daisy'; Ext='png'; Url='https://freepngimg.com/save/114802-mario-super-princess-bros-daisy/840x859'; Page='https://freepngimg.com/png/114802-mario-super-princess-bros-daisy/download' },
  @{ Id='toad'; Ext='png'; Url='https://freepngimg.com/save/114826-toad-mario-super-bros-photos/860x1142'; Page='https://freepngimg.com/png/114826-toad-mario-super-bros-photos' },
  @{ Id='trish'; Ext='png'; Url='https://image.pngaaa.com/789/89789-middle.png'; Page='https://www.pngaaa.com/detail/89789' },
  @{ Id='nero'; Ext='png'; Url='https://image.pngaaa.com/646/6638646-middle.png'; Page='https://www.pngaaa.com/detail/6638646'; FallbackUrl='https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/f6b0bf93-bf66-4551-8b9b-b723ee634429/dce27xb-6e3151c4-454d-4070-846c-b683cda93245.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi9mNmIwYmY5My1iZjY2LTQ1NTEtOGI5Yi1iNzIzZWU2MzQ0MjkvZGNlMjd4Yi02ZTMxNWM0LTQ1NGQtNDA3MC04NDZjLWI2ODNjZGE5MzI0NS5wbmcifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6ZmlsZS5kb3dubG9hZCJdfQ.LT_VCDSbF-ZmZV-k5vTw9R_6Lnl08_Cia0rKgBJwp4k'; FallbackPage='https://www.deviantart.com/vigoord/art/Devil-May-Cry-5-Nero-Render-PNG-749212319'; RefreshV20=$true },
  @{ Id='jetstream-sam'; Ext='png'; Url='https://origin.giantbomb.com/a/uploads/scale_medium/3/34651/3405972-2samrising.png'; Page='https://www.giantbomb.com/samuel-rodrigues/3005-24520/' },
  @{ Id='jill-valentine'; Ext='png'; Url='https://pngset.com/images/https-static-tvtropes-remake-jill-valentine-jill-valentine-resident-evil-3-remake-person-human-brace-gun-transparent-png-246234.png'; Page='https://pngset.com/download-free-png-knpbh' },
  @{ Id='chris-redfield'; Ext='jpg'; Url='https://cdn.imgbin.com/1/18/12/imgbin-resident-evil-6-resident-evil-7-biohazard-chris-redfield-claire-redfield-resident-evil-the-mercenaries-3d-resident-evil-2YY66FA68cxVPRERhBih1aMPq.jpg'; Page='https://imgbin.com/png/VrAsBuXJ/resident-evil-6-resident-evil-7-biohazard-chris-redfield-claire-redfield-resident-evil-the-mercenaries-3d-png' },
  @{ Id='nemesis'; Ext='png'; Url='https://image.pngaaa.com/400/2701400-middle.png'; Page='https://www.pngaaa.com/detail/2701400'; FallbackUrl='https://www.vhv.rs/dpng/d/554-5549443_nemesis-nemesis-re3-hd-png-download.png'; FallbackPage='https://www.vhv.rs/'; RefreshV20=$true },
  @{ Id='raiden-mk'; Ext='png'; Url='https://www.pngfind.com/pngs/m/141-1410118_click-renders-for-a-higher-resolution-version-raiden.png'; Page='https://www.pngfind.com/mpng/Jbmxbi_click-renders-for-a-higher-resolution-version-raiden/' },
  @{ Id='sly-cooper'; Ext='png'; Url='https://www.pngfind.com/pngs/m/35-357329_sly-cooper-thieves-in-time-sly-hd-png.png'; Page='https://www.pngfind.com/mpng/hTRbii_sly-cooper-thieves-in-time-sly-hd-png/'; FallbackUrl='https://toppng.com/uploads/preview/sly-cooper-sly-cooper-sly-115632326947mjoct4uiz.png'; FallbackPage='https://toppng.com/'; RefreshV20=$true },
  @{ Id='commander-shepard'; Ext='jpg'; Url='https://cdn.imgbin.com/11/1/18/imgbin-mass-effect-2-mass-effect-3-mass-effect-andromeda-mass-effect-infiltrator-commander-shepard-eQNbg5cZGECQfeRLQTLwXc4Jc.jpg'; Page='https://imgbin.com/png/VSgrr019/mass-effect-2-mass-effect-3-mass-effect-andromeda-mass-effect-infiltrator-png' },
  @{ Id='zagreus'; Ext='jpg'; Url='https://cdn.imgbin.com/23/25/13/hades-animated-hero-with-sword-DQzkzLKt.jpg'; Page='https://imgbin.com/png/DQzkzLKt/hades-animated-hero-with-sword-png' },
  @{ Id='jak'; Ext='png'; Url='https://image.pngaaa.com/466/4716466-middle.png'; Page='https://www.pngaaa.com/detail/4716466' },
  @{ Id='daxter'; Ext='png'; Url='https://thecodex.wiki/images/thumb/4/4d/Daxter_from_Jak_3_render.png/800px-Daxter_from_Jak_3_render.png'; Page='https://thecodex.wiki/File:Daxter_from_Jak_3_render.png' },
  @{ Id='bayek'; Ext='jpg'; Url='https://img.favpng.com/9/20/11/assassin-s-creed-origins-bayek-di-siwa-video-games-character-siwa-oasis-png-favpng-fqy0S1vbwD2hzy487VsTKD4HU.jpg'; Page='https://favpng.com/png_view/assassin-outline-assassins-creed-origins-bayek-di-siwa-video-games-character-siwa-oasis-png/GevhkGw3' },
  @{ Id='guile'; Ext='png'; Url='https://www.pngfind.com/pngs/m/580-5809658_shinkiro-guile-street-fighter-ii-the-world-warrior.png'; Page='https://www.pngfind.com/mpng/hxJobhJ_shinkiro-guile-street-fighter-ii-the-world-warrior/' },
  @{ Id='kitana'; Ext='png'; Url='https://www.pngfind.com/pngs/m/577-5772406_kitana-mortal-kombat-characters-hd-png-download.png'; Page='https://www.pngfind.com/mpng/hxowxbw_kitana-mortal-kombat-characters-hd-png-download/' },
  @{ Id='liu-kang'; Ext='jpg'; Url='https://cdn.imgbin.com/0/11/20/imgbin-liu-kang-mortal-kombat-ii-mortal-kombat-4-mortal-kombat-x-others-Qg9LX4QqcZigkuahZiJWriwbw.jpg'; Page='https://imgbin.com/png/3XSA9wEQ/liu-kang-mortal-kombat-ii-mortal-kombat-4-mortal-kombat-x-png' },
  @{ Id='mileena'; Ext='png'; Url='https://www.mortalkombatwarehouse.com/mk12/renders/ekk/K1_MileenaRender_Action-pose.png'; Page='https://www.mortalkombatwarehouse.com/mk12/' ; RefreshV22=$true },
  @{ Id='aerith'; Ext='png'; Url='https://image.pngaaa.com/862/5497862-middle.png'; Page='https://www.pngaaa.com/detail/5497862'; RefreshV20=$true },
  @{ Id='barret'; Ext='png'; Url='https://www.vhv.rs/dpng/d/415-4152906_barret-ff7-remake-hd-png-download.png'; Page='https://www.vhv.rs/viewpic/hTmRbhJ_barret-ff7-remake-hd-png-download/' },
  @{ Id='squall'; Ext='png'; Url='https://www.kindpng.com/picc/m/144-1444236_final-fantasy-png-transparent-image-squall-leonhart-png.png'; Page='https://www.kindpng.com/imgv/moxhmw_final-fantasy-png-transparent-image-squall-leonhart-png/' },
  @{ Id='tidus'; Ext='png'; Url='https://www.vhv.rs/dpng/d/89-891955_ffx-tidus-png-transparent-png.png'; Page='https://www.vhv.rs/viewpic/xxTbmi_ffx-tidus-png-transparent-png/' },
  @{ Id='connor'; Ext='png'; Url='https://www.nicepng.com/png/full/314-3145881_connor-kenway-coolest-assassins-creed-outfit.png'; Page='https://www.nicepng.com/maxp/u2w7o0r5u2u2w7r5/' },
  @{ Id='kassandra'; Ext='png'; Url='https://www.assassinscreed.de/sites/www.assassinscreed.de/files/assassins_creed_odyssey_kassandra_3_transparent_2400x3500.png'; Page='https://www.assassinscreed.de/ac-odyssey/charakterbilder-kassandra' },
  @{ Id='amy-rose'; Ext='png'; Url='https://www.clipartmax.com/png/middle/35-358259_amy-rose-is-the-self-proclaimed-girlfriend-of-sonic-amy-rose.png'; Page='https://www.clipartmax.com/middle/m2i8i8b1m2i8d3H7_amy-rose-is-the-self-proclaimed-girlfriend-of-sonic-amy-rose/'; RefreshV22=$true },
  @{ Id='metal-sonic'; Ext='png'; Url='https://image.pngaaa.com/219/5245219-middle.png'; Page='https://www.pngaaa.com/detail/5245219' },
  @{ Id='rouge'; Ext='png'; Url='https://image.pngaaa.com/508/4708508-middle.png'; Page='https://www.pngaaa.com/detail/4708508'; RefreshV20=$true },
  @{ Id='bayonetta'; Ext='png'; Url='https://image.pngaaa.com/522/1941522-middle.png'; Page='https://www.pngaaa.com/detail/1941522' },
  @{ Id='sephiroth'; Ext='jpg'; Url='https://img.favpng.com/21/4/15/sephiroth-final-fantasy-vii-remake-crisis-core-final-fantasy-vii-cloud-strife-png-favpng-U73YkE5h9P3jcm284z9i0hZsa.jpg'; Page='https://favpng.com/png_view/swordman-sephiroth-final-fantasy-vii-remake-crisis-core-final-fantasy-vii-cloud-strife-png/kXdqgqLt' },
  @{ Id='raiden-mgr'; Ext='png'; Url='https://www.pngkey.com/png/detail/84-847117_metal-gear-rising-revengeance-raiden-render-by-american.png'; Page='https://www.pngkey.com/detail/u2q8t4e6r5q8o0a9_metal-gear-rising-revengeance-raiden-render-by-american/'; FallbackUrl='https://www.pngfind.com/pngs/m/19-190664_metal-gear-rising-metal-gear-rising-revengeance-png.png'; FallbackPage='https://www.pngfind.com/'; RefreshV20=$true },
  @{ Id='ken-masters'; Ext='jpg'; Url='https://img.redbull.com/images/q_auto%2Cf_auto/redbullcom/2023/7/31/hvkvvkrtsq6d9xj41zfz/street-fighter-6-ken-st-l-p'; Page='https://www.redbull.com/us-en/street-fighter-6-ken-character-guide' },
  @{ Id='arthur-morgan'; Ext='png'; Url='https://image.pngaaa.com/315/1369315-middle.png'; Page='https://www.pngaaa.com/detail/1369315'; RefreshV22=$true },
  @{ Id='john-marston'; Ext='jpg'; Url='https://p7.hiclipart.com/preview/488/650/484/john-marston-red-dead-redemption-deadfall-adventures-game-image-red-dead-redemption.jpg'; Page='https://www.hiclipart.com/free-transparent-background-png-clipart-ffbax'; RefreshV25=$true },
  @{ Id='frisk'; Ext='png'; Url='https://image.pngaaa.com/220/1407220-middle.png'; Page='https://www.pngaaa.com/detail/1407220'; RefreshV20=$true },
  @{ Id='sans'; Ext='png'; Url='https://www.pngitem.com/pimgs/m/258-2585763_transparent-sans-sprite-png-undertale-sans-the-skeleton.png'; Page='https://www.pngitem.com/middle/ixiboJh_transparent-sans-sprite-png-undertale-sans-the-skeleton/'; RefreshV22=$true },
  @{ Id='garrus'; Ext='png'; Url='https://img.gamdb.com/character/figure/63a36fa23f7c4f05725f5e9563a44213.png'; Page='https://gamdb.com/'; RefreshV20=$true },
  @{ Id='phoenix-wright'; Ext='png'; Url='https://www.pngkey.com/png/detail/75-756459_phoenix-body-phoenix-wright-full-body.png'; Page='https://www.pngkey.com/detail/u2q8r5u2t4i1o0o0_phoenix-body-phoenix-wright-full-body/' },
  @{ Id='ellie'; Ext='jpg'; Url='https://cdn.renderhub.com/fantasy999d/ellie-tlou2/ellie-tlou2-01.jpg'; Page='https://www.renderhub.com/fantasy999d/ellie-tlou2'; RefreshV24=$true },
  @{ Id='vault-boy'; Ext='png'; Url='https://www.kindpng.com/picc/m/125-1257328_fallout-vault-boy-png-transparent-png.png'; Page='https://www.kindpng.com/imgv/'; RefreshV22=$true },
  @{ Id='solidus-snake'; Ext='png'; Url='https://www.pngitem.com/pimgs/m/253-2534153_metal-gear-solid-2-cast-solidus-snake-s.png'; Page='https://www.pngitem.com/middle/iowoxTo_metal-gear-solid-2-cast-solidus-snake-s/'; FallbackUrl='https://static.wikia.nocookie.net/villains/images/4/48/Solidus_Snake_%28MGS2%29.png/revision/latest?cb=20130128232155'; FallbackPage='https://villains.fandom.com/wiki/Solidus_Snake'; FallbackUrls=@(@{Url='https://static.wikia.nocookie.net/villains/images/4/48/Solidus_Snake_%28MGS2%29.png';Page='https://villains.fandom.com/wiki/Solidus_Snake'}); RefreshV22=$true },
  @{ Id='ada-wong'; Ext='png'; Url='https://www.pngkey.com/png/detail/314-3146610_ada-wong-resident-evil-2.png'; Page='https://www.pngkey.com/detail/u2w7o0r5i1w7w7i1_ada-wong-resident-evil-2/'; RefreshV20=$true },
  @{ Id='big-boss'; Ext='png'; Url='https://www.konami.com/mg/s/img/history/chara_pw/chara_01.png'; Page='https://www.konami.com/mg/history/jp/ja/mgspw' },
  @{ Id='gray-fox'; Ext='png'; Url='https://www.pngitem.com/pimgs/m/24-241557_all-worlds-alliance-wiki-gray-fox-metal-gear.png'; Page='https://www.pngitem.com/middle/iwRxRT_all-worlds-alliance-wiki-gray-fox-metal-gear/' },
  @{ Id='creeper'; Ext='png'; Url='https://skinrender.dev/render/mob/creeper/body.png?size=512&variant=normal&bg=transparent'; Page='https://skinrender.dev/docs/mobs/'; FallbackUrl='https://skinrender.dev/render/mob/creeper/body?size=512&variant=normal&bg=transparent'; FallbackPage='https://skinrender.dev/docs/mobs/'; RefreshV22=$true },
  @{ Id='hornet'; Ext='jpg'; Url='https://img.favpng.com/16/16/21/hollow-knight-hornet-team-cherry-shovel-knight-metroidvania-png-favpng-Q61etvu2ZDGj7UiCJdXaEUtf2.jpg'; Page='https://favpng.com/png_view/hollow-knight-hornet-team-cherry-shovel-knight-metroidvania-png/n40kBv13' },
  @{ Id='jin-sakai'; Ext='jpg'; Url='https://www.goodsmile.com/gsc-webrevo-sdk-storage-prd/product/image/product/20201104/10352/77553/large/78412d00a12f35033b2c24ec411fd95e.jpg'; Page='https://www.goodsmile.com/en/product/8046/figma%2BJin%2BSakai'; RefreshV24=$true },
  @{ Id='joel'; Ext='png'; Url='https://www.pngkey.com/png/full/42-423419_joel-the-last-of-us-render-by-elemental.png'; Page='https://www.pngkey.com/'; RefreshV20=$true },
  @{ Id='ori'; Ext='png'; Url='https://www.pngfind.com/pngs/m/343-3439425_ori-png-ori-and-the-blind-forest-png.png'; Page='https://www.pngfind.com/mpng/ioJxJRh_ori-png-ori-and-the-blind-forest-png/' },
  @{ Id='rayman'; Ext='png'; Url='https://www.vhv.rs/dpng/d/463-4638534_rayman-png-page-rayman-smash-bros-transparent-png.png'; Page='https://www.vhv.rs/viewpic/hxTxwbw_rayman-png-page-rayman-smash-bros-transparent-png/'; RefreshV22=$true },
  @{ Id='mugman'; Ext='jpg'; Url='https://cdn.imgbin.com/10/11/23/mugman-cartoon-cup-character-illustration-bALWF5H4.jpg'; Page='https://imgbin.com/png/bALWF5H4/mugman-cartoon-cup-character-illustration-png' },
  @{ Id='lady-dmc'; Ext='png'; Url='https://www.kindpng.com/picc/m/303-3034965_ladyrender-devil-may-cry-3-girl-hd-png.png'; Page='https://www.kindpng.com/imgv/iwooTmR_ladyrender-devil-may-cry-3-girl-hd-png/' },
  @{ Id='alex'; Ext='png'; Url='https://skinrender.dev/render/alex/body.png?size=512&bg=transparent'; Page='https://skinrender.dev/docs/'; FallbackUrl='https://skin.laby.net/api/render/skin/30a403fe9f69146c0a972dcb36a032cb.png?height=512&shadow=true&width=512'; FallbackPage='https://laby.net/skin/30a403fe9f69146c0a972dcb36a032cb'; FallbackUrls=@(@{Url='https://skinrender.dev/render/alex/body?size=512&bg=transparent';Page='https://skinrender.dev/docs/'}); RefreshV22=$true },
  @{ Id='minecraft-spider'; Ext='png'; Url='https://skinrender.dev/render/mob/spider/body.png?size=512&bg=transparent'; Page='https://skinrender.dev/docs/mobs/'; FallbackUrl='https://skinrender.dev/render/mob/spider/body?size=512&bg=transparent'; FallbackPage='https://skinrender.dev/docs/mobs/'; RefreshV22=$true },
  @{ Id='minecraft-slime'; Ext='png'; Url='https://skinrender.dev/render/mob/slime/body.png?size=512&bg=transparent'; Page='https://skinrender.dev/docs/mobs/'; FallbackUrl='https://skinrender.dev/render/mob/slime/body?size=512&bg=transparent'; FallbackPage='https://skinrender.dev/docs/mobs/'; RefreshV22=$true },
  @{ Id='pokemon-charizard'; Ext='png'; Url='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png'; Page='https://github.com/PokeAPI/sprites'; RefreshV20=$true },
  @{ Id='pokemon-gengar'; Ext='png'; Url='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png'; Page='https://github.com/PokeAPI/sprites'; RefreshV20=$true },
  @{ Id='pokemon-eevee'; Ext='png'; Url='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png'; Page='https://github.com/PokeAPI/sprites'; RefreshV20=$true },
  @{ Id='pokemon-lucario'; Ext='png'; Url='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png'; Page='https://github.com/PokeAPI/sprites'; RefreshV20=$true }
)

# .NET image processor: conserva transparencias y blancos del personaje; no modifica la silueta ni rellena huecos.
# Genera dos archivos: render original a color y su mascara negra exacta.
Add-Type -AssemblyName System.Drawing
$cs = @'
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
using System.Collections.Generic;
public static class SilhouetteMaker {
  class EdgeBin { public int Key; public int Count; public long R,G,B; }
  static int Offset(int y, int stride, int h) { int s=Math.Abs(stride); return (stride>=0 ? y : (h-1-y))*s; }
  static double Dist(byte[] p, int o, int r, int g, int b) {
    int dr=p[o+2]-r, dg=p[o+1]-g, db=p[o]-b;
    return Math.Sqrt(dr*dr+dg*dg+db*db);
  }
  static int BinKey(int r,int g,int b) { return ((r>>3)<<10)|((g>>3)<<5)|(b>>3); }
  static List<int[]> BuildEdgePalette(byte[] data,int stride,int h,int w) {
    Dictionary<int,EdgeBin> bins=new Dictionary<int,EdgeBin>();
    int edgeCount=0;
    Action<int,int> sample=delegate(int x,int y) {
      int o=Offset(y,stride,h)+x*4;
      if(data[o+3]<245) return;
      int r=data[o+2],g=data[o+1],b=data[o];
      int key=BinKey(r,g,b); EdgeBin bin;
      if(!bins.TryGetValue(key,out bin)){bin=new EdgeBin();bin.Key=key;bins.Add(key,bin);}
      bin.Count++;bin.R+=r;bin.G+=g;bin.B+=b;edgeCount++;
    };
    for(int x=0;x<w;x++){sample(x,0);if(h>1)sample(x,h-1);}
    for(int y=1;y<h-1;y++){sample(0,y);if(w>1)sample(w-1,y);}
    int minimum=Math.Max(3,edgeCount/700);
    List<EdgeBin> ordered=new List<EdgeBin>();
    foreach(EdgeBin b in bins.Values) if(b.Count>=minimum) ordered.Add(b);
    ordered.Sort(delegate(EdgeBin a,EdgeBin b){return b.Count.CompareTo(a.Count);});
    List<int[]> palette=new List<int[]>();
    for(int i=0;i<Math.Min(3,ordered.Count);i++){EdgeBin b=ordered[i];palette.Add(new int[]{(int)(b.R/b.Count),(int)(b.G/b.Count),(int)(b.B/b.Count)});}
    return palette;
  }
  static bool MatchesPalette(byte[] data,int offset,List<int[]> palette,double threshold) {
    if(palette.Count==0) return false;
    for(int i=0;i<palette.Count;i++) if(Dist(data,offset,palette[i][0],palette[i][1],palette[i][2])<=threshold) return true;
    return false;
  }
  static int RemoveConnectedBackground(byte[] data,int stride,int w,int h,List<int[]> palette) {
    bool[] seen=new bool[w*h]; int[] queue=new int[w*h]; int head=0,tail=0;
    Action<int> add=delegate(int idx) {
      if(idx<0||idx>=w*h||seen[idx])return;
      int x=idx%w,y=idx/w,o=Offset(y,stride,h)+x*4;
      if(data[o+3]<8 || MatchesPalette(data,o,palette,36.0)) {seen[idx]=true;queue[tail++]=idx;}
    };
    for(int x=0;x<w;x++){add(x);add((h-1)*w+x);}
    for(int y=0;y<h;y++){add(y*w);add(y*w+w-1);}
    while(head<tail){int idx=queue[head++],x=idx%w,y=idx/w;if(x>0)add(idx-1);if(x<w-1)add(idx+1);if(y>0)add(idx-w);if(y<h-1)add(idx+w);}
    for(int i=0;i<tail;i++){int x=queue[i]%w,y=queue[i]/w,o=Offset(y,stride,h)+x*4;data[o+3]=0;}
    return tail;
  }
  static void SaveFit(Bitmap source,string output,int targetW,int targetH,bool black) {
    using(Bitmap canvas=new Bitmap(targetW,targetH,PixelFormat.Format32bppArgb)) {
      using(Graphics g=Graphics.FromImage(canvas)) {
        g.Clear(Color.Transparent);g.InterpolationMode=InterpolationMode.HighQualityBicubic;
        g.PixelOffsetMode=PixelOffsetMode.HighQuality;g.SmoothingMode=SmoothingMode.HighQuality;
        float scale=Math.Min((targetW-40f)/source.Width,(targetH-40f)/source.Height);
        int dw=Math.Max(1,(int)(source.Width*scale)),dh=Math.Max(1,(int)(source.Height*scale));
        g.DrawImage(source,new Rectangle((targetW-dw)/2,(targetH-dh)/2,dw,dh));
      }
      if(black) {
        Rectangle rect=new Rectangle(0,0,targetW,targetH);
        BitmapData bd=canvas.LockBits(rect,ImageLockMode.ReadWrite,PixelFormat.Format32bppArgb);
        int stride=Math.Abs(bd.Stride);byte[] px=new byte[stride*targetH];Marshal.Copy(bd.Scan0,px,0,px.Length);
        for(int y=0;y<targetH;y++){int row=Offset(y,bd.Stride,targetH);for(int x=0;x<targetW;x++){int o=row+x*4;if(px[o+3]>0){px[o]=0;px[o+1]=0;px[o+2]=0;}else{px[o+3]=0;}}}
        Marshal.Copy(px,0,bd.Scan0,px.Length);canvas.UnlockBits(bd);
      }
      canvas.Save(output,ImageFormat.Png);
    }
  }
  public static int Create(string input,string silhouetteOutput,string colorOutput,int targetW,int targetH) {
    using(Bitmap loaded=(Bitmap)Image.FromFile(input))
    using(Bitmap src=new Bitmap(loaded.Width,loaded.Height,PixelFormat.Format32bppArgb)) {
      using(Graphics gr=Graphics.FromImage(src)){gr.Clear(Color.Transparent);gr.DrawImage(loaded,0,0,loaded.Width,loaded.Height);}
      int w=src.Width,h=src.Height;Rectangle rect=new Rectangle(0,0,w,h);
      BitmapData bd=src.LockBits(rect,ImageLockMode.ReadWrite,PixelFormat.Format32bppArgb);
      int stride=Math.Abs(bd.Stride);byte[] data=new byte[stride*h];Marshal.Copy(bd.Scan0,data,0,data.Length);
      int transparentEdge=0,edgeTotal=0;
      for(int x=0;x<w;x++){int ot=Offset(0,bd.Stride,h)+x*4,ob=Offset(h-1,bd.Stride,h)+x*4;edgeTotal+=2;if(data[ot+3]<245)transparentEdge++;if(data[ob+3]<245)transparentEdge++;}
      for(int y=1;y<h-1;y++){int ol=Offset(y,bd.Stride,h),orow=ol+(w-1)*4;edgeTotal+=2;if(data[ol+3]<245)transparentEdge++;if(data[orow+3]<245)transparentEdge++;}
      bool hasAlphaBackground=edgeTotal>0 && transparentEdge>=Math.Max(4,edgeTotal/20);
      bool backgroundUnclear=false;
      int erasedBackground=0;
      if(!hasAlphaBackground) {
        // Para fondos opacos (JPG o PNG mate), aprende hasta tres tonos dominantes
        // del borde y usa una tolerancia conservadora. Los blancos internos (guantes,
        // ojos, dientes o prendas) no se vuelven transparentes salvo que conecten
        // fisicamente con el exterior de la imagen.
        List<int[]> palette=BuildEdgePalette(data,bd.Stride,h,w);
        if(palette.Count==0) backgroundUnclear=true;
        else erasedBackground=RemoveConnectedBackground(data,bd.Stride,w,h,palette);
        if(erasedBackground<Math.Max(20,(int)((long)w*h*0.005))) backgroundUnclear=true;
      }
      int foreground=0;
      for(int y=0;y<h;y++){int row=Offset(y,bd.Stride,h);for(int x=0;x<w;x++){int o=row+x*4;if(data[o+3]>8)foreground++;else data[o+3]=0;}}
      // IMPORTANTE: guardar en el bitmap los alfa eliminados del fondo.
      // Sin esta copia, SaveFit recibia el render original opaco y lo pintaba entero de negro.
      Marshal.Copy(data, 0, bd.Scan0, data.Length);
      src.UnlockBits(bd);
      long total=(long)w*h;
      // Evita generar una pantalla negra cuando el fondo opaco no pudo separarse.
      if(backgroundUnclear) throw new Exception("No se pudo separar un fondo opaco de forma confiable; se deja pendiente para cambiar la fuente: "+input);
      if(foreground<300)throw new Exception("No se detectaron suficientes pixeles del personaje: "+input);
      if(foreground>total*0.96) throw new Exception("Se rechazo la imagen porque el fondo sigue ocupando casi todo el lienzo: "+input);
      SaveFit(src,colorOutput,targetW,targetH,false);
      SaveFit(src,silhouetteOutput,targetW,targetH,true);
      return foreground;
    }
  }
}
'@
Add-Type -TypeDefinition $cs -ReferencedAssemblies 'System.Drawing'

function Test-ReadableImage([string]$Path) {
  if ([string]::IsNullOrWhiteSpace($Path) -or -not (Test-Path $Path)) { return $false }
  try {
    if ((Get-Item $Path -ErrorAction Stop).Length -lt 1000) { return $false }
    $img = [System.Drawing.Image]::FromFile($Path)
    $valid = ($img.Width -ge 24 -and $img.Height -ge 24)
    $img.Dispose()
    return $valid
  } catch { return $false }
}

$ok = 0
$failed = @()
foreach ($asset in $assets) {
  $dest = Join-Path $sourceDir ($asset.Id + '.' + $asset.Ext)
  $png = Join-Path $outputDir ($asset.Id + '.png')
  $colorPng = Join-Path $colorDir ($asset.Id + '.png')
  $tempPng = $png + '.tmp.png'
  $tempColorPng = $colorPng + '.tmp.png'
  $tempSource = $dest + '.download'
  $sourceBackupV22 = $dest + '.v22-backup'
  $sourceMarkerV22 = Join-Path $sourceDir ($asset.Id + '.v22-source-ok')
  $sourceBackupV24 = $dest + '.v24-backup'
  $sourceMarkerV24 = Join-Path $sourceDir ($asset.Id + '.v24-source-ok')
  $sourceBackupV25 = $dest + '.v25-backup'
  $sourceMarkerV25 = Join-Path $sourceDir ($asset.Id + '.v25-source-ok')
  $refreshV22 = ($asset.RefreshV22 -eq $true -and -not (Test-Path $sourceMarkerV22))
  $refreshV24 = ($asset.RefreshV24 -eq $true -and -not (Test-Path $sourceMarkerV24))
  $refreshV25 = ($asset.RefreshV25 -eq $true -and -not (Test-Path $sourceMarkerV25))
  $refreshSource = ($refreshV22 -or $refreshV24 -or $refreshV25)
  $sourceMarker = if ($refreshV25) { $sourceMarkerV25 } elseif ($refreshV24) { $sourceMarkerV24 } else { $sourceMarkerV22 }
  $sourceBackup = if ($refreshV25) { $sourceBackupV25 } elseif ($refreshV24) { $sourceBackupV24 } else { $sourceBackupV22 }
  $hadSourceBackup = $false
  try {
    # Las fuentes marcadas para V22/V24/V25 se actualizan una sola vez y se restauran si fallan.
    # Si la descarga falla, se restaura automaticamente la fuente anterior.
    if ($refreshSource -and (Test-ReadableImage $dest)) {
      if (Test-Path $sourceBackup) { Remove-Item $sourceBackup -Force -ErrorAction SilentlyContinue }
      Move-Item $dest $sourceBackup -Force -ErrorAction Stop
      $hadSourceBackup = $true
    }
    if (-not (Test-ReadableImage $dest)) {
      Write-Host ("DESCARGANDO: " + $asset.Id) -ForegroundColor Cyan
      $downloadUrls = @(@{ Url=$asset.Url; Page=$asset.Page })
      if ($asset.FallbackUrl) { $downloadUrls += @{ Url=$asset.FallbackUrl; Page=$asset.FallbackPage } }
      if ($asset.FallbackUrls) { foreach ($fallback in $asset.FallbackUrls) { $downloadUrls += $fallback } }
      $sourceDownloaded = $false
      foreach ($candidateUrl in $downloadUrls) {
        if (Test-Path $tempSource) { Remove-Item $tempSource -Force -ErrorAction SilentlyContinue }
        for ($attempt = 1; $attempt -le 3 -and -not $sourceDownloaded; $attempt++) {
          try {
            Invoke-WebRequest -Uri $candidateUrl.Url -OutFile $tempSource -UseBasicParsing -TimeoutSec 35 -Headers @{ 'User-Agent'='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36'; 'Referer'=$candidateUrl.Page; 'Accept'='image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8' }
            if (Test-ReadableImage $tempSource) {
              Move-Item $tempSource $dest -Force -ErrorAction Stop
              $sourceDownloaded = $true
              break
            }
          } catch { }
          if (Test-Path $tempSource) { Remove-Item $tempSource -Force -ErrorAction SilentlyContinue }
          if (-not $sourceDownloaded -and $attempt -lt 3) { Start-Sleep -Milliseconds (700 * $attempt) }
        }
      }
      if (-not $sourceDownloaded) { throw 'No se pudo descargar una fuente PNG valida desde las URL principales ni alternativas.' }
    }
    $count = [SilhouetteMaker]::Create($dest, $tempPng, $tempColorPng, 420, 540)
    if ((Test-Path $tempPng) -and (Get-Item $tempPng).Length -gt 1500 -and (Test-Path $tempColorPng) -and (Get-Item $tempColorPng).Length -gt 1500) {
      # Reemplazo en pareja: si falla una de las dos instalaciones, restaura ambos archivos anteriores.
      $backupPng = $png + '.bak'
      $backupColorPng = $colorPng + '.bak'
      if (Test-Path $backupPng) { Remove-Item $backupPng -Force -ErrorAction SilentlyContinue }
      if (Test-Path $backupColorPng) { Remove-Item $backupColorPng -Force -ErrorAction SilentlyContinue }
      $hadBlack = Test-Path $png; $hadColor = Test-Path $colorPng
      if ($hadBlack) { Copy-Item $png $backupPng -Force -ErrorAction Stop }
      if ($hadColor) { Copy-Item $colorPng $backupColorPng -Force -ErrorAction Stop }
      try {
        Move-Item $tempPng $png -Force -ErrorAction Stop
        Move-Item $tempColorPng $colorPng -Force -ErrorAction Stop
        if (Test-Path $backupPng) { Remove-Item $backupPng -Force -ErrorAction SilentlyContinue }
        if (Test-Path $backupColorPng) { Remove-Item $backupColorPng -Force -ErrorAction SilentlyContinue }
      } catch {
        if ($hadBlack -and (Test-Path $backupPng)) { Move-Item $backupPng $png -Force -ErrorAction SilentlyContinue }
        elseif (-not $hadBlack -and (Test-Path $png)) { Remove-Item $png -Force -ErrorAction SilentlyContinue }
        if ($hadColor -and (Test-Path $backupColorPng)) { Move-Item $backupColorPng $colorPng -Force -ErrorAction SilentlyContinue }
        elseif (-not $hadColor -and (Test-Path $colorPng)) { Remove-Item $colorPng -Force -ErrorAction SilentlyContinue }
        throw
      }
      if ($refreshSource) {
        $markerText = if ($refreshV25) { 'V25 refreshed full-body character source downloaded and processed' } elseif ($refreshV24) { 'V24 refreshed full-body character source' } else { 'V22 refreshed character source downloaded and processed' }
        Set-Content -Path $sourceMarker -Value $markerText -Encoding UTF8
        if (Test-Path $sourceBackup) { Remove-Item $sourceBackup -Force -ErrorAction SilentlyContinue }
      }
      $ok++
      Write-Host ("OK: " + $asset.Id + " (" + $count + " pixeles de personaje)") -ForegroundColor Green
    } else { throw 'El PNG procesado no parece valido.' }
  } catch {
    # Si una fuente especial no supera el procesamiento, recupera la original anterior.
    if ($hadSourceBackup -and (Test-Path $sourceBackup)) {
      if (Test-Path $dest) { Remove-Item $dest -Force -ErrorAction SilentlyContinue }
      Move-Item $sourceBackup $dest -Force -ErrorAction SilentlyContinue
    }
    # Solo se eliminan temporales; se conservan originales y PNG previos que ya funcionaban.
    if (Test-Path $tempPng) { Remove-Item $tempPng -Force -ErrorAction SilentlyContinue }
    if (Test-Path $tempColorPng) { Remove-Item $tempColorPng -Force -ErrorAction SilentlyContinue }
    if (Test-Path $tempSource) { Remove-Item $tempSource -Force -ErrorAction SilentlyContinue }
    $failed += ($asset.Id + ' - ' + $_.Exception.Message + ' | URL: ' + $asset.Url)
    Write-Host ("FALTA: " + $asset.Id + " - " + $_.Exception.Message) -ForegroundColor Yellow
  }
}
$report = @("SILUETAS LISTAS V25: $ok / $($assets.Count)", '', 'La silueta negra conserva la forma y transparencia del render. En imagenes opacas elimina el fondo solo si esta conectado a los bordes; no une extremidades ni rellena huecos internos.' , 'Tambien se genera assets/siluetas/color con el personaje a color y sin fondo; se muestra despues de responder. Los fondos que no puedan separarse con seguridad se marcan como pendientes, nunca como una silueta completamente negra.', 'Si una descarga falla, revisa la URL de origen o vuelve a ejecutar este script.', '', 'PENDIENTES:') + $failed
$report | Set-Content -Path (Join-Path $root 'assets\siluetas\siluetas_pendientes.txt') -Encoding UTF8
Write-Host "`nFUENTES CONFIGURADAS: $($assets.Count) | PROCESADAS AHORA: $ok" -ForegroundColor Cyan
Write-Host 'Se generan dos PNG por personaje: silueta negra y render a color sin fondo.' -ForegroundColor White
Write-Host 'Abre verificar_recursos.php para comprobar los recursos. El modo Siluetas requiere 20 personajes locales para completar 20 rondas sin repetir. Catalogo V25: 110 personajes en total (109 fuentes descargables + Pac-Man local; Birdo retirado). Las cinco figuras de Minecraft se regeneran con PNG transparentes del mismo renderizador.' -ForegroundColor White
