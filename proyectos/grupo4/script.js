const $=s=>document.querySelector(s); 
const $$=s=>Array.from(document.querySelectorAll(s));
const titleCase=s=>(s||'').replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
const capitalize=s=>s? s[0].toUpperCase()+s.slice(1):s;

/* Modo Oscuro */
const themeToggle=$('#themeToggle');
function setTheme(isDark){
  if(isDark){
    document.body.classList.add('dark-mode');
    if(themeToggle) themeToggle.textContent='☀️';
    localStorage.setItem('poke_theme','dark');
  } else {
    document.body.classList.remove('dark-mode');
    if(themeToggle) themeToggle.textContent='🌙';
    localStorage.setItem('poke_theme','light');
  }
}
if(themeToggle){
  themeToggle.addEventListener('click',()=>setTheme(!document.body.classList.contains('dark-mode')));
}
const savedTheme=localStorage.getItem('poke_theme');
if(savedTheme==='dark') setTheme(true); else setTheme(false);

/* Control de Volumen y Música Real */
const bgMusic = $('#bgMusic');
const musicVolInput = $('#musicVol');
const sfxVolInput = $('#sfxVol');
const musicToggleBtn = $('#musicToggle');

let musicVolume = parseFloat(localStorage.getItem('poke_music_vol') ?? '0.3');
let sfxVolume = parseFloat(localStorage.getItem('poke_sfx_vol') ?? '0.7');

musicVolInput.value = musicVolume;
sfxVolInput.value = sfxVolume;
bgMusic.volume = musicVolume;

musicVolInput.addEventListener('input', (e) => {
  musicVolume = parseFloat(e.target.value);
  bgMusic.volume = musicVolume;
  localStorage.setItem('poke_music_vol', musicVolume);
  if(musicVolume > 0 && bgMusic.paused && isPlayingAttempted){
    bgMusic.play().catch(() => {});
  } else if(musicVolume === 0){
    bgMusic.pause();
  }
});

sfxVolInput.addEventListener('input', (e) => {
  sfxVolume = parseFloat(e.target.value);
  localStorage.setItem('poke_sfx_vol', sfxVolume);
});

let isPlayingAttempted = false;

function toggleMusic() {
  isPlayingAttempted = true;
  if(bgMusic.paused) {
    bgMusic.play().then(() => {
      musicToggleBtn.textContent = '⏸ Pause';
    }).catch(err => {
      console.log("Play error:", err);
    });
  } else {
    bgMusic.pause();
    musicToggleBtn.textContent = '▶️ Play';
  }
}

musicToggleBtn.addEventListener('click', toggleMusic);

/* Cronómetro de Tiempo */
let timerInterval = null;
let secondsElapsed = 0;

function startTimer() {
  clearInterval(timerInterval);
  secondsElapsed = 0;
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    if (!state.gameOver) {
      secondsElapsed++;
      updateTimerDisplay();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function updateTimerDisplay() {
  const mins = Math.floor(secondsElapsed / 60);
  const secs = secondsElapsed % 60;
  $('#gameTimer').textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

/* Sistema de Rangos y Títulos Pokémon */
function getPokemonTier(score) {
  if (score === 10) return { name: "Maestro Pokémon", bg: "rgba(245, 158, 11, 0.15)", text: "#f59e0b", border: "#f59e0b" };
  if (score >= 8)  return { name: "Entrenador Élite", bg: "rgba(139, 92, 246, 0.15)", text: "#a78bfa", border: "#8b5cf6" };
  if (score >= 6)  return { name: "Líder de Gimnasio", bg: "rgba(59, 130, 246, 0.15)", text: "#60a5fa", border: "#3b82f6" };
  if (score >= 4)  return { name: "Entrenador Promesa", bg: "rgba(16, 185, 129, 0.15)", text: "#34d399", border: "#10b981" };
  if (score >= 2)  return { name: "Cazador Novato", bg: "rgba(249, 115, 22, 0.15)", text: "#fb923c", border: "#f97316" };
  return { name: "Pueblo Paleta", bg: "rgba(156, 163, 175, 0.15)", text: "#9ca3af", border: "#9ca3af" };
}

/* Almacenamiento de ronda para el resumen visual final */
let roundHistory = []; 

/* Ranking y Administración */
const ADMIN_PASS = "admin123";

function saveRanking(name, score){
  let r = JSON.parse(localStorage.getItem("poke_ranking") || "[]");
  r.push({ name, score });
  r.sort((a,b) => b.score - a.score);
  r = r.slice(0, 50);
  localStorage.setItem("poke_ranking", JSON.stringify(r));
}

function renderRanking(){
  let r = JSON.parse(localStorage.getItem("poke_ranking") || "[]"); 
  if(!r.length){ $('#ranking').innerHTML = ''; return; } 
  let h = "<h2>Top Entrenadores</h2><table><tr><th>Jugador</th><th>Puntos / Rango</th></tr>"; 
  r.forEach(x => {
    const tier = getPokemonTier(x.score);
    h += `<tr style="background:${tier.bg}; color:${tier.text}; border-left: 4px solid ${tier.border};">
      <td><b>${x.name}</b></td>
      <td>${x.score} pts — <b>${tier.name}</b></td>
    </tr>`;
  }); 
  h += "</table>"; 
  $('#ranking').innerHTML = h;
}

const settingsBtn = $('#settingsBtn');
const settingsModal = $('#settingsModal');
const closeSettingsBtn = $('#closeSettingsBtn');
const openAdminPassBtn = $('#openAdminPassBtn');
const lockAdminBtn = $('#lockAdminBtn');
const adminSection = $('#adminSection');
const resetRankingBtn = $('#resetRankingBtn');
const adminRankingList = $('#adminRankingList');

function renderAdminList(){
  let r = JSON.parse(localStorage.getItem("poke_ranking") || "[]");
  if(!r.length){
    adminRankingList.innerHTML = '<p class="muted" style="text-align:center; font-size:12px; padding:6px;">No hay puntajes en el ranking.</p>';
    return;
  }
  let html = '';
  r.forEach((x, index) => {
    const tier = getPokemonTier(x.score);
    html += `<div class="admin-item" style="background:${tier.bg}; color:${tier.text}; border-left: 3px solid ${tier.border}; border-radius:6px; margin-bottom:4px; padding:5px 8px;">
      <span><b>${x.name}</b> — ${x.score} pts (${tier.name})</span>
      <button onclick="deleteRankingItem(${index})">❌</button>
    </div>`;
  });
  adminRankingList.innerHTML = html;
}

window.deleteRankingItem = function(index){
  let r = JSON.parse(localStorage.getItem("poke_ranking") || "[]");
  r.splice(index, 1);
  localStorage.setItem("poke_ranking", JSON.stringify(r));
  renderRanking();
  renderAdminList();
};

settingsBtn.addEventListener('click', () => { settingsModal.classList.add('open'); });
closeSettingsBtn.addEventListener('click', () => { adminSection.style.display = 'none'; settingsModal.classList.remove('open'); });
openAdminPassBtn.addEventListener('click', () => {
  const pass = prompt("Ingrese la contraseña de administrador:");
  if (pass === null) return;
  if (pass === ADMIN_PASS) {
    adminSection.style.display = 'block';
    renderAdminList();
  } else {
    alert("Contraseña incorrecta.");
  }
});
lockAdminBtn.addEventListener('click', () => { adminSection.style.display = 'none'; });
resetRankingBtn.addEventListener('click', () => {
  if (confirm("¿Estás seguro de que deseas borrar todo el ranking?")) {
    localStorage.removeItem("poke_ranking");
    renderRanking();
    renderAdminList();
  }
});

/* Pokédex */
let POKEDEX = [
  {id:1, name:"bulbasaur"}, {id:2, name:"ivysaur"}, {id:3, name:"venusaur"}, {id:4, name:"charmander"}, {id:5, name:"charmeleon"}, {id:6, name:"charizard"},
  {id:7, name:"squirtle"}, {id:8, name:"wartortle"}, {id:9, name:"blastoise"}, {id:10, name:"caterpie"}, {id:11, name:"metapod"}, {id:12, name:"butterfree"},
  {id:13, name:"weedle"}, {id:14, name:"kakuna"}, {id:15, name:"beedrill"}, {id:16, name:"pidgey"}, {id:17, name:"pidgeotto"}, {id:18, name:"pidgeot"},
  {id:19, name:"rattata"}, {id:20, name:"raticate"}, {id:21, name:"spearow"}, {id:22, name:"fearow"}, {id:23, name:"ekans"}, {id:24, name:"arbok"},
  {id:25, name:"pikachu"}, {id:26, name:"raichu"}, {id:27, name:"sandshrew"}, {id:28, name:"sandslash"}, {id:29, name:"nidoran-f"}, {id:30, name:"nidorina"},
  {id:31, name:"nidoqueen"}, {id:32, name:"nidoran-m"}, {id:33, name:"nidorino"}, {id:34, name:"nidoking"}, {id:35, name:"clefairy"}, {id:36, name:"clefable"},
  {id:37, name:"vulpix"}, {id:38, name:"ninetales"}, {id:39, name:"jigglypuff"}, {id:40, name:"wigglytuff"}, {id:41, name:"zubat"}, {id:42, name:"golbat"},
  {id:43, name:"oddish"}, {id:44, name:"gloom"}, {id:45, name:"vileplume"}, {id:46, name:"paras"}, {id:47, name:"parasect"}, {id:48, name:"venonat"},
  {id:49, name:"venomoth"}, {id:50, name:"diglett"}, {id:51, name:"dugtrio"}, {id:52, name:"meowth"}, {id:53, name:"persian"}, {id:54, name:"psyduck"},
  {id:55, name:"golduck"}, {id:56, name:"mankey"}, {id:57, name:"primeape"}, {id:58, name:"growlithe"}, {id:59, name:"arcanine"}, {id:60, name:"poliwag"},
  {id:61, name:"poliwhirl"}, {id:62, name:"poliwrath"}, {id:63, name:"abra"}, {id:64, name:"kadabra"}, {id:65, name:"alakazam"}, {id:66, name:"machop"},
  {id:67, name:"machoke"}, {id:68, name:"machamp"}, {id:69, name:"bellsprout"}, {id:70, name:"weepinbell"}, {id:71, name:"victreebel"}, {id:72, name:"tentacool"},
  {id:73, name:"tentacruel"}, {id:74, name:"geodude"}, {id:75, name:"graveler"}, {id:76, name:"golem"}, {id:77, name:"ponyta"}, {id:78, name:"rapidash"},
  {id:79, name:"slowpoke"}, {id:80, name:"slowbro"}, {id:81, name:"magnemite"}, {id:82, name:"magneton"}, {id:83, name:"farfetchd"}, {id:84, name:"doduo"},
  {id:85, name:"dodrio"}, {id:86, name:"seel"}, {id:87, name:"dewgong"}, {id:88, name:"grimer"}, {id:89, name:"muk"}, {id:90, name:"shellder"},
  {id:91, name:"cloyster"}, {id:92, name:"gastly"}, {id:93, name:"haunter"}, {id:94, name:"gengar"}, {id:95, name:"onix"}, {id:96, name:"drowzee"},
  {id:97, name:"hypno"}, {id:98, name:"krabby"}, {id:99, name:"kingler"}, {id:100, name:"voltorb"}, {id:101, name:"electrode"}, {id:102, name:"exeggcute"},
  {id:103, name:"exeggutor"}, {id:104, name:"cubone"}, {id:105, name:"marowak"}, {id:106, name:"hitmonlee"}, {id:107, name:"hitmonchan"}, {id:108, name:"lickitung"},
  {id:109, name:"koffing"}, {id:110, name:"weezing"}, {id:111, name:"rhyhorn"}, {id:112, name:"rhydon"}, {id:113, name:"chansey"}, {id:114, name:"tangela"},
  {id:115, name:"kangaskhan"}, {id:116, name:"horsea"}, {id:117, name:"seadra"}, {id:118, name:"goldeen"}, {id:119, name:"seaking"}, {id:120, name:"staryu"},
  {id:121, name:"starmie"}, {id:122, name:"mr-mime"}, {id:123, name:"scyther"}, {id:124, name:"jynx"}, {id:125, name:"electabuzz"}, {id:126, name:"magmar"},
  {id:127, name:"pinsir"}, {id:128, name:"tauros"}, {id:129, name:"magikarp"}, {id:130, name:"gyarados"}, {id:131, name:"lapras"}, {id:132, name:"ditto"},
  {id:133, name:"eevee"}, {id:134, name:"vaporeon"}, {id:135, name:"jolteon"}, {id:136, name:"flareon"}, {id:137, name:"porygon"}, {id:138, name:"omanyte"},
  {id:139, name:"omastar"}, {id:140, name:"kabuto"}, {id:141, name:"kabutops"}, {id:142, name:"aerodactyl"}, {id:143, name:"snorlax"}, {id:144, name:"articuno"},
  {id:145, name:"zapdos"}, {id:146, name:"moltres"}, {id:147, name:"dratini"}, {id:148, name:"dragonair"}, {id:149, name:"dragonite"}, {id:150, name:"mewtwo"}, {id:151, name:"mew"}
];

async function loadDex(){
  try {
    const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=300');
    const data = await res.json();
    if (data && data.results) {
      POKEDEX = data.results.map(r => {
        const m = r.url.match(/\/pokemon\/(\d+)\//);
        return { name: r.name, id: m ? parseInt(m[1]) : null };
      }).filter(p => p.id);
    }
  } catch (e) {
    console.warn("Usando Pokédex de respaldo local.", e);
  }
}

async function getDetail(id){
  try {
    const r = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const d = await r.json();
    const img = d?.sprites?.other?.['official-artwork']?.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
    const types = (d.types || []).map(t => t.type.name);
    const cry = d?.cries?.latest || `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`;
    return { id: d.id, name: d.name, img, types, cry };
  } catch (e) {
    const poke = POKEDEX.find(p => p.id === id) || { name: "pokemon", id: id };
    return {
      id: id,
      name: poke.name,
      img: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
      types: ["normal"],
      cry: `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`
    };
  }
}

/* Estado del Juego */
let state={score:0,round:1,total:10,locked:false,hints:0,current:null,gameOver:false};

function buildOptions(correct){
  const pool = POKEDEX.filter(p => p.name !== correct);
  const picks = [];
  while(picks.length < 3 && pool.length > 0){
    const r = pool[Math.floor(Math.random() * pool.length)];
    if(!picks.find(x => x.name === r.name)) picks.push(r);
  }
  return [correct, ...picks.map(p => p.name)].map(titleCase).sort(() => Math.random() - 0.5);
}

function renderOptions(opts){
  const box = $('#answers');
  box.innerHTML = '';
  opts.forEach(o => {
    const b = document.createElement('button');
    b.className = 'btn';
    b.textContent = o;
    b.addEventListener('click', () => choose(o));
    box.appendChild(b);
  });
}

function revealFull(){
  const m = $('#pokeMask');
  if(m){
    m.style.setProperty('--rev', '120%');
    setTimeout(() => { m.style.opacity = '0'; }, 200);
  }
}

function lock(sel){
  state.locked = true;
  const correct = titleCase(state.current.name);
  let isCorrect = (sel === correct);

  roundHistory.push({
    name: correct,
    img: state.current.img,
    guessedCorrectly: isCorrect
  });

  $$('#answers .btn').forEach(b => {
    if(b.textContent === correct) b.classList.add('correct');
    if(sel && b.textContent === sel && !isCorrect) b.classList.add('wrong');
    b.disabled = true;
  });
  $('#next').disabled = false;
}

function showExtra(){
  if(state.gameOver) return;
  if(!state.current) return;
  const {id, types, name} = state.current;
  const chips = types.map(t => `<span class="chip">${capitalize(t)}</span>`).join('');
  $('#extra').innerHTML = `#${id} — <b>${titleCase(name)}</b> ${chips}`;
}

async function nextRound(){
  $('#next').disabled = true;
  $('#extra').textContent = '';
  $('#status').textContent = 'Cargando…';
  state.locked = false;
  state.hints = 0;
  
  const m = $('#pokeMask');
  if(m){
    m.style.opacity = '1';
    m.style.setProperty('--rev', '0%');
  }
  
  let detail = null, tries = 0;
  while(!detail && tries < 6 && POKEDEX.length > 0){
    const r = POKEDEX[Math.floor(Math.random() * POKEDEX.length)];
    try {
      const d = await getDetail(r.id);
      if(d && d.img) detail = d;
    } catch {}
    tries++;
  }
  if(!detail){
    $('#status').textContent = "Error cargando.";
    return;
  }
  state.current = detail;
  $('#pokeBase').src = detail.img;
  $('#pokeMask').src = detail.img;
  renderOptions(buildOptions(detail.name));
  $('#status').textContent = '';
}

function playErrorSound() {
  if(sfxVolume <= 0) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if(!AudioContext) return;
    const ctx = new AudioContext();
    
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'square';
    osc2.type = 'sawtooth';

    osc1.frequency.setValueAtTime(180, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);

    osc2.frequency.setValueAtTime(135, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.3);

    const adjustedGain = 0.3 * sfxVolume;
    gainNode.gain.setValueAtTime(adjustedGain, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.3);
    osc2.stop(ctx.currentTime + 0.3);
  } catch(e) {
    console.log("Web Audio error:", e);
  }
}

function choose(opt){
  try {
    if(state.locked || !state.current) return;
    revealFull();
    showExtra();
    
    const correctName = titleCase(state.current.name);
    if(opt === correctName){
      state.score++;
      $('#score').textContent = state.score;
      if(state.current.cry && sfxVolume > 0){
        const sndCry = new Audio(state.current.cry);
        sndCry.volume = sfxVolume;
        sndCry.play().catch(e => console.log("Audio cry play error:", e));
      }
    } else {
      playErrorSound();
    }
    lock(opt);
  } catch(err) {
    console.error("Error al seleccionar opción:", err);
  }
}

$('#hint').addEventListener('click', () => {
  if(state.locked) return;
  state.hints++;
  const perc = Math.min(state.hints * 20, 100);
  $('#pokeMask').style.setProperty('--rev', perc + '%');
  if(perc >= 100) $('#hint').disabled = true;
});

$('#next').addEventListener('click', () => {
  if (state.gameOver) {
    resetGameFlow();
    return;
  }

  state.round++;
  if(state.round <= state.total){
    $('#round').textContent = state.round;
    $('#hint').disabled = false;
    nextRound();
  } else {
    state.gameOver = true;
    stopTimer();
    
    bgMusic.src = 'victoria.mp3';
    bgMusic.load();
    if(musicVolume > 0) {
      bgMusic.play().catch(e => console.log("Victory music play error:", e));
      musicToggleBtn.textContent = '⏸ Pause';
    }

    revealFull();
    showExtra();
    
    const tier = getPokemonTier(state.score);
    $('#mainTitle').innerHTML = `<span style="color:${tier.text};">${tier.name}</span>`;

    const name = prompt("Fin del juego.\nIngresá tu nombre para el ranking:", "Entrenador");
    if(name) saveRanking(name, state.score);
    renderRanking();

    showSummaryScreen(tier);
  }
});

function showSummaryScreen(tier) {
  $('#gamePlayArea').style.display = 'none';
  $('#summaryArea').style.display = 'flex';
  $('#summaryRankTitle').textContent = `Partida Finalizada — ${tier.name}`;

  const listContainer = $('#summaryPokemonList');
  listContainer.innerHTML = '';

  roundHistory.forEach(item => {
    const box = document.createElement('div');
    box.className = `poke-summary-item ${item.guessedCorrectly ? 'correct-guess' : 'wrong-guess'}`;
    box.innerHTML = `
      <img src="${item.img}" alt="${item.name}">
      <div class="poke-summary-name" title="${item.name}">${item.name}</div>
    `;
    listContainer.appendChild(box);
  });
}

function resetGameFlow() {
  state.score = 0;
  state.round = 1;
  state.gameOver = false;
  roundHistory = [];
  
  $('#score').textContent = state.score;
  $('#round').textContent = state.round;
  $('#next').textContent = 'Siguiente';
  $('#hint').disabled = false;
  $('#extra').textContent = '';
  
  $('#mainTitle').textContent = '¿Quién es ese Pokémon?';
  $('#summaryArea').style.display = 'none';
  $('#gamePlayArea').style.display = 'grid';

  bgMusic.src = 'batalla-pokemon.mp3';
  bgMusic.load();
  if(musicVolume > 0) {
    bgMusic.play().catch(e => console.log("Battle music play error:", e));
    musicToggleBtn.textContent = '⏸ Pause';
  }
  
  startTimer();
  nextRound();
}

$('#restartGameBtn').addEventListener('click', resetGameFlow);

window.addEventListener('keydown', e => {
  if(state.locked) return;
  if(['1', '2', '3', '4'].includes(e.key)){
    const i = parseInt(e.key, 10) - 1;
    const b = $$('#answers .btn')[i];
    if(b) b.click();
  }
});

/* Lógica del Menú de Inicio */
$('#startGameBtn').addEventListener('click', () => {
  $('#startScreen').style.display = 'none';
  if(musicVolume > 0) {
    bgMusic.play().then(() => {
      musicToggleBtn.textContent = '⏸ Pause';
    }).catch(e => console.log("Audio play error:", e));
  }
  startTimer();
  nextRound();
});

(async function init(){
  await loadDex();
  renderRanking();
  $('#round').textContent = state.round;
  $('#total').textContent = state.total;
})();