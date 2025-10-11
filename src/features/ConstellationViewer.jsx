import * as THREE from "three";
import { useMemo } from "react";
import constellationLines from "../constellationLines.json";

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

  const lineSegments = useMemo(() => {
    if (!lineData.length) return null;

    const points = [];
    lineData.forEach(([s1, s2]) => {
      points.push(new THREE.Vector3(s1.x, s1.y, s1.z));
      points.push(new THREE.Vector3(s2.x, s2.y, s2.z));
    });

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0x66ccff,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    return new THREE.LineSegments(geometry, material);
  }, [lineData]);

  if (!lineSegments) return null;

  return <primitive object={lineSegments} />;
}

export default ConstellationViewer;
