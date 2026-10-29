/**
 * GLSL sources for the reference-library WebGL home blocks that draw a
 * single fullscreen clip-space quad (no depth, no lighting). The fragment
 * shader is the exact fBm dissolve from the original Second Skin reference:
 * a horizontal dissolve line at uv.y = uProgress*1.2 perturbed by 3-octave
 * value noise (frequency x15, spread 0.5) — below the line the fill colour
 * is opaque, above it the shader is transparent (alpha:true renderer).
 */

export const dissolveVertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const dissolveFragmentShader = /* glsl */ `
uniform float uProgress;
uniform vec2  uResolution;
uniform vec3  uColor;
uniform float uSpread;
varying vec2  vUv;

float Hash(vec2 p) {
  vec3 p2 = vec3(p.xy, 1.0);
  return fract(sin(dot(p2, vec3(37.1, 61.7, 12.4))) * 3758.5453123);
}

float noise(in vec2 p) {           // smoothed value noise
  vec2 i = floor(p);
  vec2 f = fract(p);
  f *= f * (3.0 - 2.0 * f);        // smoothstep interpolation
  return mix(
    mix(Hash(i + vec2(0.0, 0.0)), Hash(i + vec2(1.0, 0.0)), f.x),
    mix(Hash(i + vec2(0.0, 1.0)), Hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {                // 3 octaves, 0.5 / 0.25 / 0.125
  float v = 0.0;
  v += noise(p * 1.0) * 0.5;
  v += noise(p * 2.0) * 0.25;
  v += noise(p * 4.0) * 0.125;
  return v;
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / uResolution.y;
  vec2 centeredUv = (uv - 0.5) * vec2(aspect, 1.0); // aspect-correct so noise cells stay square

  float dissolveEdge = uv.y - uProgress * 1.2;      // edge rises as progress grows
  float noiseValue   = fbm(centeredUv * 15.0);      // noise frequency x15 -> fine ragged detail
  float d            = dissolveEdge + noiseValue * uSpread;

  float pixelSize = 1.0 / uResolution.y;
  float alpha = 1.0 - smoothstep(-pixelSize, pixelSize, d); // d<0 -> filled, d>0 -> transparent

  gl_FragColor = vec4(uColor, alpha);
}
`;
