import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback, useRef } from "react";
import "../css/CinematicIntro.css";

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
      audio.volume = 0.25; // soft background continuation
    }

    if (typeof onFinish === "function") onFinish();
  }, [onFinish]);

  useEffect(() => {
    const music = new Audio("/interstellar-theme.mp3");
    music.volume = 0.4;
    music.loop = false;
    audioRef.current = music;

    music.play().catch(() => {
      console.log("Autoplay blocked — waiting for user interaction");
      const clickPlay = () => {
        music.play();
        window.removeEventListener("click", clickPlay);
      };
      window.addEventListener("click", clickPlay);
    });

    const timer = setTimeout(() => endIntro(), 6000);
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
          className="cinematic-intro"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1.2 } }}
        >
          <motion.h1
            className="intro-title"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 2 }}
          >
            A S T R A E U S
          </motion.h1>

          <motion.p
            className="intro-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 2 }}
          >
            Celestial Systems Online ✦
          </motion.p>

          <motion.p
            className="intro-skip"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 3.5, duration: 1.5 }}
          >
            (Click anywhere to skip)
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
