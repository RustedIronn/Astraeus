import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

// 🎨 Extended palette for spectral classes
function spectralToColor(spectral) {
  if (!spectral || typeof spectral !== "string") return new THREE.Color("#ffffff");
  const type = spectral.trim().charAt(0).toUpperCase();
  switch (type) {
    case "O": return new THREE.Color("#6f9eff"); // blue-violet
    case "B": return new THREE.Color("#8cb4ff"); // bright blue
    case "A": return new THREE.Color("#b5e0ff"); // cyan-white
    case "F": return new THREE.Color("#f8f7ff"); // soft white
    case "G": return new THREE.Color("#ffe6c7"); // warm yellow
    case "K": return new THREE.Color("#ffb06b"); // amber
    case "M": return new THREE.Color("#ff6f61"); // deep red-orange
    case "L": return new THREE.Color("#d64b4b"); // crimson
    case "T": return new THREE.Color("#a855f7"); // magenta-violet
    case "Y": return new THREE.Color("#6b21a8"); // dark purple
    default:  return new THREE.Color("#ffffff"); // fallback white
  }
}

export default function StarField({ stars, pointsRef, selectedStar, onStarClick }) {
  const { camera, gl } = useThree();
  const raycasterRef = useRef(new THREE.Raycaster());

  const { positions, colors, sizes } = useMemo(() => {
    const pos = new Float32Array(stars.length * 3);
    const col = new Float32Array(stars.length * 3);
    const siz = new Float32Array(stars.length);

    stars.forEach((s, i) => {
      pos[i * 3] = s.x;
      pos[i * 3 + 1] = s.y;
      pos[i * 3 + 2] = s.z;

      const brightness = THREE.MathUtils.clamp(2.0 - s.mag * 0.25, 0.4, 2.8);
      const c = spectralToColor(s.spect).multiplyScalar(brightness);

      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;

      siz[i] = THREE.MathUtils.clamp(14 - s.mag * 1.5, 2, 12);
    });

    return { positions: pos, colors: col, sizes: siz };
  }, [stars]);

  const vertexShader = `
    attribute float size;
    varying vec3 vColor;
    uniform float uTime;
    void main() {
      vColor = color;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      float twinkle = 0.85 + 0.35 * sin(uTime * 3.0 + position.x * 0.25 + position.y * 0.25);
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
      float glow = exp(-10.0 * d * d);
      vec3 color = vColor * (star + glow);
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const materialRef = useRef();
  const pulseRef = useRef({ mesh: null });

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
    if (pulseRef.current.mesh) {
      const pulse = 1.15 + Math.sin(state.clock.elapsedTime * 2.0) * 0.25;
      pulseRef.current.mesh.scale.set(pulse, pulse, pulse);
    }
  });

  // Setup raycasting + click
  useEffect(() => {
    if (!pointsRef.current) return;
    pointsRef.current.raycast = THREE.Points.prototype.raycast;

    const handleClick = (event) => {
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.params.Points.threshold = 3;
      raycasterRef.current.setFromCamera({ x, y }, camera);

      const intersects = raycasterRef.current.intersectObject(pointsRef.current);
      if (intersects.length > 0) {
        const index = intersects[0].index;
        if (index !== undefined && stars[index]) {
          onStarClick?.(stars[index]); // 🔥 callback to parent
        }
      }
    };

    gl.domElement.addEventListener("click", handleClick);
    return () => gl.domElement.removeEventListener("click", handleClick);
  }, [stars, camera, gl, pointsRef, onStarClick]);

  return (
    <>
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
