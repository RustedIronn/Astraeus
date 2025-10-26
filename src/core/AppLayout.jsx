import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import useStars from "./useStars";
import StarCanvas from "./StarCanvas";
import StarGuide from "../features/StarGuide";
import StarInfoCard from "../ui/StarInfoCard";
import SpectralLegend from "../analytics/SpectralLegend";
import SpaceBrief from "../features/SpaceBrief";
import LoadingOverlay from "../ui/LoadingOverlay";
import CinematicIntro from "../features/CinematicIntro";
import StarAnalytics from "../analytics/StarAnalytics";
import ErrorBoundary from "../ErrorBoundary";

export default function AppLayout() {
  const { stars, loading: dataLoading, selectedStar, setSelectedStar } = useStars();
  const [theme, setTheme] = useState("night");
  const [introDone, setIntroDone] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [finalReady, setFinalReady] = useState(false);
  const pointsRef = useRef();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🎞️ Control sequence: intro → loader → stars ready
  useEffect(() => {
    if (introDone) {
      setShowLoader(true);
      const timer = setTimeout(() => {
        if (!dataLoading) setShowLoader(false);
        else {
          const check = setInterval(() => {
            if (!dataLoading) {
              setShowLoader(false);
              clearInterval(check);
            }
          }, 500);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [introDone, dataLoading]);

  useEffect(() => {
    if (introDone && !showLoader && !dataLoading) setFinalReady(true);
  }, [introDone, showLoader, dataLoading]);

  return (
    <div
      style={{
        background:
          theme === "night"
            ? "radial-gradient(circle at 50% 50%, #020014 0%, #000000 100%)"
            : "radial-gradient(circle at 40% 30%, #1a0736 0%, #4b1b66 65%, #0d001b 100%)",
        boxShadow:
          theme === "dawn"
            ? "inset 0 0 250px rgba(120,80,255,0.15), inset 0 0 400px rgba(80,50,150,0.25)"
            : "none",
        transition: "background 1.5s ease, box-shadow 1.5s ease",
      }}
      className="relative w-screen h-screen overflow-hidden"
    >
      {/* 🎬 Cinematic Intro */}
      {!introDone && <CinematicIntro onFinish={() => setIntroDone(true)} />}

      {/* 🚀 Loading Overlay */}
      <AnimatePresence>
        {introDone && showLoader && <LoadingOverlay />}
      </AnimatePresence>

      {/* 🌌 Star Canvas */}
      <ErrorBoundary>
        <div className="absolute inset-0 w-full h-full">
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
      {finalReady && (
        <motion.div
          key="ui-wrapper"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 pointer-events-none"
        >
          <div className="pointer-events-auto">
            <StarGuide
              stars={stars}
              onSelect={setSelectedStar}
              theme={theme}
              setTheme={setTheme}
            />
            <SpectralLegend />
            <SpaceBrief />
            <StarAnalytics />
          </div>
        </motion.div>
      )}

      {/* 💫 Star Info Card */}
      <AnimatePresence>
        {selectedStar && (
          <StarInfoCard
            star={selectedStar}
            onClose={() => setSelectedStar(null)}
          />
        )}
      </AnimatePresence>

      {/* 🪐 Controls Hint */}
      {finalReady && (
        <div className="fixed bottom-[2vh] w-full flex justify-center z-[500]">
          <div
            className={`
              font-[Iceland] text-[clamp(0.6rem,1vw,0.85rem)]
              text-[rgba(200,200,255,0.8)]
              bg-[rgba(0,0,30,0.3)] border border-[rgba(150,100,255,0.2)]
              rounded-lg px-4 py-1.5 backdrop-blur-md
              text-shadow-[0_0_6px_rgba(180,120,255,0.4)]
              tracking-wide transition-all duration-200
              ${isMobile ? "px-3 py-1 text-[0.75rem]" : ""}
            `}
          >
            💡 Scroll to zoom · Click stars to explore · Drag to rotate
          </div>
        </div>
      )}

      {/* ✨ Extra Animations */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}
