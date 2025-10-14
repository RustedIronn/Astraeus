import { useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

export default function BackgroundMilkyWay() {
  const bgRef = useRef();
  const texture = useLoader(THREE.TextureLoader, "/textures/milkyway.png");

  useFrame((_, delta) => {
    if (bgRef.current) bgRef.current.rotation.y += delta * 0.002;
  });

  return (
    <mesh ref={bgRef} scale={-1}>
      <sphereGeometry args={[5000, 64, 64]} />
      <meshBasicMaterial
        map={texture}
        side={THREE.BackSide}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
