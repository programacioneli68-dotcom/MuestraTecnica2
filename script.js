
const grid = document.getElementById("grid");
const tvBtn = document.getElementById("tvBtn");

// ACTIVAR O DESACTIVAR MODO TV
tvBtn.addEventListener("click", () => {
    document.body.classList.toggle("tv");

    tvBtn.textContent = document.body.classList.contains("tv")
        ? "🖥️ MODO TV ON"
        : "🖥️ MODO TV OFF";
});

// CREAR LAS TARJETAS DE LOS PROYECTOS
function render(proyectos) {

    grid.innerHTML = "";

    proyectos.forEach(p => {

        const card = document.createElement("article");

        card.className = "card";

        if (p.enabled === false) {
            card.classList.add("disabled");
        }

        // IMAGEN
        const thumb = document.createElement("div");
        thumb.className = "thumb";

        const img = document.createElement("img");
        img.src = "img/" + p.img;
        img.alt = p.titulo || "Proyecto";
        img.loading = "lazy";

        thumb.appendChild(img);

        // NUMERO DE GRUPO
        const badge = document.createElement("div");
        badge.className = "badge";
      //  badge.textContent = "GRUPO " + p.grupo;

        thumb.appendChild(badge);

        // TITULO
        const titulo = document.createElement("h3");
        titulo.textContent = p.titulo;

        // CATEGORIA
       const categoria = document.createElement("p");
        //categoria.className = "categoria";
        //categoria.textContent = p.categoria || "Proyecto estudiantil";

        // DESCRIPCION
        const descripcion = document.createElement("p");
        descripcion.textContent = p.descripcion || "";

        // INTEGRANTES
        const integrantes = document.createElement("p");
        integrantes.className = "integrantes";
        integrantes.textContent =
            "Integrantes: " + (p.integrantes || []).join(", ");

        // AGREGAR ELEMENTOS A LA TARJETA
        card.appendChild(thumb);
        card.appendChild(titulo);
        card.appendChild(categoria);
        card.appendChild(descripcion);
        card.appendChild(integrantes);

        // ABRIR PROYECTO
        if (p.enabled !== false && p.link) {

            card.tabIndex = 0;
            card.setAttribute("role", "link");

            const abrirProyecto = () => {
                window.open(p.link, "_blank", "noopener,noreferrer");
            };

            card.addEventListener("click", abrirProyecto);

            card.addEventListener("keydown", e => {
                if (e.key === "Enter") {
                    abrirProyecto();
                }
            });

        } else {
            card.classList.add("disabled");
        }

        grid.appendChild(card);

    });
}

// CARGAR DATOS DEL ARCHIVO JSON
async function loadData() {

    try {

        const respuesta = await fetch("games.json", {
            cache: "no-store"
        });

        if (!respuesta.ok) {
            throw new Error("No se pudo cargar games.json");
        }

        const proyectos = await respuesta.json();

        if (!Array.isArray(proyectos)) {
            throw new Error("El archivo JSON no contiene una lista");
        }

        render(proyectos);

    } catch (error) {

        console.error(error);

        grid.textContent =
            "No se pudieron cargar los proyectos. Verifique el archivo games.json.";

    }
}

// INICIAR
loadData();
