import * as THREE from "three";
import { useMemo } from "react";
import constellationLines from "./constellationLines.json";

function ConstellationViewer({ stars, selectedStar }) {
  const lines = useMemo(() => {
    if (!selectedStar) return null;

    const conLines = constellationLines[selectedStar.con] || [];
    return conLines
      .map(([hip1, hip2]) => {
        const s1 = stars.find((s) => s.hip == hip1);
        const s2 = stars.find((s) => s.hip == hip2);
        if (!s1 || !s2) return null;

        const points = [
          new THREE.Vector3(s1.x, s1.y, s1.z),
          new THREE.Vector3(s2.x, s2.y, s2.z)
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        return (
          <line key={`${hip1}-${hip2}`} geometry={geometry}>
            <lineBasicMaterial color="cyan" linewidth={2} />
          </line>
        );
      })
      .filter(Boolean);
  }, [stars, selectedStar]);

  return <>{lines}</>;
}

export default ConstellationViewer;
