# WoodGames Studio · Proceso de trabajo

Registro de lo que se ha hecho, lo que ha dicho el cliente y lo que queda. Se actualiza en cada sesión.

## Estado actual (27/11/2026)

- **Boceto principal: H · Completo**. Vista previa: https://claude.ai/artifact/FFNnazEaioSgiAhaW61ZnD. Archivos en `bocetos/h-completo/`.
- **Fecha objetivo:** una versión funcional y con estilo de la web para el **7 de diciembre de 2026**.
- **Primer juego:** Orbital, arcade 2D de gravedad para iOS y Android, en producción.

## Cómo se ve el boceto H (en orden)

1. **Intro de madera** (del cliente): un tablero de contrachapado tapa la web, se raja de abajo arriba y las dos mitades caen. Funciona en móvil y en escritorio. **Modo prueba:** se ve en cada carga. En el pie hay un botón "Repetir intro (prueba)".
2. **Portada /01:** fondo de nebulosa de Orbital y "ORBITAL" grande en Unbounded, con las letras flotando solas. A los 5 s, Orbital se reduce a una tarjeta ("Próximo lanzamiento · Orbital · Ver juego →") y en el centro aparece **WoodGames Studio** con el logo, una frase y botones.
3. **El estudio /02:** el logo WG tallado en relieve, con una luz que sigue al cursor (sin cursor, la luz orbita sola), y la frase del estudio.
4. **Juegos /03:** pósteres de tela de Orbital y del Taller de antigüedades. Ondean solos y se pueden agarrar y arrastrar.
5. **Orbital /04:** pantalla completa con el fondo negro del juego, la descripción, los 4 pasos del bucle de juego y la barra de datos.
6. **Índice /05:** bloque claro con enlaces (Estudio, Juegos, Devlog, Prensa), devlog con fechas, avisos y formulario "Te avisamos el día que salga Orbital" (en el boceto no envía nada).
7. **Pie:** contacto, redes, "WOODGAMES" grande, avisos legales y un botón flotante "Avísame de Orbital".

## Historial

| Fecha | Qué se hizo | Comentario del cliente |
|---|---|---|
| 20/11 | Lista de decisiones de marca (`docs/lista-marca.md`). | Antes se había hecho un sistema de marca sin pedirlo (`marca/`). El cliente pidió no diseñar nada sin que lo pida. |
| 26/11 | Material del cliente: logo WG, paletas, tipografías, one-sheet y game loop de Orbital, guía para publicar en las tiendas. | Plazo: 7 de diciembre. |
| 26/11 | Bocetos A (amigable) y B (minimalista). | Pide algo menos amigable, más impactante y minimalista. |
| 26/11 | Boceto C: portada con el fondo de Orbital en parallax. | Envía los fondos del juego. "Minimalista y disruptivo no es poner tonterías: enseñar lo justo, no inventar". |
| 27/11 | Boceto D: los dos fondos tal cual (portada y sección Juegos). | Envía referencias: Dgrees, Pixelarte y Wooo!. |
| 27/11 | Bocetos E, F y G a partir de esas referencias. | "Están incompletos y son malísimos". Pide uno completo. Nuevas referencias: Propagande, Fojcik, Codrops (cloth posters, relighting, kinetic images) y Mount. |
| 27/11 | **Boceto H completo.** | "La fuente intenta molar pero no mola". Pide que el título se mueva solo y que a los 5 s se reduzca lo de "Próximo lanzamiento" para enseñar la empresa. Hecho: Unbounded, letras que flotan y portada en dos tiempos. |
| 27/11 | Intro de madera integrada en el boceto H (modo prueba, móvil y escritorio). | Pide subir todo el progreso a GitHub. |

## Lo que ha quedado claro del cliente

- Enseñar lo justo. No inventar elementos, cifras ni proyectos. Inspirarse en las referencias, no copiarlas.
- Los bocetos tienen que estar **completos y probados**, no a medias.
- Tipografía limpia, sin efectos que "intentan molar".
- La portada presenta el próximo juego y después la empresa.
- Los efectos que envía el cliente se integran tal cual.

## Pendiente

- Opinión del cliente sobre el boceto H con la intro de madera.
- Imágenes reales de Orbital (capturas o arte, al menos 6–8) para la galería con "kinetic images" de Codrops.
- Tráiler o gameplay de Orbital para la sección /04, si existe.
- Datos reales: correo, ciudad, redes y texto del estudio.
- Tipografía definitiva y su licencia. La provisional es Unbounded + Inter (Google Fonts, uso comercial libre).
- Antes de publicar la web real: intro con `oncePerSession: true`, dominio, política de privacidad, aviso legal, cookies y `app-ads.txt`.

## Dónde está cada cosa

- `bocetos/`: todos los bocetos, del A al H, con su índice (`bocetos/README.md`).
- `recursos/efectos-web/`: efectos del cliente (intro de madera, fondo negro y fondo de nebulosa) con su `INTEGRACION.md` y la demo.
- `docs/`: lista de decisiones de marca, contexto del proyecto y este proceso.
- `marca/`: borrador antiguo, apartado y sin usar.
