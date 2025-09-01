import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";

function ClickHandler({ stars, onSelect, pointsRef }) {
  const { camera, gl } = useThree();

  useEffect(() => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function handleClick(event) {
      const rect = gl.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.params.Points.threshold = 10; // 🔧 “click radius” in pixels
      raycaster.setFromCamera(mouse, camera);

      if (!pointsRef.current) return;
      const intersects = raycaster.intersectObject(pointsRef.current);

      if (intersects.length > 0) {
        const starIndex = intersects[0].index;
        onSelect(stars[starIndex]);
      }
    }

    gl.domElement.addEventListener("click", handleClick);
    return () => gl.domElement.removeEventListener("click", handleClick);
  }, [stars, onSelect, camera, gl, pointsRef]);

  return null;
}

export default ClickHandler;
