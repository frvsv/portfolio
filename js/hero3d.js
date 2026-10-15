// 3D-объект первого экрана: скульптура «скрученная лента-кольцо + жемчужина».
// Рисуется прямо на WebGL-шейдере (ray marching) — без сторонних библиотек.
// Есть: пауза вне экрана, упрощение на мобильных, reduced motion, статичный fallback.

const VS = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

const FS = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform mat3 uRot;
uniform int uSteps;
uniform vec3 uAccent;

mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

// x — расстояние, y — материал (0 керамика, 1 жемчужина)
vec2 map(vec3 pw){
  vec3 p = uRot * pw;
  float ang = atan(p.z, p.x);
  vec2 t = vec2(length(p.xz) - 0.95, p.y);
  t = rot(ang * 2.0) * t;                       // двойной оборот ленты
  float w = 0.36 + 0.07 * sin(ang * 3.0);       // «дышащая» ширина
  vec2 ab = vec2(w, 0.125);
  float d1 = (length(t / ab) - 1.0) * 0.125;
  vec3 pc = p - vec3(0.0, 0.05 * sin(uTime * 0.7), 0.0);
  float d2 = length(pc) - 0.27;
  return d1 < d2 ? vec2(d1, 0.0) : vec2(d2, 1.0);
}

vec3 calcNormal(vec3 p){
  const vec2 k = vec2(1.0, -1.0);
  const float h = 0.0012;
  return normalize(k.xyy * map(p + k.xyy * h).x + k.yyx * map(p + k.yyx * h).x +
                   k.yxy * map(p + k.yxy * h).x + k.xxx * map(p + k.xxx * h).x);
}

float softShadow(vec3 ro, vec3 rd){
  float res = 1.0, t = 0.04;
  for (int i = 0; i < 18; i++){
    float h = map(ro + rd * t).x;
    res = min(res, 9.0 * h / t);
    t += clamp(h, 0.03, 0.25);
    if (res < 0.01 || t > 3.0) break;
  }
  return clamp(res, 0.0, 1.0);
}

float ao(vec3 p, vec3 n){
  float o = 0.0, s = 1.0;
  for (int i = 1; i <= 5; i++){
    float h = 0.03 + 0.11 * float(i);
    o += (h - map(p + n * h).x) * s;
    s *= 0.72;
  }
  return clamp(1.0 - 1.6 * o, 0.0, 1.0);
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec3 ro = vec3(0.0, 0.0, 5.0);
  vec3 rd = normalize(vec3(uv, -1.7));

  float t = 3.2, id = -1.0;
  for (int i = 0; i < 96; i++){
    if (i >= uSteps) break;
    vec2 h = map(ro + rd * t);
    if (h.x < 0.0009){ id = h.y; break; }
    t += h.x * 0.85;
    if (t > 7.5) break;
  }
  if (id < 0.0){ gl_FragColor = vec4(0.0); return; }

  vec3 p = ro + rd * t;
  vec3 n = calcNormal(p);
  vec3 v = -rd;

  vec3 l1 = normalize(vec3(-0.55, 0.8, 0.65));
  vec3 l2 = normalize(vec3(0.8, 0.15, 0.45));
  float sh = softShadow(p + n * 0.02, l1);
  float occ = ao(p, n);

  float d1 = max(0.0, (dot(n, l1) + 0.3) / 1.3);
  float d2 = max(0.0, dot(n, l2));
  float up = n.y * 0.5 + 0.5;

  vec3 alb;
  float spec, pw;
  if (id < 0.5){
    alb = mix(vec3(0.78, 0.73, 0.66), vec3(0.95, 0.93, 0.88), up);
    spec = 0.16; pw = 36.0;
  } else {
    alb = uAccent;
    spec = 0.85; pw = 120.0;
  }

  vec3 col = alb * (vec3(1.0, 0.94, 0.85) * d1 * (0.35 + 0.65 * sh) * 1.05
                  + vec3(0.62, 0.68, 0.8) * d2 * 0.28
                  + vec3(0.52, 0.5, 0.48) * 0.34 * occ);
  col += uAccent * 0.10 * max(0.0, -n.y) * occ * (id < 0.5 ? 1.0 : 0.0);

  vec3 h = normalize(l1 + v);
  col += vec3(1.0, 0.97, 0.92) * spec * pow(max(dot(n, h), 0.0), pw) * sh;
  float fr = pow(1.0 - max(dot(n, v), 0.0), 3.0);
  vec3 r = reflect(rd, n);
  vec3 env = mix(vec3(0.55, 0.5, 0.45), vec3(1.0, 0.98, 0.94), smoothstep(-0.6, 0.8, r.y));
  col += env * fr * (id < 0.5 ? 0.12 : 0.35) * occ;

  col = pow(col, vec3(1.0 / 2.2));
  gl_FragColor = vec4(col, 1.0);
}
`;

function mat3FromAngles(ax, ay) {
  // Объект→мир: Rx(ax)·Ry(ay). Шейдеру нужен мир→объект, то есть транспонированная матрица.
  const cx = Math.cos(ax), sx = Math.sin(ax), cy = Math.cos(ay), sy = Math.sin(ay);
  // R = Rx * Ry (строки)
  const R = [
    [cy, 0, sy],
    [sx * sy, cx, -sx * cy],
    [-cx * sy, sx, cx * cy],
  ];
  // транспонирование; uniformMatrix3fv ждёт column-major, а транспонированная R в column-major = R по строкам
  return new Float32Array([R[0][0], R[0][1], R[0][2], R[1][0], R[1][1], R[1][2], R[2][0], R[2][1], R[2][2]]);
}

export function initHero3D(hero, canvas) {
  const fail = () => hero.classList.add("no-webgl");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = matchMedia("(max-width: 720px), (pointer: coarse)").matches;

  let gl;
  try {
    gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: "high-performance" });
  } catch (e) { /* noop */ }
  if (!gl) return fail();

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || "shader");
    return s;
  };
  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error("link");
  } catch (e) {
    console.warn("3D-сцена отключена:", e);
    return fail();
  }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const U = (n) => gl.getUniformLocation(prog, n);
  const uRes = U("uRes"), uTime = U("uTime"), uRot = U("uRot"), uSteps = U("uSteps"), uAccent = U("uAccent");
  gl.uniform3f(uAccent, 0.86, 0.27, 0.12);
  gl.uniform1i(uSteps, isMobile ? 56 : 84);

  // На обычных экранах рендерим чуть плотнее (сглаживание краёв), на телефонах — экономнее.
  const maxDpr = isMobile ? 1.5 : 2;
  const resize = () => {
    const dpr = Math.min(Math.max(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.5), maxDpr);
    const w = Math.max(2, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(2, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    gl.uniform2f(uRes, w, h);
  };

  let mx = 0, my = 0, tx = 0, ty = 0;
  if (!reduce && !isMobile) {
    window.addEventListener("pointermove", (e) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
  }

  const draw = (time) => {
    mx += (tx - mx) * 0.045;
    my += (ty - my) * 0.045;
    const ay = time * 0.11 + mx * 0.55;
    const ax = 1.0 + my * 0.22 + Math.sin(time * 0.25) * 0.06;
    gl.uniformMatrix3fv(uRot, false, mat3FromAngles(ax, ay));
    gl.uniform1f(uTime, time);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  resize();
  window.addEventListener("resize", () => { resize(); if (reduce) draw(2.4); }, { passive: true });
  canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); fail(); });

  if (reduce) { draw(2.4); return; }

  let visible = true, raf = 0, last = 0;
  const loop = (now) => {
    raf = 0;
    if (!visible || document.hidden) return;
    if (now - last > 15) { last = now; draw(now / 1000); }
    raf = requestAnimationFrame(loop);
  };
  const kick = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(loop); };
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; kick(); }).observe(hero);
  document.addEventListener("visibilitychange", kick);
  kick();
}
