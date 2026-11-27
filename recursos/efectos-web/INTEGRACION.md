# Efectos web de Orbital · Instrucciones de integración

Este paquete tiene dos efectos ya terminados para la web de WoodGames Studio:

1. **Intro de madera** (`efectos/intro-madera/`). Al cargar la página, un tablero de contrachapado tapa la web. Se raja de abajo arriba siguiendo la veta y las dos mitades caen dejando ver la página. Dura unos 3 s.
2. **Fondo de Orbital** (`efectos/fondo-orbital/`). Es un fondo negro con un brillo azul y morado muy leve y estrellas que se mueven, aparecen y se apagan. De vez en cuando cruza una estrella fugaz. Tiene parallax con el cursor y no tiene fin.

Los dos son **JavaScript y CSS sin dependencias**: no hay librerías, imágenes ni fuentes externas. La textura de la madera se genera con WebGL.

> **Para Claude Code:** integra estos efectos **tal como están**. No cambies su aspecto, sus tiempos ni sus colores salvo que el cliente lo pida. No añadas elementos (constelaciones, logos, textos, sierras, herramientas) que no se hayan pedido. El diseño del resto de la web es tuyo.

---

## Estructura

```
efectos/
  intro-madera/
    intro-madera.css
    intro-madera.js
  fondo-orbital/
    orbital-bg.css
    orbital-bg.js
demo/
  index.html            ← ejemplo de integración (rutas relativas a ../efectos)
  vista-previa.html     ← todo en un archivo, con botón "Repetir"
  intro-madera-demo.mov ← vídeo de referencia de la intro (1920×1080, 60 fps)
```

Copia `efectos/` a la carpeta pública de la web, por ejemplo `public/efectos/` o `static/efectos/`.

---

## Integración en HTML

En el `<head>`, **en este orden**:

```html
<!-- 1. Opciones de la intro (opcional; si no se pone, se usan los valores por defecto) -->
<script>
  window.IntroMaderaConfig = { oncePerSession: true };
</script>

<!-- 2. Tapa la web desde el primer pintado. Sin esto, la página se ve un instante antes de la intro. -->
<script>
  (function () {
    var c = window.IntroMaderaConfig || {}, seen = false;
    try { seen = sessionStorage.getItem('intro-madera-vista') === '1'; } catch (e) {}
    if (c.auto !== false && !(c.oncePerSession && seen)) document.documentElement.classList.add('intro-madera-pending');
  })();
</script>

<link rel="stylesheet" href="/efectos/fondo-orbital/orbital-bg.css">
<link rel="stylesheet" href="/efectos/intro-madera/intro-madera.css">
```

En el `<body>`:

```html
<!-- Fondo de estrellas: primer hijo del body; queda fijo detrás de todo -->
<div class="orbital-bg" data-orbital-bg></div>

<!-- ... contenido de la web ... -->

<script src="/efectos/fondo-orbital/orbital-bg.js" defer></script>
<script src="/efectos/intro-madera/intro-madera.js" defer></script>
```

La intro crea sus propios elementos y se coloca encima de todo con `z-index: 9999`. Al terminar se elimina del DOM.

---

## Opciones y API de la intro

`window.IntroMaderaConfig`, que se define **antes** de cargar `intro-madera.js`:

| Opción | Por defecto | Qué hace |
|---|---|---|
| `auto` | `true` | `false`: no arranca sola; hay que llamar a `IntroMadera.play()`. |
| `oncePerSession` | `false` | `true`: solo se ve la primera vez en la sesión del navegador. **Recomendado en producción.** |
| `hold` | `0.7` | Segundos con el tablero entero antes de rajarse. |
| `crack` | `1.05` | Segundos que tarda la grieta en subir. |
| `open` | `0.18` | Segundos que tarda en abrirse la rendija antes de la caída. |
| `fall` | `1.15` | Segundos de caída de las mitades. |
| `maxDpr` | `2` | Resolución máxima de la textura (para pantallas retina). |

Para controlarla desde código:

```js
IntroMadera.play().then(() => { /* la intro ha terminado */ });

window.addEventListener('intro-madera:fin', () => {
  // la intro ha terminado: aquí se puede animar la entrada del contenido (hero, logo, menú)
});
```

Comportamiento:
- Un **clic o una tecla** salta directamente a la caída.
- Durante la intro se bloquea el scroll: se añade la clase `intro-madera-lock` a `<html>` y se quita al terminar.
- Con **`prefers-reduced-motion`** el tablero no se rompe: solo se desvanece.
- **Sin WebGL** usa una madera más sencilla pintada con Canvas 2D.
- Cada carga genera un tablero distinto: cambian las chapas, los nudos y la forma de la grieta.

---

## Opciones del fondo de Orbital

Se editan en el objeto `CONFIG`, al principio de `orbital-bg.js`:

| Opción | Por defecto | Qué hace |
|---|---|---|
| `density` | `1/6500` | Estrellas por px². |
| `speed` | `6` | Velocidad de deriva de las estrellas (px/s en la capa cercana). |
| `parallax` | `40` | Desplazamiento máximo al mover el cursor (px). |
| `life` | `[5, 14]` | Segundos que vive cada estrella antes de apagarse. |
| `shootEvery` | `[3.5, 9]` | Segundos entre estrellas fugaces. |

La intensidad del morado y del azul se cambia en `orbital-bg.css`, en `.orbital-bg__glow`.

El fondo:
- se pausa solo cuando no está visible;
- en móvil usa la inclinación del teléfono si el navegador la permite;
- con `prefers-reduced-motion` se queda quieto.

**Solo en la portada:** en `.orbital-bg`, cambia `position: fixed` por `position: absolute` y mete el `div` dentro de la sección (que debe tener `position: relative`).

---

## Integración en frameworks

Los dos scripts son autónomos y se inician al cargarse. No son módulos ES y no exportan nada.

### Next.js (App Router)

Pon `efectos/` en `public/`. En `app/layout.tsx`:

```tsx
import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          window.IntroMaderaConfig = { oncePerSession: true };
          (function () {
            var c = window.IntroMaderaConfig || {}, seen = false;
            try { seen = sessionStorage.getItem('intro-madera-vista') === '1'; } catch (e) {}
            if (c.auto !== false && !(c.oncePerSession && seen)) document.documentElement.classList.add('intro-madera-pending');
          })();
        ` }} />
        <link rel="stylesheet" href="/efectos/fondo-orbital/orbital-bg.css" />
        <link rel="stylesheet" href="/efectos/intro-madera/intro-madera.css" />
      </head>
      <body>
        <div className="orbital-bg" data-orbital-bg />
        {children}
        <Script src="/efectos/fondo-orbital/orbital-bg.js" strategy="afterInteractive" />
        <Script src="/efectos/intro-madera/intro-madera.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
```

`suppressHydrationWarning` hace falta porque el script del `<head>` añade una clase a `<html>` antes de que React hidrate.

### Astro, Vite, HTML estático, WordPress

Igual que en la integración HTML: copia `efectos/` a la carpeta pública y pega los mismos fragmentos en el layout base (`<head>` y final de `<body>`).

### Componente React del fondo (si se prefiere montarlo en una sección concreta)

```tsx
'use client';
import { useEffect, useRef } from 'react';

export function FondoOrbital() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current as any;
    if (el && (window as any).OrbitalBg && !el._ob) el._ob = new (window as any).OrbitalBg(el);
  }, []);
  return <div ref={ref} className="orbital-bg" />;
}
```

Sin `data-orbital-bg`, el script no lo inicia solo; lo inicia el componente. `orbital-bg.js` tiene que estar cargado antes.

---

## Comprobaciones antes de publicar

- [ ] La web **no se ve ni un instante** antes de la intro: el script del `<head>` está puesto.
- [ ] Al terminar la intro se puede hacer scroll: `intro-madera-lock` se ha quitado.
- [ ] El contenido de la web tiene fondo transparente (o no lo tiene) donde deba verse el fondo de estrellas.
- [ ] Con "reducir movimiento" activado en el sistema, la intro solo se desvanece.
- [ ] Probado en Chrome, Safari (también iPhone) y Firefox.
- [ ] En producción, `oncePerSession: true`, para no obligar a ver la intro en cada página.

## Referencia visual

`demo/intro-madera-demo.mov` muestra cómo debe verse la intro. `demo/vista-previa.html` se abre directamente en el navegador.
