import * as THREE from "three";
import { useMemo } from "react";
import constellationLines from "./constellationLines.json";

function ConstellationViewer({ stars, selectedStar }) {
  const lineData = useMemo(() => {
    if (!selectedStar) return [];
    const map = new Map(stars.map((s) => [s.hip, s]));
    const conLines = constellationLines[selectedStar.con] || [];

    return conLines
      .map(([hip1, hip2]) => {
        const s1 = map.get(String(hip1));
        const s2 = map.get(String(hip2));
        if (!s1 || !s2) return null;
        return [s1, s2];
      })
      .filter(Boolean);
  }, [stars, selectedStar]);

  const geometry = useMemo(() => {
    const points = [];
    lineData.forEach(([s1, s2]) => {
      points.push(new THREE.Vector3(s1.x, s1.y, s1.z));
      points.push(new THREE.Vector3(s2.x, s2.y, s2.z));
    });
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, [lineData]);

  if (!selectedStar || lineData.length === 0) return null;

  return (
  <lineSegments geometry={geometry}>
    <lineBasicMaterial
      color={new THREE.Color(0x66ccff)} // softer cyan
      transparent
      opacity={0.85}
      blending={THREE.AdditiveBlending}
      depthWrite={false}
    />
  </lineSegments>
  );
}

export default ConstellationViewer;
