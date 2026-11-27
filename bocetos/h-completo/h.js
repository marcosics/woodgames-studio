/* WoodGames Studio · Boceto H
   1. Pantalla de carga y grano.
   2. Pósteres de tela (WebGL + simulación verlet): cuelgan de una barra, ondean y se pueden arrastrar.
   3. Logo tallado: el logo se reilumina con un mapa de relieve sacado de su propia imagen; la luz sigue al cursor.
   4. Botón flotante y formulario. */
(function () {
  'use strict';
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DPR = Math.min(window.devicePixelRatio || 1, 2);

  /* ---------- 1. Carga y grano ---------- */
  var loader = document.querySelector('.h-loader');
  var t0 = performance.now();
  function doneLoading() { setTimeout(function () { loader && loader.classList.add('is-done'); }, Math.max(0, 1000 - (performance.now() - t0))); }
  if (document.readyState === 'complete') doneLoading(); else addEventListener('load', doneLoading);
  setTimeout(function () { loader && loader.classList.add('is-done'); }, 2600);

  (function grain() {
    var c = document.createElement('canvas'); c.width = c.height = 180;
    var g = c.getContext('2d'), im = g.createImageData(180, 180);
    for (var i = 0; i < im.data.length; i += 4) { var v = Math.random() * 255 | 0; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
    g.putImageData(im, 0, 0);
    document.querySelector('.h-grain').style.backgroundImage = 'url(' + c.toDataURL() + ')';
  })();

  /* ---------- utilidades WebGL ---------- */
  function shader(gl, type, src) {
    var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  function program(gl, vs, fs) {
    var p = gl.createProgram();
    gl.attachShader(p, shader(gl, gl.VERTEX_SHADER, vs)); gl.attachShader(p, shader(gl, gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    return p;
  }
  function texture(gl, source) {
    var t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }
  function rand(seed) { var s = seed >>> 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function visibleLoop(el, step) {
    var on = false, raf = 0, last = 0;
    function tick(now) { var dt = Math.min(0.033, (now - last) / 1000 || 0.016); last = now; step(dt, now / 1000); raf = on ? requestAnimationFrame(tick) : 0; }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { on = e[0].isIntersecting; if (on && !raf) { last = performance.now(); raf = requestAnimationFrame(tick); } }).observe(el);
    } else { on = true; raf = requestAnimationFrame(tick); }
  }

  /* ---------- 2. Pósteres de tela ---------- */
  var TW = 1000, TH = 1280; // textura del póster (proporción 1 : 1.28)

  function paintOrbital(g) {
    g.fillStyle = '#020207'; g.fillRect(0, 0, TW, TH);
    var a = g.createRadialGradient(TW * .38, TH * .26, 0, TW * .38, TH * .26, TW * .75);
    a.addColorStop(0, 'rgba(40,18,96,.75)'); a.addColorStop(.5, 'rgba(40,18,96,.25)'); a.addColorStop(1, 'rgba(40,18,96,0)');
    g.fillStyle = a; g.fillRect(0, 0, TW, TH);
    var b = g.createRadialGradient(TW * .64, TH * .78, 0, TW * .64, TH * .78, TW * .8);
    b.addColorStop(0, 'rgba(12,34,96,.75)'); b.addColorStop(.5, 'rgba(12,34,96,.25)'); b.addColorStop(1, 'rgba(12,34,96,0)');
    g.fillStyle = b; g.fillRect(0, 0, TW, TH);
    var r = rand(11);
    for (var i = 0; i < 260; i++) { g.fillStyle = 'rgba(232,236,255,' + (.25 + r() * .6).toFixed(2) + ')'; g.beginPath(); g.arc(r() * TW, r() * TH, .6 + r() * 1.8, 0, 6.283); g.fill(); }
    // Planeta, órbitas y La Bola: la mecánica del juego en una imagen
    var cx = TW * .5, cy = TH * .5, R = 170;
    g.setLineDash([3, 14]); g.lineWidth = 3; g.strokeStyle = 'rgba(214,206,255,.35)'; g.beginPath(); g.arc(cx, cy, R + 120, 0, 6.283); g.stroke();
    g.setLineDash([22, 16]); g.strokeStyle = 'rgba(214,206,255,.5)'; g.beginPath(); g.arc(cx, cy, R + 60, 0, 6.283); g.stroke(); g.setLineDash([]);
    var p = g.createRadialGradient(cx - R * .45, cy - R * .5, 4, cx - R * .2, cy - R * .2, R * 1.45);
    p.addColorStop(0, '#5648aa'); p.addColorStop(.45, '#181440'); p.addColorStop(1, '#050510');
    g.fillStyle = p; g.beginPath(); g.arc(cx, cy, R, 0, 6.283); g.fill();
    var bx = cx + Math.cos(-.75) * (R + 60), by = cy + Math.sin(-.75) * (R + 60);
    var gl = g.createRadialGradient(bx, by, 0, bx, by, 70); gl.addColorStop(0, 'rgba(242,169,59,.6)'); gl.addColorStop(1, 'rgba(242,169,59,0)');
    g.fillStyle = gl; g.beginPath(); g.arc(bx, by, 70, 0, 6.283); g.fill();
    g.fillStyle = '#ffc867'; g.beginPath(); g.arc(bx, by, 18, 0, 6.283); g.fill();
    // Tipografía
    g.fillStyle = '#f2f2ee';
    g.font = '600 26px Inter, sans-serif'; g.textBaseline = 'top';
    g.fillText('WOODGAMES STUDIO', 56, 64); g.textAlign = 'right'; g.fillText('PRÓXIMO LANZAMIENTO', TW - 56, 64); g.textAlign = 'left';
    g.font = '800 200px Archivo, "Arial Black", sans-serif';
    try { g.font = '800 125% 200px Archivo, "Arial Black", sans-serif'; } catch (e) {}
    g.textBaseline = 'alphabetic';
    fitText(g, 'ORBITAL', 56, TH - 120, TW - 112, '800', 'Archivo, "Arial Black", sans-serif');
    g.font = '600 26px Inter, sans-serif'; g.fillStyle = '#a3a3ad';
    g.fillText('iOS · ANDROID', 56, TH - 64); g.textAlign = 'right'; g.fillText('ARCADE 2D', TW - 56, TH - 64); g.textAlign = 'left';
  }
  function paintTaller(g) {
    var bg = g.createLinearGradient(0, 0, 0, TH); bg.addColorStop(0, '#3a2416'); bg.addColorStop(1, '#22150d');
    g.fillStyle = bg; g.fillRect(0, 0, TW, TH);
    // Anillos de un tronco, como en el logo
    var r = rand(7), cx = TW * .5, cy = TH * .48;
    for (var i = 1; i < 26; i++) {
      g.strokeStyle = 'rgba(233,198,144,' + (.05 + r() * .09).toFixed(3) + ')'; g.lineWidth = 2 + r() * 4;
      g.beginPath(); g.ellipse(cx + (r() - .5) * 12, cy + (r() - .5) * 12, i * 22 + r() * 8, i * 21 + r() * 8, r() * 3, 0, 6.283); g.stroke();
    }
    g.fillStyle = '#f2e6d2'; g.font = '600 26px Inter, sans-serif'; g.textBaseline = 'top';
    g.fillText('WOODGAMES STUDIO', 56, 64); g.textAlign = 'right'; g.fillText('PRÓXIMAMENTE', TW - 56, 64); g.textAlign = 'left';
    g.textBaseline = 'alphabetic';
    fitText(g, 'TALLER DE', 56, TH - 250, TW - 112, '800', 'Archivo, "Arial Black", sans-serif');
    fitText(g, 'ANTIGÜEDADES', 56, TH - 120, TW - 112, '800', 'Archivo, "Arial Black", sans-serif');
    g.font = '600 26px Inter, sans-serif'; g.fillStyle = '#c9b49a';
    g.fillText('IDLE · RESTAURACIÓN', 56, TH - 64); g.textAlign = 'right'; g.fillText('NOMBRE PROVISIONAL', TW - 56, TH - 64); g.textAlign = 'left';
  }
  function fitText(g, text, x, y, maxW, weight, family) {
    var size = 260; g.font = weight + ' ' + size + 'px ' + family;
    var w = g.measureText(text).width; size = Math.floor(size * maxW / w); g.font = weight + ' ' + size + 'px ' + family;
    g.fillText(text, x, y);
  }

  function Cloth(canvas, kind) {
    var stage = canvas.parentNode;
    var tex = document.createElement('canvas'); tex.width = TW; tex.height = TH;
    (kind === 'orbital' ? paintOrbital : paintTaller)(tex.getContext('2d'));
    var gl = canvas.getContext('webgl', { premultipliedAlpha: false, antialias: true, alpha: true });
    if (!gl) { var img = new Image(); img.alt = ''; img.src = tex.toDataURL('image/jpeg', .85); stage.appendChild(img); canvas.remove(); return; }

    var COLS = 22, ROWS = 28, W = 1, H = 1.28, n = COLS * ROWS;
    var pos = new Float32Array(n * 3), prev = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2);
    for (var j = 0; j < ROWS; j++) for (var i = 0; i < COLS; i++) {
      var k = j * COLS + i, x = (i / (COLS - 1) - .5) * W, y = -j / (ROWS - 1) * H;
      pos[k * 3] = prev[k * 3] = x; pos[k * 3 + 1] = prev[k * 3 + 1] = y; pos[k * 3 + 2] = prev[k * 3 + 2] = 0;
      uv[k * 2] = i / (COLS - 1); uv[k * 2 + 1] = j / (ROWS - 1);
    }
    var rest = pos.slice();
    var dx = W / (COLS - 1), dy = H / (ROWS - 1), dg = Math.sqrt(dx * dx + dy * dy);
    var idx = [];
    for (j = 0; j < ROWS - 1; j++) for (i = 0; i < COLS - 1; i++) { var a = j * COLS + i, b = a + 1, c = a + COLS, d = c + 1; idx.push(a, c, b, b, c, d); }

    var prog = program(gl,
      'attribute vec3 p;attribute vec3 nn;attribute vec2 t;uniform vec2 s;uniform float top;varying vec2 vT;varying vec3 vN;varying float vZ;' +
      'void main(){float w=1.0-p.z*0.55;gl_Position=vec4(p.x*s.x,top+p.y*s.y,0.0,w);vT=t;vN=nn;vZ=p.z;}',
      'precision mediump float;uniform sampler2D tex;varying vec2 vT;varying vec3 vN;varying float vZ;' +
      'void main(){vec3 N=normalize(vN);if(!gl_FrontFacing)N=-N;vec3 L=normalize(vec3(-0.45,0.55,1.0));float d=max(dot(N,L),0.0);' +
      'float sh=0.42+0.68*d;vec3 H=normalize(L+vec3(0.0,0.0,1.0));float sp=pow(max(dot(N,H),0.0),48.0)*0.10;' +
      'vec4 c=texture2D(tex,vT);gl_FragColor=vec4(c.rgb*sh+sp,1.0);}');
    gl.useProgram(prog);
    var bP = gl.createBuffer(), bN = gl.createBuffer(), bT = gl.createBuffer(), bI = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bT); gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW);
    var aT = gl.getAttribLocation(prog, 't'); gl.enableVertexAttribArray(aT); gl.vertexAttribPointer(aT, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bI); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
    var aP = gl.getAttribLocation(prog, 'p'), aN = gl.getAttribLocation(prog, 'nn');
    gl.enableVertexAttribArray(aP); gl.enableVertexAttribArray(aN);
    texture(gl, tex);
    var uS = gl.getUniformLocation(prog, 's'), uTop = gl.getUniformLocation(prog, 'top');

    // Encaje en el lienzo: el póster ocupa el 76 % del ancho y cuelga desde arriba
    var sx = 1.52, top = 0.885, sy = 1.73 / H;
    function resize() {
      var r = canvas.getBoundingClientRect();
      canvas.width = Math.max(2, Math.round(r.width * DPR)); canvas.height = Math.max(2, Math.round(r.height * DPR));
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize(); addEventListener('resize', resize, { passive: true });

    // Cursor: empuja la tela al pasar y permite agarrarla
    var ptr = { x: 0, y: 0, vx: 0, vy: 0, in: false, grab: -1, gz: 0 };
    function toCloth(e) {
      var r = canvas.getBoundingClientRect();
      var nx = ((e.clientX - r.left) / r.width) * 2 - 1, ny = 1 - ((e.clientY - r.top) / r.height) * 2;
      return { x: nx / sx, y: (ny - top) / sy };
    }
    canvas.addEventListener('pointermove', function (e) {
      var q = toCloth(e); ptr.vx = q.x - ptr.x; ptr.vy = q.y - ptr.y; ptr.x = q.x; ptr.y = q.y; ptr.in = true;
    });
    canvas.addEventListener('pointerleave', function () { ptr.in = false; });
    canvas.addEventListener('pointerdown', function (e) {
      var q = toCloth(e), best = -1, bd = .06;
      for (var k = COLS; k < n; k++) { var ddx = pos[k * 3] - q.x, ddy = pos[k * 3 + 1] - q.y, dd = ddx * ddx + ddy * ddy; if (dd < bd) { bd = dd; best = k; } }
      if (best >= 0) { ptr.grab = best; ptr.x = q.x; ptr.y = q.y; canvas.setPointerCapture(e.pointerId); canvas.style.cursor = 'grabbing'; }
    });
    function release() { ptr.grab = -1; canvas.style.cursor = ''; }
    canvas.addEventListener('pointerup', release); canvas.addEventListener('pointercancel', release);

    var phase = Math.random() * 10;
    function simulate(dt, t) {
      var damp = 0.985, g = -0.9 * dt * dt;
      for (var k = 0; k < n; k++) {
        var o = k * 3;
        var vx = (pos[o] - prev[o]) * damp, vy = (pos[o + 1] - prev[o + 1]) * damp, vz = (pos[o + 2] - prev[o + 2]) * damp;
        prev[o] = pos[o]; prev[o + 1] = pos[o + 1]; prev[o + 2] = pos[o + 2];
        var ux = uv[k * 2], vv = uv[k * 2 + 1];
        var wind = reduced ? 0 : (Math.sin(t * 1.25 + ux * 3.1 + vv * 2.2 + phase) * .55 + Math.sin(t * 2.3 + ux * 7 + phase) * .25) * vv * 0.0009;
        pos[o] += vx; pos[o + 1] += vy + g; pos[o + 2] += vz + wind;
        // La tela recupera su forma de póster poco a poco (más rígida arriba, más suelta abajo)
        var stiff = 0.010 + (1 - vv) * 0.02;
        pos[o] += (rest[o] - pos[o]) * stiff; pos[o + 1] += (rest[o + 1] - pos[o + 1]) * stiff; pos[o + 2] *= 0.992;
        if (ptr.in && ptr.grab < 0) {
          var ex = pos[o] - ptr.x, ey = pos[o + 1] - ptr.y, ed = ex * ex + ey * ey;
          if (ed < .045) { var f = (1 - ed / .045); pos[o + 2] += f * f * Math.min(.02, (Math.abs(ptr.vx) + Math.abs(ptr.vy)) * .25); }
        }
      }
      if (ptr.grab >= 0) { var go = ptr.grab * 3; pos[go] += (ptr.x - pos[go]) * .5; pos[go + 1] += (ptr.y - pos[go + 1]) * .5; pos[go + 2] += (.08 - pos[go + 2]) * .4; }
      ptr.vx *= .8; ptr.vy *= .8;
      for (var it = 0; it < 5; it++) {
        for (var j = 0; j < ROWS; j++) for (var i = 0; i < COLS; i++) {
          var a = j * COLS + i;
          if (i < COLS - 1) link(a, a + 1, dx);
          if (j < ROWS - 1) link(a, a + COLS, dy);
          if (i < COLS - 1 && j < ROWS - 1) { link(a, a + COLS + 1, dg); link(a + 1, a + COLS, dg); }
        }
        for (var c = 0; c < COLS; c++) { var co = c * 3; pos[co] = rest[co]; pos[co + 1] = rest[co + 1]; pos[co + 2] = 0; }
      }
    }
    function link(a, b, L) {
      var ao = a * 3, bo = b * 3;
      var x = pos[bo] - pos[ao], y = pos[bo + 1] - pos[ao + 1], z = pos[bo + 2] - pos[ao + 2];
      var d = Math.sqrt(x * x + y * y + z * z) || 1e-6, diff = (d - L) / d * .5;
      x *= diff; y *= diff; z *= diff;
      pos[ao] += x; pos[ao + 1] += y; pos[ao + 2] += z; pos[bo] -= x; pos[bo + 1] -= y; pos[bo + 2] -= z;
    }
    function normals() {
      for (var j = 0; j < ROWS; j++) for (var i = 0; i < COLS; i++) {
        var k = j * COLS + i, l = j * COLS + Math.max(0, i - 1), r = j * COLS + Math.min(COLS - 1, i + 1);
        var u = Math.max(0, j - 1) * COLS + i, d = Math.min(ROWS - 1, j + 1) * COLS + i;
        var ax = pos[r * 3] - pos[l * 3], ay = pos[r * 3 + 1] - pos[l * 3 + 1], az = pos[r * 3 + 2] - pos[l * 3 + 2];
        var bx = pos[u * 3] - pos[d * 3], by = pos[u * 3 + 1] - pos[d * 3 + 1], bz = pos[u * 3 + 2] - pos[d * 3 + 2];
        nor[k * 3] = ay * bz - az * by; nor[k * 3 + 1] = az * bx - ax * bz; nor[k * 3 + 2] = ax * by - ay * bx;
      }
    }
    function draw() {
      normals();
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(uS, sx, sy); gl.uniform1f(uTop, top);
      gl.bindBuffer(gl.ARRAY_BUFFER, bP); gl.bufferData(gl.ARRAY_BUFFER, pos, gl.DYNAMIC_DRAW); gl.vertexAttribPointer(aP, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, bN); gl.bufferData(gl.ARRAY_BUFFER, nor, gl.DYNAMIC_DRAW); gl.vertexAttribPointer(aN, 3, gl.FLOAT, false, 0, 0);
      gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
    }
    if (reduced) { for (var s = 0; s < 60; s++) simulate(1 / 60, s / 60); draw(); return; }
    draw();
    visibleLoop(canvas, function (dt, t) { simulate(1 / 60, t); draw(); });
  }

  /* ---------- 3. Logo tallado con luz ---------- */
  function Relief(fig) {
    var canvas = fig.querySelector('canvas');
    var gl = canvas.getContext('webgl', { premultipliedAlpha: false, alpha: true });
    if (!gl) { fig.classList.add('is-fallback'); return; }
    var img = new Image();
    img.onload = function () { try { setup(); } catch (e) { fig.classList.add('is-fallback'); } };
    function setup() {
      var prog = program(gl,
        'attribute vec2 a;varying vec2 v;void main(){v=vec2(a.x*0.5+0.5,0.5-a.y*0.5);gl_Position=vec4(a,0.0,1.0);}',
        'precision mediump float;uniform sampler2D tex;uniform vec3 light;uniform vec2 px;varying vec2 v;' +
        'float h(vec2 q){vec4 c=texture2D(tex,q);return dot(c.rgb,vec3(0.3,0.59,0.11))*c.a;}' +
        'float hb(vec2 q){return (h(q)*4.0+h(q+vec2(px.x,0.0))+h(q-vec2(px.x,0.0))+h(q+vec2(0.0,px.y))+h(q-vec2(0.0,px.y)))/8.0;}' +
        'void main(){vec4 c=texture2D(tex,v);if(c.a<0.02){gl_FragColor=vec4(0.0);return;}' +
        'float k=7.0;vec2 o=px*2.0;' +
        'vec3 N=normalize(vec3((hb(v-vec2(o.x,0.0))-hb(v+vec2(o.x,0.0)))*k,(hb(v+vec2(0.0,o.y))-hb(v-vec2(0.0,o.y)))*k,1.0));' +
        'vec3 P=vec3(v.x,1.0-v.y,hb(v)*0.06);vec3 L=normalize(light-P);float d=max(dot(N,L),0.0);' +
        'float dist=length(light.xy-P.xy);float fall=1.0/(1.0+dist*dist*2.2);' +
        'vec3 H=normalize(L+vec3(0.0,0.0,1.0));float sp=pow(max(dot(N,H),0.0),36.0)*0.55*fall;' +
        'vec3 col=c.rgb*(0.30+1.15*d*fall)+vec3(1.0,0.86,0.62)*sp;gl_FragColor=vec4(col,c.a);}');
      gl.useProgram(prog);
      var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      var aA = gl.getAttribLocation(prog, 'a'); gl.enableVertexAttribArray(aA); gl.vertexAttribPointer(aA, 2, gl.FLOAT, false, 0, 0);
      texture(gl, img);
      var uL = gl.getUniformLocation(prog, 'light'), uPx = gl.getUniformLocation(prog, 'px');
      gl.uniform2f(uPx, 1 / img.width, 1 / img.height);
      gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      function resize() { var r = canvas.getBoundingClientRect(); canvas.width = Math.round(r.width * DPR) || 560; canvas.height = Math.round(r.height * DPR) || 560; gl.viewport(0, 0, canvas.width, canvas.height); }
      resize(); addEventListener('resize', resize, { passive: true });
      var L = { x: .25, y: .8, tx: .25, ty: .8 }, hover = false;
      canvas.addEventListener('pointermove', function (e) { var r = canvas.getBoundingClientRect(); L.tx = (e.clientX - r.left) / r.width; L.ty = 1 - (e.clientY - r.top) / r.height; hover = true; });
      canvas.addEventListener('pointerleave', function () { hover = false; });
      function draw() { gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.uniform3f(uL, L.x, L.y, .55); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); }
      if (reduced) { draw(); return; }
      visibleLoop(canvas, function (dt, t) {
        if (!hover) { L.tx = .5 + Math.cos(t * .5) * .42; L.ty = .5 + Math.sin(t * .5) * .42; } // sin cursor, la luz orbita el logo
        L.x += (L.tx - L.x) * .12; L.y += (L.ty - L.y) * .12; draw();
      });
    }
    img.onerror = function () { fig.classList.add('is-fallback'); };
    img.src = 'logo-wg.png';
  }

  function start() {
    document.querySelectorAll('[data-cloth]').forEach(function (c) {
      try { Cloth(c, c.getAttribute('data-cloth')); } catch (e) { console.warn(e); }
    });
    var fig = document.querySelector('.h-relief');
    if (fig) { try { Relief(fig); } catch (e) { fig.classList.add('is-fallback'); } }
  }
  // Los pósteres dibujan texto: esperamos a las fuentes
  if (document.fonts && document.fonts.ready) {
    Promise.all([document.fonts.load('800 100px Archivo'), document.fonts.load('600 20px Inter')]).then(start, start);
  } else start();

  /* ---------- 4. Botón flotante y formulario ---------- */
  var flt = document.querySelector('.h-float'), hero = document.querySelector('.h-hero'), ask = document.getElementById('contacto');
  function floatState() {
    var past = hero.getBoundingClientRect().bottom < innerHeight * .4;
    var r = ask.getBoundingClientRect(), atForm = r.top < innerHeight && r.bottom > 0;
    flt.classList.toggle('is-hidden', !past || atForm);
  }
  addEventListener('scroll', floatState, { passive: true }); floatState();

  var form = document.querySelector('.h-form'), out = document.getElementById('h-out'), mail = document.getElementById('h-mail');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!mail.value || !mail.checkValidity()) { out.textContent = 'Escribe un correo válido, por ejemplo nombre@correo.com.'; mail.focus(); return; }
    out.textContent = 'Apuntado. (En este boceto no se envía nada.)';
    form.reset();
  });
})();
