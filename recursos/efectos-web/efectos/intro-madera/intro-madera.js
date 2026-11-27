/* Intro de madera para la web
   Uso:
     <link rel="stylesheet" href="intro-madera.css">
     <script src="intro-madera.js" defer> (al final del body)
   Se pone sola encima de la página al cargar. Al terminar se elimina y lanza el
   evento "intro-madera:fin" en window. Un clic o una tecla la salta.

   Opciones (antes de cargar este archivo):
     window.IntroMaderaConfig = {
       auto: true,            // false: no arranca sola; llama a IntroMadera.play()
       oncePerSession: false, // true: solo la primera vez en la sesión del navegador
       hold: 0.7, crack: 1.05, open: 0.18, fall: 1.15
     };
   API:
     IntroMadera.play()  -> Promise que se resuelve al terminar

   Cómo funciona:
   1. La textura del contrachapado se genera con un shader (WebGL): chapas de madera
      de distinto tono y veta, juntas entre ellas, nudos y fibra fina.
   2. Una grieta sube de abajo arriba siguiendo la veta, con vibración y astillas.
   3. Las dos mitades se separan y caen con gravedad; detrás aparece la web. */
(function () {
  'use strict';

  var CFG = {
    hold: 0.7,        // segundos con el tablero entero antes de romperse
    crack: 1.05,      // lo que tarda la grieta en subir
    open: 0.18,       // separación antes de caer
    fall: 1.15,       // caída de las mitades
    maxDpr: 2,
    seed: 7
  };

  var USER = window.IntroMaderaConfig || {};
  for (var key in USER) if (Object.prototype.hasOwnProperty.call(USER, key)) CFG[key] = USER[key];
  var running = null;

  // ---------- utilidades ----------
  function rng(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function seg(t, a, b) { return clamp01((t - a) / (b - a)); }
  function easeIn(x) { return x * x; }
  function easeOut(x) { return 1 - (1 - x) * (1 - x); }

  // ---------- textura del contrachapado (WebGL) ----------
  var FRAG = [
    'precision highp float;',
    'uniform vec2 res;',
    'uniform float dpr;',
    'uniform float edges[10];',
    'uniform float seed;',
    'float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }',
    'float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);',
    '  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x), u.y); }',
    'float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p=p*2.03+vec2(17.1,9.2); a*=0.5; } return v; }',
    'void main(){',
    '  vec2 px = vec2(gl_FragCoord.x, res.y - gl_FragCoord.y) / dpr;',   // px de CSS, origen arriba
    '  vec2 R = res / dpr;',
    '  float u = px.x / R.x;',
    // chapa (tira vertical) en la que cae este píxel
    '  float id = 0.0, x0 = 0.0, x1 = 1.0;',
    '  for (int i = 0; i < 9; i++) { if (u >= edges[i] && u < edges[i+1]) { id = float(i); x0 = edges[i]; x1 = edges[i+1]; } }',
    '  float s = id * 7.13 + seed;',
    '  float hs = hash(vec2(s, 3.1));',
    // coordenadas de la madera (la veta corre en vertical)
    '  vec2 p = px / 680.0 + vec2(s * 3.7, s * 1.9);',
    // nudos pequeños: como mucho uno por chapa y solo en chapas anchas
    '  float knot = 0.0, kcore = 0.0, kring = 0.0;',
    '  {',
    '    float wide = step(0.11, x1 - x0) * step(0.62, hash(vec2(s*1.7, 9.0)));',
    '    vec2 c = vec2(mix(x0, x1, 0.3 + 0.4*hash(vec2(s, 1.0))) * R.x, (0.15 + 0.7*hash(vec2(4.0, s))) * R.y);',
    '    float r = 4.0 + 5.0*hash(vec2(2.0, s*2.3));',
    '    vec2 d = (px - c) / vec2(r, r*2.4);',
    '    float dd = dot(d, d);',
    '    knot = wide * 1.4 * exp(-dd * 0.05) * sign(px.x - c.x + 0.001);',
    '    kcore = wide * smoothstep(1.0, 0.25, dd);',
    '    kring = wide * smoothstep(1.6, 1.15, dd) * smoothstep(0.8, 1.15, dd);',
    '  }',
    // figura del desenrollo: anillos amplios y ondulados
    '  float warp = fbm(vec2(p.x*1.6, p.y*0.22) + s) * 3.0 + fbm(vec2(p.x*5.0, p.y*0.8) + s*2.0) * 0.4;',
    '  float v = p.x * 11.0 + warp * 2.4 + knot;',
    '  float ring = fract(v);',
    '  float lw = smoothstep(0.5, 0.9, ring) * (1.0 - smoothstep(0.9, 1.0, ring));',   // paso de madera temprana a tardía
    '  float line = smoothstep(0.955, 1.0, ring) + smoothstep(0.035, 0.0, ring);',      // línea de anillo, fina
    // fibra larga y fina en vertical, a tres escalas
    '  float f1 = noise(vec2(px.x*1.1, px.y*0.008) + s*5.0);',
    '  float f2 = noise(vec2(px.x*3.6, px.y*0.028) + s*11.0);',
    '  float f3 = noise(vec2(px.x*9.0, px.y*0.11) + s*17.0);',
    '  float pore = smoothstep(0.82, 0.97, noise(vec2(px.x*2.2, px.y*0.06) + s*3.0));',
    '  float broad = fbm(vec2(p.x*0.9, p.y*0.18) + s*4.0);',
    // tonos de abedul: cada chapa algo distinta
    '  vec3 light = mix(vec3(0.88, 0.74, 0.55), vec3(0.83, 0.66, 0.46), hs);',
    '  vec3 late  = mix(vec3(0.72, 0.52, 0.32), vec3(0.64, 0.44, 0.26), hs);',
    '  vec3 lcol  = vec3(0.52, 0.34, 0.19);',
    '  vec3 col = mix(light, late, lw * 0.6);',
    '  col = mix(col, lcol, clamp(line, 0.0, 1.0) * 0.45);',
    '  col *= 1.0 - (f1 - 0.5)*0.12 - (f2 - 0.5)*0.09 - (f3 - 0.5)*0.07 - pore*0.07;',
    '  col *= 0.92 + 0.14 * broad;',
    '  col = mix(col, vec3(0.42, 0.26, 0.13), clamp(kcore, 0.0, 1.0) * 0.8);',
    '  col = mix(col, vec3(0.30, 0.18, 0.09), clamp(kring, 0.0, 1.0) * 0.6);',
    // junta entre chapas: línea fina y oscura con un poco de sombra
    '  float dl = x0 > 0.001 ? (u - x0) * R.x : 99.0;',
    '  float dr = x1 < 0.999 ? (x1 - u) * R.x : 99.0;',
    '  float joint = min(dl, dr);',
    '  col *= mix(0.55, 1.0, smoothstep(0.0, 1.2, joint));',
    '  col *= mix(0.93, 1.0, smoothstep(0.0, 5.0, joint));',
    // luz suave de arriba a la izquierda
    '  vec2 q = px / R;',
    '  col *= 0.95 + 0.10 * (1.0 - length(q - vec2(0.3, 0.2)));',
    '  col *= 0.88 + 0.12 * smoothstep(0.0, 0.25, min(min(q.x, 1.0-q.x), min(q.y, 1.0-q.y)));',
    // grano de lijado
    '  col += (hash(px * 1.31 + s) - 0.5) * 0.02;',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  function makeTexture(w, h, dpr, edges, seed) {
    var c = document.createElement('canvas');
    c.width = Math.round(w * dpr);
    c.height = Math.round(h * dpr);
    var gl = c.getContext('webgl', { preserveDrawingBuffer: true, antialias: false });
    if (!gl) return fallbackTexture(w, h, dpr, edges);
    function sh(type, src) {
      var o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o);
      if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o));
      return o;
    }
    try {
      var prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, 'attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }'));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      gl.useProgram(prog);
      var buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var loc = gl.getAttribLocation(prog, 'a');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      gl.viewport(0, 0, c.width, c.height);
      gl.uniform2f(gl.getUniformLocation(prog, 'res'), c.width, c.height);
      gl.uniform1f(gl.getUniformLocation(prog, 'dpr'), dpr);
      gl.uniform1f(gl.getUniformLocation(prog, 'seed'), seed);
      gl.uniform1fv(gl.getUniformLocation(prog, 'edges'), new Float32Array(edges));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      return c;
    } catch (e) {
      return fallbackTexture(w, h, dpr, edges);
    }
  }

  // Sin WebGL: madera más sencilla con degradados y líneas
  function fallbackTexture(w, h, dpr, edges) {
    var c = document.createElement('canvas');
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    var g = c.getContext('2d'), r = rng(3);
    g.scale(dpr, dpr);
    for (var i = 0; i < edges.length - 1 && edges[i + 1] <= 1; i++) {
      var x0 = edges[i] * w, x1 = edges[i + 1] * w;
      g.fillStyle = 'hsl(' + (30 + r() * 6) + ',' + (45 + r() * 10) + '%,' + (62 + r() * 8) + '%)';
      g.fillRect(x0, 0, x1 - x0, h);
      for (var k = 0; k < (x1 - x0) / 3; k++) {
        var x = x0 + r() * (x1 - x0);
        g.strokeStyle = 'rgba(110,65,30,' + (0.05 + r() * 0.15) + ')';
        g.lineWidth = 0.5 + r() * 1.5;
        g.beginPath(); g.moveTo(x, 0);
        g.bezierCurveTo(x + (r() - 0.5) * 30, h * 0.33, x + (r() - 0.5) * 30, h * 0.66, x + (r() - 0.5) * 20, h);
        g.stroke();
      }
      g.fillStyle = 'rgba(60,35,15,.5)'; g.fillRect(x1 - 0.7, 0, 1.2, h);
    }
    return c;
  }

  // ---------- la grieta ----------
  // Sube de abajo arriba casi en vertical (la madera se abre por la veta),
  // con pequeñas desviaciones y algún salto lateral entre fibras.
  function makeCrack(w, h, r) {
    var pts = [], x = w * (0.47 + r() * 0.06), y = h + 4, jog = 0;
    pts.push([x, y]);
    while (y > -4) {
      y -= 6 + r() * 8;
      if (jog <= 0 && r() < 0.06) jog = (r() < 0.5 ? -1 : 1) * (6 + r() * 14);
      var step = jog !== 0 ? jog * 0.35 : 0;
      jog -= step; if (Math.abs(jog) < 1) jog = 0;
      x += step + (r() - 0.5) * 2.2;
      pts.push([x, Math.max(y, -4)]);
    }
    // astillas: fibras largas y finas pegadas a cada lado de la grieta
    var spl = [];
    for (var i = 2; i < pts.length - 2; i++) {
      if (r() < 0.5) {
        spl.push({
          i: i,
          side: r() < 0.5 ? -1 : 1,
          len: 10 + r() * 34,          // largo (en vertical, siguiendo la veta)
          wid: 1 + r() * 3.2,          // cuánto asoma al otro lado
          lean: (r() - 0.5) * 0.6
        });
      }
    }
    return { pts: pts, spl: spl };
  }

  function tracePath(g, pts, from, to) {
    g.moveTo(pts[from][0], pts[from][1]);
    for (var i = from + 1; i <= to; i++) g.lineTo(pts[i][0], pts[i][1]);
  }

  // Dibuja una mitad: madera recortada por la grieta, canto claro de madera fresca y astillas
  // Capas del canto del contrachapado (de arriba abajo): grosor en px y color
  var PLIES = [
    [1.4, '#e2c597'], [0.45, '#5a3a20'], [2.4, '#a9804f'], [0.45, '#5a3a20'],
    [2.4, '#d4b07f'], [0.45, '#5a3a20'], [2.4, '#9c7244'], [0.45, '#5a3a20'],
    [2.4, '#cfa978'], [0.45, '#5a3a20'], [1.4, '#d8b98b']
  ];
  var EDGE = 15;   // grosor visible del canto superior al caer

  function sidePath(g, pts, side, w, h) {
    var n = pts.length - 1;
    g.beginPath();
    tracePath(g, pts, 0, n);
    g.lineTo(pts[n][0], -EDGE - 2);
    if (side < 0) { g.lineTo(-10, -EDGE - 2); g.lineTo(-10, h + 10); }
    else { g.lineTo(w + 10, -EDGE - 2); g.lineTo(w + 10, h + 10); }
    g.closePath();
  }

  function paintHalf(canvas, tex, crack, side, w, h, dpr, broken) {
    var g = canvas.getContext('2d');
    canvas.width = tex.width; canvas.height = tex.height + Math.round(EDGE * dpr);
    g.setTransform(dpr, 0, 0, dpr, 0, EDGE * dpr);
    var pts = crack.pts, n = pts.length - 1;
    var pat = g.createPattern(tex, 'no-repeat');
    pat.setTransform && pat.setTransform(new DOMMatrix().scale(1 / dpr));

    g.save();
    // entero: cada mitad pinta el tablero completo y se solapan sin costura; roto: recorte por la grieta
    if (broken) { sidePath(g, pts, side, w, h); g.clip(); }
    g.fillStyle = pat;
    g.fillRect(-10, 0, w + 20, h + 10);
    // canto superior: capas del contrachapado, visible cuando el tablero cae
    var y = -EDGE;
    for (var i = 0; i < PLIES.length; i++) {
      g.fillStyle = PLIES[i][1];
      g.fillRect(-10, y, w + 20, PLIES[i][0] + 0.2);
      y += PLIES[i][0];
    }
    var sh = g.createLinearGradient(0, -EDGE, 0, 0);
    sh.addColorStop(0, 'rgba(255,240,215,.18)');
    sh.addColorStop(1, 'rgba(40,20,5,.28)');
    g.fillStyle = sh;
    g.fillRect(-10, -EDGE, w + 20, EDGE);
    g.restore();

    if (!broken) return;

    // astillas de este lado: asoman hacia la otra mitad
    for (var k = 0; k < crack.spl.length; k++) {
      var s = crack.spl[k];
      if (s.side !== side * -1) continue;           // las de side=-1 pertenecen a la mitad derecha y viceversa
      var a = pts[s.i], dir = -side;                  // hacia el otro lado
      var topY = a[1] - s.len, midY = a[1] - s.len * 0.55;
      g.beginPath();
      g.moveTo(a[0], a[1] + 2);
      g.quadraticCurveTo(a[0] + dir * s.wid * 1.1, midY, a[0] + dir * (s.wid * 0.4) + s.lean * 6, topY);
      g.lineTo(a[0] - dir * 0.6, midY);
      g.closePath();
      g.fillStyle = pat; g.fill();
      g.strokeStyle = 'rgba(245,222,185,.55)'; g.lineWidth = 0.6; g.stroke();
    }

    // canto de la rotura: madera fresca, más clara, con fibra deshilachada
    g.save();
    g.beginPath(); tracePath(g, pts, 0, n);
    g.strokeStyle = 'rgba(250,228,192,.75)'; g.lineWidth = 1.4; g.stroke();
    g.translate(side * 1.6, 0);
    g.beginPath(); tracePath(g, pts, 0, n);
    g.strokeStyle = 'rgba(70,40,18,.35)'; g.lineWidth = 1.2; g.stroke();
    g.restore();
  }

  // ---------- montaje ----------
  function start(resolve) {
    var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var root = document.createElement('div');
    root.className = 'intro-madera';
    root.setAttribute('aria-hidden', 'true');
    root.innerHTML =
      '<div class="intro-madera__shade"></div>' +
      '<div class="intro-madera__rig">' +
        '<canvas class="intro-madera__half intro-madera__half--l"></canvas>' +
        '<canvas class="intro-madera__half intro-madera__half--r"></canvas>' +
        '<canvas class="intro-madera__fx"></canvas>' +
      '</div>';
    document.body.appendChild(root);
    document.documentElement.classList.add('intro-madera-lock');

    var w = innerWidth, h = innerHeight, dpr = Math.min(devicePixelRatio || 1, CFG.maxDpr);
    var r = rng(CFG.seed * 7919 + Math.floor(Math.random() * 1e6));

    // chapas del contrachapado: anchos distintos
    var edges = [0], x = 0;
    while (x < 1 && edges.length < 9) { x += 0.12 + r() * 0.16; edges.push(Math.min(x, 1)); }
    if (edges[edges.length - 1] < 1) edges[edges.length - 1] = 1;
    while (edges.length < 10) edges.push(2);

    var tex = makeTexture(w, h, dpr, edges, 1 + r() * 50);
    var crack = makeCrack(w, h, r);
    var L = root.querySelector('.intro-madera__half--l');
    var R = root.querySelector('.intro-madera__half--r');
    var fx = root.querySelector('.intro-madera__fx');
    var rig = root.querySelector('.intro-madera__rig');
    var shade = root.querySelector('.intro-madera__shade');
    paintHalf(L, tex, crack, -1, w, h, dpr, false);
    paintHalf(R, tex, crack, 1, w, h, dpr, false);
    L.style.top = R.style.top = -EDGE + 'px';
    L.style.height = R.style.height = (h + EDGE) + 'px';
    fx.width = tex.width; fx.height = tex.height;
    var g = fx.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    root.classList.add('is-ready');
    document.documentElement.classList.remove('intro-madera-pending');

    var pts = crack.pts, n = pts.length - 1;
    var cx = pts[0][0];
    L.style.transformOrigin = '0px ' + (h + EDGE) + 'px';
    R.style.transformOrigin = w + 'px ' + (h + EDGE) + 'px';
    var repainted = false;

    // virutas y serrín que saltan de la grieta
    var chips = [];
    function emit(x, y, count, power) {
      for (var i = 0; i < count; i++) {
        chips.push({
          x: x + (Math.random() - 0.5) * 6, y: y,
          vx: (Math.random() - 0.5) * 160 * power, vy: -Math.random() * 140 * power,
          s: 0.8 + Math.random() * (Math.random() < 0.15 ? 4 : 1.8),
          rot: Math.random() * 6, vr: (Math.random() - 0.5) * 14,
          c: Math.random() < 0.5 ? '226,196,152' : '196,156,108', life: 0.9 + Math.random() * 0.8, age: 0
        });
      }
    }

    var T = { crack0: CFG.hold, crack1: CFG.hold + CFG.crack };
    T.open1 = T.crack1 + CFG.open;
    T.end = T.open1 + CFG.fall;
    var t0 = null, prev = 0, done = false, lastTip = n, finished = false;

    function finish() {
      if (finished) return;
      finished = true;
      root.remove();
      document.documentElement.classList.remove('intro-madera-lock');
      window.dispatchEvent(new Event('intro-madera:fin'));
      try { sessionStorage.setItem('intro-madera-vista', '1'); } catch (e) {}
      running = null;
      if (resolve) resolve();
    }

    // saltar con clic o tecla
    function skip() { if (!finished && t0 !== null) { T.skipAt = (performance.now() - t0) / 1000; } }
    root.addEventListener('click', skip);
    addEventListener('keydown', skip, { once: true });

    if (reduced) {
      root.style.transition = 'opacity .6s';
      setTimeout(function () { root.style.opacity = '0'; }, 600);
      setTimeout(finish, 1300);
      return;
    }

    function frame(now) {
      if (t0 === null) t0 = now;
      var t = (now - t0) / 1000;
      if (T.skipAt != null) {                         // salto: directo a la caída
        var off = Math.max(0, T.open1 - T.skipAt);
        T.crack0 -= off; T.crack1 -= off; T.open1 -= off; T.end -= off; T.skipAt = null;
      }
      var dt = Math.min(0.05, t - prev); prev = t;

      // 1. la grieta sube
      var pc = easeIn(seg(t, T.crack0, T.crack1));
      var tipIdx = Math.max(0, Math.round(n - pc * n));
      // vibración mientras cruje
      var shake = 0;
      if (t > T.crack0 && t < T.open1) shake = (1 - seg(t, T.crack0, T.open1) * 0.5) * 1.6;
      var sx = shake * (Math.sin(t * 91) + Math.sin(t * 57) * 0.6) * 0.5;
      var sy = shake * Math.sin(t * 73) * 0.35;
      rig.style.transform = 'translate3d(' + sx.toFixed(2) + 'px,' + sy.toFixed(2) + 'px,0)';

      if (tipIdx < lastTip) {
        for (var k = tipIdx; k < lastTip; k += 3) emit(pts[k][0], pts[k][1], 1, 0.7);
        lastTip = tipIdx;
      }

      // 2. se abre la rendija y 3. caen
      var open = easeOut(seg(t, T.crack1, T.open1));
      // al abrirse, cada mitad pasa a mostrar el canto roto y las astillas
      if (!repainted && t >= T.crack1) {
        repainted = true;
        paintHalf(L, tex, crack, -1, w, h, dpr, true);
        paintHalf(R, tex, crack, 1, w, h, dpr, true);
      }
      var ft = Math.max(0, t - T.open1);
      if (ft > 0 && !done) { done = true; for (var j = 0; j < n; j += 4) emit(pts[j][0], pts[j][1], 2, 1.2); }
      var grav = 2 * (h * 1.25) / (CFG.fall * CFG.fall);
      var fy = 0.5 * grav * ft * ft;
      var tilt = easeIn(clamp01(ft / CFG.fall)) * 9;
      var gap = open * 3 + ft * 40;
      L.style.transform = 'translate3d(' + (-gap).toFixed(2) + 'px,' + fy.toFixed(2) + 'px,0) rotate(' + (-tilt).toFixed(3) + 'deg)';
      R.style.transform = 'translate3d(' + gap.toFixed(2) + 'px,' + (fy * 1.04).toFixed(2) + 'px,0) rotate(' + tilt.toFixed(3) + 'deg)';
      // sombra que el tablero proyecta sobre la web mientras cae
      shade.style.opacity = (t < T.open1 ? 0 : 0.55 * (1 - seg(t, T.open1, T.end))).toFixed(3);

      // capa de efectos: grieta en curso + virutas
      g.clearRect(0, 0, w, h);
      if (pc > 0 && ft === 0 && tipIdx < n) {
        var wide = 1 + open * 2;
        g.beginPath(); tracePath(g, pts, tipIdx, n);
        g.strokeStyle = 'rgba(30,16,6,.85)'; g.lineWidth = 1.6 * wide; g.lineJoin = 'round'; g.stroke();
        g.beginPath(); tracePath(g, pts, tipIdx, n);
        g.strokeStyle = 'rgba(10,5,2,.9)'; g.lineWidth = 0.7 * wide; g.stroke();
        // punta fina de la grieta
        var tip = pts[tipIdx];
        g.fillStyle = 'rgba(30,16,6,.6)';
        g.beginPath(); g.arc(tip[0], tip[1], 1, 0, 6.283); g.fill();
      }
      for (var c = chips.length - 1; c >= 0; c--) {
        var p = chips[c];
        p.age += dt;
        if (p.age > p.life) { chips.splice(c, 1); continue; }
        p.vy += 900 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
        g.save(); g.translate(p.x, p.y); g.rotate(p.rot);
        g.fillStyle = 'rgba(' + p.c + ',' + (1 - p.age / p.life).toFixed(3) + ')';
        g.fillRect(-p.s, -p.s * 0.35, p.s * 2, p.s * 0.7);
        g.restore();
      }

      if (t < T.end + 0.2) requestAnimationFrame(frame);
      else finish();
    }
    requestAnimationFrame(frame);
  }

  window.IntroMadera = {
    play: function () {
      if (running) return running;
      running = new Promise(function (resolve) {
        var go = function () { start(resolve); };
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
        else go();
      });
      return running;
    }
  };

  var seen = false;
  try { seen = sessionStorage.getItem('intro-madera-vista') === '1'; } catch (e) {}
  if (CFG.auto !== false && !(CFG.oncePerSession && seen)) window.IntroMadera.play();
  else document.documentElement.classList.remove('intro-madera-pending');
})();
