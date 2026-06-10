import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * ─── HeroCanvas ──────────────────────────────────────────────────────────────
 * Dust motes drifting through a shaft of light — the air of an old reading
 * room. A custom shader renders ~1,100 soft points that:
 *  - drift slowly sideways and upward, wrapping around the field
 *  - brighten and warm to gold inside a diagonal beam (matching the CSS
 *    .hero-shaft gradient layered above the canvas)
 *  - shimmer faintly near the pointer, with gentle camera parallax
 *
 * The gold is read from the CSS variable --accent at mount, so re-theming
 * the site automatically re-themes the dust.
 *
 * This file is lazy-loaded (see Hero.jsx) so three.js ships as its own chunk.
 */

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;       // world-space x,y of the pointer target
  uniform float uPixelRatio;

  attribute float aScale;
  attribute float aSeed;
  attribute float aDrift;

  varying float vBeam;
  varying float vGlow;
  varying float vTwinkle;
  varying float vFade;

  void main() {
    vec3 pos = position;
    float t = uTime;

    // Slow lateral drift + slow rise, both wrapping across the field box.
    pos.x = mod(pos.x + aDrift * t, 18.0) - 9.0;
    pos.y = mod(pos.y + 5.0 + t * (0.05 + aSeed * 0.06), 11.0) - 5.0;

    // Gentle, individual bobbing.
    pos.x += sin(t * 0.45 + aSeed * 9.0) * 0.12;
    pos.y += sin(t * 0.6 + aSeed * 6.2831) * 0.16;

    // The shaft of light: distance from a diagonal line in the xy plane.
    vec2 n = normalize(vec2(1.0, -0.5));
    float d = dot(pos.xy - vec2(1.2, 0.4), n);
    vBeam = exp(-d * d * 0.5);

    // Faint shimmer near the pointer.
    vec2 m = pos.xy - uMouse;
    vGlow = exp(-dot(m, m) * 0.8) * 0.55;

    // Each mote breathes on its own slow cycle.
    vTwinkle = 0.72 + 0.28 * sin(t * 1.3 + aSeed * 12.566);

    // Fade out near the wrap edges so motes never pop in or out.
    float fx = 1.0 - smoothstep(7.6, 9.0, abs(pos.x));
    float fy = 1.0 - smoothstep(4.4, 5.5, abs(pos.y - 0.5));
    vFade = fx * fy;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aScale * uPixelRatio * (30.0 / -mv.z);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uGold;

  varying float vBeam;
  varying float vGlow;
  varying float vTwinkle;
  varying float vFade;

  void main() {
    // Very soft round sprite — out-of-focus dust, not a hard dot.
    float d = length(gl_PointCoord - 0.5);
    float disc = 1.0 - smoothstep(0.12, 0.5, d);
    if (disc < 0.01) discard;

    float alpha = disc * (0.05 + vBeam * 0.4 + vGlow * 0.35) * vTwinkle * vFade;
    vec3 color = mix(uBase, uGold, clamp(vBeam * 0.85 + vGlow * 0.7, 0.0, 1.0));
    gl_FragColor = vec4(color, alpha);
  }
`;

function readAccent() {
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue('--accent')
    .trim();
  return v || '#c8a45c';
}

function Dust() {
  const matRef = useRef(null);
  const mouseTarget = useRef(new THREE.Vector2(0, 0));
  const { camera } = useThree();

  const { geometry, uniforms } = useMemo(() => {
    const count = 1100;
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const seeds = new Float32Array(count);
    const drifts = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 18; // x ∈ [-9, 9]
      positions[i * 3 + 1] = -5 + Math.random() * 11; //    y ∈ [-5, 6]
      positions[i * 3 + 2] = (Math.random() - 0.5) * 7; //  z ∈ [-3.5, 3.5]

      // Mostly fine specks, with a few large soft bokeh motes.
      scales[i] = 0.5 + Math.pow(Math.random(), 3) * 2.6;
      seeds[i] = Math.random();
      drifts[i] = 0.08 + Math.random() * 0.22;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    geometry.setAttribute('aDrift', new THREE.BufferAttribute(drifts, 1));

    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uBase: { value: new THREE.Color('#a89a80') }, // warm parchment grey
      uGold: { value: new THREE.Color(readAccent()) },
    };

    return { geometry, uniforms };
  }, []);

  useFrame((state, delta) => {
    const mat = matRef.current;
    if (!mat) return;

    mat.uniforms.uTime.value += Math.min(delta, 0.05);

    // Map normalized pointer (-1..1) into the dust field's world space.
    mouseTarget.current.set(state.pointer.x * 5.5, state.pointer.y * 3.2);
    mat.uniforms.uMouse.value.lerp(mouseTarget.current, 0.05);

    // Subtle camera parallax — leaning toward the light.
    camera.position.x += (state.pointer.x * 0.5 - camera.position.x) * 0.04;
    camera.position.y += (0.35 + state.pointer.y * 0.3 - camera.position.y) * 0.04;
    camera.lookAt(0, 0.3, 0);
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
      camera={{ position: [0, 0.4, 8.5], fov: 38, near: 0.1, far: 40 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
    >
      <Dust />
    </Canvas>
  );
}
