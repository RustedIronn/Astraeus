import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import StarField from "../features/StarField";
import ConstellationViewer from "../features/ConstellationViewer";
import FlyToStar from "./FlyToStar";

export default function StarCanvas({ stars, selectedStar, setSelectedStar, theme }) {
  return (
    <Canvas camera={{ position: [0, 0, 2000] }}>
      <StarField
        stars={stars}
        selectedStar={selectedStar}
        onStarClick={setSelectedStar}
      />
      <ConstellationViewer stars={stars} selectedStar={selectedStar} />
      <FlyToStar target={selectedStar} />
      <OrbitControls enableZoom enablePan enableRotate zoomSpeed={0.5} panSpeed={0.5} />
    </Canvas>
  );
}
