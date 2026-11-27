/* Orbital · fondo negro animado (interminable)
   Uso:  <div class="orbital-bgn" data-orbital-bgn></div>  +  orbital-bgn.css  +  este archivo.

   - Las estrellas se desplazan despacio y dan la vuelta por los bordes: nunca se acaba.
   - Cada estrella nace, brilla un rato y se apaga; en su lugar aparece otra.
   - De vez en cuando cruza una estrella fugaz.
   - Interactivo: las estrellas siguen el cursor con parallax (las cercanas se mueven más).
     En móvil se usa la inclinación del teléfono si está disponible.
   - Respeta "reducir movimiento" y se pausa cuando no se ve. */
(function () {
  'use strict';

  var CONFIG = {
    density: 1 / 6500,       // estrellas por px²
    speed: 6,                // velocidad de desplazamiento de las estrellas (px/s en la capa cercana)
    direction: -0.35,        // ángulo del desplazamiento en radianes (ligeramente hacia arriba a la izquierda)
    parallax: 40,            // desplazamiento máximo por el cursor (px en la capa cercana)
    follow: 0.05,            // suavidad del seguimiento (más bajo = más lento)
    life: [5, 14],           // segundos que vive cada estrella
    shootEvery: [3.5, 9],    // segundos entre estrellas fugaces
    maxDpr: 2
  };

  // Profundidades: lejos (muchas, pequeñas, lentas) y cerca (pocas, más grandes, rápidas)
  var LAYERS = [
    { depth: 0.25, share: 0.6, r: [0.3, 0.7], a: [0.35, 0.7] },
    { depth: 0.55, share: 0.3, r: [0.55, 1.0], a: [0.5, 0.9] },
    { depth: 1.0, share: 0.1, r: [0.9, 1.6], a: [0.7, 1.0] }
  ];

  var TINTS = ['255,255,255', '236,240,255', '220,212,255', '206,222,255'];

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function OrbitalBgn(root) {
    this.root = root;
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.fine = matchMedia('(pointer: fine)').matches;
    this.target = { x: 0, y: 0 };
    this.cur = { x: 0, y: 0 };
    this.shots = [];
    this.nextShot = rnd(1.5, 4);
    this.time = 0;
    this.visible = true;

    root.setAttribute('aria-hidden', 'true');
    root.innerHTML = '<div class="orbital-bgn__glow"></div><canvas class="orbital-bgn__stars"></canvas>';
    this.glow = root.querySelector('.orbital-bgn__glow');
    this.canvas = root.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d');

    this.resize();
    this.bind();
    if (this.reduced) this.draw(); else this.start();
  }

  OrbitalBgn.prototype.resize = function () {
    var w = this.root.clientWidth || innerWidth, h = this.root.clientHeight || innerHeight;
    var dpr = Math.min(devicePixelRatio || 1, CONFIG.maxDpr);
    this.w = w; this.h = h;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.pad = CONFIG.parallax + 30;               // margen para que el parallax nunca deje bordes vacíos
    this.fw = w + this.pad * 2; this.fh = h + this.pad * 2;
    var total = Math.round(this.fw * this.fh * CONFIG.density);
    this.stars = [];
    for (var i = 0; i < LAYERS.length; i++) {
      var n = Math.round(total * LAYERS[i].share);
      for (var j = 0; j < n; j++) this.stars.push(this.spawn(LAYERS[i], true));
    }
  };

  // Crea una estrella. "initial": al cargar, ya está a mitad de su vida para que no aparezcan todas a la vez
  OrbitalBgn.prototype.spawn = function (L, initial) {
    var life = rnd(CONFIG.life[0], CONFIG.life[1]);
    return {
      L: L,
      x: Math.random() * this.fw,
      y: Math.random() * this.fh,
      r: rnd(L.r[0], L.r[1]),
      a: rnd(L.a[0], L.a[1]),
      c: TINTS[(Math.random() * TINTS.length) | 0],
      life: life,
      age: initial ? Math.random() * life : 0,
      tw: rnd(0.6, 2.2),             // velocidad del titileo
      ph: Math.random() * 6.283,
      cross: L.depth === 1 && Math.random() < 0.45
    };
  };

  OrbitalBgn.prototype.bind = function () {
    var self = this, t;
    addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(function () { self.resize(); if (self.reduced) self.draw(); }, 150);
    }, { passive: true });

    if (this.reduced) return;

    if (this.fine) {
      addEventListener('pointermove', function (e) {
        self.target.x = (e.clientX / innerWidth) * 2 - 1;
        self.target.y = (e.clientY / innerHeight) * 2 - 1;
      }, { passive: true });
      document.documentElement.addEventListener('pointerleave', function () {
        self.target.x = 0; self.target.y = 0;
      });
    } else {
      addEventListener('deviceorientation', function (e) {
        if (e.gamma == null) return;
        self.target.x = Math.max(-1, Math.min(1, e.gamma / 30));
        self.target.y = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
      }, { passive: true });
    }

    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) self.last = performance.now();
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        self.visible = en[0].isIntersecting;
        if (self.visible && !self.raf) self.start();
      }).observe(this.root);
    }
  };

  OrbitalBgn.prototype.start = function () {
    var self = this;
    this.last = performance.now();
    var tick = function (now) {
      if (!self.visible) { self.raf = 0; return; }
      var dt = Math.min(0.05, (now - self.last) / 1000);
      self.last = now;
      self.update(dt);
      self.draw();
      self.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  };

  OrbitalBgn.prototype.update = function (dt) {
    this.time += dt;
    var k = 1 - Math.pow(1 - CONFIG.follow, dt * 60);
    this.cur.x += (this.target.x - this.cur.x) * k;
    this.cur.y += (this.target.y - this.cur.y) * k;

    // Desplazamiento continuo; al salir por un borde la estrella entra por el contrario
    var vx = Math.cos(CONFIG.direction) * CONFIG.speed * -1;
    var vy = Math.sin(CONFIG.direction) * CONFIG.speed;
    for (var i = 0; i < this.stars.length; i++) {
      var s = this.stars[i];
      s.x += vx * s.L.depth * dt;
      s.y += vy * s.L.depth * dt;
      if (s.x < 0) s.x += this.fw; else if (s.x > this.fw) s.x -= this.fw;
      if (s.y < 0) s.y += this.fh; else if (s.y > this.fh) s.y -= this.fh;
      s.age += dt;
      if (s.age > s.life) this.stars[i] = this.spawn(s.L, false);   // se apaga y nace otra
    }

    // Estrellas fugaces
    this.nextShot -= dt;
    if (this.nextShot <= 0) {
      this.nextShot = rnd(CONFIG.shootEvery[0], CONFIG.shootEvery[1]);
      var ang = rnd(0.35, 0.75) * (Math.random() < 0.5 ? 1 : -1) + (Math.random() < 0.5 ? 0 : Math.PI);
      this.shots.push({
        x: rnd(0.1, 0.9) * this.w, y: rnd(0.05, 0.55) * this.h,
        vx: Math.cos(ang), vy: Math.abs(Math.sin(ang)),
        sp: rnd(700, 1100), len: rnd(120, 220), age: 0, dur: rnd(0.7, 1.1)
      });
    }
    for (var j = this.shots.length - 1; j >= 0; j--) {
      var sh = this.shots[j];
      sh.age += dt;
      if (sh.age > sh.dur) this.shots.splice(j, 1);
    }
  };

  OrbitalBgn.prototype.draw = function () {
    var ctx = this.ctx, px = -this.cur.x * CONFIG.parallax, py = -this.cur.y * CONFIG.parallax * 0.7;
    ctx.clearRect(0, 0, this.w, this.h);

    // El brillo de fondo apenas se mueve con el cursor
    this.glow.style.transform = 'translate3d(' + (px * 0.15).toFixed(2) + 'px,' + (py * 0.15).toFixed(2) + 'px,0)';

    for (var i = 0; i < this.stars.length; i++) {
      var s = this.stars[i];
      var x = s.x - this.pad + px * s.L.depth, y = s.y - this.pad + py * s.L.depth;
      if (x < -6 || y < -6 || x > this.w + 6 || y > this.h + 6) continue;
      // Aparece y se apaga con suavidad; titila un poco mientras vive
      var p = s.age / s.life;
      var fade = this.reduced ? 1 : Math.min(1, p / 0.2, (1 - p) / 0.25);
      fade = fade * fade * (3 - 2 * fade);
      var tw = this.reduced ? 1 : 0.75 + 0.25 * Math.sin(this.time * s.tw + s.ph);
      var a = s.a * fade * tw;
      if (a < 0.01) continue;
      ctx.fillStyle = 'rgba(' + s.c + ',' + a.toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(x, y, s.r, 0, 6.2832);
      ctx.fill();
      if (s.cross) {
        var L = s.r * 4 * tw;
        ctx.strokeStyle = 'rgba(' + s.c + ',' + (a * 0.4).toFixed(3) + ')';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(x - L, y); ctx.lineTo(x + L, y);
        ctx.moveTo(x, y - L); ctx.lineTo(x, y + L);
        ctx.stroke();
      }
    }

    // Estrellas fugaces: cabeza brillante y estela que se desvanece
    for (var j = 0; j < this.shots.length; j++) {
      var sh = this.shots[j], q = sh.age / sh.dur;
      var hx = sh.x + sh.vx * sh.sp * sh.age, hy = sh.y + sh.vy * sh.sp * sh.age;
      var tl = sh.len * Math.min(1, q * 3);
      var tx = hx - sh.vx * tl, ty = hy - sh.vy * tl;
      var alpha = Math.sin(Math.PI * q);
      var g = ctx.createLinearGradient(tx, ty, hx, hy);
      g.addColorStop(0, 'rgba(255,255,255,0)');
      g.addColorStop(1, 'rgba(255,255,255,' + (0.85 * alpha).toFixed(3) + ')');
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tx, ty); ctx.lineTo(hx, hy);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,' + alpha.toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(hx, hy, 1.4, 0, 6.2832);
      ctx.fill();
    }
  };

  window.OrbitalBgn = OrbitalBgn;

  function init() {
    var els = document.querySelectorAll('[data-orbital-bgn]');
    for (var i = 0; i < els.length; i++) if (!els[i]._ob) els[i]._ob = new OrbitalBgn(els[i]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
