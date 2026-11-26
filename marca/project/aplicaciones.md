# Aplicaciones

Cómo se aplica el taller en cada sitio. Los tamaños son los recomendados por cada plataforma en noviembre de 2026. Revísalos antes de cada campaña.

## Web

La web no es un folleto, es el primer nivel del juego.

- **El hero se juega.** En lugar de una imagen, la primera pantalla es una demo mínima jugable con el teclado o con el dedo: por ejemplo, apilar tablones o mover al protagonista por un nivel de prueba. Va dentro de un marco con `corte-lg` y debajo lleva un único titular `display-xl` y un botón principal "Juega la demo".
- **Los personajes son la navegación.** Cada personaje tiene su **FichaPersonaje**. Antes del anuncio se muestra como silueta con estadísticas "???" y la etiqueta PRÓXIMAMENTE. Desvelarlos poco a poco da motivos para volver.
- **Nada se repite.** Cada sección cambia de material: una banda `bosque`, una zona de veta, un bloque `roble`. No pongas dos secciones seguidas con el mismo fondo ni la misma maqueta.
- **El devlog es el blog.** Cada entrada usa la plantilla Devlog de redes, de modo que web y redes cuentan lo mismo con la misma cara.
- Estructura mínima: Hero jugable → Juego (qué es, en 3 frases) → Personajes → Devlog → Estudio (quiénes somos) → Contacto y prensa.
- Iconos de la web: favicon de 16, 32 y 48 px con la marca a color, `apple-touch-icon` de 180 px y 512 px para la PWA, con la marca sobre `abedul` y un margen del 12 %.

## Redes sociales

Tres plantillas, una cuadrícula. Están en el componente **PostSocial**.

- **Formatos:** 1080 × 1080 (cuadrado), 1080 × 1350 (vertical, para el feed de Instagram) y 1080 × 1920 (stories y reels, con 250 px libres arriba y abajo para la interfaz).
- **Cuadrícula fija:** margen de seguridad de 72 px. La etiqueta `label` va siempre arriba a la izquierda y la marca a 56 px, abajo a la derecha. El titular `display-lg` se apoya en la línea inferior.
- **Anuncio** sobre `bosque`, para fechas, lanzamientos y eventos.
- **Devlog** sobre `abedul`, con captura del juego en un marco `corte-md`, para el progreso semanal.
- **Personaje** sobre `roble`, para presentar o insinuar personajes.
- En el feed se alternan las tres plantillas para que el perfil forme un mosaico de colores, no una pared del mismo color.
- **Foto de perfil:** la marca a color sobre `abedul` dentro del círculo, a 400 × 400. Vale para X, Instagram, LinkedIn, YouTube, Discord y Steam.
- **Banners:** X 1500 × 500, LinkedIn 1584 × 396 y YouTube 2560 × 1440 (zona segura central de 1546 × 423). Banda de veta sobre `roble` y el logotipo horizontal en `carbon` dentro de la zona segura.

## Firma de correo

Una sola firma para todo el equipo. La tienes en el componente **FirmaCorreo**.

- Se construye con tablas HTML y estilos en línea, que es lo único que respetan Gmail y Outlook.
- El logo va en PNG a 2x (96 × 96 px mostrado a 48 px), alojado en el dominio del estudio. Los SVG no se ven en Outlook.
- Las fuentes web no cargan en la mayoría de clientes: el nombre usa la pila Arial Black y el texto Arial. El color y el bisel mantienen la identidad.
- Contenido fijo: nombre, cargo en `label`, correo, web y una sola línea de "Ahora en el taller" con el último devlog. Sin citas ni banners pesados.

## Dentro del juego

- Menús y HUD con los mismos tokens: botones con bisel, sombra de bloque, `laca` para la selección y `resina` para logros.
- Pantalla de carga: veta animada que crece anillo a anillo.
- Créditos y splash: la marca a color sobre `abedul`, o la versión `abedul` sobre `carbon` en el tema oscuro.
- Las tres fuentes tienen licencia OFL y pueden ir incluidas en el ejecutable del juego.
