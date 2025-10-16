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

    // 🌌 Let the music continue softly in background
    if (audioRef.current) {
      const audio = audioRef.current;
      audio.loop = true;
      audio.volume = 0.25; // lower volume after intro
    }

    if (typeof onFinish === "function") onFinish();
  }, [onFinish]);

  useEffect(() => {
    const music = new Audio("/interstellar-theme.mp3");
    music.volume = 0.4;
    music.loop = false; // only loop after intro ends
    audioRef.current = music;

    // Try playing automatically
    music.play().catch(() => {
      console.log("Autoplay blocked — waiting for user interaction");
      const clickPlay = () => {
        music.play();
        window.removeEventListener("click", clickPlay);
      };
      window.addEventListener("click", clickPlay);
    });

    // Auto-end intro after 6s
    const timer = setTimeout(() => endIntro(), 6000);
    const handleClick = () => endIntro();
    window.addEventListener("click", handleClick);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("click", handleClick);
      // do not stop music — let it play
    };
  }, [endIntro]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1.2 } }}
          style={{
            position: "fixed",
            inset: 0,
            background: "radial-gradient(circle at center, #000010 0%, #000000 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            fontFamily: "Orbitron, sans-serif",
            zIndex: 9999,
            cursor: "pointer",
          }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 2 }}
            style={{
              fontSize: "clamp(2rem, 5vw, 4rem)",
              letterSpacing: "clamp(6px, 1vw, 12px)",
              textShadow: "0 0 30px #a855f7, 0 0 60px rgba(168,85,247,0.6)",
            }}
          >
            A S T R A E U S
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 2 }}
            style={{
              fontSize: "clamp(0.9rem, 1.2vw, 1.2rem)",
              letterSpacing: "clamp(2px, 0.5vw, 4px)",
              color: "#a855f7",
              marginTop: "1.2vh",
              textShadow: "0 0 10px rgba(168,85,247,0.6)",
            }}
          >
            Celestial Systems Online ✦
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 3.5, duration: 1.5 }}
            style={{
              position: "absolute",
              bottom: "5vh",
              fontSize: "clamp(0.75rem, 0.9vw, 1rem)",
              color: "#ccc",
              letterSpacing: "clamp(1px, 0.3vw, 3px)",
            }}
          >
            (Click anywhere to skip)
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
