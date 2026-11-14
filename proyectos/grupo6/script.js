const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const titleCase = s => (s || '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const API = 'https://pokeapi.co/api/v2/pokemon';

const FIJOS = [
  {id: 25, name: 'pikachu'}, {id: 6, name: 'charizard'}, {id: 1, name: 'bulbasaur'},
  {id: 7, name: 'squirtle'}, {id: 39, name: 'jigglypuff'}, {id: 94, name: 'gengar'},
  {id: 143, name: 'snorlax'}, {id: 150, name: 'mewtwo'}, {id: 133, name: 'eevee'},
  {id: 52, name: 'meowth'}
];
const store = (k, v) => v === undefined ? JSON.parse(localStorage.getItem(k) || 'null') : localStorage.setItem(k, JSON.stringify(v));

const sndCorrect = new Audio('sonido/victoria.mp3');
const sndWrong = new Audio('sonido/error.mp3');

let save = {coins: 0, owned: ['bg0', 'm0'], bg: 'bg0', music: 'm0', ...(store('poke_save') || {})};
function persist() { store('poke_save', save); $$('.wallet').forEach(e => e.textContent = save.coins); }

const BGS = [
  {id: 'bg0', name: 'Clasico', price: 0, css: 'radial-gradient(1000px 500px at 10% -10%, #eaf1ff 0%, #f6f8ff 55%, #fbfcff 100%)'},
  {id: 'bg1', name: 'Atardecer', price: 50, css: 'linear-gradient(135deg,#ffb88c,#de6262)'},
  {id: 'bg2', name: 'Bosque', price: 100, css: 'linear-gradient(135deg,#a8e063,#56ab2f)'}
];
const MODES = [
  {id: 'mode_inf', name: 'Modo Infinito', price: INF_PRICE, icon: '♾️'}
];
const MUSIC = [
  {id: 'm0', name: 'Sin musica', price: 0},
  {id: 'm1', name: 'Aventura', price: 80, notes: [392, 392, 523.3, 494, 440, 392, 330, 349], tempo: 220, type: 'square'} ,
  {id: 'm2', name: 'Noche tranquila', price: 120, notes: [261.6, 329.6, 392, 523.3, 392, 329.6, 293.7, 349.2], tempo: 420, type: 'triangle'}
];

let actx, timer;
function playMusic(id) {
  clearInterval(timer);
  const t = MUSIC.find(m => m.id === id); if (!t?.notes) return;
  actx ||= new (window.AudioContext || window.webkitAudioContext)(); actx.resume();
  let i = 0, dur = t.tempo / 1000;
  timer = setInterval(() => {
    const o = actx.createOscillator(), g = actx.createGain(), now = actx.currentTime;
    o.type = t.type; o.frequency.value = t.notes[i++ % t.notes.length];
    g.gain.setValueAtTime(.05, now); g.gain.exponentialRampToValueAtTime(.001, now + dur);
    o.connect(g); g.connect(actx.destination); o.start(now); o.stop(now + dur);
  }, t.tempo);
}
const applyBg = () => document.body.style.background = (BGS.find(x => x.id === save.bg) || BGS[0]).css;

function renderShop() {
  const mk = (list, icon, sel) => list.map(it => {
    const owned = save.owned.includes(it.id);
    const btn = sel === null ? (owned ? '<button class="btnSm" disabled>✔ Desbloqueado</button>'
      : `<button class="btnSm" data-act="buy" data-id="${it.id}">Comprar (${it.price})</button>`)
      : sel === it.id ? '<button class="btnSm" disabled>✔ En uso</button>'
      : `<button class="btnSm" data-act="${owned ? 'use' : 'buy'}" data-id="${it.id}">${owned ? 'Usar' : `Comprar (${it.price})`}</button>`;
    return `<div class="item"><div class="prev" style="background:${it.css || '#f6f8ff'}">${it.icon || icon}</div><b>${it.name}</b>${btn}</div>`;
  }).join('');
  $('#shopModes').innerHTML = mk(MODES, '', null);
  $('#shopBg').innerHTML = mk(BGS, '', save.bg);
  $('#shopMusic').innerHTML = mk(MUSIC, '🎵', save.music);
}
$('#shop').addEventListener('click', e => {
  const b = e.target.closest('button[data-act]'); if (!b) return;
  const id = b.dataset.id, isBg = id.startsWith('bg'), isMode = id.startsWith('mode'), it = (isBg ? BGS : isMode ? MODES : MUSIC).find(x => x.id === id);
  if (b.dataset.act === 'buy') {
    if (save.coins < it.price) { $('#shopMsg').textContent = `Te faltan ${it.price - save.coins} puntos 😅`; return; }
    save.coins -= it.price; save.owned.push(id); $('#shopMsg').textContent = `¡Compraste "${it.name}"! 🎉`;
  } else $('#shopMsg').textContent = '';
  if (isMode) { /* los modos solo se compran, no se "usan" */ }
  else if (isBg) { save.bg = id; applyBg(); } else { save.music = id; playMusic(id); }
  persist(); renderShop(); renderMenu();
});

const show = id => ['menu', 'shop', 'game'].forEach(s => $('#' + s).hidden = s !== id);
$('#openShop').onclick = () => { renderShop(); $('#shopMsg').textContent = ''; show('shop'); };
$('#shopBack').onclick = $('#toMenu').onclick = () => show('menu');
$('#startBtn').onclick = async () => { playMusic(save.music); show('game'); await startGame('normal'); };

const infOwned = () => save.owned.includes('mode_inf');
function renderMenu() {
  const b = $('#infBtn'); b.classList.toggle('locked', !infOwned());
  b.textContent = infOwned() ? '♾️ Infinito' : '🔒 Infinito';
}
$('#infBtn').onclick = async () => {
  if (!infOwned()) {
    renderShop(); show('shop');
    $('#shopMsg').textContent = `El Modo Infinito cuesta ${INF_PRICE} monedas 🔒`; return;
  }
  playMusic(save.music); show('game'); await startGame('inf');
};

const esc = s => s.replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
const rankKey = inf => inf ? 'poke_ranking_inf' : 'poke_ranking';
function saveRanking(name, score, inf, rounds) { store(rankKey(inf), [...(store(rankKey(inf)) || []), {name, score, rounds}].sort((a, b) => b.score - a.score).slice(0, 5)); }
function renderRanking(inf) {
  const r = store(rankKey(inf)) || [];
  $('#ranking').innerHTML = r.length ? `<h2>🏆 Ranking${inf ? ' ♾️ Infinito' : ''}</h2><table><tr><th>Jugador</th><th>Puntos</th>${inf ? '<th>Rondas</th>' : ''}</tr>`
    + r.map(x => `<tr><td>${esc(x.name)}</td><td>${x.score}</td>${inf ? `<td>${x.rounds ?? '-'}</td>` : ''}</tr>`).join('') + '</table>' : '';
}

let POKEDEX = [];
async function loadDex() { POKEDEX = [...FIJOS]; }
async function getDetail(id) {
  const d = await (await fetch(`${API}/${id}`)).json();
  return {id: d.id, name: d.name, img: d.sprites?.other?.['official-artwork']?.front_default, types: d.types.map(t => t.type.name)};
}

// Modo infinito: lista de nombres de PokeAPI (nada predefinido en el codigo)
let INF_DEX = [];
async function loadInfDex() {
  const d = await (await fetch(`${API}?limit=${INF_MAX_POKE}`)).json();
  INF_DEX = d.results.map((p, i) => ({id: i + 1, name: p.name}));
}
const optsFor = round => Math.min(INF_START_OPTS + Math.floor((round - 1) / INF_STEP), INF_MAX_OPTS);
const heartsHtml = n => '❤️'.repeat(n) + '🖤'.repeat(INF_LIVES - n);
const randId = used => { let id; do id = INF_DEX[Math.floor(Math.random() * INF_DEX.length)].id; while (used.has(id) && used.size < INF_DEX.length); return id; };

let state;
const buildOptions = (correct, n = 4, dex = POKEDEX) => {
  const pool = dex.filter(p => p.name !== correct).sort(() => Math.random() - .5).slice(0, n - 1).map(p => p.name);
  return [correct, ...pool].map(titleCase).sort(() => Math.random() - .5);
};
function renderOptions(opts) {
  $('#answers').innerHTML = ''; $('#answers').classList.toggle('many', opts.length > 4);
  opts.forEach(o => { const b = document.createElement('button'); b.className = 'btn'; b.textContent = o; b.onclick = () => choose(o); $('#answers').appendChild(b); });
}
function revealFull() { const m = $('#pokeMask'); m.style.setProperty('--rev', '120%'); setTimeout(() => m.style.opacity = '0', 200); }
function showExtra() {
  const {id, types, name} = state.current;
  $('#extra').innerHTML = `#${id} — <b>${titleCase(name)}</b> ` + types.map(t => `<span class="chip">${titleCase(t)}</span>`).join('');
}
function lock(sel) {
  state.locked = true; const correct = titleCase(state.current.name);
  $$('#answers .btn').forEach(b => {
    if (b.textContent === correct) b.classList.add('correct');
    else if (b.textContent === sel) b.classList.add('wrong');
    b.disabled = true;
  });
  $('#next').disabled = false;
}

async function nextRound() {
  $('#next').disabled = true; $('#extra').textContent = ''; $('#status').textContent = 'Cargando…';
  state.locked = false; state.hints = 0;
  const m = $('#pokeMask'); m.style.opacity = '1'; m.style.setProperty('--rev', '0%');
  $('#next').textContent = 'Siguiente ⏭';
  let detail = null;
  for (let t = 0; t < 3 && !detail; t++) {
    try {
      const id = state.inf ? randId(state.used) : state.orden[state.round - 1].id;
      detail = await getDetail(id);
      if (!detail.img) detail = null; else if (state.inf) state.used.add(id);
    } catch { detail = null; }
    if (!state.inf) break;
  }
  if (!detail) { $('#status').textContent = 'Error cargando.'; return; }
  state.current = detail; $('#pokeBase').src = $('#pokeMask').src = detail.img;
  renderOptions(state.inf ? buildOptions(detail.name, optsFor(state.round), INF_DEX) : buildOptions(detail.name));
  $('#status').textContent = 'Listo';
}

function choose(opt) {
  if (state.locked) return;
  revealFull(); showExtra();
  if (opt === titleCase(state.current.name)) {
    state.score += POINTS_PER_HIT; save.coins += POINTS_PER_HIT; persist();
    $('#score').textContent = state.score; sndCorrect.play();
  } else {
    sndWrong.play();
    if (state.inf) {
      state.lives--; $('#lives').innerHTML = heartsHtml(state.lives);
      if (state.lives <= 0) { state.over = true; $('#next').textContent = 'Terminar 🏁'; }
    }
  }
  lock(opt);
}

$('#hint').onclick = () => {
  if (state.locked) return;
  const perc = Math.min(++state.hints * 20, 100);
  $('#pokeMask').style.setProperty('--rev', perc + '%');
  if (perc >= 100) $('#hint').disabled = true;
};

function endGame() {
  revealFull(); showExtra();
  const inf = state.inf;
  const name = prompt(inf ? `Te quedaste sin vidas 💔\nLlegaste a la ronda ${state.round}\nIngresá tu nombre para el ranking:` : 'Fin del juego 🎉\nIngresá tu nombre para el ranking:', 'Jugador');
  if (name) saveRanking(name, state.score, inf, state.round);
  renderRanking(inf);
  $('#status').textContent = inf ? `Fin del Modo Infinito: ${state.score} puntos · ronda ${state.round}` : `Juego terminado: ${state.score}/${TOTAL * POINTS_PER_HIT} puntos`;
  $('#answers').innerHTML = ''; $('#pokeBase').src = $('#pokeMask').src = '';
  $('#next').disabled = $('#hint').disabled = true;
}
$('#next').onclick = () => {
  if (state.over) return endGame();
  if (state.inf || state.round < TOTAL) { state.round++; $('#round').textContent = state.round; $('#hint').disabled = false; return nextRound(); }
  endGame();
};

addEventListener('keydown', e => {
  if ($('#game').hidden || state.locked || !/^[1-8]$/.test(e.key)) return;
  $$('#answers .btn')[e.key - 1]?.click();
});

async function startGame(mode = 'normal') {
  const inf = mode === 'inf';
  state = {inf, over: false, lives: INF_LIVES, used: new Set(), score: 0, round: 1, locked: false, hints: 0, current: null, orden: [...FIJOS].sort(() => Math.random() - .5)};
  $('#score').textContent = 0; $('#round').textContent = 1;
  $('#total').textContent = inf ? '∞' : TOTAL;
  $('#livesPill').hidden = !inf; if (inf) $('#lives').innerHTML = heartsHtml(INF_LIVES);
  $('#hint').disabled = false; $('#ranking').innerHTML = ''; $('#status').textContent = 'Cargando…';
  if (inf) {
    if (!INF_DEX.length) { try { await loadInfDex(); } catch { $('#status').textContent = 'Error cargando Pokédex.'; return; } }
  } else if (!POKEDEX.length) { try { await loadDex(); } catch { $('#status').textContent = 'Error cargando Pokédex.'; return; } }
  renderRanking(inf); nextRound();
}

persist(); applyBg(); renderMenu();
