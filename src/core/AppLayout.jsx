import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import useStars from "./UseStars";
import StarField from "../features/StarField";
import ConstellationViewer from "../features/ConstellationViewer";
import StarOfTheDay from "../features/StarOfTheDay";
import SpectralLegend from "../analytics/SpectralLegend";
import StarGuide from "../features/StarGuide";
import FlyToStar from "./FlyToStar";
import CinematicIntro from "../features/CinematicIntro";
import StarAnalytics from "../analytics/StarAnalytics";
import StarInfoCard from "../ui/StarInfoCard"; // ✅ import here

export default function AppLayout() {
  const { stars, loading, selectedStar, setSelectedStar } = useStars();
  const [theme, setTheme] = useState("night");
  const pointsRef = useRef();
  const controlsRef = useRef(null);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background:
          theme === "night"
            ? "radial-gradient(circle at center, #0a0018 0%, #000000 100%)"
            : "linear-gradient(to bottom, #b3e5fc, #e3f2fd)",
        position: "relative",
        transition: "background 1s ease",
        overflow: "hidden",
      }}
    >
      {/* 🚀 Loading state */}
      {loading && (
  <div
    style={{
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      background: "radial-gradient(circle at center, #050010 0%, #000 100%)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
      zIndex: 9999,
    }}
  >
    {/* 🌌 Animated ring loader */}
    <div
      style={{
        width: "120px",
        height: "120px",
        border: "3px solid rgba(157, 77, 255, 0.2)",
        borderTopColor: "#B266FF",
        borderRadius: "50%",
        animation: "spin 1.2s linear infinite",
        boxShadow: "0 0 15px #C77DFF88",
      }}
    ></div>

    {/* ✨ Text fade-in */}
    <h2
      style={{
        fontFamily: "Iceland, sans-serif",
        color: "#7F00FF",
        fontWeight: "400",
        fontSize: "1.5rem",
        marginTop: "20px",
        letterSpacing: "1px",
        animation: "fade 2s ease-in-out infinite",
      }}
    >
      Initializing Star Map...
    </h2>

    {/* 🌠 Sparkle effect */}
    <div
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        background:
          "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)",
        backgroundSize: "400% 400%",
        animation: "twinkle 8s ease-in-out infinite",
      }}
    ></div>

    {/* 🔮 Inline keyframes */}
    <style>{`
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes fade {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 1; }
      }
      @keyframes twinkle {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
    `}</style>
  </div>
)}


      {/* 🌌 3D Star Canvas */}
      <Canvas camera={{ position: [0, 0, 2000] }}>
        <StarField
          stars={stars}
          pointsRef={pointsRef}
          selectedStar={selectedStar}
          onStarClick={setSelectedStar}
        />
        <ConstellationViewer stars={stars} selectedStar={selectedStar} />
        <OrbitControls enableZoom enablePan enableRotate zoomSpeed={0.5} panSpeed={0.5} />
        <FlyToStar target={selectedStar} controlsRef={controlsRef} />
      </Canvas>

      {/* ⭐ Star Guide (with integrated theme toggle) */}
      <StarGuide
        stars={stars}
        onSelect={setSelectedStar}
        theme={theme}
        setTheme={setTheme}
      />

      {/* 🌟 Star Info Card — replaces inline motion.div */}
      <AnimatePresence>
        {selectedStar && (
          <StarInfoCard star={selectedStar} onClose={() => setSelectedStar(null)} />
        )}
      </AnimatePresence>

      {/* ✨ Extras */}
      <SpectralLegend />
      <StarOfTheDay />
      <CinematicIntro />

      {/* 📊 Analytics */}
      <div
        style={{
          position: "absolute",
          right: "0px",
          bottom: "10px",
          zIndex: 1000,
        }}
      >
        <StarAnalytics />
      </div>
    </div>
  );
}
