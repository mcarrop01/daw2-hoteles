# Hoteles · Proyectos web de 2.º de DAW

Directorio de la práctica **2.1.5. Sitio web de alojamiento**. Reúne los proyectos del alumnado de 2.º de Desarrollo de Aplicaciones Web y permite consultar el hotel de referencia, la web publicada y el prototipo de Figma de cada trabajo.

## Qué incluye

- Catálogo con búsqueda por alumno u hotel, filtros por disponibilidad del enlace y ordenación. El selector de curso muestra la promoción actual y queda preparado para futuras promociones.
- Requisitos de la práctica, lista personal de comprobación con progreso y opción de deshacer el reinicio, y acceso a la actividad de Moodle.
- Diseño adaptable a móviles y ordenadores, modo claro y oscuro, y una guía de estilo plegable con la paleta, la tipografía y los componentes.

## Actualizar los proyectos


«Enlace pendiente» indica que falta incorporar la URL al directorio. El estado de la entrega se consulta en Moodle.

Para añadir otra promoción, usa el formato `AAAA-AAAA` en el campo `course` de sus proyectos y elimina el atributo `disabled` del selector `course-filter` en `index.html`. Las opciones se generan a partir de los cursos de los proyectos.

## Estructura del repositorio

| Archivo o carpeta | Función |
| --- | --- |
| `index.html` | Contenido, navegación y directorio básico disponible sin JavaScript. |
| `projects.js` y `app.js` | Datos de los proyectos y funcionamiento del catálogo. |
| `checklist.js` y `theme.js` | Lista de comprobación y preferencias de tema. |
| `styles.css`, `classroom.css` y `accessibility.css` | Diseño, adaptación a pantallas, contraste y foco visible. |
| `assets/` | Bootstrap, su licencia y el icono de la web. |
| `scripts/generate-directory.mjs` | Generador del directorio básico a partir de los datos de los proyectos. |

## Accesibilidad y datos

La web incluye acceso directo a los proyectos mediante teclado, indicadores de foco, etiquetas accesibles y respeto por la preferencia de movimiento reducido. Si no se carga JavaScript, siguen disponibles los requisitos de la práctica y el directorio básico.

La preferencia de tema y las marcas de la lista se guardan en el navegador. La entrega de la actividad se realiza en Moodle.

Bootstrap se distribuye bajo [licencia MIT](assets/bootstrap-LICENSE.txt).
