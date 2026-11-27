/* Boceto D · la ventana de Juegos se abre al entrar en pantalla.
   Empieza recortada (como una tarjeta) y termina a todo el ancho. */
(function () {
  'use strict';
  var win = document.querySelector('[data-d-window]');
  if (!win) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var ticking = false;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function update() {
    ticking = false;
    var r = win.getBoundingClientRect(), vh = window.innerHeight || 800;
    // 0 cuando la ventana asoma por abajo, 1 cuando su parte superior llega al 15 % de la pantalla
    var p = clamp((vh - r.top) / (vh * 0.85), 0, 1);
    var e = 1 - Math.pow(1 - p, 3);
    var narrow = window.innerWidth < 820;
    win.style.setProperty('--d-clip-x', ((1 - e) * (narrow ? 4 : 7)).toFixed(3) + '%');
    win.style.setProperty('--d-clip-y', ((1 - e) * 6).toFixed(3) + '%');
    win.style.setProperty('--d-clip-r', ((1 - e) * 28).toFixed(2) + 'px');
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();
