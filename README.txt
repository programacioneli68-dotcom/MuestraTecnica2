GALERÍA INSTITUCIONAL DE PROYECTOS ESTUDIANTILES

ARCHIVOS
- index.html: estructura de la página.
- estilos.css: diseño institucional y Modo TV.
- script.js: carga de JSON, buscador, filtros y pantalla completa.
- games.json: listado editable de proyectos.
- img/: imágenes de las tarjetas.
- proyectos/: carpetas donde se alojan los trabajos de los estudiantes.

CÓMO PROBAR
1. Descomprimí la carpeta.
2. Abrila con Visual Studio Code.
3. Ejecutá index.html con la extensión Live Server (o usá otro servidor HTTP).
   No abras index.html directamente con doble clic: fetch() necesita un servidor.
4. La galería carga los datos desde games.json.

CÓMO AGREGAR UN PROYECTO
1. Copiá el proyecto terminado dentro de proyectos/, por ejemplo proyectos/grupo4/.
2. Copiá una imagen representativa dentro de img/, por ejemplo grupo4.jpg.
3. Abrí games.json y agregá un objeto separado por comas dentro del arreglo.
4. Completá grupo, titulo, descripcion, integrantes, img, link, categoria y enabled.
5. Guardá el JSON y recargá la galería.

EJEMPLO DE OBJETO JSON
{
  "grupo": 4,
  "titulo": "Nombre del proyecto",
  "descripcion": "Breve explicación del trabajo.",
  "integrantes": ["Nombre Apellido", "Nombre Apellido"],
  "img": "grupo4.jpg",
  "link": "proyectos/grupo4/index.html",
  "categoria": "Programación",
  "enabled": true
}

IMPORTANTE
- JSON no admite comentarios y requiere comillas dobles en nombres y textos.
- Cada objeto debe separarse con una coma, excepto el último.
- enabled: false muestra el proyecto como “Próximamente” y no permite abrirlo.
- Para ocultar temporalmente un proyecto, se puede usar enabled: false.
- Los enlaces son rutas relativas a index.html.
- La pantalla completa depende del navegador y requiere una acción del usuario.
- Antes de publicar, reemplazá los nombres de ejemplo y verificá que tengas autorización
  para publicar nombres e imágenes de estudiantes. También podés usar solo nombres de pila
  o seudónimos, según las pautas de la institución.
