import React, { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export default function DeepSkyField({ objects }) {
  const points = useMemo(() => {
    if (!Array.isArray(objects) || objects.length === 0) return null;

    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];

    objects.forEach((obj) => {
      const x = parseFloat(obj.x);
      const y = parseFloat(obj.y);
      const z = parseFloat(obj.z);

      // 🛑 Skip invalid entries
      if (!isFinite(x) || !isFinite(y) || !isFinite(z)) return;

      positions.push(x, y, z);

      // 💫 Color by object type
      const type = (obj.type || obj["Object type"] || "").toLowerCase();
      let color;

      if (type.startsWith("g")) color = new THREE.Color(0x88ccff); // Galaxy
      else if (type.includes("neb")) color = new THREE.Color(0xff77cc); // Nebula
      else if (type.includes("cluster")) color = new THREE.Color(0xffff99); // Cluster
      else color = new THREE.Color(0xff9966); // Default / Other

      colors.push(color.r, color.g, color.b);
    });

    if (positions.length === 0) {
      console.warn("⚠️ No valid coordinates found in deep-sky dataset.");
      return null;
    }

    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeBoundingSphere();

    const material = new THREE.PointsMaterial({
      vertexColors: true,
      size: 20,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.85,
    });

    return new THREE.Points(geometry, material);
  }, [objects]);

  useFrame(() => {
    if (points) points.rotation.y += 0.00015;
  });

  if (!points) return null;
  return <primitive object={points} />;
}
