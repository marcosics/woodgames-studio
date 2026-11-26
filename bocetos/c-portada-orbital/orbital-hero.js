/* Orbital · portada con parallax (WoodGames Studio)
   Uso: <section class="oh-hero" data-orbital-hero> con .oh-bg (nebulosas + canvas) y .oh-content.
   - Fondo del juego: nebulosas y tres profundidades de estrellas (basado en orbital-bg.js).
   - Escena: planetas a distintas profundidades con órbitas exterior/interior y La Bola
     saltando de un planeta a otro, como en el juego.
   - Cursor: parallax suave por profundidad y una "lente de gravedad" que curva las estrellas.
     En pantallas táctiles, deriva lenta automática.
   - Scroll: cada capa se desplaza a su velocidad y el texto se desvanece.
   - Respeta "reducir movimiento" y se detiene cuando la portada no está en pantalla. */
(function () {
  'use strict';

  var root = document.querySelector('[data-orbital-hero]');
  if (!root) return;

  var canvas = root.querySelector('.oh-canvas');
  var ctx = canvas.getContext('2d');
  var nebula = root.querySelector('.oh-nebula');
  var violet = root.querySelector('.oh-cloud--violet');
  var blue = root.querySelector('.oh-cloud--blue');
  var content = root.querySelector('.oh-content');
  var grain = root.querySelector('.oh-grain');

  var mq = function (q) { return window.matchMedia ? window.matchMedia(q).matches : false; };
  var reduced = mq('(prefers-reduced-motion: reduce)');
  var fine = mq('(pointer: fine)');

  var TAU = Math.PI * 2;
  var TINTS = ['232,236,255', '232,236,255', '214,206,255', '200,218,255'];
  var LAYERS = [
    { depth: 0.18, share: 0.62, r: [0.35, 0.75], a: [0.25, 0.6] },
    { depth: 0.45, share: 0.30, r: [0.6, 1.05], a: [0.4, 0.8] },
    { depth: 1.00, share: 0.08, r: [0.9, 1.5], a: [0.6, 1.0] }
  ];

  function rand(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  /* Grano fino para evitar bandas en los degradados oscuros */
  (function () {
    var c = document.createElement('canvas'); c.width = c.height = 160;
    var g = c.getContext('2d'), img = g.createImageData(160, 160), r = rand(7);
    for (var i = 0; i < img.data.length; i += 4) {
      var v = (r() * 255) | 0;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    if (grain) grain.style.backgroundImage = 'url(' + c.toDataURL('image/png') + ')';
  })();

  /* Planetas: posición relativa (fx, fy), radio en unidades (1 u = lado corto / 1000), profundidad y color */
  var PLANET_STYLE = [
    { lit: '86,72,170', mid: '24,20,64', core: '5,5,16', rim: '214,206,255', rings: true },   // principal, violeta
    { lit: '52,96,170', mid: '10,26,60', core: '3,6,16', rim: '190,214,255', rings: false },  // azul
    { lit: '120,100,200', mid: '30,22,70', core: '6,5,18', rim: '214,206,255', rings: false } // lejano
  ];

  var S = {
    w: 0, h: 0, dpr: 1, unit: 1, stars: [], planets: [], dust: [],
    target: { x: 0, y: 0 }, cur: { x: 0, y: 0 }, lastMove: -1e9,
    lens: { x: -999, y: -999, tx: -999, ty: -999, k: 0, tk: 0 },
    scroll: 0, visible: true, raf: 0, t0: performance.now(),
    ball: null, trail: [], pulses: []
  };

  function layout() {
    var land = S.w / S.h > 1.05;
    var u = S.unit;
    var defs = land ? [
      { fx: 0.77, fy: 0.57, r: 230, d: 0.9 },
      { fx: 0.91, fy: 0.17, r: 62, d: 0.55 },
      { fx: 0.53, fy: 0.12, r: 20, d: 0.28 }
    ] : [
      { fx: 0.70, fy: 0.80, r: 330, d: 0.9 },
      { fx: 0.16, fy: 0.64, r: 95, d: 0.55 },
      { fx: 0.86, fy: 0.42, r: 34, d: 0.28 }
    ];
    S.planets = defs.map(function (p, i) {
      var r = p.r * u;
      return {
        fx: p.fx, fy: p.fy, r: r, d: p.d, st: PLANET_STYLE[i],
        inner: r * 1.16 + 12 * u, outer: r * 1.38 + 22 * u,
        x: 0, y: 0, ringSeed: i * 97 + 3
      };
    });
  }

  function makeStars() {
    var r = rand(20261126), m = 60 * S.unit + 40;
    var W = S.w + m * 2, H = S.h + m * 2;
    var total = Math.round(W * H / 12000);
    S.stars = [];
    for (var li = 0; li < LAYERS.length; li++) {
      var L = LAYERS[li], n = Math.round(total * L.share);
      for (var i = 0; i < n; i++) {
        var big = li === 2 || r() < 0.04;
        S.stars.push({
          x: r() * W - m, y: r() * H - m, d: L.depth,
          r: L.r[0] + r() * (L.r[1] - L.r[0]), a: L.a[0] + r() * (L.a[1] - L.a[0]),
          c: TINTS[(r() * TINTS.length) | 0], sp: TAU / (3 + r() * 6), ph: r() * TAU,
          tw: 0.15 + r() * 0.35, cross: big && r() < 0.55
        });
      }
    }
    // Polvo cercano: pocas motas grandes y desenfocadas, muy por delante
    S.dust = [];
    for (var k = 0; k < 10; k++) {
      S.dust.push({ x: r() * S.w, y: r() * S.h, r: (6 + r() * 16) * S.unit + 2, a: 0.03 + r() * 0.05, d: 1.7 });
    }
  }

  function resize() {
    var w = root.clientWidth, h = root.clientHeight;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    S.w = w; S.h = h; S.dpr = dpr; S.unit = Math.min(w, h) / 1000;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    layout(); makeStars();
    if (!S.ball) resetBall();
  }

  /* ---------- La Bola: orbita, carga, se suelta y viaja al siguiente planeta ---------- */
  function resetBall() {
    S.ball = { mode: 'orbit', p: 0, inner: false, ang: -2.2, dir: 1, timer: 0, minT: 3, born: 1.5 };
  }
  function orbitR(b) { var p = S.planets[b.p]; return b.inner ? p.inner : p.outer; }

  function stepBall(dt) {
    var b = S.ball, P = S.planets;
    if (b.mode === 'orbit') {
      var p = P[b.p], R = orbitR(b);
      var speed = (b.inner ? 230 : 170) * Math.max(S.unit, 0.55);
      b.ang += (speed / R) * dt * b.dir;
      b.timer += dt;
      b.x = p.x + Math.cos(b.ang) * R; b.y = p.y + Math.sin(b.ang) * R;
      if (b.timer > b.minT) {
        var to = P[b.p === 0 ? 1 : 0];
        var tx = -Math.sin(b.ang) * b.dir, ty = Math.cos(b.ang) * b.dir;
        var dx = to.x - b.x, dy = to.y - b.y, dl = Math.hypot(dx, dy) || 1;
        if ((tx * dx + ty * dy) / dl > 0.9) {
          b.mode = 'fly'; b.from = b.p; b.to = b.p === 0 ? 1 : 0;
          b.relX = b.x - p.x; b.relY = b.y - p.y; b.tx = tx; b.ty = ty;
          b.toInner = Math.random() < 0.5;
          b.u = 0; b.dur = clamp(dl / (520 * Math.max(S.unit, 0.5)), 0.9, 1.9);
        }
      }
    } else {
      var src = P[b.from], dst = P[b.to];
      b.u = Math.min(1, b.u + dt / b.dur);
      var fx = src.x + b.relX, fy = src.y + b.relY;
      var Rt = b.toInner ? dst.inner : dst.outer;
      var ta = Math.atan2(fy - dst.y, fx - dst.x) - 0.35;
      var ex = dst.x + Math.cos(ta) * Rt, ey = dst.y + Math.sin(ta) * Rt;
      var len = Math.hypot(ex - fx, ey - fy) * 0.55;
      var cx = fx + b.tx * len, cy = fy + b.ty * len;
      var e = easeInOut(b.u), ie = 1 - e;
      b.x = ie * ie * fx + 2 * ie * e * cx + e * e * ex;
      b.y = ie * ie * fy + 2 * ie * e * cy + e * e * ey;
      if (b.u >= 1) {
        var rx = ex - dst.x, ry = ey - dst.y, vx = ex - cx, vy = ey - cy;
        b.mode = 'orbit'; b.p = b.to; b.inner = b.toInner; b.ang = ta;
        b.dir = rx * vy - ry * vx >= 0 ? 1 : -1;
        b.timer = 0; b.minT = 2.6 + Math.random() * 2.4;
        S.pulses.push({ x: ex, y: ey, p: b.p, t: 0 });
      }
    }
    S.trail.push({ x: b.x, y: b.y });
    if (S.trail.length > 34) S.trail.shift();
  }

  /* ---------- Entrada ---------- */
  root.addEventListener('pointermove', function (e) {
    var r = root.getBoundingClientRect();
    S.target.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    S.target.y = ((e.clientY - r.top) / r.height) * 2 - 1;
    S.lastMove = performance.now();
    if (fine) { S.lens.tx = e.clientX - r.left; S.lens.ty = e.clientY - r.top; S.lens.tk = 1; if (S.lens.x < -500) { S.lens.x = S.lens.tx; S.lens.y = S.lens.ty; } }
  }, { passive: true });
  root.addEventListener('pointerleave', function () { S.lastMove = -1e9; S.lens.tk = 0; });

  window.addEventListener('scroll', function () {
    S.scroll = Math.max(0, window.scrollY || window.pageYOffset || 0);
    if (reduced) applyContent();
  }, { passive: true });

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { resize(); if (reduced) draw(0); }, 120);
  }, { passive: true });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      S.visible = entries[0].isIntersecting;
      if (S.visible && !reduced && !S.raf) loop();
    }).observe(root);
  }

  /* ---------- Movimiento de cámara ---------- */
  function update(t, dt) {
    var idle = clamp((performance.now() - S.lastMove - 2500) / 3000, 0, 1);
    var dr = 0.35 * (fine ? idle : 1);
    var gx = S.target.x * (1 - dr * 0.6) + Math.sin(t * 0.11) * dr;
    var gy = S.target.y * (1 - dr * 0.6) + Math.sin(t * 0.22) * 0.6 * dr;
    var k = 1 - Math.pow(1 - 0.045, dt * 60);
    S.cur.x += (gx - S.cur.x) * k;
    S.cur.y += (gy - S.cur.y) * k;
    var kl = 1 - Math.pow(1 - 0.12, dt * 60);
    S.lens.x += (S.lens.tx - S.lens.x) * kl;
    S.lens.y += (S.lens.ty - S.lens.y) * kl;
    S.lens.k += (S.lens.tk - S.lens.k) * (1 - Math.pow(1 - 0.05, dt * 60));
  }

  function offset(depth) {
    var s = 46 * S.unit;
    return {
      x: -S.cur.x * s * depth,
      y: -S.cur.y * s * 0.7 * depth - S.scroll * depth * 0.35
    };
  }

  function applyContent() {
    var h = S.h || 800;
    var fade = clamp(1 - S.scroll / (h * 0.75), 0, 1);
    var cx = reduced ? 0 : S.cur.x * -6, cy = reduced ? 0 : S.cur.y * -4;
    content.style.transform = 'translate3d(' + cx.toFixed(2) + 'px,' + (S.scroll * 0.28 + cy).toFixed(2) + 'px,0)';
    content.style.opacity = fade.toFixed(3);
  }

  /* ---------- Dibujo ---------- */
  function drawPlanet(p, alpha, t) {
    var x = p.x, y = p.y, r = p.r, st = p.st;
    ctx.save();
    ctx.globalAlpha = alpha;

    // Atmósfera
    var g = ctx.createRadialGradient(x, y, r * 0.9, x, y, r * 1.7);
    g.addColorStop(0, 'rgba(' + st.lit + ',0.16)');
    g.addColorStop(1, 'rgba(' + st.lit + ',0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r * 1.7, 0, TAU); ctx.fill();

    // Cuerpo con luz desde arriba a la izquierda
    var b = ctx.createRadialGradient(x - r * 0.5, y - r * 0.55, r * 0.05, x - r * 0.2, y - r * 0.2, r * 1.45);
    b.addColorStop(0, 'rgb(' + st.lit + ')');
    b.addColorStop(0.42, 'rgb(' + st.mid + ')');
    b.addColorStop(1, 'rgb(' + st.core + ')');
    ctx.fillStyle = b;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();

    // Anillos de crecimiento: el guiño a la madera de WoodGames
    if (st.rings) {
      ctx.save();
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
      var rr = rand(p.ringSeed);
      ctx.lineWidth = Math.max(1, r * 0.006);
      for (var i = 1; i <= 9; i++) {
        var rad = r * (0.12 + i * 0.1) * (0.96 + rr() * 0.08);
        ctx.strokeStyle = 'rgba(' + st.rim + ',' + (0.035 + rr() * 0.03).toFixed(3) + ')';
        ctx.beginPath();
        ctx.ellipse(x + r * 0.08, y + r * 0.04, rad, rad * (0.96 + rr() * 0.06), rr() * TAU, 0, TAU);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Borde iluminado
    var rim = ctx.createLinearGradient(x - r, y - r, x + r * 0.6, y + r * 0.6);
    rim.addColorStop(0, 'rgba(' + st.rim + ',0.7)');
    rim.addColorStop(0.5, 'rgba(' + st.rim + ',0.08)');
    rim.addColorStop(1, 'rgba(' + st.rim + ',0)');
    ctx.strokeStyle = rim;
    ctx.lineWidth = Math.max(1, r * 0.012);
    ctx.beginPath(); ctx.arc(x, y, r - ctx.lineWidth / 2, 0, TAU); ctx.stroke();
    ctx.restore();
  }

  function drawOrbits(p, alpha, t, activeInner, activeOuter) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 1;
    // Exterior: puntos
    ctx.setLineDash([1.5, 9]);
    ctx.lineDashOffset = -t * 6;
    ctx.strokeStyle = activeOuter ? 'rgba(242,169,59,0.45)' : 'rgba(200,210,255,0.16)';
    ctx.beginPath(); ctx.arc(p.x, p.y, p.outer, 0, TAU); ctx.stroke();
    // Interior: trazos
    ctx.setLineDash([10, 10]);
    ctx.lineDashOffset = t * 10;
    ctx.strokeStyle = activeInner ? 'rgba(242,169,59,0.5)' : 'rgba(200,210,255,0.22)';
    ctx.beginPath(); ctx.arc(p.x, p.y, p.inner, 0, TAU); ctx.stroke();
    ctx.restore();
  }

  function drawBall(alpha) {
    var b = S.ball, br = Math.max(4, 9 * S.unit);
    ctx.save();
    ctx.globalAlpha = alpha;
    // Estela
    var n = S.trail.length;
    ctx.lineCap = 'round';
    for (var i = 1; i < n; i++) {
      var a = S.trail[i - 1], c = S.trail[i], f = i / n;
      ctx.strokeStyle = 'rgba(242,169,59,' + (f * 0.42).toFixed(3) + ')';
      ctx.lineWidth = br * 1.3 * f;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(c.x, c.y); ctx.stroke();
    }
    // Brillo
    var g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, br * 5);
    g.addColorStop(0, 'rgba(242,169,59,0.55)');
    g.addColorStop(0.3, 'rgba(242,169,59,0.16)');
    g.addColorStop(1, 'rgba(242,169,59,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(b.x, b.y, br * 5, 0, TAU); ctx.fill();
    // Núcleo
    var core = ctx.createRadialGradient(b.x - br * 0.35, b.y - br * 0.35, 0, b.x, b.y, br);
    core.addColorStop(0, '#fff3d6');
    core.addColorStop(0.55, '#ffc867');
    core.addColorStop(1, '#e08a1e');
    ctx.fillStyle = core;
    ctx.beginPath(); ctx.arc(b.x, b.y, br, 0, TAU); ctx.fill();
    ctx.restore();
  }

  function draw(t, dt) {
    dt = dt || 0;
    var intro = reduced ? 1 : easeOut(clamp(((performance.now() - S.t0) / 1000 - 0.2) / 1.8, 0, 1));

    // Nebulosas: casi quietas, respiran despacio
    var on = offset(0.08 * 3);
    nebula.style.transform = 'translate3d(' + on.x.toFixed(2) + 'px,' + on.y.toFixed(2) + 'px,0)';
    if (!reduced) {
      violet.style.transform = 'scale(' + (1 + 0.035 * Math.sin(t * 0.21)).toFixed(4) + ')';
      violet.style.opacity = (0.92 + 0.08 * Math.sin(t * 0.17 + 1)).toFixed(3);
      blue.style.transform = 'scale(' + (1 + 0.035 * Math.sin(t * 0.19 + 2)).toFixed(4) + ')';
      blue.style.opacity = (0.92 + 0.08 * Math.sin(t * 0.15 + 3)).toFixed(3);
    }

    ctx.clearRect(0, 0, S.w, S.h);

    // Estrellas con lente de gravedad alrededor del cursor
    var L = 150 * S.unit + 70, lk = S.lens.k, pull = 16 * S.unit + 4;
    for (var i = 0; i < S.stars.length; i++) {
      var p = S.stars[i], o = offset(p.d);
      var x = p.x + o.x, y = p.y + o.y;
      if (lk > 0.01) {
        var dx = S.lens.x - x, dy = S.lens.y - y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < L && d > 0.5) {
          var f = (1 - d / L); f = f * f * pull * lk;
          x += dx / d * f; y += dy / d * f;
        }
      }
      if (x < -6 || y < -6 || x > S.w + 6 || y > S.h + 6) continue;
      var tw = reduced ? 1 : 1 - p.tw * (0.5 + 0.5 * Math.sin(t * p.sp + p.ph));
      var a = p.a * tw;
      ctx.fillStyle = 'rgba(' + p.c + ',' + a.toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(x, y, p.r, 0, TAU); ctx.fill();
      if (p.cross) {
        var cl = p.r * (3.2 + 1.2 * tw);
        ctx.strokeStyle = 'rgba(' + p.c + ',' + (a * 0.45).toFixed(3) + ')';
        ctx.lineWidth = 0.6;
        ctx.beginPath(); ctx.moveTo(x - cl, y); ctx.lineTo(x + cl, y); ctx.moveTo(x, y - cl); ctx.lineTo(x, y + cl); ctx.stroke();
      }
    }

    // Lente: un halo apenas visible donde está el cursor
    if (lk > 0.01) {
      var lg = ctx.createRadialGradient(S.lens.x, S.lens.y, 0, S.lens.x, S.lens.y, L);
      lg.addColorStop(0, 'rgba(214,206,255,' + (0.05 * lk).toFixed(3) + ')');
      lg.addColorStop(1, 'rgba(214,206,255,0)');
      ctx.fillStyle = lg;
      ctx.beginPath(); ctx.arc(S.lens.x, S.lens.y, L, 0, TAU); ctx.fill();
      ctx.save();
      ctx.setLineDash([2, 8]); ctx.lineDashOffset = -t * 8;
      ctx.strokeStyle = 'rgba(214,206,255,' + (0.18 * lk).toFixed(3) + ')';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(S.lens.x, S.lens.y, 22 + 4 * Math.sin(t * 2), 0, TAU); ctx.stroke();
      ctx.restore();
    }

    // Posición de los planetas (de lejos a cerca)
    var order = [2, 1, 0];
    for (var j = 0; j < S.planets.length; j++) {
      var pl = S.planets[j], po = offset(pl.d);
      var rise = (1 - intro) * 40 * S.unit * pl.d;
      pl.x = pl.fx * S.w + po.x;
      pl.y = pl.fy * S.h + po.y + rise;
    }

    if (!reduced && S.ball) stepBall(dt);
    var b = S.ball;

    for (var q = 0; q < order.length; q++) {
      var P = S.planets[order[q]];
      var isHere = b && b.mode === 'orbit' && b.p === order[q];
      if (order[q] !== 2) drawOrbits(P, intro, t, isHere && b.inner, isHere && !b.inner);
      drawPlanet(P, intro, t);
    }

    // Pulsos de captura
    for (var k = S.pulses.length - 1; k >= 0; k--) {
      var pu = S.pulses[k]; pu.t += dt;
      var pp = S.planets[pu.p];
      var life = pu.t / 0.9;
      if (life >= 1) { S.pulses.splice(k, 1); continue; }
      ctx.save();
      ctx.strokeStyle = 'rgba(242,169,59,' + (0.55 * (1 - life)).toFixed(3) + ')';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(pu.x, pu.y, 6 + life * 46 * Math.max(S.unit, 0.6), 0, TAU); ctx.stroke();
      ctx.restore();
    }

    if (b) {
      if (reduced) { var rp = S.planets[0]; b.x = rp.x + Math.cos(b.ang) * rp.outer; b.y = rp.y + Math.sin(b.ang) * rp.outer; S.trail = []; }
      var ballIn = reduced ? 1 : clamp(((performance.now() - S.t0) / 1000 - b.born) / 0.6, 0, 1);
      if (ballIn > 0) drawBall(ballIn);
    }

    // Polvo cercano (por delante de todo)
    for (var m = 0; m < S.dust.length; m++) {
      var du = S.dust[m], dofs = offset(du.d);
      var ux = ((du.x + dofs.x) % S.w + S.w) % S.w, uy = ((du.y + dofs.y) % S.h + S.h) % S.h;
      var dg = ctx.createRadialGradient(ux, uy, 0, ux, uy, du.r);
      dg.addColorStop(0, 'rgba(214,206,255,' + du.a.toFixed(3) + ')');
      dg.addColorStop(1, 'rgba(214,206,255,0)');
      ctx.fillStyle = dg;
      ctx.beginPath(); ctx.arc(ux, uy, du.r, 0, TAU); ctx.fill();
    }

    applyContent();
  }

  function loop() {
    var prev = performance.now();
    var tick = function (now) {
      if (!S.visible) { S.raf = 0; return; }
      var dt = Math.min(0.05, (now - prev) / 1000); prev = now;
      update(now / 1000, dt);
      draw(now / 1000, dt);
      S.raf = requestAnimationFrame(tick);
    };
    S.raf = requestAnimationFrame(tick);
  }

  resize();
  S.scroll = Math.max(0, window.scrollY || 0);
  if (reduced) draw(0); else loop();
})();
