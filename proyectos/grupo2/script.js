

const $ = selector => document.querySelector(selector);

const DEEZER_PROXY = "https://proxy.cors.dev/https://api.deezer.com";
const ITUNES_URL = "https://itunes.apple.com/search";

const TOTAL_ROUNDS = 5;
const TARGET_SONGS = 24;

const GAME_PAGE = "adivina_cancion.html";
const GENRE_PAGE = "generos.html";

const ALL_GENRES = [
    "Rock", "Urbana", "Reggaetón", "Bachata",
    "Cumbia", "Pop", "Trap"
];

// ARTISTAS POR GÉNERO

const GENRE_ARTISTS = {

    "Rock": [
        "Soda Stereo", "Queen", "Airbag", "Charly Garcia",
        "Fito Paez", "Bon Jovi", "Coldplay", "Tan Bionica",
        "The Beatles", "a-ha", "Andres Calamaro",
        "Los Piojos", "Divididos", "Los Pericos"
    ],

    "Urbana": [
        "Bad Bunny", "Duki", "Emilia", "Tiago PZK",
        "Trueno", "Bizarrap", "Nicki Nicole", "Wos",
        "Paulo Londra", "Maria Becerra"
    ],

    "Reggaetón": [
        "Daddy Yankee", "Don Omar", "Wisin y Yandel",
        "J Balvin", "Ozuna", "Rauw Alejandro", "Feid",
        "Maluma", "Nicky Jam", "Bad Bunny",
        "Maria Becerra", "Emilia", "Tiago PZK",
        "Rusherking", "FMK"
    ],

    "Bachata": [
        "Romeo Santos", "Prince Royce", "Aventura",
        "Monchy y Alexandra", "Dani J", "Frank Reyes",
        "Zacarias Ferreira"
    ],

    "Cumbia": [
        "Karina", "Los Palmeras", "La Konga", "Rafaga",
        "Amar Azul", "Damas Gratis", "Gilda",
        "Grupo Sombras", "Antonio Rios", "Yerba Brava",
        "Los Charros", "La Nueva Luna", "El Polaco",
        "Angela Leiva", "Nestor en Bloque"
    ],

    "Pop": [
        "Justin Bieber", "Shakira", "Katy Perry", "Ed Sheeran",
        "Adele", "Rihanna", "Bruno Mars", "Taylor Swift",
        "Dua Lipa", "Michael Jackson", "Maroon 5",
        "The Weeknd", "Tini", "Emilia", "Lali",
        "Miranda", "Abel Pintos", "Diego Torres"
    ],

    "Trap": [
        "Duki", "YSY A", "Neo Pistea", "Cazzu", "Khea",
        "Paulo Londra", "Lit Killah", "Bhavi", "Trueno",
        "Tiago PZK", "Wos", "Nicki Nicole"
    ]

};

// UTILIDADES

function normalizeName(name) {
    return String(name || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");
}

function uniqueArtists(artists) {
    return [
        ...new Map(
            artists.map(artist => [normalizeName(artist), artist])
        ).values()
    ];
}

// ESTADO DEL JUEGO

let state = {
    score: 0,
    round: 0,
    usedIds: new Set(),
    current: null,
    selectedGenres: [],
    loadingFirst: false,
    locked: false,
    songPool: null
};

// TEMA

function applyTheme(theme) {

    document.body.classList.toggle("light", theme === "light");

    if ($("#themeToggle")) {
        $("#themeToggle").textContent =
            theme === "light" ? "🌙 Modo oscuro" : "☀️ Modo claro";
    }

    try {
        localStorage.setItem("musicGameTheme", theme);
    } catch (error) {
        console.warn(error);
    }
}

let savedTheme = "dark";

try {
    savedTheme = localStorage.getItem("musicGameTheme") || "dark";
} catch (error) {}

applyTheme(savedTheme);

if ($("#themeToggle")) {

    $("#themeToggle").addEventListener("click", () => {

        const light = document.body.classList.contains("light");

        applyTheme(light ? "dark" : "light");

    });

}

// ALEATORIEDAD

function shuffle(items) {

    const copy = [...items];

    for (let i = copy.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [copy[i], copy[j]] = [copy[j], copy[i]];

    }

    return copy;
}

function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
}

// CONSULTAS CON TIEMPO LÍMITE

async function fetchWithTimeout(url, timeoutMs = 15000) {

    const controller = new AbortController();

    const timer = setTimeout(() => {
        controller.abort();
    }, timeoutMs);

    try {

        const response = await fetch(url, {
            signal: controller.signal,
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("Error HTTP " + response.status);
        }

        return await response.json();

    } finally {
        clearTimeout(timer);
    }
}

// NORMALIZAR CANCIONES

function createSongId(title, artist) {
    return normalizeName(title) + "-" + normalizeName(artist);
}

function normalizeITunes(track) {

    if (
        !track ||
        !track.trackId ||
        !track.previewUrl ||
        !track.trackName
    ) {
        return null;
    }

    const artist = track.artistName || "Artista desconocido";

    return {
        id: createSongId(track.trackName, artist),
        title: track.trackName,
        artist,
        label: track.trackName + " — " + artist,
        preview: track.previewUrl,
        cover: track.artworkUrl100 || "",
        source: "iTunes"
    };
}

function normalizeDeezer(track) {

    if (
        !track ||
        !track.id ||
        !track.preview ||
        !track.title ||
        !track.artist?.name
    ) {
        return null;
    }

    const artist = track.artist.name;

    return {
        id: createSongId(track.title, artist),
        title: track.title,
        artist,
        label: track.title + " — " + artist,
        preview: track.preview,
        cover: track.album?.cover_medium || "",
        source: "Deezer"
    };
}

// OBTENER ARTISTAS SEGÚN LOS GÉNEROS

function getSelectedArtists() {

    let artists = [];

    state.selectedGenres.forEach(genre => {

        artists = artists.concat(GENRE_ARTISTS[genre] || []);

    });

    return uniqueArtists(artists);
}

// BUSCAR EN DEEZER

async function searchDeezer(artist) {

    const url = DEEZER_PROXY +
        "/search?q=" +
        encodeURIComponent('artist:"' + artist + '"') +
        "&limit=50";

    const data = await fetchWithTimeout(url);

    if (data.error) {
        throw new Error(data.error.message);
    }

    return (data.data || [])
        .map(normalizeDeezer)
        .filter(Boolean);
}

// BUSCAR EN ITUNES

async function searchITunes(artist) {

    const url = ITUNES_URL +
        "?term=" + encodeURIComponent(artist) +
        "&entity=song&attribute=artistTerm&limit=200&country=AR";

    const data = await fetchWithTimeout(url);

    return (data.results || [])
        .map(normalizeITunes)
        .filter(Boolean);
}

// ELIMINAR CANCIONES REPETIDAS

function removeDuplicates(songs) {

    return [
        ...new Map(
            songs.map(song => [song.id, song])
        ).values()
    ];
}

// BUSCAR CANCIONES EN LAS DOS APIS

async function getSongsPool() {

    if (state.songPool) {
        return state.songPool;
    }

    const artists = shuffle(getSelectedArtists());

    if (artists.length === 0) {
        throw new Error(
            "No hay artistas disponibles para esa combinación."
        );
    }

    let songs = [];

    console.log("Artistas seleccionados:", artists);

    // Consultamos las dos APIs por grupos de artistas.

    for (let i = 0; i < artists.length; i += 3) {

        const batch = artists.slice(i, i + 3);

        console.log("Buscando artistas:", batch);

        const requests = batch.map(async artist => {

            const results = await Promise.allSettled([

                searchDeezer(artist),
                searchITunes(artist)

            ]);

            const artistSongs = [];

            results.forEach((result, index) => {

                if (result.status === "fulfilled") {

                    artistSongs.push(...result.value);

                } else {

                    console.warn(
                        index === 0 ? "Error Deezer:" : "Error iTunes:",
                        artist,
                        result.reason
                    );

                }

            });

            return artistSongs;

        });

        const results = await Promise.all(requests);

        songs = removeDuplicates([
            ...songs,
            ...results.flat()
        ]);

        console.log(
            "Canciones acumuladas:",
            songs.length
        );

        if (songs.length >= TARGET_SONGS) {
            break;
        }

    }

    state.songPool = shuffle(songs);

    console.log("Búsqueda terminada.");
    console.log("Total de canciones:", state.songPool.length);

    if (state.songPool.length < 20) {

        console.warn(
            "No se consiguieron 20 canciones diferentes. " +
            "Probá con más géneros o con otra selección."
        );

    }

    return state.songPool;
}

// PREPARAR RONDA

async function createRoundPack() {

    const pool = await getSongsPool();

    const available = pool.filter(
        song => !state.usedIds.has(song.id)
    );

    if (available.length < 4) {

        throw new Error(
            "No quedan suficientes canciones nuevas. " +
            "Se encontraron " + pool.length +
            " canciones válidas en total."
        );

    }

    const choices = shuffle(available).slice(0, 4);

    choices.forEach(song => state.usedIds.add(song.id));

    return {
        choices,
        correct: randomItem(choices)
    };
}

// MOSTRAR RONDA

function renderPack(pack) {

    state.current = pack;
    state.locked = false;

    const player = $("#player");

    player.pause();
    player.src = pack.correct.preview;
    player.load();

    $("#cover").src = pack.correct.cover;
    $("#cover").alt = "Portada de " + pack.correct.title;

    $("#answers").innerHTML = "";

    shuffle(pack.choices).forEach(song => {

        const button = document.createElement("button");

        button.className = "answer-button";
        button.textContent = song.label;
        button.dataset.songId = song.id;

        button.addEventListener("click", () => {
            chooseAnswer(song.id);
        });

        $("#answers").appendChild(button);

    });

    $("#round").textContent = state.round;
    $("#score").textContent = state.score;

    $("#next").disabled = true;

    $("#next").textContent =
        state.round === TOTAL_ROUNDS
            ? "Ver resultado"
            : "Siguiente →";

    $("#status").textContent =
        "Escuchá el fragmento y elegí una respuesta.";

    $("#audioHint").textContent =
        "Tocá reproducir para escuchar el fragmento.";

}

// REPRODUCIR AUDIO

function tryPlay() {

    const player = $("#player");

    const promise = player.play();

    if (promise && promise.catch) {

        promise.catch(() => {

            $("#audioHint").textContent =
                "Tocá reproducir en el reproductor para escuchar.";

        });

    }
}

// RESPUESTAS

function chooseAnswer(selectedId) {

    if (!state.current || state.locked) return;

    state.locked = true;

    const correctId = state.current.correct.id;

    if (selectedId === correctId) {

        state.score++;

        $("#status").textContent =
            "¡Correcto! Sumaste un punto. 🎉";

    } else {

        $("#status").textContent =
            "Incorrecto. La respuesta era: " +
            state.current.correct.label;

    }

    $("#score").textContent = state.score;

    document.querySelectorAll(".answer-button").forEach(button => {

        const id = button.dataset.songId;

        if (id === correctId) {
            button.classList.add("correct");
        }

        if (id === selectedId && id !== correctId) {
            button.classList.add("wrong");
        }

        button.disabled = true;

    });

    $("#player").pause();

    $("#next").disabled = false;

}

// COMENZAR JUEGO

function startGame() {

    if (!state.current) {
        prepareFirstRound();
        return;
    }

    $("#welcome").classList.add("hidden");
    $("#game").classList.remove("hidden");

    state.round = 1;

    renderPack(state.current);

    tryPlay();

}

// SIGUIENTE RONDA

async function goNext() {

    if (state.round === TOTAL_ROUNDS) {

        finishGame();

        return;
    }

    $("#next").disabled = true;
    $("#next").textContent = "Buscando...";

    $("#status").textContent =
        "Preparando canciones nuevas...";

    try {

        const pack = await createRoundPack();

        state.round++;

        renderPack(pack);

        tryPlay();

    } catch (error) {

        console.error(error);

        $("#status").textContent = error.message;

        $("#next").disabled = false;
        $("#next").textContent = "Reintentar";

    }

}

// RESULTADO FINAL

function finishGame() {

    $("#game").classList.add("hidden");
    $("#finished").classList.remove("hidden");

    $("#finalScore").textContent =
        state.score + " / " + TOTAL_ROUNDS;

    if (state.score === 5) {

        $("#finalMessage").textContent =
            "¡Excelente! Acertaste todas las canciones.";

    } else if (state.score >= 3) {

        $("#finalMessage").textContent =
            "¡Muy bien! Tenés buen oído musical.";

    } else if (state.score >= 1) {

        $("#finalMessage").textContent =
            "¡Buen trabajo! Seguí practicando.";

    } else {

        $("#finalMessage").textContent =
            "¡A seguir intentando!";

    }

    $("#player").pause();
    $("#player").removeAttribute("src");
    $("#player").load();

}

// PREPARAR PRIMERA RONDA

async function prepareFirstRound() {

    if (state.loadingFirst) return;

    state.loadingFirst = true;

    $("#start").disabled = true;
    $("#start").textContent = "Buscando canciones...";

    try {

        state.current = await createRoundPack();

        $("#start").disabled = false;
        $("#start").textContent = "Comenzar a jugar";

    } catch (error) {

        console.error("Error al buscar canciones:", error);

        state.current = null;

        $("#start").disabled = false;
        $("#start").textContent = "Reintentar conexión";

        $("#genreLabel").textContent = error.message;

    }

    state.loadingFirst = false;

}

// LEER GÉNEROS GUARDADOS

function readSavedGenres() {

    try {

        const saved = JSON.parse(
            sessionStorage.getItem("selectedMusicGenres") || "[]"
        );

        if (
            !Array.isArray(saved) ||
            saved.length === 0 ||
            !saved.every(genre => ALL_GENRES.includes(genre))
        ) {

            return [];

        }

        return saved;

    } catch (error) {

        console.error(error);

        return [];

    }

}

// PÁGINA DE GÉNEROS

function setupGenrePage() {

    let selectedGenres = [];

    const genreButtons = document.querySelectorAll(".genre-option");

    const allButton = $("#allGenres");
    const selectedDisplay = $("#selectedGenres");
    const playButton = $("#playGenres");

    function updateGenreSelection() {

        genreButtons.forEach(button => {

            button.classList.toggle(
                "selected",
                selectedGenres.includes(button.dataset.genre)
            );

        });

        allButton.classList.toggle(
            "selected",
            selectedGenres.length === ALL_GENRES.length
        );

        selectedDisplay.textContent = selectedGenres.length
            ? selectedGenres.join(" + ")
            : "Ninguno seleccionado";

        $("#genreMessage").textContent = selectedGenres.length
            ? selectedGenres.length + " género(s) seleccionado(s)."
            : "Seleccioná al menos un género para continuar.";

        playButton.disabled = selectedGenres.length === 0;

    }

    genreButtons.forEach(button => {

        button.addEventListener("click", () => {

            const genre = button.dataset.genre;

            if (selectedGenres.includes(genre)) {

                selectedGenres = selectedGenres.filter(
                    item => item !== genre
                );

            } else {

                selectedGenres.push(genre);

            }

            updateGenreSelection();

        });

    });

    allButton.addEventListener("click", () => {

        if (selectedGenres.length === ALL_GENRES.length) {

            selectedGenres = [];

        } else {

            selectedGenres = [...ALL_GENRES];

        }

        updateGenreSelection();

    });

    $("#clearGenres").addEventListener("click", () => {

        selectedGenres = [];

        updateGenreSelection();

    });

    playButton.addEventListener("click", () => {

        if (selectedGenres.length === 0) return;

        sessionStorage.setItem(
            "selectedMusicGenres",
            JSON.stringify(selectedGenres)
        );

        window.location.href = GAME_PAGE;

    });

    updateGenreSelection();

}

// PÁGINA PRINCIPAL DEL JUEGO

function setupGamePage() {

    const savedGenres = readSavedGenres();

    if (savedGenres.length === 0) {

        $("#welcome").classList.remove("hidden");
        $("#game").classList.add("hidden");
        $("#finished").classList.add("hidden");

        $("#start").addEventListener("click", () => {

            window.location.href = GENRE_PAGE;

        });

        return;

    }

    state.selectedGenres = savedGenres;

    $("#genreLabel").textContent =
        "Selección: " + savedGenres.join(" + ");

    $("#start").addEventListener("click", startGame);

    $("#next").addEventListener("click", goNext);

    $("#restart").addEventListener("click", () => {

        sessionStorage.removeItem("selectedMusicGenres");

        window.location.href = GAME_PAGE;

    });

    prepareFirstRound();

}

// DETECTAR PÁGINA

if ($("#playGenres")) {

    setupGenrePage();

} else if ($("#welcome")) {

    setupGamePage();

}
