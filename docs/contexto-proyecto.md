# WoodGames Studio · Contexto del proyecto (chat, acceso, juegos, estructura)

WoodGames Studio es una desarrolladora de videojuegos nueva y muy joven. Tiene que salir al mercado con una identidad **coherente y homogénea** en la web, las redes, el correo y dentro de los juegos. La idea de **"marco creativo"** es que los mismos patrones se usen en todo: web, posts, firmas y juego.

Este repositorio reúne la identidad de marca, los bocetos y las webs del estudio.

## Reglas de trabajo (importante)

- **Responde siempre en español.**
- **No diseñes ni crees nada que no se haya pedido.** El usuario (Marcos) va enviando el material: juegos, colores, tipografía, logo e ideas del cliente. Al principio se creó un sistema de marca completo sin que se pidiera y el usuario lo frenó. Haz solo lo que pida y pregunta antes de crear algo nuevo.
- **Guarda TODOS los bocetos.** No borres ni sustituyas ninguno: se compararán y se decidirá más adelante. Cada boceto nuevo va a `bocetos/` y a una página nueva del lienzo, y se apunta en `bocetos/README.md`.
- **Al terminar cada tarea, haz commit y push** para poder seguir desde otro equipo.
- **El repositorio es público.** No subas secretos (tokens, contraseñas) ni documentos internos del cliente: nombres de personas, fechas internas o documentos de juegos sin publicar.
- Marca los datos que faltan como `[CORCHETES]`. No inventes cifras ni textos que parezcan reales.

## Acceso y entorno

- Repositorio: https://github.com/marcosics/woodgames-studio (público).
- La conexión de GitHub con Claude no funcionó. En las sesiones en la nube el usuario pega un token al empezar y se configura **solo en `.git/config` local** del clon (`http.<url>.extraHeader`). Nunca se escribe en archivos del repositorio. Si no hay token, no se puede hacer push: pídelo.
- El usuario también trabaja en local en Windows (carpeta WOODGAMESTUDIO). Allí no tiene Git Bash instalado y los hooks de bash fallan.

## Material recibido del cliente (resumen)

- **Logo:** tronco cortado con "WG" tallado, vetas amarillas y corteza marrón. Hay dos versiones a color y una en grises. Para el logo definitivo se estudian también un cincel y martillo, solo un cincel o una espada de madera.
- **Estudios de referencia:**
  - Gustan: Digital Sun, Devolver Digital, ustwo games y Mobius Digital ("la base está bien").
  - No gustan: Larian, Naughty Dog, The Game Kitchen, Team Cherry.
  - Interesante: Annapurna. Raro: Chibig.
- **Webs de referencia:** pixelarte.es, marcocreativo.es (más impactantes visualmente y minimalistas) e iukanet.com. Hay también una web de prueba del cliente en base44, "le falta aún".
- **Paletas:** 12 de coolors propuestas por el cliente. Las que más encajan con el logo son la 4 (`#18100d #351000 #af7253 #ffd99b #d1b391`) y la 10 (`#242331 #533e2d #a27035 #b88b4a #ddca7d`).
- **Tipografías:** unas 16 de dafont. Gustan Blood'n Guts ("como tallado en madera"), Godzilla y Snake in the Boot. Haloberry sirve de referencia espacial. **Ojo:** casi todas son "solo uso personal" y necesitan licencia comercial.
- **Plazo:** versión funcional y con estilo de la web para el **7 de diciembre de 2026** "a poder ser". Decide el responsable del cliente; el nombre está en el documento del cliente, no se sube aquí.
- **Guía para publicar un juego móvil:** orden recomendado:
  1. Entidad legal y dominio con web pública.
  2. D-U-N-S (tarda hasta 30 días).
  3. Correos de empresa.
  4. Cuentas de Apple Developer y Google Play de organización.
  5. GitHub y Unity.
  6. Datos fiscales y bancarios.
  7. Política de privacidad y app-ads.txt en la web.

## Juegos

- **Orbital** (en producción): arcade 2D de habilidad con físicas para iOS y Android.
  - Un meteorito ("La Bola") viaja de planeta en planeta usando la gravedad.
  - Se juega con un dedo: mantener pulsado atrae hacia el planeta; en órbita, mantener carga el lanzamiento y soltar escapa de la órbita.
  - Cada planeta tiene dos órbitas: la exterior da 10 puntos y 1 moneda; la interior, 25 puntos y 3 monedas.
  - Se pierde al chocar con un planeta o al quedarse sin inercia en el espacio.
  - Las monedas se gastan en personalizaciones.
- **Taller de antigüedades** (futuro, nombre provisional): idle de restauración.

## Estructura del repositorio

- `docs/lista-marca.md`: lista de todas las decisiones de marca, en 10 bloques con casillas.
- `bocetos/`: todos los bocetos de la web. Índice en `bocetos/README.md`. `bocetos/lienzo/` es la copia de los archivos del lienzo privado https://claude.ai/artifact/PYTGWDTfNDVD8T6Q1YeG6H, que tiene una página por boceto.
  - **Boceto A · Amigable:** estilo cartoon, madera cálida y sombras duras, con Luckiest Guy y Nunito. Incluye la portada (`Main`), la página de Orbital (`Orbital`) y la demo jugable (`DemoOrbital`).
  - **Boceto B · Minimalista:** estilo editorial con la idea "Anillos" (los anillos del tronco son órbitas). Colores papel `#f2ede4`, tinta `#120d0a` y resina `#e9a23b`, con Instrument Serif, Inter y JetBrains Mono. Archivo `MainMinimal`. Usa `DemoOrbital` con `minimal=true`.
  - `assets/`: logo WG recortado con fondo transparente.
- `base/`, `web-cliente/`, `web-propuesta/`: para las **dos webs separadas**, la del método del cliente y la del método del usuario, con una base común. Todavía están vacías.
- `marca/`: borrador de sistema de diseño hecho sin que se pidiera. **Apartado:** no se usa salvo que el usuario lo diga. También está publicado como artefacto privado en https://claude.ai/artifact/NTbaXb51qJ4AeuJzy7W5vZ.

## Pendiente

- Elegir boceto o mezcla de bocetos, la tipografía definitiva con licencia comercial y la paleta definitiva.
- Textos reales: estudio, ciudad, correo, redes, devlog y capturas de Orbital.
- Logo definitivo y sus versiones: horizontal, símbolo, una tinta y favicon.
- Definir las ideas del cliente y las del usuario para las dos webs.
