<template>
  <div class="fixed inset-0 bg-[#0e0d17]">
    <canvas ref="canvasRef" class="h-full w-full" />
  </div>
</template>

<script setup>
const canvasRef = ref(null);
let ready = false;

const isMobile = typeof window !== 'undefined' &&
  (window.matchMedia('(max-width: 768px)').matches || 'ontouchstart' in window);

const MAX_TAPS = 8;
const RIPPLE_LIFETIME = 5.0;

const VERT = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

// ── Tiny mobile shader: same colours & random positions, no noise/ripples ──
const FRAG_MOBILE = `
precision highp float;
uniform float u_aspect;
uniform float u_seed;
varying vec2 vUv;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float blob(vec2 uv, vec2 pos, float radius, float power) {
  vec2 delta = (uv - pos) * vec2(u_aspect, 1.0);
  float d = length(delta);
  float t = clamp(d / radius, 0.0, 1.0);
  return pow(smoothstep(1.0, 0.2, t), power);
}

void main() {
  vec2 uv = vUv;

  vec2 o1 = vec2(0.20 + 0.55 * hash(vec2(1.0, u_seed)), 0.20 + 0.60 * hash(vec2(11.0, u_seed)));
  vec2 o2 = vec2(0.20 + 0.55 * hash(vec2(2.0, u_seed)), 0.20 + 0.60 * hash(vec2(12.0, u_seed)));
  vec2 o3 = vec2(0.20 + 0.55 * hash(vec2(3.0, u_seed)), 0.20 + 0.60 * hash(vec2(13.0, u_seed)));
  vec2 o4 = vec2(0.20 + 0.55 * hash(vec2(4.0, u_seed)), 0.20 + 0.60 * hash(vec2(14.0, u_seed)));
  vec2 o5 = vec2(0.20 + 0.55 * hash(vec2(5.0, u_seed)), 0.20 + 0.60 * hash(vec2(15.0, u_seed)));
  vec2 o6 = vec2(0.20 + 0.55 * hash(vec2(6.0, u_seed)), 0.20 + 0.60 * hash(vec2(16.0, u_seed)));
  vec2 o7 = vec2(0.20 + 0.55 * hash(vec2(7.0, u_seed)), 0.20 + 0.60 * hash(vec2(17.0, u_seed)));

  float rScale = mix(0.7, 1.0, smoothstep(0.5, 1.2, u_aspect)) * 0.87;

  float b1 = blob(uv, o1, 1.30 * rScale, 1.4);
  float b2 = blob(uv, o2, 0.85 * rScale, 2.2);
  float b3 = blob(uv, o3, 1.20 * rScale, 1.5);
  float b4 = blob(uv, o4, 1.15 * rScale, 2.0);
  float b5 = blob(uv, o5, 1.00 * rScale, 1.8);
  float b6 = blob(uv, o6, 1.15 * rScale, 1.4);
  float b7 = blob(uv, o7, 1.05 * rScale, 1.4);

  vec3 base    = vec3(0.04, 0.02, 0.09);
  vec3 navy    = vec3(0.05, 0.04, 0.18);
  vec3 indigo  = vec3(0.18, 0.08, 0.42);
  vec3 purple  = vec3(0.35, 0.10, 0.55);
  vec3 magenta = vec3(0.85, 0.15, 0.65);
  vec3 pink    = vec3(0.96, 0.37, 0.75);
  vec3 teal    = vec3(0.15, 0.75, 0.70);
  vec3 amber   = vec3(1.0, 0.9, 0.25);
  vec3 amberEdge = vec3(0.0, 0.90, 0.75);
  vec3 sunset  = vec3(1.0, 0.55, 0.12);

  vec3 col = base;
  col = mix(col, teal,    b1 * 0.85);
  col = mix(col, navy,    b2 * 0.5);
  col = mix(col, indigo,  b3 * 0.55);
  float b4dist = clamp(length((uv - o4) * vec2(u_aspect, 1.0)) / (0.85 * rScale), 0.0, 1.0);
  vec3 amberGrad = mix(amber, amberEdge, smoothstep(0.12, 0.55, b4dist));
  col = mix(col, amberGrad, b4 * 0.85);
  col = mix(col, sunset,  b5 * 0.70);
  col = mix(col, magenta, b6 * 0.40);
  col = mix(col, pink,    b7 * 0.35);

  float midWash = blob(uv, vec2(0.45 + 0.1 * hash(vec2(8.0, u_seed)), 0.40 + 0.2 * hash(vec2(18.0, u_seed))), 1.0, 1.8);
  col = mix(col, purple, midWash * 0.15);

  col = pow(col, vec3(1.7));
  col *= 0.60;

  vec3 vigColor = pow(vec3(0.067, 0.063, 0.137), vec3(2.2));
  float vigDist = length((uv - 0.5) * vec2(u_aspect * 0.55, 1.0));
  float vigMask = smoothstep(0.0, 0.55, vigDist);
  vigMask *= vigMask;
  col = mix(col, vigColor, vigMask * 0.85);

  col = pow(max(col, vec3(0.0)), vec3(1.0 / 2.2));
  gl_FragColor = vec4(col, 1.0);
}
`;

// ── Full desktop shader with ripples, specular, film grain ──
const FRAG = `
precision highp float;

uniform float u_time;
uniform float u_aspect;
uniform float u_seed;
uniform int u_tapCount;
uniform vec4 u_taps[${MAX_TAPS}];
varying vec2 vUv;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  vec2 shift = vec2(100.0);
  for (int i = 0; i < 3; i++) {
    v += a * vnoise(p);
    p = p * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}

float blob(vec2 uv, vec2 pos, float radius, float power, float stretch, float angle) {
  vec2 delta = (uv - pos) * vec2(u_aspect, 1.0);
  float c = cos(angle), s = sin(angle);
  delta = vec2(c * delta.x + s * delta.y, -s * delta.x + c * delta.y);
  delta.x *= stretch;
  float d = length(delta);
  float t = clamp(d / radius, 0.0, 1.0);
  return pow(smoothstep(1.0, 0.2, t), power);
}

#define WAVE_SPEED 0.35
#define WAVE_NUM 32.0
#define DISPERSION 1.0
#define WAVE_OMEGA 10.0
#define AMP 0.014
#define CENTER_R 0.035
#define LIFETIME ${RIPPLE_LIFETIME.toFixed(1)}

float tapWaveAt(vec2 pos, vec4 tap) {
  float age = u_time - tap.z;
  float force = tap.w;
  if (age < 0.0 || age > LIFETIME) return 0.0;
  vec2 delta = pos - tap.xy;
  vec2 corrected = delta * vec2(u_aspect, 1.0);
  float dist = length(corrected);
  float front = age * WAVE_SPEED;
  float behindFront = 1.0 - smoothstep(front - 0.02, front + 0.01, dist);
  float phase = (WAVE_NUM / DISPERSION) * log(1.0 + dist * DISPERSION) - age * WAVE_OMEGA;
  float wave = sin(phase);
  float spatialFade = 1.0 / (1.0 + dist * 3.5);
  float timeFade = exp(-age * 0.8);
  float impact = 1.0 + 3.0 * exp(-age * 5.0);
  float centerMask = smoothstep(0.0, CENTER_R, dist);
  return wave * behindFront * spatialFade * timeFade * impact * centerMask * AMP * force;
}

vec2 rippleDisplace(vec2 uv) {
  vec2 totalDisp = vec2(0.0);
  for (int i = 0; i < ${MAX_TAPS}; i++) {
    if (i >= u_tapCount) break;
    vec4 tap = u_taps[i];
    vec2 delta = uv - tap.xy;
    vec2 dir = length(delta) > 0.001 ? normalize(delta) : vec2(0.0);
    totalDisp += dir * tapWaveAt(uv, tap);
  }
  return totalDisp;
}

float waveHeightAt(vec2 pos) {
  float h = 0.0;
  for (int i = 0; i < ${MAX_TAPS}; i++) {
    if (i >= u_tapCount) break;
    h += tapWaveAt(pos, u_taps[i]);
  }
  return h;
}

void main() {
  vec2 uv = vUv;

  // Ripple UV displacement
  uv += rippleDisplace(uv);

  // Static blob positions — no drift, no warp
  vec2 o1 = vec2(0.20 + 0.55 * hash(vec2(1.0, u_seed)), 0.20 + 0.60 * hash(vec2(11.0, u_seed)));
  vec2 o2 = vec2(0.20 + 0.55 * hash(vec2(2.0, u_seed)), 0.20 + 0.60 * hash(vec2(12.0, u_seed)));
  vec2 o3 = vec2(0.20 + 0.55 * hash(vec2(3.0, u_seed)), 0.20 + 0.60 * hash(vec2(13.0, u_seed)));
  vec2 o4 = vec2(0.20 + 0.55 * hash(vec2(4.0, u_seed)), 0.20 + 0.60 * hash(vec2(14.0, u_seed)));
  vec2 o5 = vec2(0.20 + 0.55 * hash(vec2(5.0, u_seed)), 0.20 + 0.60 * hash(vec2(15.0, u_seed)));
  vec2 o6 = vec2(0.20 + 0.55 * hash(vec2(6.0, u_seed)), 0.20 + 0.60 * hash(vec2(16.0, u_seed)));
  vec2 o7 = vec2(0.20 + 0.55 * hash(vec2(7.0, u_seed)), 0.20 + 0.60 * hash(vec2(17.0, u_seed)));

  float rScale = mix(0.7, 1.0, smoothstep(0.5, 1.2, u_aspect)) * 0.87;

  float b1 = blob(uv, o1, 1.30 * rScale, 1.4, 1.0, 0.0);
  float b2 = blob(uv, o2, 0.85 * rScale, 2.2, 1.0, 0.0);
  float b3 = blob(uv, o3, 1.20 * rScale, 1.5, 1.0, 0.0);
  float b4 = blob(uv, o4, 1.15 * rScale, 2.0, 1.0, 0.0);
  float b5 = blob(uv, o5, 1.00 * rScale, 1.8, 1.0, 0.0);
  float b6 = blob(uv, o6, 1.15 * rScale, 1.4, 1.0, 0.0);
  float b7 = blob(uv, o7, 1.05 * rScale, 1.4, 1.0, 0.0);

  vec3 base    = vec3(0.04, 0.02, 0.09);
  vec3 navy    = vec3(0.05, 0.04, 0.18);
  vec3 indigo  = vec3(0.18, 0.08, 0.42);
  vec3 purple  = vec3(0.35, 0.10, 0.55);
  vec3 magenta = vec3(0.85, 0.15, 0.65);
  vec3 pink    = vec3(0.96, 0.37, 0.75);
  vec3 teal    = vec3(0.15, 0.75, 0.70);
  vec3 amber   = vec3(1.0, 0.9, 0.25);
  vec3 amberEdge = vec3(0.0, 0.90, 0.75);
  vec3 sunset  = vec3(1.0, 0.55, 0.12);

  vec3 col = base;
  col = mix(col, teal,    b1 * 0.85);
  col = mix(col, navy,    b2 * 0.5);
  col = mix(col, indigo,  b3 * 0.55);
  float b4dist = clamp(length((uv - o4) * vec2(u_aspect, 1.0)) / (0.85 * rScale), 0.0, 1.0);
  vec3 amberGrad = mix(amber, amberEdge, smoothstep(0.12, 0.55, b4dist));
  col = mix(col, amberGrad, b4 * 0.85);
  col = mix(col, sunset,  b5 * 0.70);
  col = mix(col, magenta, b6 * 0.40);
  col = mix(col, pink,    b7 * 0.35);

  float midWash = blob(uv, vec2(0.45 + 0.1 * hash(vec2(8.0, u_seed)), 0.40 + 0.2 * hash(vec2(18.0, u_seed))), 1.0, 1.8, 1.0, 0.0);
  col = mix(col, purple, midWash * 0.15);

  // Vignette
  col = pow(col, vec3(1.7));
  col *= 0.60;

  vec3 vigColor = pow(vec3(0.067, 0.063, 0.137), vec3(2.2));
  float vigDist = length((uv - 0.5) * vec2(u_aspect * 0.55, 1.0));
  float vigMask = smoothstep(0.0, 0.55, vigDist);
  vigMask *= vigMask;
  col = mix(col, vigColor, vigMask * 0.85);

  // Ripple specular highlights
  if (u_tapCount > 0) {
    float eps = 0.006;
    float h  = waveHeightAt(vUv);
    float hx = waveHeightAt(vUv + vec2(eps, 0.0));
    float hy = waveHeightAt(vUv + vec2(0.0, eps));
    float dx = (hx - h) / eps;
    float dy = (hy - h) / eps;
    vec3 normal = normalize(vec3(-dx, -dy, 1.0));
    vec3 lightDir = normalize(vec3(-0.3, 0.5, 1.0));
    vec3 viewDir  = vec3(0.0, 0.0, 1.0);
    vec3 halfVec  = normalize(lightDir + viewDir);
    float diffuse = dot(normal, lightDir) * 0.5 + 0.5;
    float spec = pow(max(dot(normal, halfVec), 0.0), 80.0);
    float heightBased = abs(h) * 50.0;
    float gradBased = sqrt(length(vec2(dx, dy))) * 3.0;
    float waveStrength = clamp(heightBased + gradBased * 0.25, 0.0, 1.0);
    col *= mix(1.0, 0.90 + 0.20 * diffuse, waveStrength);
    col += col * spec * 0.5 * waveStrength;
  }

  // Film grain
  float grain = (hash(gl_FragCoord.xy + u_time * 0.1) - 0.5) * 0.018;
  col += grain;

  // Gamma correction
  col = pow(max(col, vec3(0.0)), vec3(1.0 / 2.2));

  gl_FragColor = vec4(col, 1.0);
}
`;

let gl = null;
let program = null;
let uniforms = {};
let taps = [];
let startTime = 0;
let seed = Math.random() * 1000;
let animId = 0;
let autoRippleTimer = null;
let needsInitialRender = true;

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function init(canvas) {
  gl = canvas.getContext("webgl", { alpha: false, antialias: false });
  if (!gl) return;

  const vs = compileShader(gl, gl.VERTEX_SHADER, VERT);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, isMobile ? FRAG_MOBILE : FRAG);
  if (!vs || !fs) return;

  program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.useProgram(program);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  );
  const posLoc = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  uniforms = {
    time: gl.getUniformLocation(program, "u_time"),
    aspect: gl.getUniformLocation(program, "u_aspect"),
    seed: gl.getUniformLocation(program, "u_seed"),
    tapCount: gl.getUniformLocation(program, "u_tapCount"),
    taps: [],
  };
  for (let i = 0; i < MAX_TAPS; i++) {
    uniforms.taps.push(gl.getUniformLocation(program, `u_taps[${i}]`));
  }

  startTime = performance.now();
  renderOnce();

  if (!isMobile) {
    animId = requestAnimationFrame(renderLoop);
  }
}

function resize() {
  if (!canvasRef.value || !gl) return;
  const canvas = canvasRef.value;
  const dpr = Math.min(window.devicePixelRatio, isMobile ? 1 : 2);
  const w = canvas.clientWidth * dpr;
  const h = canvas.clientHeight * dpr;
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    return true;
  }
  return false;
}

// Single-frame draw — used by mobile and as the initial frame for desktop
function renderOnce() {
  if (!gl || !program) return;
  resize();

  const aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;

  gl.uniform1f(uniforms.aspect, aspect);
  gl.uniform1f(uniforms.seed, seed);

  if (!isMobile) {
    const elapsed = (performance.now() - startTime) / 1000;
    gl.uniform1f(uniforms.time, elapsed);
    gl.uniform1i(uniforms.tapCount, taps.length);
    for (let i = 0; i < MAX_TAPS; i++) {
      if (i < taps.length) {
        const t = taps[i];
        gl.uniform4f(uniforms.taps[i], t.x, t.y, t.time, t.force);
      } else {
        gl.uniform4f(uniforms.taps[i], 0, 0, 0, 0);
      }
    }
  }

  gl.drawArrays(gl.TRIANGLES, 0, 6);
  if (!ready) {
    ready = true;
    if (!isMobile && canvasRef.value) {
      canvasRef.value.style.opacity = '1';
    }
  }
}

// Desktop-only continuous loop — only draws when ripples are active or resize happened
function renderLoop() {
  if (!gl || !program) return;
  const resized = resize();

  const elapsed = (performance.now() - startTime) / 1000;
  taps = taps.filter((t) => elapsed - t.time < RIPPLE_LIFETIME);

  const hasRipples = taps.length > 0;
  if (!hasRipples && !needsInitialRender && !resized) {
    animId = requestAnimationFrame(renderLoop);
    return;
  }
  needsInitialRender = false;

  const aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;

  gl.uniform1f(uniforms.time, elapsed);
  gl.uniform1f(uniforms.aspect, aspect);
  gl.uniform1f(uniforms.seed, seed);
  gl.uniform1i(uniforms.tapCount, taps.length);

  for (let i = 0; i < MAX_TAPS; i++) {
    if (i < taps.length) {
      const t = taps[i];
      gl.uniform4f(uniforms.taps[i], t.x, t.y, t.time, t.force);
    } else {
      gl.uniform4f(uniforms.taps[i], 0, 0, 0, 0);
    }
  }

  gl.drawArrays(gl.TRIANGLES, 0, 6);
  if (!ready) {
    ready = true;
    if (canvasRef.value) {
      canvasRef.value.style.opacity = '1';
    }
  }
  animId = requestAnimationFrame(renderLoop);
}

function spawnRandomRipple() {
  const x = 0.1 + Math.random() * 0.8;
  const y = 0.1 + Math.random() * 0.8;
  const elapsed = (performance.now() - startTime) / 1000;
  taps.push({ x, y, time: elapsed, force: 0.8 + Math.random() * 0.4 });
  while (taps.length > MAX_TAPS) taps.shift();
  needsInitialRender = true;
}

function scheduleNextRipple() {
  const delay = 2000 + Math.random() * 4000;
  autoRippleTimer = setTimeout(() => {
    spawnRandomRipple();
    scheduleNextRipple();
  }, delay);
}

function handleResize() {
  if (isMobile && gl && program) renderOnce();
}

onMounted(() => {
  if (!canvasRef.value) return;

  const canvas = canvasRef.value;

  // Apply fade-in setup client-side only (avoids SSR hydration mismatch)
  if (!isMobile) {
    canvas.style.opacity = '0';
    canvas.style.transition = 'opacity 3000ms ease-in';
  }

  window.addEventListener("resize", isMobile ? handleResize : resize);

  if (isMobile) {
    const ric = window.requestIdleCallback || ((cb) => setTimeout(cb, 200));
    ric(() => { if (canvasRef.value) init(canvas); });
  } else {
    init(canvas);
    scheduleNextRipple();
  }
});

onBeforeUnmount(() => {
  cancelAnimationFrame(animId);
  clearTimeout(autoRippleTimer);
  window.removeEventListener("resize", isMobile ? handleResize : resize);
});
</script>
