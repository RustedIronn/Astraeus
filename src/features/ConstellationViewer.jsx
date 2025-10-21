import * as THREE from "three";
import { useMemo, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import constellationLines from "../constellationLines.json";

export default function ConstellationViewer({ stars = [], selectedStar }) {
  const groupRef = useRef();
  const opacityRef = useRef({ value: 0 });

  // 🗺️ Create HIP map
  const hipMap = useMemo(() => {
    const map = new Map();
    for (const s of stars) {
      const hip = String(s.hip).trim();
      if (hip && s.x != null && s.y != null && s.z != null) map.set(hip, s);
    }
    return map;
  }, [stars]);

  // 🌠 Collect valid line pairs
  const linePairs = useMemo(() => {
    if (!selectedStar?.con) return [];
    const key = selectedStar.con.toUpperCase();
    const data = constellationLines[key];
    if (!data) {
      console.warn("❌ No constellation data for:", key);
      return [];
    }

    const pairs = [];
    for (const [a, b] of data) {
      const s1 = hipMap.get(String(a));
      const s2 = hipMap.get(String(b));
      if (s1 && s2) pairs.push([s1, s2]);
    }

    console.log(
      `⭐ Selected: ${selectedStar.con} | Lines in dataset: ${data.length} | Renderable pairs: ${pairs.length}`
    );
    return pairs;
  }, [selectedStar, hipMap]);

  // ✨ Geometry + material setup
  const lineSegments = useMemo(() => {
    if (!linePairs.length) return null;

    const positions = new Float32Array(linePairs.length * 6);
    let i = 0;
    for (const [s1, s2] of linePairs) {
      positions[i++] = s1.x;
      positions[i++] = s1.y;
      positions[i++] = s1.z;
      positions[i++] = s2.x;
      positions[i++] = s2.y;
      positions[i++] = s2.z;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(0x00ffff),
      transparent: true,
      opacity: 0,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });

    const lines = new THREE.LineSegments(geometry, material);
    lines.frustumCulled = false;
    lines.renderOrder = 9999;
    return lines;
  }, [linePairs]);

  // 🌈 Fade-in animation for constellation lines
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const lines = groupRef.current.children[0];
    if (!lines) return;

    const targetOpacity = selectedStar ? 0.85 : 0;
    opacityRef.current.value = THREE.MathUtils.lerp(
      opacityRef.current.value,
      targetOpacity,
      delta * 3
    );

    lines.material.opacity = opacityRef.current.value;
  });

  // 🪩 Subtle pulsing glow ring around constellation center
  const glowRef = useRef();
  useFrame((state) => {
    if (glowRef.current) {
      const t = state.clock.elapsedTime;
      const s = 1.05 + Math.sin(t * 2) * 0.05;
      glowRef.current.scale.set(s, s, s);
      glowRef.current.material.opacity = 0.2 + Math.sin(t * 2) * 0.1;
    }
  });

  // 🎯 Position glow roughly at constellation center
  const centerPos = useMemo(() => {
    if (!linePairs.length) return new THREE.Vector3();
    const all = linePairs.flat();
    const sum = all.reduce(
      (acc, s) => {
        acc.x += s.x;
        acc.y += s.y;
        acc.z += s.z;
        return acc;
      },
      { x: 0, y: 0, z: 0 }
    );
    const n = all.length;
    return new THREE.Vector3(sum.x / n, sum.y / n, sum.z / n);
  }, [linePairs]);

  useEffect(() => {
    if (selectedStar?.con)
      console.log("🛰️ Rendering constellation:", selectedStar.con.toUpperCase());
  }, [selectedStar]);

  if (!lineSegments) return null;

  return (
    <group ref={groupRef}>
      {/* ✨ Constellation lines */}
      <primitive object={lineSegments} key={selectedStar?.con} />

      {/* 🌌 Soft cyan glow to mark constellation */}
      <mesh ref={glowRef} position={centerPos}>
        <sphereGeometry args={[12, 64, 64]} />
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
