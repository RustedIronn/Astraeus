import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

const colorCache = new Map();
function spectralToColor(spectral) {
  const type = spectral?.trim()?.[0]?.toUpperCase() ?? "G";
  if (!colorCache.has(type)) {
    const map = {
      O: "#66CCFF",
      B: "#88CCFF",
      A: "#CFE9FF",
      F: "#FFF1C1",
      G: "#FFD87C",
      K: "#FF9B53",
      M: "#FF5540",
      L: "#D85B8F",
      T: "#A97AFF",
      Y: "#7C5CFF",
    };
    colorCache.set(type, new THREE.Color(map[type] || "#ffffff"));
  }
  return colorCache.get(type).clone();
}

function StarField({ stars, pointsRef, selectedStar, onStarClick }) {
  const { camera, gl } = useThree();
  const raycasterRef = useRef(new THREE.Raycaster());

  // 🪐 Generate geometry data
  const { positions, colors, sizes, offsets } = useMemo(() => {
    const pos = new Float32Array(stars.length * 3);
    const col = new Float32Array(stars.length * 3);
    const siz = new Float32Array(stars.length);
    const off = new Float32Array(stars.length);

    stars.forEach((s, i) => {
      pos[i * 3] = s.x;
      pos[i * 3 + 1] = s.y;
      pos[i * 3 + 2] = s.z;

      const brightness = THREE.MathUtils.clamp(2.0 - s.mag * 0.25, 0.4, 2.8);
      const c = spectralToColor(s.spect).multiplyScalar(brightness);

      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;

      siz[i] = THREE.MathUtils.clamp(14 - s.mag * 1.2, 3, 12);

      const hash = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
      off[i] = hash - Math.floor(hash);
    });

    return { positions: pos, colors: col, sizes: siz, offsets: off };
  }, [stars]);

  // 🌌 Star shaders
  const vertexShader = `
    attribute float size;
    attribute float offset;
    varying vec3 vColor;
    uniform float uTime;
    void main() {
      vColor = color;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      float twinkle = 0.85 + 0.35 * sin(uTime * 3.0 + offset * 6.283);
      gl_PointSize = size * twinkle * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    varying vec3 vColor;
    void main() {
      float d = length(gl_PointCoord - vec2(0.5));
      if (d > 0.5) discard;
      float core = pow(smoothstep(0.25, 0.0, d), 1.6);
      float glow = smoothstep(0.45, 0.1, d);
      vec3 tint = vec3(0.04, 0.03, 0.01);
      vec3 color = vColor + tint * (1.0 - d * 2.0);
      float aa = fwidth(d) * 1.5;
      float softAlpha = smoothstep(0.5, 0.5 - aa, d);
      gl_FragColor = vec4(color * (core * 1.6 + glow * 0.9), softAlpha * (1.0 - d * 0.3));
    }
  `;

  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geom.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    geom.setAttribute("offset", new THREE.BufferAttribute(offsets, 1));
    return geom;
  }, [positions, colors, sizes, offsets]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthTest: true,
        depthWrite: false,
        uniforms: { uTime: { value: 0 } },
      }),
    []
  );

  const pulseRef = useRef(null);
  const rippleRef = useRef(null);
  const selectedGroupRef = useRef();

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    const t = state.clock.elapsedTime;

    if (pulseRef.current) {
      const s = 1.1 + Math.sin(t * 2.0) * 0.08;
      pulseRef.current.scale.set(s, s, s);
    }

    if (rippleRef.current) {
      const rippleScale = 1.5 + Math.sin(t * 1.3) * 0.25;
      rippleRef.current.scale.set(rippleScale, rippleScale, rippleScale);
      rippleRef.current.material.opacity = 0.25 + Math.sin(t * 1.3) * 0.15;
    }

    if (selectedGroupRef.current) {
      const shimmer = selectedGroupRef.current.getObjectByName("shimmer");
      if (shimmer) shimmer.rotation.y = t * 0.2;
    }
  });

  // 🔍 Click to select
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
        if (index !== undefined && stars[index]) onStarClick?.(stars[index]);
      }
    };

    gl.domElement.addEventListener("click", handleClick);
    return () => gl.domElement.removeEventListener("click", handleClick);
  }, [stars, camera, gl, pointsRef, onStarClick]);

  // ✨ Update selection visuals
  useEffect(() => {
    const g = selectedGroupRef.current;
    if (!g) return;
    if (!selectedStar) {
      g.visible = false;
      return;
    }

    const color = spectralToColor(selectedStar.spect);
    g.position.set(selectedStar.x, selectedStar.y, selectedStar.z);
    g.visible = true;
    g.children.forEach((child) => {
      if (child.material) child.material.color = color.clone();
    });
  }, [selectedStar]);

  return (
    <>
      <points ref={pointsRef} geometry={geometry} material={material} />
      <ambientLight intensity={0.4} color="#b2d8ff" />
      <pointLight position={[0, 0, 0]} intensity={1} color="#ffffff" />

      {/* ✴️ Selection highlight */}
      <group ref={selectedGroupRef} visible={false}>
        <mesh>
          <sphereGeometry args={[2.2, 64, 64]} />
          <meshStandardMaterial emissiveIntensity={1.2} metalness={0.3} roughness={0.25} />
        </mesh>

        {/* Pulsing glow */}
        <mesh ref={pulseRef}>
          <sphereGeometry args={[3.5, 64, 64]} />
          <meshBasicMaterial
            transparent
            opacity={0.5}
            blending={THREE.AdditiveBlending}
            depthWrite={true}
            depthTest={true}
            side={THREE.FrontSide}
          />
        </mesh>

        {/* Ripple sphere */}
        <mesh ref={rippleRef}>
          <sphereGeometry args={[5.5, 64, 64]} />
          <meshBasicMaterial
            transparent
            opacity={0.2}
            blending={THREE.AdditiveBlending}
            depthWrite={true}
            depthTest={true}
            side={THREE.FrontSide}
          />
        </mesh>

        {/* Shimmer particles */}
        <group name="shimmer">
          {Array.from({ length: 16 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                Math.cos((i / 16) * Math.PI * 2) * (7.5 + (i % 2) * 0.5),
                Math.sin((i / 16) * Math.PI * 2) * (7.5 + ((i + 1) % 3) * 0.3),
                Math.sin((i / 16) * Math.PI * 2) * 0.6,
              ]}
            >
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshBasicMaterial
                transparent
                opacity={0.8}
                blending={THREE.AdditiveBlending}
                depthWrite={true}
                depthTest={true}
              />
            </mesh>
          ))}
        </group>
      </group>
    </>
  );
}

export default React.memo(StarField);
