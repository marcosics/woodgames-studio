WoodGames Studio hace videojuegos como se trabaja la madera: a mano, por capas, dejando que se vea la veta. Esta guía es **el taller**, un único marco creativo para la web, las redes, los correos, el material de prensa y la interfaz de cada juego. Si algo de la marca no sale de aquí, todavía no es de la marca.

> Estado: **versión 0.1, propuesta.** Paleta, tipografía y logo son una primera dirección para decidir. El logo es un boceto vectorial y debe pasar por una sesión de diseño antes de registrarlo.

## La idea: el taller

Tres materiales del taller dan forma a todo lo que hacemos:

- **El corte.** Las esquinas no se redondean, se cortan en bisel, como un tablón serrado. Es la silueta del logo y la de cada botón, ficha y marco. Usa `corte-sm` en botones y etiquetas, `corte-md` en fichas y `corte-lg` en bloques grandes.
- **El bloque.** Las piezas se apilan unas sobre otras con sombra dura y sin desenfoque (`sombra-bloque`, `sombra-bloque-alta` al pasar el ratón). Nada flota con sombras difusas. Como `clip-path` recorta la sombra, pon el bisel en el elemento y la sombra en su contenedor con `filter: drop-shadow`.
- **La veta.** Los anillos de crecimiento del tronco son nuestro patrón: círculos concéntricos descentrados en `linea` sobre `abedul`, o en `on-roble` sobre `roble`. Se usan como textura de fondo en zonas amplias, nunca detrás de texto pequeño.

La misma regla vale dentro del juego: los menús, el HUD y las pantallas de carga usan estos tokens, este corte y esta sombra. Así un jugador reconoce el estudio sin ver el logo.

## Voz y tono

- Habla de tú, en español cercano y claro. Primera persona del plural para el estudio: "estamos puliendo", "os enseñamos".
- Cuenta el proceso. Somos un estudio joven y lo que nos diferencia es enseñar el taller: bocetos, errores, versiones.
- Frases cortas y verbos concretos: "Juega la demo", no "Descubre una experiencia".
- Nada de emojis en titulares ni en la web. En redes, como mucho uno al final del texto.
- Mayúsculas solo en las etiquetas `label` (DEVLOG #03, v0.2, NUEVO).

## Color

- El fondo es `abedul`. Las superficies elevadas, en `abedul-alto`. El texto, en `carbon`, y el secundario en `ceniza`.
- **Roble** es la marca. Úsalo en grandes campos, el bloque del logo y el botón principal, siempre con `on-roble` encima. Para texto naranja usa `roble-tinta`, nunca `roble`.
- **Bosque** es el segundo color: bandas de sección y cabeceras de post, con `on-bosque` encima.
- **Laca** es solo para lo que se puede tocar: enlaces, foco, selección en menús. Si es azul, se puede pulsar.
- **Resina** es un destello: etiquetas NUEVO, logros, puntuaciones. Nunca ocupa más de una décima parte de una pieza.
- Proporción orientativa en cualquier pieza: 60 % abedul, 25 % roble o bosque, 10 % carbon, 5 % laca o resina.
- El tema oscuro no es un negativo: cada token tiene su valor oscuro propio, ya comprobado para contraste. En el juego, los menús nocturnos usan el tema oscuro.

## Tipografía

- **Bricolage Grotesque** para titulares (`display-xl`, `display-lg`, `title`, `subtitle`). Tiene carácter de taller y el nombre lo dice todo: bricolaje. Usa un solo `display-xl` por pantalla.
- **Figtree** para leer (`body-lg`, `body`, `small`). Es clara, amable y se lee bien en pantallas pequeñas.
- **JetBrains Mono** para etiquetas y datos (`label`), siempre en mayúsculas con su espaciado. En el juego, para el HUD, contadores y versiones.
- Las tres están en Google Fonts, son gratuitas y tienen licencia OFL, así que valen para web, impresión y para incluirlas dentro del juego.
- Titulares alineados a la izquierda. Nada centrado salvo el logo apilado.

## Logo

- La marca es **un tronco cortado**: un bloque de `roble` con bisel en las cuatro esquinas, dos anillos de crecimiento en `carbon` y un píxel en el centro. Madera por fuera, juego en el corazón.
- Versiones en el grupo **Logos**: color, una tinta `carbon` para fondos claros, y una tinta `abedul` para fondos oscuros o de `bosque`.
- Logotipo completo = marca + "WoodGames" en Bricolage Grotesque 800 + "STUDIO" en `label`. Tienes los montajes horizontal y apilado en el componente **Logo**.
- Margen de seguridad: un cuarto del ancho de la marca por cada lado. Tamaño mínimo: 16 px la marca sola (favicon) y 120 px de ancho el logotipo horizontal.
- No lo gires, no le cambies los colores fuera de las tres versiones, no le pongas sombra ni lo metas en un círculo, salvo en la foto de perfil.

## Iconografía

- Todavía no hay set de iconos. Mientras tanto, usa iconos de trazo de 2 px con esquinas vivas, en `carbon` o `laca`. Encaja bien un set abierto como Lucide.
- Nada de emojis como iconos.

## Movimiento

- Las piezas entran como si se apilaran: un desplazamiento corto de 8 px y 160 ms con curva de salida. En hover, el bloque sube y su sombra pasa a `sombra-bloque-alta`.
- Respeta `prefers-reduced-motion`: sin desplazamientos, solo cambio de color.

## Accesibilidad

- Todo texto cumple 4.5:1 sobre su fondo en los dos temas. Las parejas válidas están en la nota de uso de cada token.
- Foco visible siempre: contorno sólido de 3 px en `laca` separado 3 px del elemento.
- La información nunca va solo en color: un logro lleva icono y palabra, no solo resina.
