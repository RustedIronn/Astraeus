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
  const { positions, colors, sizes } = useMemo(() => {
    const pos = new Float32Array(stars.length * 3);
    const col = new Float32Array(stars.length * 3);
    const siz = new Float32Array(stars.length);

    stars.forEach((s, i) => {
      pos[i * 3] = s.x;
      pos[i * 3 + 1] = s.y;
      pos[i * 3 + 2] = s.z;

      const brightness = THREE.MathUtils.clamp(2.0 - s.mag * 0.25, 0.4, 2.5);
      const c = bvToRGB(s.bv).multiplyScalar(brightness);

      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;

      // ✅ larger min size so faint stars always show
      siz[i] = THREE.MathUtils.clamp(14 - s.mag * 1.5, 2, 14);
    });

    return { positions: pos, colors: col, sizes: siz };
  }, [stars]);

  const materialRef = useRef();

  // ✅ Animate twinkle
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  // ✅ Ensure raycasting works
  useEffect(() => {
    if (pointsRef.current) {
      pointsRef.current.raycast = THREE.Points.prototype.raycast;
    }
  }, [pointsRef]);

  const vertexShader = `
    attribute float size;
    varying vec3 vColor;
    uniform float uTime;
    void main() {
      vColor = color;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      float twinkle = sin(uTime * 3.0 + position.x * 0.1 + position.y * 0.1) * 0.3 + 1.0;
      gl_PointSize = size * twinkle * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    varying vec3 vColor;
    void main() {
      float d = length(gl_PointCoord - vec2(0.5));
      if (d > 0.5) discard;
      float alpha = 1.0 - smoothstep(0.0, 0.5, d);
      gl_FragColor = vec4(vColor, alpha);
    }
  `;

  return (
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
  );
}
