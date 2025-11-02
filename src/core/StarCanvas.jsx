import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useRef } from "react";
import StarField from "../features/StarField";
import ConstellationViewer from "../features/ConstellationViewer";
import FlyToStar from "./FlyToStar";

function ThemedLighting({ theme }) {
  const ambientRef = useRef();
  const pointRef = useRef();
  const { gl, scene } = useThree();

  useEffect(() => {
    if (!scene || !ambientRef.current || !pointRef.current) return;

    if (theme === "night") {
      // 🌑 Absolute darkness
      scene.background = new THREE.Color("#000000");
      gl.setClearColor("#000000");

      ambientRef.current.color.set("#9bcaff");
      ambientRef.current.intensity = 0.25;

      pointRef.current.color.set("#88ccff");
      pointRef.current.intensity = 1.2;
    } else {
  // 🌅 Cosmic dawn — violet-blue sunrise glow
  const dawnTop = new THREE.Color("#1b0040");   // deep violet
  const dawnMid = new THREE.Color("#38125a");   // purple transition
  const dawnBottom = new THREE.Color("#0b0020"); // near black

  const dawnTexture = new THREE.CanvasTexture(
    (() => {
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");
      const gradient = ctx.createLinearGradient(0, 0, 0, 256);
      gradient.addColorStop(0, dawnTop.getStyle());
      gradient.addColorStop(0.4, dawnMid.getStyle());
      gradient.addColorStop(1, dawnBottom.getStyle());
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1, 256);
      return canvas;
    })()
  );

  dawnTexture.colorSpace = THREE.SRGBColorSpace;
  scene.background = dawnTexture;

  gl.setClearColor("#0b0020");

  ambientRef.current.color.set("#b8a9ff"); // softer lavender tone
  ambientRef.current.intensity = 0.45;

  pointRef.current.color.set("#a88cff"); // dawn hue
  pointRef.current.intensity = 1.6;
}
  }, [theme, gl, scene]);

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.25} color="#9bcaff" />
      <pointLight
        ref={pointRef}
        position={[0, 0, 500]}
        intensity={1.2}
        color="#88ccff"
      />
    </>
  );
}

export default function StarCanvas({
  stars,
  selectedStar,
  setSelectedStar,
  pointsRef,
  theme,
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 1800], fov: 60, near: 0.1, far: 100000 }}
      gl={{
        antialias: true,
        alpha: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
        outputEncoding: THREE.sRGBEncoding,
        physicallyCorrectLights: true,
        pixelRatio: Math.min(window.devicePixelRatio, 2),
      }}
      style={{
        width: "100%",
        height: "100%",
        background:
          theme === "night"
            ? "radial-gradient(circle at 50% 50%, #000000 0%, #000000 100%)"
            : "radial-gradient(circle at 40% 30%, #0a0018 0%, #1a0736 70%, #000000 100%)",
        transition: "background 1.5s ease",
      }}
    >
      <ThemedLighting theme={theme} />
      {theme === "dawn" && (
  <directionalLight
    position={[500, 200, 1000]}
    intensity={0.3}
    color="#ffb2a6"
  />
)}

      <group scale={[0.5, 0.5, 0.5]}>
  <StarField
    stars={stars}
    pointsRef={pointsRef}
    selectedStar={selectedStar}
    onStarClick={setSelectedStar}
  />
  <ConstellationViewer stars={stars} selectedStar={selectedStar} />
</group>

      <FlyToStar target={selectedStar} />

      <OrbitControls
        maxDistance={20000}
        minDistance={200}
        enableZoom
        enablePan
        enableRotate
        zoomSpeed={0.5}
        panSpeed={0.5}
        rotateSpeed={0.6}
      />
    </Canvas>
  );
}
