Botón con bisel y sombra de bloque, el mismo en la web y en los menús del juego.

- **Principal** (`roble` / `on-roble`): una sola acción por pantalla, la más importante ("Juega la demo").
- **Secundario** (`laca` / `on-laca`): acciones de apoyo.
- **Texto** (`laca` subrayado): enlaces dentro de bloques, sin sombra.
- El bisel es `corte-sm` con `clip-path`. Como `clip-path` recorta la sombra, el botón va dentro de un contenedor con `filter: drop-shadow(4px 4px 0 …)`. En hover el bloque sube 2 px y la sombra pasa a 8 px.
- El texto es un verbo en imperativo, de dos o tres palabras.
- Lo que aporta quien lo usa: la etiqueta y la acción. El foco siempre es visible: 3 px de `laca` separados 3 px.
