import { AnimatePresence, motion } from "framer-motion";
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

  // Sequence control: intro → loader → stars ready
  useEffect(() => {
    if (introDone) {
      setShowLoader(true);
      // Keep loader visible for cinematic feel even if stars load fast
      const timer = setTimeout(() => {
        if (!dataLoading) setShowLoader(false);
        else {
          // keep checking until stars finish
          const check = setInterval(() => {
            if (!dataLoading) {
              setShowLoader(false);
              clearInterval(check);
            }
          }, 500);
        }
      }, 1500); // <- delay to ensure "Initializing Star Map" always appears
      return () => clearTimeout(timer);
    }
  }, [introDone, dataLoading]);

  useEffect(() => {
    if (introDone && !showLoader && !dataLoading) {
      setFinalReady(true);
    }
  }, [introDone, showLoader, dataLoading]);

  return (
    <div
      className={`
        relative w-screen h-screen overflow-hidden transition-colors duration-700
        ${
          theme === "night"
            ? "bg-[radial-gradient(circle_at_center,#070014_0%,#000000_100%)]"
            : "bg-[radial-gradient(circle_at_40%_30%,#2e0f4c_0%,#513a83_35%,#9e7cff_65%,#ffb36b_100%)] shadow-[inset_0_0_200px_rgba(255,200,150,0.15),inset_0_0_350px_rgba(255,150,100,0.1)]"
        }
      `}
    >
      {/* 🎬 Cinematic Intro */}
      {!introDone && <CinematicIntro onFinish={() => setIntroDone(true)} />}

      {/* 🚀 Loading Overlay */}
      <AnimatePresence>
        {introDone && showLoader && (
          <motion.div
            key="loading-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="
              absolute inset-0 flex flex-col justify-center items-center
              bg-[radial-gradient(circle_at_center,#050010_0%,#000_100%)]
              z-[9999] text-center
            "
          >
            <div className="w-[8vw] h-[8vw] border-[3px] border-[rgba(157,77,255,0.2)] border-t-[#b266ff] rounded-full animate-spin shadow-[0_0_15px_#c77dff88]" />
            <h2 className="font-[Iceland] text-[#b266ff] font-normal text-[clamp(1rem,2vw,1.5rem)] mt-[2vh] tracking-wide animate-pulse">
              Initializing Star Map...
            </h2>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0%,transparent_70%)] bg-[length:400%_400%] animate-[twinkle_8s_ease-in-out_infinite]" />
          </motion.div>
        )}
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

      {/* 🧭 UI Modules (appear only when everything ready) */}
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
            <StarOfTheDay />
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

      {/* ✨ Animations */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}
