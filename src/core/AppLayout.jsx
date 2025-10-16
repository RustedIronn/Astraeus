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

export default function AppLayout() {
  const { stars, loading, selectedStar, setSelectedStar } = useStars();
  const [theme, setTheme] = useState("night");
  const pointsRef = useRef();

  // Handle responsive breakpoints cleanly
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background:
          theme === "night"
            ? "radial-gradient(circle at center, #0a0018 0%, #000000 100%)"
            : "radial-gradient(circle at 50% 20%, #cdeaff 0%, #9ed8ff 40%, #78b4f8 70%, #4a90e2 100%)",
        boxShadow:
          theme === "day"
            ? "inset 0 0 200px rgba(255,255,255,0.4), inset 0 0 300px rgba(255,255,255,0.25)"
            : "none",
        position: "relative",
        transition: "background 1s ease",
        overflow: "hidden",
      }}
    >
      {/* 🚀 Loading Overlay */}
      {loading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "radial-gradient(circle at center, #050010 0%, #000 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: "8vw",
              height: "8vw",
              border: "3px solid rgba(157, 77, 255, 0.2)",
              borderTopColor: "#B266FF",
              borderRadius: "50%",
              animation: "spin 1.2s linear infinite",
              boxShadow: "0 0 15px #C77DFF88",
            }}
          ></div>
          <h2
            style={{
              fontFamily: "Iceland, sans-serif",
              color: "#7F00FF",
              fontWeight: "400",
              fontSize: "clamp(1rem, 2vw, 1.5rem)",
              marginTop: "2vh",
              letterSpacing: "1px",
              animation: "fade 2s ease-in-out infinite",
            }}
          >
            Initializing Star Map...
          </h2>
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

          <style>{`
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @keyframes fade { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
            @keyframes twinkle { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
          `}</style>
        </div>
      )}

      {/* 🌌 Main Canvas */}
      <ErrorBoundary>
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          <StarCanvas
            stars={stars}
            selectedStar={selectedStar}
            setSelectedStar={setSelectedStar}
            theme={theme}
            pointsRef={pointsRef}
          />
        </div>
      </ErrorBoundary>

      {/* 🧭 UI Modules (fixed, not scaled) */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        <div style={{ pointerEvents: "auto" }}>
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
      <div
        style={{
          position: "fixed",
          bottom: "2vh",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          zIndex: 500,
        }}
      >
        <div
          style={{
            fontFamily: "'Iceland', sans-serif",
            fontSize: "clamp(0.6rem, 1vw, 0.85rem)",
            color: "rgba(200,200,255,0.8)",
            background: "rgba(0,0,30,0.3)",
            border: "1px solid rgba(150,100,255,0.2)",
            borderRadius: "10px",
            padding: isMobile ? "4px 10px" : "6px 14px",
            backdropFilter: "blur(8px)",
            textShadow: "0 0 6px rgba(180,120,255,0.4)",
            letterSpacing: "0.5px",
            transition: "all 0.25s ease",
          }}
        >
          💡 Scroll to zoom · Click stars to explore · Drag to rotate
        </div>
      </div>
    </div>
  );
}
