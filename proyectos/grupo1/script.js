/* ---------- 1. Datos y configuración ---------- */
// Para usar una API externa, reemplazá este objeto por un fetch().
const WORDS = {
  "Animales":   ["elefante", "jirafa", "murciélago", "cocodrilo", "pingüino", "delfín",
                 "mariposa", "caballo", "tortuga", "hipopótamo", "canguro", "gallina"],
  "Países":     ["argentina", "españa", "japón", "brasil", "australia", "alemania",
                 "méxico", "colombia", "noruega", "egipto", "canadá", "portugal"],
  "Tecnología": ["computadora", "teclado", "algoritmo", "internet", "programa", "pantalla",
                 "navegador", "servidor", "variable", "función", "bluetooth", "impresora"],
  "Comida":     ["empanada", "milanesa", "chocolate", "alfajor", "hamburguesa", "ensalada",
                 "zanahoria", "mermelada", "tostada", "pizza", "sandía", "durazno"],
  "Deportes":   ["fútbol", "básquet", "natación", "ciclismo", "atletismo", "voleibol",
                 "tenis", "rugby", "gimnasia", "patinaje", "handball", "esgrima"]
};

const KEYBOARD_ROWS = ["QWERTYUIOP", "ASDFGHJKLÑ", "ZXCVBNM"];
const MAX_ERRORS = 6;
const HINT_COST = 15;
const CONFETTI_COLORS = ["#1d4ed8", "#15803d", "#f59e0b", "#db2777", "#7c3aed"];


/* ---------- 2. Estado ---------- */
const state = {
  category: "Animales",
  word: "",
  letters: [],          // [{ shown: "Ó", base: "O" }, ...]
  used: new Set(),      // letras ya probadas (sin tildes)
  errors: 0,
  finished: false,
  score: 0,
  streak: 0,
  best: 0,
  muted: false,
  seenWords: {}         // palabras ya jugadas por categoría
};

// Recupera récord y sonido guardados (si el navegador lo permite)
try {
  state.best = Number(localStorage.getItem("ahorcado-best")) || 0;
  state.muted = localStorage.getItem("ahorcado-mute") === "1";
} catch (e) { /* sin almacenamiento */ }


/* ---------- 3. Utilidades ---------- */
const $ = (id) => document.getElementById(id);

// Quita tildes y pasa a mayúscula; la Ñ se conserva
function normalize(char) {
  if (/ñ/i.test(char)) return "Ñ";
  return char.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}

function save(key, value) {
  try { localStorage.setItem(key, value); } catch (e) { /* sin almacenamiento */ }
}


/* ---------- 4. Sonido ---------- */
let audioCtx;

function tone(freq, duration, type = "sine", volume = 0.08, delay = 0) {
  if (state.muted) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const start = audioCtx.currentTime + delay;

    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(start);
    osc.stop(start + duration);
  } catch (e) { /* audio no disponible */ }
}

const sounds = {
  correct: () => {
    tone(660, 0.12);
    tone(880, 0.15, "sine", 0.08, 0.08);
  },
  wrong: () => tone(150, 0.3, "sawtooth", 0.07),
  win:   () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.25, "triangle", 0.09, i * 0.12)),
  lose:  () => [392, 330, 262, 196].forEach((f, i) => tone(f, 0.3, "sawtooth", 0.06, i * 0.18))
};


/* ---------- 5. Dibujo en pantalla ---------- */
function renderCategories() {
  const container = $("cats");
  container.innerHTML = "";

  Object.keys(WORDS).forEach((name) => {
    const btn = document.createElement("button");
    btn.className = "chip";
    btn.textContent = name;
    btn.setAttribute("aria-pressed", name === state.category);
    btn.onclick = () => {
      state.category = name;
      renderCategories();
      startGame();
    };
    container.appendChild(btn);
  });
}

function renderKeyboard() {
  const container = $("keyboard");
  container.innerHTML = "";

  KEYBOARD_ROWS.forEach((letters) => {
    const row = document.createElement("div");
    row.className = "row";

    [...letters].forEach((letter) => {
      const btn = document.createElement("button");
      btn.className = "key";
      btn.textContent = letter;
      btn.dataset.letter = letter;
      btn.onclick = () => guess(letter);
      row.appendChild(btn);
    });

    container.appendChild(row);
  });
}

function renderWord() {
  const container = $("word");
  container.innerHTML = "";

  state.letters.forEach((letter) => {
    const slot = document.createElement("div");

    if (letter.base === " ") {
      slot.className = "slot gap";
    } else {
      slot.className = "slot";
      const revealed = state.used.has(letter.base);

      if (revealed || state.finished) {
        const span = document.createElement("span");
        span.textContent = letter.shown;
        slot.appendChild(span);
        // Letras que no se adivinaron (se muestran en rojo al perder)
        if (!revealed) slot.classList.add("missed");
      }
    }
    container.appendChild(slot);
  });
}

function renderStats() {
  const lives = MAX_ERRORS - state.errors;
  $("lives").textContent = "❤ " + lives;
  $("lives").className = "lives" + (lives <= 2 ? " low" : "");
  $("score").textContent = state.score;
  $("streak").textContent = state.streak;
  $("best").textContent = state.best;
}

function render() {
  renderWord();
  renderStats();
}

function showResult(won, message) {
  $("modal").className = "modal " + (won ? "win" : "lose");
  $("modal-title").textContent = won ? "¡Te salvaste!" : "Perdiste";
  $("modal-word").textContent = state.word.toUpperCase();
  $("modal-msg").textContent = message;
  $("btn-help").disabled = true;

  setTimeout(() => {
    $("overlay").classList.add("show");
    $("btn-next").focus();
  }, won ? 600 : 900);
}

function launchConfetti() {
  for (let i = 0; i < 50; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti";
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    piece.style.animationDuration = (1.8 + Math.random() * 1.6) + "s";
    piece.style.animationDelay = Math.random() * 0.4 + "s";
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 4200);
  }
}


/* ---------- 6. Lógica de juego ---------- */
function pickWord() {
  const all = WORDS[state.category];
  if (!state.seenWords[state.category] || state.seenWords[state.category].length >= all.length) {
    state.seenWords[state.category] = [];
  }
  const seen = state.seenWords[state.category];
  const available = all.filter((w) => !seen.includes(w));
  const word = available[Math.floor(Math.random() * available.length)];
  seen.push(word);
  return word;
}

function startGame() {
  state.word = pickWord();
  state.letters = [...state.word].map((char) => ({
    shown: char.toUpperCase(),
    base: char === " " ? " " : normalize(char)
  }));
  state.used = new Set();
  state.errors = 0;
  state.finished = false;

  $("overlay").classList.remove("show");
  document.querySelectorAll(".part").forEach((p) => p.classList.remove("on"));
  $("hint").textContent = "Categoría: " + state.category + " · " + state.word.length + " letras";
  $("btn-help").disabled = false;

  renderKeyboard();
  render();
}

function guess(letter) {
  if (state.finished || state.used.has(letter)) return;

  state.used.add(letter);
  const hit = state.letters.some((l) => l.base === letter);
  const key = document.querySelector('.key[data-letter="' + letter + '"]');

  if (key) {
    key.disabled = true;
    key.classList.add(hit ? "ok" : "no");
  }

  if (hit) {
    sounds.correct();
  } else {
    sounds.wrong();
    const part = document.querySelectorAll(".part")[state.errors];
    state.errors++;
    if (part) part.classList.add("on");
  }

  render();
  checkEnd();
}

function checkEnd() {
  const won = state.letters.every((l) => l.base === " " || state.used.has(l.base));

  if (won) {
    state.finished = true;
    const bonus = (MAX_ERRORS - state.errors) * 10 + state.streak * 10 + 20;
    state.score += bonus;
    state.streak++;

    if (state.score > state.best) {
      state.best = state.score;
      save("ahorcado-best", state.best);
    }

    render();
    sounds.win();
    launchConfetti();
    showResult(true, "+" + bonus + " puntos" + (state.streak > 1 ? " · racha de " + state.streak : ""));

  } else if (state.errors >= MAX_ERRORS) {
    state.finished = true;
    state.streak = 0;
    render();
    sounds.lose();
    showResult(false, "Se terminó la racha. ¡Probá de nuevo!");
  }
}

function useHint() {
  if (state.finished) return;

  const hidden = state.letters.filter((l) => l.base !== " " && !state.used.has(l.base));
  if (hidden.length <= 1 || state.errors >= MAX_ERRORS - 1) return;

  state.score = Math.max(0, state.score - HINT_COST);
  guess(hidden[Math.floor(Math.random() * hidden.length)].base);
}


/* ---------- 7. Eventos ---------- */
$("btn-help").onclick = useHint;

$("btn-skip").onclick = () => {
  if (!state.finished) state.streak = 0;
  startGame();
};

$("btn-next").onclick = startGame;

$("btn-sound").onclick = () => {
  state.muted = !state.muted;
  $("btn-sound").textContent = state.muted ? "🔇" : "🔊";
  save("ahorcado-mute", state.muted ? "1" : "0");
};

$("btn-theme").onclick = () => {
  const root = document.documentElement;
  const isDark = root.dataset.theme
    ? root.dataset.theme === "dark"
    : matchMedia("(prefers-color-scheme: dark)").matches;
  root.dataset.theme = isDark ? "light" : "dark";
};

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  if (e.key === "Enter" && state.finished) {
    startGame();
    return;
  }
  if (e.key.length === 1 && /[a-zñáéíóúü]/i.test(e.key)) {
    guess(normalize(e.key));
  }
});


/* ---------- 8. Inicio ---------- */
$("btn-sound").textContent = state.muted ? "🔇" : "🔊";
renderCategories();
startGame();