import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function FlyToStar({ target, controlsRef }) {
  const { camera } = useThree();
  const anim = useRef(null);

  useEffect(() => {
    if (target) {
      const start = { pos: camera.position.clone(), time: performance.now() };
      const safeDist = Math.max(30, (10 - (target.mag || 5)) * 20);
      const starPos = new THREE.Vector3(target.x, target.y, target.z);
      const endPos = starPos.clone().add(new THREE.Vector3(0, 0, safeDist));

      anim.current = { start, endPos, starPos, duration: 2000 };
      if (controlsRef?.current) controlsRef.current.enabled = false;
    }
  }, [target, camera, controlsRef]);

  useFrame(() => {
    if (anim.current) {
      const { start, endPos, starPos, duration } = anim.current;
      const elapsed = performance.now() - start.time;
      const t = Math.min(elapsed / duration, 1);
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      camera.position.lerpVectors(start.pos, endPos, ease);
      camera.lookAt(starPos);

      if (t >= 1) {
        anim.current = null;
        if (controlsRef?.current) {
          controlsRef.current.enabled = true;
          controlsRef.current.target.copy(starPos);
        }
      }
    }
  });

  return null;
}
