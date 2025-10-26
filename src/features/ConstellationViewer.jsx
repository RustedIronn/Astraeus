import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import constellationLines from "../constellationLines_mainConnected.json";

export default function ConstellationViewer({ stars = [], selectedStar }) {
  const groupRef = useRef();
  const opacity = useRef(0);
  const glowRef = useRef();

  // 🗺️ Map stars by HIP
  const hipMap = useMemo(() => {
    const map = new Map();
    for (const s of stars) {
      if (s.hip && s.x != null && s.y != null && s.z != null)
        map.set(String(s.hip), s);
    }
    return map;
  }, [stars]);

  // 🌠 Get constellation line pairs
  const linePairs = useMemo(() => {
    if (!selectedStar?.con) return [];
    const lines = constellationLines[selectedStar.con.toUpperCase()];
    if (!lines) return [];
    return lines
      .map(([a, b]) => [hipMap.get(String(a)), hipMap.get(String(b))])
      .filter(([s1, s2]) => s1 && s2);
  }, [selectedStar, hipMap]);

  // ✨ Build line geometry
  const lineSegments = useMemo(() => {
    if (!linePairs.length) return null;
    const positions = new Float32Array(linePairs.length * 6);
    linePairs.forEach(([s1, s2], i) => {
      const base = i * 6;
      positions.set([s1.x, s1.y, s1.z, s2.x, s2.y, s2.z], base);
    });
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });

    const lines = new THREE.LineSegments(geom, mat);
    lines.frustumCulled = false;
    return lines;
  }, [linePairs]);

  // 🌈 Fade in/out
  useFrame((_, delta) => {
    if (!groupRef.current?.children[0]) return;
    const target = selectedStar ? 0.8 : 0;
    opacity.current = THREE.MathUtils.lerp(opacity.current, target, delta * 3);
    groupRef.current.children[0].material.opacity = opacity.current;
  });

  // 🪩 Glow animation
  useFrame(({ clock }) => {
    if (glowRef.current) {
      const t = clock.elapsedTime;
      const pulse = 1.05 + Math.sin(t * 2) * 0.05;
      glowRef.current.scale.setScalar(pulse);
      glowRef.current.material.opacity = 0.2 + Math.sin(t * 2) * 0.1;
    }
  });

  // 🎯 Center glow
  const center = useMemo(() => {
    if (!linePairs.length) return new THREE.Vector3();
    const all = linePairs.flat();
    const sum = all.reduce(
      (a, s) => ({ x: a.x + s.x, y: a.y + s.y, z: a.z + s.z }),
      { x: 0, y: 0, z: 0 }
    );
    const n = all.length;
    return new THREE.Vector3(sum.x / n, sum.y / n, sum.z / n);
  }, [linePairs]);

  if (!lineSegments) return null;

  return (
    <group ref={groupRef}>
      <primitive object={lineSegments} key={selectedStar?.con} />
      <mesh ref={glowRef} position={center}>
        <sphereGeometry args={[12, 32, 32]} />
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
