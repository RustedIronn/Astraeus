import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback, useRef } from "react";

export default function CinematicIntro({ onFinish }) {
  const [show, setShow] = useState(true);
  const [scale, setScale] = useState(Math.min(window.innerWidth / 1920, 1));
  const audioRef = useRef(null);
  const hasEnded = useRef(false);

  const endIntro = useCallback(() => {
    if (hasEnded.current) return;
    hasEnded.current = true;
    setShow(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof onFinish === "function") onFinish();
  }, [onFinish]);

  useEffect(() => {
    const music = new Audio("/interstellar-theme.mp3");
    music.volume = 0.3;
    music.play().catch(() => console.log("Autoplay blocked"));
    audioRef.current = music;

    const timer = setTimeout(() => endIntro(), 6000);
    const handleClick = () => endIntro();
    window.addEventListener("click", handleClick);

    const handleResize = () => setScale(Math.min(window.innerWidth / 1920, 1));
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
      music.pause();
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
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "radial-gradient(circle at center, #000010 0%, #000000 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            fontFamily: "Orbitron, sans-serif",
            zIndex: 9999,
            cursor: "pointer",
            transform: `scale(${scale})`,
            transformOrigin: "center center",
            transition: "transform 0.2s ease-out",
          }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 2 }}
            style={{
              fontSize: "3rem",
              letterSpacing: "10px",
              textShadow: "0 0 30px #a855f7",
            }}
          >
            A S T R A E U S
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 2 }}
            style={{
              fontSize: "1rem",
              letterSpacing: "3px",
              color: "#6A0DAD",
              marginTop: "10px",
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
              bottom: "40px",
              fontSize: "0.9rem",
              color: "#ccc",
              letterSpacing: "2px",
            }}
          >
            (Click anywhere to skip)
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
