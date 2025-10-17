import { AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import useStars from "./useStars";
import StarCanvas from "./StarCanvas";
import StarGuide from "../features/StarGuide";
import StarInfoCard from "../ui/StarInfoCard";
import SpectralLegend from "../analytics/SpectralLegend";
import StarOfTheDay from "../features/StarOfTheDay";
import CinematicIntro from "../features/CinematicIntro";
import StarAnalytics from "../analytics/StarAnalytics";
import ErrorBoundary from "../ErrorBoundary";
import "../css/AppLayout.css";

export default function AppLayout() {
  const { stars, loading, selectedStar, setSelectedStar } = useStars();
  const [theme, setTheme] = useState("night");
  const pointsRef = useRef();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={`app-layout theme-${theme}`}>
      {/* 🚀 Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <h2 className="loading-text">Initializing Star Map...</h2>
          <div className="loading-twinkle"></div>
        </div>
      )}

      {/* 🌌 Main Canvas */}
      <ErrorBoundary>
        <div className="canvas-container">
          <StarCanvas
            stars={stars}
            selectedStar={selectedStar}
            setSelectedStar={setSelectedStar}
            theme={theme}
            pointsRef={pointsRef}
          />
        </div>
      </ErrorBoundary>

      {/* 🧭 UI Modules */}
      <div className="ui-container">
        <div className="ui-wrapper">
          <StarGuide
            stars={stars}
            onSelect={setSelectedStar}
            theme={theme}
            setTheme={setTheme}
          />
          <SpectralLegend />
          <StarOfTheDay />
          <StarAnalytics />
        </div>
      </div>

      {/* 💫 Star Info Card */}
      <AnimatePresence>
        {selectedStar && (
          <StarInfoCard
            star={selectedStar}
            onClose={() => setSelectedStar(null)}
          />
        )}
      </AnimatePresence>

      {/* 🎬 Intro Sequence */}
      <CinematicIntro />

      {/* 🪐 Controls Hint */}
      <div className="controls-hint">
        <div className={`hint-box ${isMobile ? "mobile" : ""}`}>
          💡 Scroll to zoom · Click stars to explore · Drag to rotate
        </div>
      </div>
    </div>
  );
}
