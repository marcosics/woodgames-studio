# WoodGames Studio · Estilo de diseño y web

WoodGames Studio es un estudio de videojuegos nuevo y joven. Este archivo recoge **la dirección de diseño del estudio**: estilo visual, web, arte digital y aplicaciones. Se basa en el material y los comentarios del cliente. Lo que aún no está decidido se marca como **[PENDIENTE]**.

## Reglas para trabajar aquí

- Responde en español.
- No diseñes nada que no se haya pedido. El cliente y Marcos envían el material, y se trabaja sobre eso.
- Guarda **todos** los bocetos en `bocetos/` y en el lienzo (https://claude.ai/artifact/PYTGWDTfNDVD8T6Q1YeG6H), cada uno en su página. Se decidirá más adelante.
- Haz commit y push al terminar. El repositorio es público: nada de secretos ni documentos internos del cliente.
- Contexto general del proyecto (acceso a GitHub, juegos, estructura del repositorio): `docs/contexto-proyecto.md`.
- Si falta un dato, pon `[CORCHETES]`. No te lo inventes.

---

## 1. La idea central: el "marco creativo"

Todo debe parecer hecho por el mismo estudio y pensado a propósito, nunca improvisado. Los **mismos patrones** se repiten en la web, los posts, las firmas de correo, los banners, los perfiles de redes y dentro de los juegos. La marca no va separada del resto: lo une todo.

**El concepto que sale del nombre y del logo:** madera, taller y algo hecho a mano. El juego se talla como una pieza de madera. En el boceto B surgió una idea que une la madera con el primer juego: **los anillos del tronco también son órbitas**.

## 2. Qué buscamos y qué no

Esta es la lectura de los estudios de referencia que valoró el cliente. La interpretación de por qué gusta cada uno es mía y conviene confirmarla con él.

| Gusta | Qué tomar |
|---|---|
| **Devolver Digital** | Personalidad fuerte, atrevida, con humor. Que no sea aburrido. |
| **ustwo games** | Minimalismo elegante, color limpio y mucho cuidado del detalle. |
| **Mobius Digital** | Lo cósmico y lo artesanal juntos. "La base está bien, lo haría de otra forma". |
| **Digital Sun** | Calidez, cercanía y arte hecho a mano. |

| No gusta | Qué evitar |
|---|---|
| Larian, Naughty Dog | Estética AAA realista, oscura y cinematográfica. |
| The Game Kitchen, Team Cherry | Mundos góticos u oscuros. |
| Annapurna ("interesante") | Se puede tomar alguna idea, pero no como base. |
| Chibig ("raro") | Lo excesivamente adorable o pastel. |

**Webs de referencia:** pixelarte.es y marcocreativo.es se ven "más alucinantes visualmente". Se busca algo **más minimalista**: tipografía grande, mucho espacio en blanco, pocas cosas pero contundentes, etiquetas en mayúsculas y el proceso contado por fases. iukanet.com es otra referencia. La web de prueba del cliente (base44) "todavía tiene muchas cosas incorrectas".

**En resumen:** cálido, estilizado, hecho a mano y con chispa, pero **pulido y con criterio de diseño**. Ni infantil ni oscuro.

## 3. Logo

- **El actual** es un tronco cortado visto de frente, con "WG" tallado en relieve, vetas amarillas, corteza marrón irregular y grietas. Hay dos versiones a color, una con grietas que llegan a las letras, y otra en grises.
- **Para el definitivo** el cliente quiere probar un símbolo simple y estilizado: **cincel y martillo**, **solo cincel** o **espada de madera**. Hay que probar varias versiones y comparar. **[PENDIENTE]**
- Debe funcionar como banner, logo, foto de perfil, favicon e icono de app. Hay que **vectorizarlo** y adaptarlo a cada caso:
  - versión completa, horizontal y solo símbolo
  - a color, a una tinta oscura y a una tinta clara
  - tamaño mínimo y espacio de respeto
- El logo actual tiene mucho detalle de vetas y grietas. A 16–32 px se pierde, así que el favicon necesita una versión simplificada.

## 4. Color

El cliente propuso 12 paletas de coolors.co (están en su documento). Las que mejor encajan con el logo:

- **Paleta 4, madera:** `#18100d` `#351000` `#af7253` `#ffd99b` `#d1b391`
- **Paleta 10, para espacio y Orbital:** `#242331` `#533e2d` `#a27035` `#b88b4a` `#ddca7d`

Direcciones probadas en los bocetos:
- **A · Amigable:** crema `#f6e8d0`, corteza `#351000`, madera `#af7253`, serrín `#d1b391`, resina `#ffd99b` y espacio `#242331`.
- **B · Minimalista:** solo 3 colores. Papel `#f2ede4`, tinta `#120d0a` y resina `#e9a23b` como único acento.

Paleta definitiva: **[PENDIENTE]**. Normas en cualquier caso:
- Contraste legible: mínimo 4,5:1 en texto normal.
- Que funcione sobre fondo claro y oscuro.
- Colores de aviso, éxito y error también para la interfaz del juego.

## 5. Tipografía

- **Titulares, lo que da carácter:** el cliente busca algo que parezca **tallado en madera**. Sus favoritas de dafont son **Blood'n Guts**, Godzilla y Snake in the Boot. **Haloberry** es la referencia para lo espacial, como inspiración y no para usarla tal cual.
- **Licencia:** casi todas las de dafont son **solo para uso personal**. Para la web, la marca y el juego hace falta comprar la licencia comercial o elegir otra. **[PENDIENTE]**
- **Texto largo:** una sans muy legible en móvil.
- **Interfaz del juego y datos:** opcionalmente una mono o una display para el HUD.
- Provisionales en los bocetos, todas de Google Fonts con uso comercial libre:
  - A: Luckiest Guy + Nunito.
  - B: Instrument Serif + Inter + JetBrains Mono.
- Correo: fuente de respaldo segura (Arial o Georgia).

## 6. Elementos gráficos (el lenguaje propio)

Salen del logo y se reutilizan en todo:
- **Vetas y anillos del tronco:** como fondos, separadores o patrones. También como órbitas.
- **Grietas y cortes:** para bordes, transiciones entre secciones y efectos.
- **El tallado:** letras y formas en relieve, con sombras marcadas.
- **Corteza irregular:** como marco de imágenes o avatares.
- Iconos: un solo estilo coherente con la marca. **[PENDIENTE]**
- Nada de emoji ni de clichés de plantilla genérica.

## 7. La web

Lo que pidió el cliente:
- **Innovadora, nada aburrida, y homogénea con el resto de la marca.**
- **Que no se repita:** cada sección con su propio ritmo y fondo.
- **Una demo del juego** en la web, aunque sea básica, para enseñarlo. Ya hay una demo jugable de Orbital en los bocetos.
- **Los personajes** pueden tener protagonismo, por ejemplo desvelándose poco a poco.
- **Dos webs separadas** con una base común: una con el método del cliente y otra con el método de Marcos. Las carpetas son `base/`, `web-cliente/` y `web-propuesta/`.
- Fecha objetivo: **7 de diciembre de 2026** para una versión funcional y con estilo.

Secciones previstas: inicio, juegos, página de cada juego (con demo, cómo se juega, capturas y aviso de lanzamiento), personajes, estudio o proceso, devlog, prensa (press kit), contacto y textos legales (aviso legal, privacidad y cookies). La web también tiene que alojar la política de privacidad y app-ads.txt que piden las tiendas.

Bocetos actuales en `bocetos/README.md`:
- **A · Amigable:** estilo cartoon, madera cálida y sombras duras.
- **B · Minimalista:** editorial, con la idea "Anillos", tipografía grande y animaciones sutiles.
- **C · Portada Orbital:** el fondo del juego (nebulosas violeta y azul, estrellas) en parallax como portada de toda la web para promocionar Orbital. Planetas, La Bola en ámbar (único color cálido) y el cursor como lente de gravedad. Código web real en `bocetos/c-portada-orbital/`.

## 8. Arte de los juegos (Orbital)

- Arcade 2D en el espacio. El one-sheet pide: **fondo con parallax, efectos luminosos, partículas y planetas con diseños distintos**.
- Piezas de arte: **planetas**, **avatar (La Bola)** y **fondos**. El documento de arte, sonido y efectos tiene los apartados creados pero todavía sin contenido. **[PENDIENTE]**
- La Bola tiene personalizaciones que se compran con monedas, así que hacen falta varios aspectos.
- Para mantener el marco creativo, el espacio de Orbital debería llevar **algo de la calidez de la marca** (tonos madera y resina) y no un sci-fi frío genérico.
- La interfaz del juego (botones, menús, tipografía y pantalla de inicio con el logo) sigue los mismos patrones que la web.

## 9. Aplicaciones de la marca

Cada pieza tiene que salir de una plantilla, no hacerse a mano cada vez:
- **Posts:** formatos cuadrado, vertical y stories. Tipos: anuncio, devlog, personaje y evento. Siempre la misma cuadrícula y la misma forma de ordenar los elementos.
- **Firma de correo:** igual para todo el equipo, en HTML compatible con Gmail y Outlook.
- **Banners y perfiles** de cada red: X, Instagram, TikTok, YouTube, Discord y Steam.
- **Favicon e iconos de app** en sus tamaños.
- **Press kit:** logos, capturas, descripción y contacto.

## Pendiente de decidir

Boceto o mezcla de bocetos · paleta definitiva · tipografía definitiva con licencia · logo definitivo (cincel, martillo o espada) y sus versiones · estilo de iconos · arte de Orbital · textos reales.
