import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function StarInfoCard({ star, onClose }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!star) return null;

  // 🌌 Aurora background (deep violet tones)
  const backgroundImage = `
    linear-gradient(130deg,
      rgba(80, 0, 160, 0.35),
      rgba(120, 50, 200, 0.25),
      rgba(50, 0, 100, 0.4),
      rgba(20, 0, 60, 0.3),
      rgba(90, 30, 180, 0.35)
    )
  `;

  return (
    <AnimatePresence>
      {star && (
        <motion.div
          className="fixed bottom-[2vh] w-full flex justify-center z-[9999] pointer-events-none"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ duration: 0.4 }}
        >
          <div
            className={`
              relative overflow-hidden pointer-events-auto
              border border-white/10 text-white text-center
              rounded-xl shadow-[0_0_25px_rgba(90,50,200,0.35)]
              font-[Playwrite_US_Modern]
              transition-all duration-200 ease-out
              ${isMobile ? "w-[290px] px-4 py-2.5" : "w-[355px] px-6 py-2.5"}
            `}
            style={{
              backgroundImage,
              backgroundSize: "400% 400%",
              animation: "auroraFloat 18s ease-in-out infinite",
              backdropFilter: "blur(8px) saturate(180%)",
            }}
          >
            {/* 🌠 Star Content */}
            <div className="relative z-10">
              <h2
                className="
                  text-[clamp(1.1rem,1.5vw,1.3rem)]
                  text-violet-200 mb-1.5
                  font-[Playwrite_DE_Grund]
                  drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]
                "
              >
                {star.name}
              </h2>

              <p className="text-gray-300 text-[clamp(0.75rem,1vw,0.85rem)] mb-1 drop-shadow-[0_0_6px_rgba(0,0,0,0.8)]">
                {star.con} • Mag {star.mag} • {star.dist} ly
              </p>

              {star.funfact && (
                <p
                  className="
                    italic text-lime-400 mt-1
                    text-[clamp(0.7rem,0.9vw,0.8rem)]
                    leading-[1.15rem]
                    drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]
                  "
                >
                  💡 {star.funfact}
                </p>
              )}

              <button
                onClick={onClose}
                className="
                  mt-2 bg-[rgba(70,40,150,0.45)] border border-[rgba(120,90,255,0.3)]
                  text-white px-4 py-1.5 rounded-lg cursor-pointer
                  text-[clamp(0.75rem,0.9vw,0.85rem)]
                  font-[Playwrite_US_Modern]
                  transition-all duration-200
                  hover:bg-[rgba(100,70,200,0.6)] hover:scale-105
                  shadow-[0_0_15px_rgba(100,70,200,0.25)]
                "
              >
                Close
              </button>
            </div>

            {/* 🌌 Aurora Animation */}
            <style>{`
              @keyframes auroraFloat {
                0% { background-position: 0% 50%; }
                25% { background-position: 50% 60%; }
                50% { background-position: 100% 50%; }
                75% { background-position: 50% 40%; }
                100% { background-position: 0% 50%; }
              }
            `}</style>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
