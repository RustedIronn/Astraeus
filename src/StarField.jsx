import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

function bvToRGB(bv) {
  let t;
  if (bv < -0.4) bv = -0.4;
  if (bv > 2.0) bv = 2.0;

  if (bv < 0.0) {
    t = (bv + 0.4) / 0.4;
    return new THREE.Color(0.61 + 0.11 * t, 0.70 + 0.07 * t, 1.0);
  } else if (bv < 0.4) {
    t = bv / 0.4;
    return new THREE.Color(0.72 - 0.11 * t, 0.77 - 0.07 * t, 1.0 - 0.24 * t);
  } else if (bv < 1.5) {
    t = (bv - 0.4) / 1.1;
    return new THREE.Color(0.61 - 0.19 * t, 0.70 - 0.07 * t, 0.76 - 0.41 * t);
  } else {
    t = (bv - 1.5) / 0.5;
    return new THREE.Color(0.42 - 0.42 * t, 0.63 - 0.14 * t, 0.35 - 0.35 * t);
  }
}

export default function StarField({ stars, pointsRef, selectedStar }) {
  // ✅ Precompute attributes
  const { positions, colors, sizes } = useMemo(() => {
    const pos = new Float32Array(stars.length * 3);
    const col = new Float32Array(stars.length * 3);
    const siz = new Float32Array(stars.length);

    stars.forEach((s, i) => {
      pos[i * 3] = s.x;
      pos[i * 3 + 1] = s.y;
      pos[i * 3 + 2] = s.z;

      const brightness = THREE.MathUtils.clamp(2.0 - s.mag * 0.25, 0.3, 2.5);
      const c = bvToRGB(s.bv).multiplyScalar(brightness);

      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;

      siz[i] = THREE.MathUtils.clamp(14 - s.mag * 1.5, 2, 12);
    });

    return { positions: pos, colors: col, sizes: siz };
  }, [stars]);

  // ✅ Shaders
  const vertexShader = `
    attribute float size;
    varying vec3 vColor;
    uniform float uTime;

    void main() {
      vColor = color;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

      float twinkle = 0.8 + 0.4 * sin(uTime * 3.0 + position.x * 0.2 + position.y * 0.3);

      gl_PointSize = size * twinkle * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    varying vec3 vColor;
    void main() {
      float d = length(gl_PointCoord - vec2(0.5));
      if (d > 0.5) discard;

      float star = smoothstep(0.5, 0.0, d);
      float glow = exp(-12.0 * d * d);

      vec3 color = vColor * (star + glow);
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const materialRef = useRef();
  const pulseRef = useRef({ mesh: null });
  const pausedTime = useRef(0); // stores frozen time when paused

  // ✅ Animate
  useFrame((state) => {
    if (materialRef.current) {
      if (selectedStar) {
        // freeze animation by keeping last time
        if (pausedTime.current === 0) {
          pausedTime.current = state.clock.elapsedTime;
        }
        materialRef.current.uniforms.uTime.value = pausedTime.current;
      } else {
        // resume normal animation
        pausedTime.current = 0;
        materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      }
    }

    if (pulseRef.current.mesh) {
      const pulse = 1.2 + Math.sin(state.clock.elapsedTime * 2.0) * 0.2;
      pulseRef.current.mesh.scale.set(pulse, pulse, pulse);
    }
  });

  // ✅ Restore clicking
  useEffect(() => {
    if (pointsRef.current) {
      pointsRef.current.raycast = THREE.Points.prototype.raycast;
    }
  }, [pointsRef]);

  return (
    <>
      {/* ⭐ Stars (with pause/resume animation) */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={positions}
            count={positions.length / 3}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            array={colors}
            count={colors.length / 3}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            array={sizes}
            count={sizes.length}
            itemSize={1}
          />
        </bufferGeometry>
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          vertexColors
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          uniforms={{ uTime: { value: 0 } }}
        />
      </points>

      {/* 🔥 Highlight for selected star */}
      {selectedStar && (
        <group position={[selectedStar.x, selectedStar.y, selectedStar.z]}>
          <mesh>
            <sphereGeometry args={[3, 32, 32]} />
            <meshBasicMaterial color="yellow" />
          </mesh>

          <mesh ref={(el) => (pulseRef.current.mesh = el)}>
            <sphereGeometry args={[6, 32, 32]} />
            <meshBasicMaterial
              color="yellow"
              transparent
              opacity={0.35}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>

          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[7, 8, 64]} />
            <meshBasicMaterial
              color="yellow"
              side={THREE.DoubleSide}
              transparent
              opacity={0.6}
            />
          </mesh>
        </group>
      )}
    </>
  );
}
