# Bocetos de la web

Aquí se guardan **todos** los bocetos para compararlos y decidir más adelante. No se borra ninguno.

Lienzo privado con todos los bocetos: https://claude.ai/artifact/PYTGWDTfNDVD8T6Q1YeG6H
(cada boceto está en su propia página del lienzo). `lienzo/` es una copia de sus archivos.

| Boceto | Estilo | Archivos (`lienzo/project/`) | Estado |
|---|---|---|---|
| A · Amigable | Cartoon, madera cálida, sombras duras. Luckiest Guy + Nunito | `Main.dc.html`, `Orbital.dc.html`, `DemoOrbital.dc.html` | Boceto v0.1 |
| B · Minimalista | Editorial, idea «Anillos» (anillos del tronco = órbitas). Instrument Serif + Inter + JetBrains Mono. Inspirado en pixelarte.es y marcocreativo.es | `MainMinimal.dc.html` (usa `DemoOrbital.dc.html` en modo sobrio) | Boceto v0.1 |
| C · Portada Orbital | Portada a pantalla completa con el fondo del juego en parallax (3 profundidades de estrellas y nebulosas), planetas con órbitas, La Bola saltando entre planetas, lente de gravedad que sigue al cursor y parallax al hacer scroll. Unbounded + Inter + JetBrains Mono. Vista previa: https://claude.ai/artifact/T6J6odi6NMv6V941bdTiVw | `c-portada-orbital/` (HTML, CSS y JS listos para la web) | Boceto v0.1 |
| D · Fondos de Orbital | Usa los dos fondos del juego tal cual: nebulosa a pantalla completa en la portada (solo nombre, una frase y dos botones) y el fondo negro en la sección Juegos dentro de una ventana que se abre con el scroll. Vista previa: https://claude.ai/artifact/UZQpxAMY1bvVwJVg1raEUU | `d-orbital-fondos/` (ver `LEEME.md`) | Boceto v0.1 |
| E · Tipográfico | Inspirado en Wooo! y Dgrees: marca en movimiento, lista que alterna palo seco y serif, filas a dos columnas, principios con iconos pixel (La Bola, planeta, tronco) y el fondo negro de Orbital en una ventanita al pasar el cursor por "Orbital". Vista previa: https://claude.ai/artifact/S8jkFdLfhh3FKoUZiV2GaY | `e-tipografico/` | Boceto v0.1 |
| F · Galería | Inspirado en Pixelarte: fondo negro, el fondo de nebulosa de Orbital como imagen grande con el nombre encima, mosaico de trabajos con filtros, fichas del estudio y pie ámbar con el nombre enorme. Vista previa: https://claude.ai/artifact/9hJ444Nn4igbieQ7K7p6th | `f-galeria/` | Boceto v0.1 |
| G · Caso Orbital | Página de Orbital como caso de estudio (página de proyecto de Pixelarte): ficha, palabra gigante en contorno sobre cuadrícula, muestrario tipográfico, paleta del fondo del juego en franjas, barra de datos y bucle de juego. Vista previa: https://claude.ai/artifact/X8xXvjhKztVxQF62a13pNn | `g-caso-orbital/` | Boceto v0.1 |
| **H · Completo** | El boceto principal y el único completo. Empieza con la **intro de madera** del cliente (un tablero que se raja y cae; ahora en modo prueba, se ve en cada carga). Portada con el fondo de nebulosa y ORBITAL en Unbounded con letras que flotan solas; a los 5 s se reduce a una tarjeta y aparece WoodGames Studio. Logo tallado que se reilumina con el cursor (Codrops Relighting), pósteres de tela arrastrables (Codrops Cloth Posters), Orbital a pantalla completa con el fondo negro, índice claro con devlog y aviso de lanzamiento (Mount), secciones numeradas (Propagande). Vista previa: https://claude.ai/artifact/FFNnazEaioSgiAhaW61ZnD | `h-completo/` | **Boceto v0.3** |

Cada carpeta lleva los archivos de los fondos de Orbital que necesita para funcionar sola. Los originales del cliente (intro de madera y fondos) están en `../recursos/efectos-web/`.

`assets/`: logo recortado con fondo transparente (a partir del logo WG del cliente).

## Pendiente de decidir
- Qué boceto (o mezcla) se sigue.
- Tipografía definitiva y su licencia comercial.
- Textos entre [CORCHETES].
