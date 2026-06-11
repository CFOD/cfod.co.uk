import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * ─── HeroCanvas ──────────────────────────────────────────────────────────────
 * A low, drifting particle terrain rendered with a custom shader:
 *  - ~21k points on a wide grid, displaced by two octaves of simplex noise
 *  - the pointer lifts and tints a soft patch of the field (uMouse)
 *  - edges fade out so the field melts into the page background
 *
 * The accent colour is read from the CSS variable --accent at mount, so
 * re-theming the site automatically re-themes the shader.
 *
 * This file is lazy-loaded (see Hero.jsx) so three.js ships as its own chunk.
 */

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;       // world-space x,z of the pointer target
  uniform float uPixelRatio;

  attribute float aScale;

  varying float vGlow;
  varying float vFade;

  // Ashima 2D simplex noise (public domain)
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec3 pos = position;

    // Two octaves of drifting noise displace the terrain vertically.
    float n = snoise(pos.xz * 0.16 + uTime * 0.05) * 0.9
            + snoise(pos.xz * 0.42 - uTime * 0.03) * 0.35;
    pos.y += n;

    // Pointer lift: gaussian bump centred on uMouse.
    float d2 = dot(pos.xz - uMouse, pos.xz - uMouse);
    float lift = exp(-d2 * 0.16);
    pos.y += lift * 0.9;
    vGlow = lift;

    // Fade the field out toward its edges.
    float fx = 1.0 - smoothstep(8.5, 13.0, abs(pos.x));
    float fz = 1.0 - smoothstep(4.5, 8.0, abs(pos.z));
    vFade = fx * fz;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aScale * uPixelRatio * (34.0 / -mv.z);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uAccent;

  varying float vGlow;
  varying float vFade;

  void main() {
    // Soft round point sprite.
    float d = length(gl_PointCoord - 0.5);
    float disc = 1.0 - smoothstep(0.32, 0.5, d);
    if (disc < 0.01) discard;

    float alpha = disc * (0.16 + vGlow * 0.75) * vFade;
    vec3 color = mix(uBase, uAccent, clamp(vGlow * 1.4, 0.0, 1.0));
    gl_FragColor = vec4(color, alpha);
  }
`;

function readAccent() {
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue('--accent')
    .trim();
  return v || '#c6ff4e';
}

function Field() {
  const matRef = useRef(null);
  const mouseTarget = useRef(new THREE.Vector2(0, 0));
  const { camera } = useThree();

  const { geometry, uniforms } = useMemo(() => {
    const cols = 190;
    const rows = 110;
    const count = cols * rows;
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);

    let i = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = (c / (cols - 1) - 0.5) * 26 + (Math.random() - 0.5) * 0.12;
        const z = (r / (rows - 1) - 0.5) * 16 + (Math.random() - 0.5) * 0.12;
        positions[i * 3 + 0] = x;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = z;
        scales[i] = 0.5 + Math.random();
        i++;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));

    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uBase: { value: new THREE.Color('#aab2bd') },
      uAccent: { value: new THREE.Color(readAccent()) },
    };

    return { geometry, uniforms };
  }, []);

  useFrame((state, delta) => {
    const mat = matRef.current;
    if (!mat) return;

    mat.uniforms.uTime.value += Math.min(delta, 0.05);

    // Map normalized pointer (-1..1) into the field's world space.
    mouseTarget.current.set(state.pointer.x * 11, 2.2 - state.pointer.y * 5.5);
    mat.uniforms.uMouse.value.lerp(mouseTarget.current, 0.055);

    // Subtle camera parallax.
    camera.position.x += (state.pointer.x * 0.6 - camera.position.x) * 0.04;
    camera.position.y += (3.1 + state.pointer.y * 0.25 - camera.position.y) * 0.04;
    camera.lookAt(0, 0.4, 0);
  });

  // Dispose GPU resources on unmount.
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function HeroCanvas({ active }) {
  return (
    <Canvas
      className="hero-canvas"
      dpr={[1, 2]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 3.1, 9.2], fov: 40, near: 0.1, far: 60 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
    >
      <Field />
    </Canvas>
  );
}
