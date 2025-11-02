import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback, useRef } from "react";

export default function CinematicIntro({ onFinish }) {
  const [show, setShow] = useState(true);
  const audioRef = useRef(null);
  const hasEnded = useRef(false);

  const endIntro = useCallback(() => {
    if (hasEnded.current) return;
    hasEnded.current = true;
    setShow(false);

    if (audioRef.current) {
      const audio = audioRef.current;
      audio.loop = true;
      audio.volume = 0.25;
    }

    if (typeof onFinish === "function") onFinish();
  }, [onFinish]);

  useEffect(() => {
    const music = new Audio("/interstellar-theme.mp3");
    music.volume = 0.4;
    music.loop = false;
    audioRef.current = music;

    music.play().catch(() => {
      const clickPlay = () => {
        music.play();
        window.removeEventListener("click", clickPlay);
      };
      window.addEventListener("click", clickPlay);
    });

    const timer = setTimeout(() => endIntro(), 3500);
    const handleClick = () => endIntro();
    window.addEventListener("click", handleClick);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("click", handleClick);
    };
  }, [endIntro]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="
            fixed inset-0 flex flex-col items-center justify-center
            bg-[radial-gradient(circle_at_center,#000010_0%,#000000_100%)]
            text-white font-[Iceland] cursor-pointer z-[9999]
            overflow-hidden
          "
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8 } }}
        >
          {/* 🌌 Title */}
          <motion.h1
            className="
              text-[clamp(2rem,5vw,4rem)]
              tracking-[clamp(6px,1vw,12px)]
              text-center
              text-transparent bg-clip-text
              bg-gradient-to-b from-[#c0dfff] via-[#6ea2ff] to-[#9b5de5]
              drop-shadow-[0_0_25px_rgba(110,162,255,0.4)]
            "
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4 }}
          >
            A S T R A E U S
          </motion.h1>

          {/* ✨ Subtitle */}
          <motion.p
            className="
              mt-[1.2vh]
              text-[clamp(0.9rem,1.2vw,1.2rem)]
              tracking-[clamp(2px,0.5vw,4px)]
              text-[#80aaff]
              text-center uppercase
              drop-shadow-[0_0_10px_rgba(128,170,255,0.6)]
            "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 1.2 }}
          >
            Version 1.5.3
          </motion.p>

          {/* 🖱 Skip Hint */}
          <motion.p
            className="
              absolute bottom-[5vh]
              text-[clamp(0.75rem,0.9vw,1rem)]
              tracking-[clamp(1px,0.3vw,3px)]
              text-gray-400 opacity-60
              font-[Iceberg]
            "
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 2.4, duration: 0.8 }}
          >
            Click anywhere to skip
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
