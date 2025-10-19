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
              bg-[rgba(20,20,30,0.12)] backdrop-blur-2xl saturate-[160%]
              border border-white/10 text-white text-center
              rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)]
              font-[Playwrite_US_Modern] pointer-events-auto
              transition-all duration-200 ease-out
              ${isMobile ? "w-[280px] px-4 py-3" : "w-[340px] px-6 py-4"}
            `}
          >
            <h2
              className="
                text-[clamp(1.1rem,1.5vw,1.3rem)]
                text-purple-400 mb-2
                font-[Playwrite_DE_Grund]
              "
            >
              {star.name}
            </h2>

            <p className="text-gray-300 text-[clamp(0.75rem,1vw,0.85rem)] mb-2">
              {star.con} • Mag {star.mag} • {star.dist} ly
            </p>

            {star.funfact && (
              <p
                className="
                  italic text-lime-400 mt-1
                  text-[clamp(0.7rem,0.9vw,0.8rem)]
                  leading-[1.2rem]
                "
              >
                💡 {star.funfact}
              </p>
            )}

            <button
              onClick={onClose}
              className="
                mt-3 bg-purple-500 border-none text-white
                px-4 py-1.5 rounded-lg cursor-pointer
                text-[clamp(0.75rem,0.9vw,0.85rem)]
                font-[Playwrite_US_Modern]
                transition-all duration-200
                hover:bg-purple-700 hover:scale-105
              "
            >
              Close
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
