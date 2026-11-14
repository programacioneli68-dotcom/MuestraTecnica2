document.addEventListener('DOMContentLoaded', () => {
  const $ = s => document.querySelector(s); 
  const $$ = s => Array.from(document.querySelectorAll(s));

  /* 🌙 Modo Tema / Oscuro o Claro */
  const themeToggle = $('#themeToggle');
  function setTheme(isLight) {
    document.body.classList.toggle('light-mode', isLight);
    if (themeToggle) themeToggle.textContent = isLight ? '☀️' : '🌙';
    localStorage.setItem('movie_theme', isLight ? 'light' : 'dark');
  }
  if (themeToggle) {
    themeToggle.addEventListener('click', () => setTheme(!document.body.classList.contains('light-mode')));
  }
  if (localStorage.getItem('movie_theme') === 'light') setTheme(true);

  /* ⚙️ Sistema de Modo Administrador */
  const settingsBtn = $('#settingsBtn');
  const adminModal = $('#adminModal');
  const adminLoginSection = $('#adminLoginSection');
  const adminDashboardSection = $('#adminDashboardSection');
  const adminPassInput = $('#adminPassInput');
  const adminSubmitBtn = $('#adminSubmitBtn');
  const adminCancelBtn = $('#adminCancelBtn');
  const adminCloseBtn = $('#adminCloseBtn');
  const clearRankingBtn = $('#clearRankingBtn');
  const adminRankingList = $('#adminRankingList');

  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      if (adminModal) {
        adminModal.style.display = 'flex';
        adminLoginSection.style.display = 'block';
        adminDashboardSection.style.display = 'none';
        adminPassInput.value = '';
        adminPassInput.focus();
      }
    });
  }

  function handleAdminLogin() {
    if (adminPassInput.value === 'admin123') {
      adminLoginSection.style.display = 'none';
      adminDashboardSection.style.display = 'block';
      renderAdminRanking();
    } else {
      alert('Contraseña incorrecta.');
      adminPassInput.value = '';
      adminPassInput.focus();
    }
  }

  if (adminSubmitBtn) adminSubmitBtn.addEventListener('click', handleAdminLogin);
  if (adminPassInput) {
    adminPassInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleAdminLogin(); });
  }

  if (adminCancelBtn) adminCancelBtn.addEventListener('click', () => { adminModal.style.display = 'none'; });
  if (adminCloseBtn) adminCloseBtn.addEventListener('click', () => { adminModal.style.display = 'none'; });

  function renderAdminRanking() {
    let r = JSON.parse(localStorage.getItem("movie_ranking") || "[]");
    if (!adminRankingList) return;
    if (!r.length) {
      adminRankingList.innerHTML = '<p style="color:var(--muted); margin:0;">El ranking está vacío.</p>';
      return;
    }
    let h = "<table class='ranking-table'><tr><th>#</th><th>Nombre</th><th>Pts</th><th>Acción</th></tr>";
    r.forEach((x, index) => {
      h += `<tr>
        <td>${index + 1}</td>
        <td><b>${x.name}</b></td>
        <td>${x.score}</td>
        <td><button class="btnCinematicSec deleteRankItem" data-index="${index}" style="padding:4px 8px; font-size:11px; background:#ef4444; color:#fff; border:none; margin-top:0;">Borrar</button></td>
      </tr>`;
    });
    h += "</table>";
    adminRankingList.innerHTML = h;

    $$('.deleteRankItem').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'));
        r.splice(idx, 1);
        localStorage.setItem("movie_ranking", JSON.stringify(r));
        renderAdminRanking();
        renderRanking();
      });
    });
  }

  if (clearRankingBtn) {
    clearRankingBtn.addEventListener('click', () => {
      if (confirm("¿Estás seguro de que querés borrar todo el ranking?")) {
        localStorage.removeItem("movie_ranking");
        renderAdminRanking();
        renderRanking();
      }
    });
  }

  /* 🎬 Catálogo Completo de Películas */
  const ALL_MOVIES = [
    { Title: "Volver al Futuro", Year: "1985", Poster: "https://image.tmdb.org/t/p/w1280/ueL9wJhMkoR2OGPpVu4ArF0nwVn.jpg", genre: "scifi", decoys: ["Los Cazafantasmas", "Indiana Jones y el Templo Maldito", "Los Goonies"] },
    { Title: "Jurassic Park", Year: "1993", Poster: "https://image.tmdb.org/t/p/w1280/b1xCNnyrPebIc7EWNZIa6jhb1Ww.jpg", genre: "scifi", decoys: ["Godzilla", "King Kong", "Soy Leyenda"] },
    { Title: "Titanic", Year: "1997", Poster: "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg", genre: "drama", decoys: ["Diario de una Pasión", "Pearl Harbor", "Ghost"] },
    { Title: "Matrix", Year: "1999", Poster: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", genre: "scifi", decoys: ["Equilibrium", "Yo, Robot", "Minority Report"] },
    { Title: "Avatar", Year: "2009", Poster: "https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgbbJyK.jpg", genre: "scifi", decoys: ["Alicia en el País de las Maravillas", "Valerian", "Titanes del Pacífico"] },
    { Title: "El Padrino", Year: "1972", Poster: "https://image.tmdb.org/t/p/w1280/ApiEfzSkrqS4m1L5a2GwWXzIiAs.jpg", genre: "crime", decoys: ["Buenos Muchachos", "Scarface", "El Irlandés"] },
    { Title: "Star Wars: Una nueva esperanza", Year: "1977", Poster: "https://image.tmdb.org/t/p/w1280/4hOUzmButYUeON0prG3RpbqS7ag.jpg", genre: "scifi", decoys: ["Star Trek", "Dune Parte Dos", "Guardianes de la Galaxia"] },
    { Title: "Los Vengadores", Year: "2012", Poster: "https://image.tmdb.org/t/p/w500/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg", genre: "hero", decoys: ["Liga de la Justicia", "El Hombre de Acero", "Iron Man"] },
    { Title: "Toy Story", Year: "1995", Poster: "https://image.tmdb.org/t/p/w500/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg", genre: "animation", decoys: ["Bichos", "Madagascar", "La Era de Hielo"] },
    { Title: "Shrek", Year: "2001", Poster: "https://image.tmdb.org/t/p/w1280/jTQONM7jt1yv2lL972TtmWO0UIZ.jpg", genre: "animation", decoys: ["La Era de Hielo", "Madagascar", "Hotel Transylvania"] },
    { Title: "Gladiador", Year: "2000", Poster: "https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg", genre: "action", decoys: ["Troya", "300", "El Rey Arturo"] },
    { Title: "Buscando a Nemo", Year: "2003", Poster: "https://image.tmdb.org/t/p/w1280/jPhak722pNGxQIXSEfeWIUqBrO5.jpg", genre: "animation", decoys: ["El Espanta-Tiburones", "Buscando a Dory", "Moana"] },
    { Title: "El Rey León", Year: "1994", Poster: "https://image.tmdb.org/t/p/w500/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg", genre: "animation", decoys: ["Tarzán", "Mulán", "Pocahontas"] },
    { Title: "Interestelar", Year: "2014", Poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", genre: "scifi", decoys: ["Gravity", "The Martian", "Arrival"] },
    { Title: "El Señor de los Anillos: La Comunidad del Anillo", Year: "2001", Poster: "https://image.tmdb.org/t/p/w1280/9xtH1RmAzQ0rrMBNUMXstb2s3er.jpg", genre: "fantasy", decoys: ["El Hobbit", "Las Crónicas de Narnia", "Harry Potter y la Cámara Secreta"] },
    { Title: "Spider-Man", Year: "2002", Poster: "https://image.tmdb.org/t/p/w500/gh4cZbhZxyTbgxQPxD0dOudNPTn.jpg", genre: "hero", decoys: ["El Sorprendente Hombre Araña", "Venom", "Daredevil"] },
    { Title: "Pulp Fiction", Year: "1994", Poster: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg", genre: "crime", decoys: ["Perros de la Calle", "Snatch", "Fargo"] },
    { Title: "Inception (El Origen)", Year: "2010", Poster: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg", genre: "scifi", decoys: ["Memento", "Shutter Island", "El Gran Truco"] },
    { Title: "El Guasón (Joker)", Year: "2019", Poster: "https://image.tmdb.org/t/p/w1280/v0eQLbzT6sWelfApuYsEkYpzufl.jpg", genre: "drama", decoys: ["Taxi Driver", "El Rey de la Comedia", "Nightcrawler"] },
    { Title: "Coco", Year: "2017", Poster: "https://image.tmdb.org/t/p/w1280/vwsFGblLYxWBNjg9pdWN1Mm5YfW.jpg", genre: "animation", decoys: ["El Libro de la Vida", "Encanto", "Klaus"] },
    { Title: "Batman: El Caballero de la Noche", Year: "2008", Poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg", genre: "hero", decoys: ["El Caballero de la Noche Asciende", "Watchmen", "V de Venganza"] },
    { Title: "Top Gun: Maverick", Year: "2022", Poster: "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg", genre: "action", decoys: ["Top Gun", "Pearl Harbor", "Midway"] },
    { Title: "Dune", Year: "2021", Poster: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg", genre: "scifi", decoys: ["Dune: Parte Dos", "Fundación", "Valerian"] },
    { Title: "Oppenheimer", Year: "2023", Poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg", genre: "drama", decoys: ["La Red Social", "El Discurso del Rey", "El Código Enigma"] },
    { Title: "Barbie", Year: "2023", Poster: "https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg", genre: "comedy", decoys: ["Legalmente Rubia", "Chicas Pesadas", "Clueless"] },
    { Title: "El Gato con Botas: El Último Deseo", Year: "2022", Poster: "https://image.tmdb.org/t/p/w1280/3biPHgMIwj2SgmWtPPTSJvflC8N.jpg", genre: "animation", decoys: ["Shrek", "Los Croods", "El Origen de los Guardianes"] },
    { Title: "Super Mario Bros. La película", Year: "2023", Poster: "https://image.tmdb.org/t/p/w500/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg", genre: "animation", decoys: ["Sonic: La película", "Pokémon: Detective Pikachu", "Wreck-It Ralph"] },
    { Title: "Intensamente 2", Year: "2024", Poster: "https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg", genre: "animation", decoys: ["Intensamente", "Soul", "Unidos"] },
    { Title: "La La Land", Year: "2016", Poster: "https://image.tmdb.org/t/p/w1280/7pFsAaJmiOppVHcldBzg8JKBHwe.jpg", genre: "musical", decoys: ["Whiplash", "Los Miserables", "El Gran Showman"] },
    { Title: "Bohemian Rhapsody", Year: "2018", Poster: "https://image.tmdb.org/t/p/w1280/gk6IErM0acV6HJRwKZy8ecBoddc.jpg", genre: "musical", decoys: ["Rocketman", "Elvis", "Yesterday"] },
    { Title: "Mad Max: Furia en el Camino", Year: "2015", Poster: "https://image.tmdb.org/t/p/w500/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg", genre: "action", decoys: ["Mad Max 2", "Furiosa", "Terminator Génesis"] },
    { Title: "Logan", Year: "2017", Poster: "https://image.tmdb.org/t/p/w1280/d0ktjN9eKww26HhM8or8iUB1I68.jpg", genre: "hero", decoys: ["Deadpool 2", "The Wolverine", "X-Men: Apocalipsis"] },
    { Title: "Deadpool", Year: "2016", Poster: "https://image.tmdb.org/t/p/w1280/3E53WEZJqP6aM84D8CckXx4pIHw.jpg", genre: "hero", decoys: ["Deadpool 2", "Kick-Ass", "Escuadrón Suicida"] },
    { Title: "Thor: Ragnarok", Year: "2017", Poster: "https://image.tmdb.org/t/p/w500/rzRwTcFvttcN1ZpX2xv4j3tSdJu.jpg", genre: "hero", decoys: ["Thor: Un mundo oscuro", "Guardianes de la Galaxia Vol. 2", "Eternals"] },
    { Title: "Avengers: Endgame", Year: "2019", Poster: "https://image.tmdb.org/t/p/w1280/br6krBFpaYmCSglLBWRuhui7tPc.jpg", genre: "hero", decoys: ["Avengers: Infinity War", "Capitán América: Civil War", "Thor: Love and Thunder"] },
    { Title: "Spider-Man: Un nuevo universo", Year: "2018", Poster: "https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg", genre: "animation", decoys: ["Spider-Man: A través del universo", "Los Tipos Malos", "Tortugas Ninja: Caos Mutante"] },
    { Title: "The Batman", Year: "2022", Poster: "https://image.tmdb.org/t/p/w1280/kOD0qxiUmSg7M5LeHNWT6KffsNQ.jpg", genre: "hero", decoys: ["Batman Begins", "Joker", "The Flash"] },
    { Title: "Alien, el octavo pasajero", Year: "1979", Poster: "https://image.tmdb.org/t/p/w500/vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg", genre: "horror", decoys: ["The Thing", "Depredador", "Prometeo"] },
    { Title: "Blade Runner", Year: "1982", Poster: "https://image.tmdb.org/t/p/w1280/zHKWxyG4j404HVeSYHNH4niUpkW.jpg", genre: "scifi", decoys: ["Blade Runner 2049", "Ghost in the Shell", "Gattaca"] },
    { Title: "Piratas del Caribe: La maldición del Perla Negra", Year: "2003", Poster: "https://image.tmdb.org/t/p/w1280/bVG48kmXuLaZYgPfSCmhs6EYFbX.jpg", genre: "fantasy", decoys: ["Piratas del Caribe 2", "Peter Pan", "La Isla de las Cabezas Cortadas"] },
    { Title: "Forrest Gump", Year: "1994", Poster: "https://image.tmdb.org/t/p/w1280/oiqKEhEfxl9knzWXvWecJKN3aj6.jpg", genre: "drama", decoys: ["Náufrago", "El Curioso Caso de Benjamin Button", "Philadelphia"] },
    { Title: "Mi Pobre Angelito", Year: "1990", Poster: "https://image.tmdb.org/t/p/w1280/rjc2a9N5pro1xGsSvvnJ1JDXRGm.jpg", genre: "comedy", decoys: ["Mi Pobre Angelito 2", "Beethoven", "Daniel el Travieso"] },
    { Title: "Terminator 2: El Juicio Final", Year: "1991", Poster: "https://image.tmdb.org/t/p/w600_and_h900_face/10xtoK2SFv6ADIeWxr3mcrjko72.jpg", genre: "scifi", decoys: ["Terminator", "Terminator 3", "RoboCop"] },
    { Title: "Monsters, Inc.", Year: "2001", Poster: "https://image.tmdb.org/t/p/w600_and_h900_face/jTE3BLVCpYaR71L2U8SHV22HvEr.jpg", genre: "animation", decoys: ["Monsters University", "Toy Story", "Bichos"] },
    { Title: "El Club de la Pelea", Year: "1999", Poster: "https://image.tmdb.org/t/p/w600_and_h900_face/sgTAWJFaB2kBvdQxRGabYFiQqEK.jpg", genre: "drama", decoys: ["Seven", "Zodiac", "American Psycho"] },
    { Title: "Ratatouille", Year: "2007", Poster: "https://image.tmdb.org/t/p/w600_and_h900_face/nGUelOVetiRpY2wTBMHTbrTIGYC.jpg", genre: "animation", decoys: ["Wall-E", "Up", "Cars"] },
    { Title: "Cars", Year: "2006", Poster: "https://image.tmdb.org/t/p/w600_and_h900_face/2Touk3m5gzsqr1VsvxypdyHY5ci.jpg", genre: "animation", decoys: ["Cars 2", "Cars 3", "Aviones"] },
    { Title: "Whiplash", Year: "2014", Poster: "https://image.tmdb.org/t/p/w1280/sL32IZkyjlF7otj5vcUxiKSKzg5.jpg", genre: "musical", decoys: ["La La Land", "El Cisne Negro", "Birdman"] },
    { Title: "El Renacido", Year: "2015", Poster: "https://image.tmdb.org/t/p/w600_and_h900_face/k3Jh7J5GGMx1lmr7qmynRxOvOK5.jpg", genre: "action", decoys: ["Náufrago", "El Odioso Ocho", "El Último Mohicano"] },
    { Title: "Spider-Man: Sin camino a casa", Year: "2021", Poster: "https://image.tmdb.org/t/p/w600_and_h900_face/miZFgV81xG324rpUknQX8dtXuBl.jpg", genre: "hero", decoys: ["Spider-Man: Lejos de casa", "Doctor Strange", "Venom: Carnage Liberado"] },
    { Title: "Avengers: Infinity War", Year: "2018", Poster: "https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg", genre: "hero", decoys: ["Avengers: Endgame", "Capitán América: Civil War", "Thor: Ragnarok"] },
    { Title: "Spider-Man 2", Year: "2004", Poster: "https://image.tmdb.org/t/p/w600_and_h900_face/tGYrkVuskQKyRZ9WRS6wPTPBJpm.jpg", genre: "hero", decoys: ["Spider-Man", "Spider-Man 3", "X-Men 2"] },
    { Title: "Batman Begins", Year: "2005", Poster: "https://image.tmdb.org/t/p/w600_and_h900_face/6yMWU1vWkOBbNRIwOxhetd2aHhO.jpg", genre: "hero", decoys: ["Batman (1989)", "Superman Returns", "El Hombre de Acero"] },
    { Title: "Wall-E", Year: "2008", Poster: "https://image.tmdb.org/t/p/w600_and_h900_face/dSxBq0TyC9TxNG26reLv0Sv1Jz7.jpg", genre: "animation", decoys: ["Ratatouille", "Up", "Robots"] },
    { Title: "Toy Story 3", Year: "2010", Poster: "https://image.tmdb.org/t/p/w600_and_h900_face/yBSISwqix2z0JiwIrM3r6fiI6Cm.jpg", genre: "animation", decoys: ["Toy Story 2", "Toy Story 4", "Buscando a Nemo"] },
    { Title: "Kung Fu Panda", Year: "2008", Poster: "https://image.tmdb.org/t/p/w600_and_h900_face/zcORJ8s9zsBjvKxP0k4FASQSjpf.jpg", genre: "animation", decoys: ["Kung Fu Panda 2", "Kung Fu Panda 3", "Shrek"] },
    { Title: "Cómo entrenar a tu dragón", Year: "2010", Poster: "https://image.tmdb.org/t/p/w600_and_h900_face/jjGyBXyhXs2aofZDVOf1zguTrvJ.jpg", genre: "animation", decoys: ["Cómo entrenar a tu dragón 2", "Los Croods", "Brave"] },
    { Title: "Soul", Year: "2020", Poster: "https://image.tmdb.org/t/p/w500/hm58Jw4Lw8OIeECIq5qyPYhAeRJ.jpg", genre: "animation", decoys: ["Intensamente", "Luca", "Coco"] },
    { Title: "Luca", Year: "2021", Poster: "https://image.tmdb.org/t/p/w600_and_h900_face/dagjxde57bpFgiSDsfTDgLjzLyn.jpg", genre: "animation", decoys: ["Red", "Soul", "Moana"] },
    { Title: "Moana: Un mar de aventuras", Year: "2016", Poster: "https://image.tmdb.org/t/p/w600_and_h900_face/hw4FlDdufQuLIsYiqBYIL0Bxn26.jpg", genre: "animation", decoys: ["Frozen", "Enredados", "Pocahontas"] },
    { Title: "Harry Potter y la Piedra Filosofal", Year: "2001", Poster: "https://image.tmdb.org/t/p/w600_and_h900_face/3MKK7vAJLtSkBTABMTjxf6TOCo3.jpg", genre: "fantasy", decoys: ["Harry Potter y la Cámara Secreta", "Harry Potter y el Prisionero de Azkaban", "Animales Fantásticos"] },
    { Title: "Harry Potter y la Cámara Secreta", Year: "2002", Poster: "https://image.tmdb.org/t/p/w600_and_h900_face/bhCfAzeMMg7GyLDT11yVM2i1NPh.jpg", genre: "fantasy", decoys: ["Harry Potter y la Piedra Filosofal", "Harry Potter y el Cáliz de Fuego", "Percy Jackson"] },
    { Title: "Harry Potter y el Prisionero de Azkaban", Year: "2004", Poster: "https://image.tmdb.org/t/p/w600_and_h900_face/6SqfjgzB7ULYmdqETobVEjNRH18.jpg", genre: "fantasy", decoys: ["Harry Potter y la Orden del Fénix", "Las Crónicas de Narnia", "El Señor de los Anillos"] },
    { Title: "Harry Potter y el Cáliz de Fuego", Year: "2005", Poster: "https://image.tmdb.org/t/p/w600_and_h900_face/qg7W7bINW7fVVnrAxZo9y8e41fY.jpg", genre: "fantasy", decoys: ["Harry Potter y el Misterio del Príncipe", "Harry Potter y las Reliquias de la Muerte", "Eragon"] },
    { Title: "Harry Potter y la Orden del Fénix", Year: "2007", Poster: "https://image.tmdb.org/t/p/w600_and_h900_face/xxXiM2Ij7plbzibKWW9BfDk23aI.jpg", genre: "fantasy", decoys: ["Harry Potter y el Cáliz de Fuego", "Harry Potter y las Reliquias de la Muerte: Parte 1", "La Brújula Dorada"] },
    { Title: "Harry Potter y el Misterio del Príncipe", Year: "2009", Poster: "https://image.tmdb.org/t/p/w600_and_h900_face/bQBWN0rw3oMa06wZ42Rard170t2.jpg", genre: "fantasy", decoys: ["Harry Potter y la Orden del Fénix", "Harry Potter y las Reliquias de la Muerte: Parte 2", "Crepúsculo"] },
    { Title: "Harry Potter y las Reliquias de la Muerte: Parte 1", Year: "2010", Poster: "https://image.tmdb.org/t/p/w600_and_h900_face/w6wsYKdXERaXRdByPsI2O9rn20b.jpg", genre: "fantasy", decoys: ["Harry Potter y las Reliquias de la Muerte: Parte 2", "Los Juegos del Hambre", "Divergente"] },
    { Title: "Harry Potter y las Reliquias de la Muerte: Parte 2", Year: "2011", Poster: "https://image.tmdb.org/t/p/w600_and_h900_face/p65LMSaksb87X7YRn8Dt2WqNWn4.jpg", genre: "fantasy", decoys: ["Harry Potter y las Reliquias de la Muerte: Parte 1", "El Hobbit: Un viaje inesperado", "Las Crónicas de Narnia"] },
    { Title: "Dragon Ball Z: La Batalla de los Dioses", Year: "2013", Poster: "https://image.tmdb.org/t/p/w600_and_h900_face/hupWvQIBf2qFJY1MEzFSyPKW4MR.jpg", genre: "anime", decoys: ["Dragon Ball Z: La Resurrección de F", "Dragon Ball Super: Broly", "One Piece Film: Red"] },
    { Title: "Dragon Ball Super: Broly", Year: "2018", Poster: "https://image.tmdb.org/t/p/w600_and_h900_face/uMEgkyiPznZP5AiMSWAk2jsj5gC.jpg", genre: "anime", decoys: ["Dragon Ball Super: Super Hero", "Naruto the Last", "Demon Slayer: Mugen Train"] },
    { Title: "Dragon Ball Super: Super Hero", Year: "2022", Poster: "https://image.tmdb.org/t/p/w600_and_h900_face/rugyJdeoJm7cSJL1q4jBpTNbxyU.jpg", genre: "anime", decoys: ["Dragon Ball Super: Broly", "Jujutsu Kaisen 0", "My Hero Academia: Two Heroes"] },
    { Title: "Dragon Ball Z: El Combate Final", Year: "1994", Poster: "https://image.tmdb.org/t/p/w1280/96IrRfvolvjoTey4M12UNvtJ1hq.jpg", genre: "anime", decoys: ["Dragon Ball Z: Los Guerreros de Plata", "Dragon Ball Z: El Poder Invencible", "Bleach: Memories of Nobody"] },
    { Title: "Volver al Futuro Parte II", Year: "1989", Poster: "https://image.tmdb.org/t/p/w1280/ygKImi2jzm0j00W3JXBxvxdUM8n.jpg", genre: "scifi", decoys: ["Volver al Futuro", "Volver al Futuro Parte III", "Terminator 2: El Juicio Final"] },
    { Title: "Volver al Futuro Parte III", Year: "1990", Poster: "https://image.tmdb.org/t/p/w1280/6mqdrgXFOUa3o6wmxdJWVuswLMg.jpg", genre: "scifi", decoys: ["Volver al Futuro Parte II", "Indiana Jones y la Última Cruzada", "Cowboys & Aliens"] },
    { Title: "Terminator", Year: "1984", Poster: "https://image.tmdb.org/t/p/w1280/kdYu7YJJP0uuGEuhUX5toqvBSog.jpg", genre: "scifi", decoys: ["Terminator 2: El Juicio Final", "Depredador", "RoboCop"] },
    { Title: "Terminator 3: La Rebelión de las Máquinas", Year: "2003", Poster: "https://image.tmdb.org/t/p/w1280/ugVNhnnH3DKUZZ3JtzRkViIh4L9.jpg", genre: "scifi", decoys: ["Terminator 2: El Juicio Final", "Terminator: Destino Oculto", "Matrix Revoluciones"] },
    { Title: "Jurassic Park: El Mundo Perdido", Year: "1997", Poster: "https://image.tmdb.org/t/p/w1280/aINQEFUVqI0M7ArfYNhYPuZuFSH.jpg", genre: "scifi", decoys: ["Jurassic Park III", "Jurassic World", "Godzilla"] },
    { Title: "Jurassic World: Mundo Jurásico", Year: "2015", Poster: "https://image.tmdb.org/t/p/w1280/lWhnr4ehIiRMudbF6YCEViatbaN.jpg", genre: "scifi", decoys: ["Jurassic World: El Reino Caído", "Jurassic Park", "Rampage"] },
    { Title: "Shrek 2", Year: "2004", Poster: "https://image.tmdb.org/t/p/w1280/2yYP0PQjG8zVqturh1BAqu2Tixl.jpg", genre: "animation", decoys: ["Shrek", "Shrek Tercero", "Madagascar 2"] },
    { Title: "Shrek Tercero", Year: "2007", Poster: "https://image.tmdb.org/t/p/w1280/wlqB5CdROxuEzY9y3SDTExA2EeD.jpg", genre: "animation", decoys: ["Shrek 2", "Shrek por Siempre", "La Era de Hielo 2"] },
    { Title: "Toy Story 2", Year: "1999", Poster: "https://image.tmdb.org/t/p/w1280/4rbcp3ng8n1MKHjpeqW0L7Fnpzz.jpg", genre: "animation", decoys: ["Toy Story", "Toy Story 3", "Bichos"] },
    { Title: "Toy Story 4", Year: "2019", Poster: "https://image.tmdb.org/t/p/w1280/yF1vPDuHVrAUMX5dy1tVMbAjkEL.jpg", genre: "animation", decoys: ["Toy Story 3", "Los Increíbles 2", "Buscando a Dory"] },
    { Title: "Buscando a Dory", Year: "2016", Poster: "https://image.tmdb.org/t/p/w1280/wXBwo2DxTm6wZ8Cbu02t9kzzoK4.jpg", genre: "animation", decoys: ["Buscando a Nemo", "Moana", "La Sirenita"] },
    { Title: "Frozen: Una Aventura Congelada", Year: "2013", Poster: "https://image.tmdb.org/t/p/w1280/8aAkLBwrnBuKWyWowgj9KTNnjzo.jpg", genre: "animation", decoys: ["Frozen 2", "Enredados", "Valiente"] },
    { Title: "Frozen 2", Year: "2019", Poster: "https://image.tmdb.org/t/p/w1280/jnFCk7qGGWop2DgfnJXeKLZFuBq.jpg", genre: "animation", decoys: ["Frozen: Una Aventura Congelada", "Moana", "Raya y el Último Dragón"] },
    { Title: "Los Increíbles", Year: "2004", Poster: "https://image.tmdb.org/t/p/w1280/al1jusd4T7JPatZlj4BuYkDDOzr.jpg", genre: "animation", decoys: ["Los Increíbles 2", "Megamente", "Mi Villano Favorito"] },
    { Title: "Los Increíbles 2", Year: "2018", Poster: "https://image.tmdb.org/t/p/w1280/7uintpyNlSF32hj5Bua85VuAp2R.jpg", genre: "animation", decoys: ["Los Increíbles", "Ralph, el Demoledor", "Hotel Transylvania"] },
    { Title: "Mi Villano Favorito", Year: "2010", Poster: "https://image.tmdb.org/t/p/w1280/avm0bLWtSoHk9erXAnViuPQ9mqf.jpg", genre: "animation", decoys: ["Mi Villano Favorito 2", "Minions", "Megamente"] },
    { Title: "Mi Villano Favorito 2", Year: "2013", Poster: "https://image.tmdb.org/t/p/w1280/6G9hI4Y9NMOdKYgDUnIHpDZBluX.jpg", genre: "animation", decoys: ["Mi Villano Favorito", "Minions: Nace un Villano", "La Vida Secreta de tus Mascotas"] },
    { Title: "Madagascar", Year: "2005", Poster: "https://image.tmdb.org/t/p/w1280/zrV5GnfCcLWzyjrFgYTpjQPRMfl.jpg", genre: "animation", decoys: ["Madagascar 2: Escape de África", "La Era de Hielo", "Vecinos Invasores"] },
    { Title: "La Era de Hielo", Year: "2002", Poster: "https://image.tmdb.org/t/p/w1280/j52ufQ4Y5QIESpCdgSN3MVNvZOK.jpg", genre: "animation", decoys: ["La Era de Hielo 2: El Deshielo", "Madagascar", "Pie Pequeño"] },
    { Title: "Kung Fu Panda 2", Year: "2011", Poster: "https://image.tmdb.org/t/p/w1280/mtqqD00vB4PGRt20gWtGqFhrkd0.jpg", genre: "animation", decoys: ["Kung Fu Panda", "Kung Fu Panda 3", "El Gato con Botas"] },
    { Title: "Cómo entrenar a tu dragón 2", Year: "2014", Poster: "https://image.tmdb.org/t/p/w1280/hUFRL4jjfr3Z2LXwehuh4W4bNAd.jpg", genre: "animation", decoys: ["Cómo entrenar a tu dragón", "Cómo entrenar a tu dragón 3", "Brave"] },
    { Title: "Spider-Man: A Través del Spider-Verso", Year: "2023", Poster: "https://image.tmdb.org/t/p/w1280/rXhgHQmtjTIQOEDU8E2TbUFMjWM.jpg", genre: "animation", decoys: ["Spider-Man: Un nuevo universo", "Los Tipos Malos", "Teen Titans Go!"] },
    { Title: "Batman (1989)", Year: "1989", Poster: "https://image.tmdb.org/t/p/w1280/7xiCfaVZXfNPhZ5e9YqsjWR0oLz.jpg", genre: "hero", decoys: ["Batman Regresa", "Batman Forever", "Superman (1978)"] },
    { Title: "El Caballero de la Noche Asciende", Year: "2012", Poster: "https://image.tmdb.org/t/p/w1280/rrS7K8tXVFUBliIKWaRuSq65nWr.jpg", genre: "hero", decoys: ["Batman: El Caballero de la Noche", "Batman Begins", "El Hombre de Acero"] },
    { Title: "El Hombre de Acero", Year: "2013", Poster: "https://image.tmdb.org/t/p/w1280/5JW44QGgpEWx4aWXM0uVSi2xtrI.jpg", genre: "hero", decoys: ["Batman vs Superman", "La Liga de la Justicia", "Thor"] },
    { Title: "Capitán América: Civil War", Year: "2016", Poster: "https://image.tmdb.org/t/p/w1280/jPPy7tCfglppQo6J9nGwU6UmJ8X.jpg", genre: "hero", decoys: ["Avengers: Infinity War", "Capitán América y el Soldado de Invierno", "Iron Man 3"] },
    { Title: "Iron Man", Year: "2008", Poster: "https://image.tmdb.org/t/p/w1280/A693Lu1HW32j1AEFiqxjg9T4BAJ.jpg", genre: "hero", decoys: ["Iron Man 2", "Iron Man 3", "Thor"] },
    { Title: "Thor: Love and Thunder", Year: "2022", Poster: "https://image.tmdb.org/t/p/w1280/z9ajF6E39Hg2pXUofmUYgZHvdX.jpg", genre: "hero", decoys: ["Thor: Ragnarok", "Doctor Strange en el Multiverso de la Locura", "Eternals"] },
    { Title: "Doctor Strange", Year: "2016", Poster: "https://image.tmdb.org/t/p/w1280/sOsvKTJS0XwtfLsNMO3C0CVWJ4u.jpg", genre: "hero", decoys: ["Doctor Strange en el Multiverso de la Locura", "Thor: Ragnarok", "Shang-Chi"] },
    { Title: "Guardianes de la Galaxia", Year: "2014", Poster: "https://image.tmdb.org/t/p/w1280/9fRMLxaevSTY4geVlkLpySwIzWi.jpg", genre: "hero", decoys: ["Guardianes de la Galaxia Vol. 2", "Guardianes de la Galaxia Vol. 3", "Thor: Love and Thunder"] },
    { Title: "Pantera Negra", Year: "2018", Poster: "https://image.tmdb.org/t/p/w1280/r9BbzMXJmOZQ8yfijJMCyU0Rnhs.jpg", genre: "hero", decoys: ["Pantera Negra: Wakanda Por Siempre", "Capitán América: Civil War", "Shang-Chi"] },
    { Title: "John Wick", Year: "2014", Poster: "https://image.tmdb.org/t/p/w1280/wXqWR7dHncNRbxoEGybEy7QTe9h.jpg", genre: "action", decoys: ["John Wick 2", "John Wick 3: Parabellum", "El Justiciero"] },
    { Title: "John Wick 2", Year: "2017", Poster: "https://image.tmdb.org/t/p/w1280/kTvpQimqkTXPYvP4F4t8nGqMYg6.jpg", genre: "action", decoys: ["John Wick", "John Wick 4", "Rápidos y Furiosos 7"] },
    { Title: "Rápidos y Furiosos", Year: "2001", Poster: "https://image.tmdb.org/t/p/w1280/a4rmfthujzbIRwSuuICfPvrZilb.jpg", genre: "action", decoys: ["Rápidos y Furiosos 5", "Rápidos y Furiosos 7", "Need for Speed"] },
    { Title: "Rápidos y Furiosos 7", Year: "2015", Poster: "https://image.tmdb.org/t/p/w1280/n5yLlBdOBOWhE2664ULGJVuyLvL.jpg", genre: "action", decoys: ["Rápidos y Furiosos 8", "Rápidos y Furiosos 5", "Misión Imposible: Nación Secreta"] },
    { Title: "Misión Imposible", Year: "1996", Poster: "https://image.tmdb.org/t/p/w1280/hZSmObk21tNV3874sOM3Q1U5VVp.jpg", genre: "action", decoys: ["Misión Imposible 2", "Misión Imposible: Repercusión", "James Bond: Casino Royale"] },
    { Title: "James Bond: Casino Royale", Year: "2006", Poster: "https://image.tmdb.org/t/p/w1280/qplE2N7QWTO6w7X8zW46X3cGUBZ.jpg", genre: "action", decoys: ["James Bond: Sin tiempo para morir", "Misión Imposible", "Jason Bourne"] },
    { Title: "El Señor de los Anillos: Las Dos Torres", Year: "2002", Poster: "https://image.tmdb.org/t/p/w1280/up6gIHZlfEQZkHIfQwcOOaGOzOt.jpg", genre: "fantasy", decoys: ["El Señor de los Anillos: El Retorno del Rey", "La Comunidad del Anillo", "El Hobbit"] },
    { Title: "El Señor de los Anillos: El Retorno del Rey", Year: "2003", Poster: "https://image.tmdb.org/t/p/w1280/mWuFbQrXyLk2kMBKF9TUPtDwuPx.jpg", genre: "fantasy", decoys: ["Las Dos Torres", "El Hobbit: La batalla de los cinco ejércitos", "Las Crónicas de Narnia"] },
    { Title: "El Hobbit: Un viaje inesperado", Year: "2012", Poster: "https://image.tmdb.org/t/p/w1280/1id2xLxg750ojOWvGWeqPIxmOIF.jpg", genre: "fantasy", decoys: ["El Hobbit: La desolación de Smaug", "El Señor de los Anillos", "Warcraft"] },
    { Title: "Crepúsculo", Year: "2008", Poster: "https://image.tmdb.org/t/p/w1280/40ollvfwHaVF85lkkg522SIl3Qc.jpg", genre: "fantasy", decoys: ["Crepúsculo: Luna Nueva", "Crepúsculo: Amanecer", "Cazadores de Sombras"] },
    { Title: "Los Juegos del Hambre", Year: "2012", Poster: "https://image.tmdb.org/t/p/w1280/vu2JdkMHWmM4I6I14N3q9CALtwm.jpg", genre: "scifi", decoys: ["Los Juegos del Hambre: En llamas", "Divergente", "El Corredor del Laberinto"] },
    { Title: "Divergente", Year: "2014", Poster: "https://image.tmdb.org/t/p/w1280/libmZ7xJBkVWmoixPyF3EdTmNtt.jpg", genre: "scifi", decoys: ["Los Juegos del Hambre", "El Corredor del Laberinto", "Eagles Eye"] },
    { Title: "Son como niños", Year: "2010", Poster: "https://image.tmdb.org/t/p/w1280/rEQTerbvmbCgRl47MvY49pgD2yu.jpg", genre: "comedy", decoys: ["Son como niños 2", "Una esposa de mentira", "Superbad"] },
    { Title: "Jumanji: En la selva", Year: "2017", Poster: "https://image.tmdb.org/t/p/w1280/1uQaSgtHyTN3r2fecL0mSs6geQO.jpg", genre: "adventure", decoys: ["Jumanji: El siguiente nivel", "Jumanji (1995)", "La Propuesta"] },
    { Title: "Indiana Jones y los Cazadores del Arca Perdida", Year: "1981", Poster: "https://image.tmdb.org/t/p/w1280/tECLVwLCMexSkls33RTCwedRZ6d.jpg", genre: "adventure", decoys: ["Indiana Jones y el Templo Maldito", "La Momia", "Piratas del Caribe"] },
    { Title: "La Momia", Year: "1999", Poster: "https://image.tmdb.org/t/p/w1280/aGRMxB5ve2nSKsq8ww6PyUwhWpP.jpg", genre: "adventure", decoys: ["La Momia Regresa", "Indiana Jones", "Van Helsing"] },
    { Title: "El Conjuro", Year: "2013", Poster: "https://image.tmdb.org/t/p/w1280/10ir0eISr3p1MF1mjZwGTx7u4vv.jpg", genre: "horror", decoys: ["El Conjuro 2", "Annabelle", "Insidious"] },
    { Title: "It (Eso)", Year: "2017", Poster: "https://image.tmdb.org/t/p/w1280/cf56KSxlBjcR4PFt2UP7KsgCg9f.jpg", genre: "horror", decoys: ["It Capítulo Dos", "El Conjuro", "Halloween"] },
    { Title: "Scream", Year: "1996", Poster: "https://image.tmdb.org/t/p/w1280/ovLspZZ7UFogalmDvXa4G7F5dbV.jpg", genre: "horror", decoys: ["Scream 2", "Sé lo que hicieron el verano pasado", "Destino Final"] },
    { Title: "Destino Final", Year: "2000", Poster: "https://image.tmdb.org/t/p/w1280/6F3MEcGHeMAMxledi7vQfqkZRkc.jpg", genre: "horror", decoys: ["Destino Final 2", "Scream", "Saw: El Juego Macabro"] },
    { Title: "Saw: El Juego Macabro", Year: "2004", Poster: "https://image.tmdb.org/t/p/w1280/rLNSOudrayDBo1uqXjrhxcjODIC.jpg", genre: "horror", decoys: ["Saw II", "El Juego del Miedo", "Hostel"] },
    { Title: "El Exorcista", Year: "1973", Poster: "https://image.tmdb.org/t/p/w1280/kLvwboUfLrQbbbYZvWuLsJkptuf.jpg", genre: "horror", decoys: ["El Conjuro", "El Resplandor", "La Profecía"] },
    { Title: "El Resplandor", Year: "1980", Poster: "https://image.tmdb.org/t/p/w1280/mm003Mj2e9kJRsrxiVdPn2BSBPh.jpg", genre: "horror", decoys: ["Doctor Sueño", "Psicosis", "Carrie"] },
    { Title: "El Sexto Sentido", Year: "1999", Poster: "https://image.tmdb.org/t/p/w1280/pvjph7FouToPBY3PhTvTyOYoJDX.jpg", genre: "drama", decoys: ["Los Otros", "Señales", "Fragmentado"] },
    { Title: "Gladiador 2", Year: "2024", Poster: "https://image.tmdb.org/t/p/w1280/gGnSGohHWvXjQkpG1CNPYrPUvmO.jpg", genre: "action", decoys: ["Gladiador", "Troya", "Napoleón"] },
    { Title: "Avatar: El sentido del agua", Year: "2022", Poster: "https://image.tmdb.org/t/p/w1280/ckeTumMS4G31UQ9NNkmtW2QhfMF.jpg", genre: "scifi", decoys: ["Avatar", "Dune Parte Dos", "Titanes del Pacífico"] }
  ];

  const HINT_STEP = 12;      
  const MAX_POINTS = 5;      
  const MIN_POINTS = 1;      
  const HINT_PENALTY = 1;    

  /* ⏱️ Estado del Juego */
  let state = { score: 0, round: 1, total: 10, locked: false, reveal: 7.5, hints: 0, roundValue: MAX_POINTS, current: null, gameOver: false };
  let timerInterval = null, secondsElapsed = 0;
  let hintInactivityTimer = null; 
  let gameDeck = [];
  let sessionPlayedMovies = []; 

  function shuffle(array) {
    const a = [...array];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

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

  function updateTimerDisplay() {
    const mins = Math.floor(secondsElapsed / 60);
    const secs = secondsElapsed % 60;
    const timerEl = $('#gameTimer');
    if (timerEl) timerEl.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  function resetHintInactivity() {
    const hintBtn = $('#hint');
    if (hintBtn) hintBtn.classList.remove('hint-pulsing');
    clearTimeout(hintInactivityTimer);

    if (!state.locked && !state.gameOver) {
      hintInactivityTimer = setTimeout(() => {
        if (!state.locked && !state.gameOver && hintBtn && !hintBtn.disabled) {
          hintBtn.classList.add('hint-pulsing');
        }
      }, 7000);
    }
  }

  function getTier(score) {
    if (score >= 45) return { name: "Director Leyenda", color: "#f59e0b" };
    if (score >= 35) return { name: "Director Estrella", color: "#8b5cf6" };
    if (score >= 25) return { name: "Crítico Cinéfilo", color: "#3b82f6" };
    if (score >= 15) return { name: "Fanático de Cine", color: "#10b981" };
    if (score >= 5)  return { name: "Espectador Ocasional", color: "#f97316" };
    return { name: "Extra de Cine", color: "#9ca3af" };
  }

  /* Lógica de guardado con límite de 5 "Cinéfilo Anónimo" por antigüedad y límite máximo de 50 puestos */
  function saveRanking(name, score) {
    let r = JSON.parse(localStorage.getItem("movie_ranking") || "[]");
    const timerEl = $('#gameTimer');
    
    const isAnonymous = (name.trim().toLowerCase() === "cinéfilo anónimo" || name.trim().toLowerCase() === "cinefilo anonimo");

    if (isAnonymous) {
      // Filtrar cuántos anónimos hay actualmente
      let anonCount = r.filter(x => x.name.toLowerCase().includes("cinéfilo anónimo") || x.name.toLowerCase().includes("cinefilo anonimo")).length;
      if (anonCount >= 5) {
        // Encontrar y eliminar el anónimo más antiguo (el primero de la lista de anónimos)
        let firstAnonIdx = r.findIndex(x => x.name.toLowerCase().includes("cinéfilo anónimo") || x.name.toLowerCase().includes("cinefilo anonimo"));
        if (firstAnonIdx !== -1) {
          r.splice(firstAnonIdx, 1);
        }
      }
    }

    r.push({ name, score, time: timerEl ? timerEl.textContent : '0:00', timeSeconds: secondsElapsed });
    
    r.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.timeSeconds - b.timeSeconds;
    });

    localStorage.setItem("movie_ranking", JSON.stringify(r.slice(0, 50)));
  }

  function renderRanking() {
    let r = JSON.parse(localStorage.getItem("movie_ranking") || "[]");
    const rankingEl = $('#ranking');
    if (!rankingEl) return;
    
    let h = "<h2>Ranking</h2>";
    if (!r.length) {
      rankingEl.innerHTML = h + "<p style='color:var(--muted); font-size:13px; text-align:center;'>Sin registros aún.</p>";
      return;
    }
    
    h += "<table class='ranking-table'>";
    r.forEach((x, idx) => {
      const tier = getTier(x.score);
      h += `<tr>
        <td><b>#${idx + 1} ${x.name}</b></td>
        <td style="text-align:right;"><span style="color:${tier.color}; font-weight:700;">${x.score} pts</span> <small style="color:var(--muted);">(${x.time})</small></td>
      </tr>`;
    });
    h += "</table>";
    rankingEl.innerHTML = h;
  }

  function startNewGame() {
    state.score = 0;
    state.round = 1;
    state.gameOver = false;
    gameDeck = shuffle(ALL_MOVIES);
    sessionPlayedMovies = [];

    $('#score').textContent = '0';
    $('#round').textContent = '1';
    $('#extra').textContent = '';
    $('#status').textContent = '';

    // Restaurar instrucciones originales al iniciar nueva partida
    const instructionBox = $('#instructionBox');
    if (instructionBox) {
      instructionBox.innerHTML = "Solo es visible una pequeña porción del poster. Intenta adivinar de cuál se trata:";
    }

    const questionContainer = $('#questionContainer');
    const gameSummary = $('#gameSummary');

    if (questionContainer) questionContainer.style.display = 'flex';
    if (gameSummary) gameSummary.style.display = 'none';

    const nextBtn = $('#next');
    if (nextBtn) {
      nextBtn.textContent = 'Siguiente';
      nextBtn.style.cssText = '';
      nextBtn.disabled = true;
    }

    startTimer();
    nextRound();
  }

  function nextRound() {
    const nextBtn = $('#next');
    const extraEl = $('#extra');
    const roundValEl = $('#roundValue');
    const cover = $('#posterCover');
    const hintBtn = $('#hint');
    const pBase = $('#posterBase');
    const posterLoader = $('#posterLoader');

    if (nextBtn) nextBtn.disabled = true;
    if (extraEl) extraEl.textContent = '';
    
    state.locked = false;
    state.reveal = 7.5;
    state.hints = 0;
    state.roundValue = MAX_POINTS;
    if (roundValEl) roundValEl.textContent = state.roundValue;

    if (posterLoader) posterLoader.style.display = 'flex';
    
    const randomX = Math.floor(Math.random() * 61) + 20;
    const randomY = Math.floor(Math.random() * 61) + 20;

    if (cover) {
      cover.style.opacity = '1';
      cover.style.setProperty('--rev', state.reveal + '%');
      cover.style.setProperty('--pos-x', randomX + '%');
      cover.style.setProperty('--pos-y', randomY + '%');
    }
    pBase.style.opacity = '0';
    pBase.src = '';

    function tryLoadNextMovie() {
      if (!gameDeck.length) gameDeck = shuffle(ALL_MOVIES);
      const candidate = gameDeck.pop();
      
      const sameGenreMovies = ALL_MOVIES.filter(m => m.genre === candidate.genre && m.Title !== candidate.Title);
      let availableDecoys = [...sameGenreMovies.map(m => m.Title), ...(candidate.decoys || [])];
      availableDecoys = [...new Set(availableDecoys)].filter(t => t !== candidate.Title);
      
      const chosenDistractors = shuffle(availableDecoys).slice(0, 3);
      if (chosenDistractors.length < 3) {
        const fallback = ALL_MOVIES.filter(m => m.Title !== candidate.Title && !chosenDistractors.includes(m.Title));
        const extraNeeded = 3 - chosenDistractors.length;
        const extraDecoys = shuffle(fallback).slice(0, extraNeeded).map(m => m.Title);
        chosenDistractors.push(...extraDecoys);
      }

      const imgLoader = new Image();
      imgLoader.src = candidate.Poster;

      imgLoader.onload = () => {
        if (posterLoader) posterLoader.style.display = 'none';
        state.current = { correctTitle: candidate.Title, poster: candidate.Poster, Year: candidate.Year };
        pBase.src = candidate.Poster;
        pBase.style.opacity = '1';

        renderOptions(candidate.Title, chosenDistractors);
        if (hintBtn) hintBtn.disabled = false;
        resetHintInactivity();
      };

      imgLoader.onerror = () => { tryLoadNextMovie(); };
    }

    tryLoadNextMovie();
  }

  function renderOptions(correctTitle, distractors) {
    const names = [correctTitle, ...distractors];
    const opts = shuffle([...new Set(names)]).slice(0, 4);
    const box = $('#answers');
    if (!box) return;
    box.innerHTML = '';
    opts.forEach(t => {
      const b = document.createElement('button');
      b.className = 'btnCinematic';
      b.textContent = t;
      b.onclick = () => {
        resetHintInactivity();
        choose(t);
      };
      box.appendChild(b);
    });
  }

  function choose(title) {
    if (state.locked) return;
    state.locked = true;
    clearTimeout(hintInactivityTimer);
    const hintBtn = $('#hint');
    if (hintBtn) hintBtn.classList.remove('hint-pulsing');

    const cover = $('#posterCover');
    if (cover) {
      cover.style.setProperty('--rev', '120%');
      cover.style.opacity = '0';
    }

    const isCorrect = (title === state.current.correctTitle);
    const extraEl = $('#extra');
    if (extraEl) {
      extraEl.innerHTML = isCorrect ? `<span style="color:var(--success);">¡Correcto!</span> <b>${state.current.correctTitle}</b> (${state.current.Year})` : `<span style="color:var(--error);">Incorrecto</span> Era: <b>${state.current.correctTitle}</b>`;
    }

    if (isCorrect) {
      state.score += state.roundValue;
      $('#score').textContent = state.score;
    }

    sessionPlayedMovies.push({
      Title: state.current.correctTitle,
      Poster: state.current.poster,
      correct: isCorrect
    });

    $$('#answers .btnCinematic').forEach(b => {
      if (b.textContent === state.current.correctTitle) b.classList.add('correct');
      if (b.textContent === title && !isCorrect) b.classList.add('wrong');
      b.disabled = true;
    });

    const nextBtn = $('#next');
    if (nextBtn) nextBtn.disabled = false;
  }

  const hintBtn = $('#hint');
  if (hintBtn) {
    hintBtn.addEventListener('click', () => {
      if (state.locked) return;
      resetHintInactivity();
      state.reveal = Math.min(state.reveal + HINT_STEP, 100);
      const cover = $('#posterCover');
      if (cover) cover.style.setProperty('--rev', state.reveal + '%');
      state.hints++;
      state.roundValue = Math.max(MIN_POINTS, MAX_POINTS - state.hints * HINT_PENALTY);
      const roundValEl = $('#roundValue');
      if (roundValEl) roundValEl.textContent = state.roundValue;
      if (state.reveal >= 100) hintBtn.disabled = true;
    });
  }

  const nextBtn = $('#next');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (state.gameOver) {
        startNewGame();
        return;
      }

      state.round++;
      if (state.round <= state.total) {
        $('#round').textContent = state.round;
        nextRound();
      } else {
        state.gameOver = true;
        clearInterval(timerInterval);
        clearTimeout(hintInactivityTimer);

        const questionContainer = $('#questionContainer');
        const gameSummary = $('#gameSummary');
        const summaryGrid = $('#summaryGrid');
        
        if (questionContainer) questionContainer.style.display = 'none';

        if (gameSummary && summaryGrid) {
          summaryGrid.innerHTML = '';
          sessionPlayedMovies.forEach(m => {
            const card = document.createElement('div');
            const borderColor = m.correct ? 'var(--success)' : 'var(--error)';
            card.style.cssText = `border: 3px solid ${borderColor}; border-radius: 12px; overflow: hidden; background: rgba(0,0,0,0.3); display: flex; flex-direction: column; align-items: center; padding: 4px; text-align: center; font-size: 11px;`;
            card.innerHTML = `
              <img src="${m.Poster}" alt="${m.Title}" style="width:100%; height:95px; object-fit:cover; border-radius:8px;">
              <b style="margin-top:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%;" title="${m.Title}">${m.Title}</b>
            `;
            summaryGrid.appendChild(card);
          });
          gameSummary.style.display = 'flex';
          gameSummary.style.flexDirection = 'column';
          gameSummary.style.justifyContent = 'space-between';
          gameSummary.style.height = '100%';
        }

        const tier = getTier(state.score);
        const instructionBox = $('#instructionBox');
        if (instructionBox) {
          instructionBox.innerHTML = `
            <div style="text-align:center; padding:10px;">
              <h2 style="margin:0 0 6px 0; font-size:24px;">Función Finalizada</h2>
              <p style="margin:0; font-size:16px; color:${tier.color}; font-weight:800;">Rango obtenido: ${tier.name}</p>
            </div>
          `;
        }

        let playerName = "";
        while (!playerName || playerName.trim() === "") {
          playerName = prompt("¡Fin de la partida!\nIngresá tu nombre para el ranking oficial:", "");
          if (playerName === null) { playerName = "Cinéfilo Anónimo"; break; }
          playerName = playerName.trim();
        }

        saveRanking(playerName, state.score);
        renderRanking();

        $('#status').textContent = '';
      }
    });
  }

  const nextSummaryBtn = $('#nextSummary');
  if (nextSummaryBtn) {
    nextSummaryBtn.addEventListener('click', () => {
      startNewGame();
    });
  }

  const startGameBtn = $('#startGameBtn');
  if (startGameBtn) {
    startGameBtn.addEventListener('click', () => {
      $('#startScreen').style.display = 'none';
      startNewGame();
    });
  }

  renderRanking();
});