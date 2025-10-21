import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import StarField from "../features/StarField";
import ConstellationViewer from "../features/ConstellationViewer";
import FlyToStar from "./FlyToStar";

export default function StarCanvas({
  stars,
  selectedStar,
  setSelectedStar,
  pointsRef,
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 1800], fov: 60 }}
      gl={{
        antialias: true,
        alpha: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        outputEncoding: THREE.sRGBEncoding,
        physicallyCorrectLights: true,
      }}
      style={{
        width: "100%",
        height: "100%",
        background: "radial-gradient(circle at 50% 50%, #020820 0%, #000010 100%)",
      }}
    >
      {/* Ambient lighting for subtle contrast */}
      <ambientLight intensity={0.25} color="#8ecfff" />

      {/* Star system */}
      <StarField
        stars={stars}
        pointsRef={pointsRef}
        selectedStar={selectedStar}
        onStarClick={setSelectedStar}
      />

      {/* Constellation lines */}
      <ConstellationViewer stars={stars} selectedStar={selectedStar} />

      {/* Smooth camera focus transition */}
      <FlyToStar target={selectedStar} />

      {/* Camera controls */}
      <OrbitControls
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
