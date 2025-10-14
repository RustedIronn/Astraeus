import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function FlyToStar({ target, controlsRef }) {
  const { camera } = useThree();
  const anim = useRef(null);

  // store last "free" view before focusing on a star
  const lastFreePos = useRef(camera.position.clone());
  const lastFreeLook = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    if (target) {
      // 🪐 store current camera position before flying in
      lastFreePos.current.copy(camera.position);
      const lookDir = new THREE.Vector3();
      camera.getWorldDirection(lookDir);
      lastFreeLook.current.copy(camera.position.clone().add(lookDir));

      const start = { pos: camera.position.clone(), time: performance.now() };
      const safeDist = Math.max(30, (10 - (target.mag || 5)) * 20);
      const starPos = new THREE.Vector3(target.x, target.y, target.z);
      const endPos = starPos.clone().add(new THREE.Vector3(0, 0, safeDist));

      const distance = start.pos.distanceTo(endPos);
      const duration = THREE.MathUtils.clamp(distance * 6, 1500, 3500);

      anim.current = { start, endPos, starPos, duration, returning: false };
      if (controlsRef?.current) controlsRef.current.enabled = false;
    } else {
      // 🌌 Return to last free camera view (not the hardcoded default)
      const start = { pos: camera.position.clone(), time: performance.now() };
      const endPos = lastFreePos.current.clone();
      const starPos = lastFreeLook.current.clone();

      const distance = start.pos.distanceTo(endPos);
      const duration = THREE.MathUtils.clamp(distance * 5, 1800, 4000);

      anim.current = { start, endPos, starPos, duration, returning: true };
      if (controlsRef?.current) controlsRef.current.enabled = false;
    }
  }, [target, camera, controlsRef]);

  useFrame(() => {
    if (!anim.current) return;

    const { start, endPos, starPos, duration, returning } = anim.current;
    const elapsed = performance.now() - start.time;
    const t = Math.min(elapsed / duration, 1);

    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    camera.position.lerpVectors(start.pos, endPos, ease);
    camera.lookAt(returning ? starPos : starPos);

    if (t >= 1) {
      anim.current = null;
      if (controlsRef?.current) {
        controlsRef.current.enabled = true;
        controlsRef.current.target.copy(returning ? starPos : starPos);
      }
    }
  });

  return null;
}
