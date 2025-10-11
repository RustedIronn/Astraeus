import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function CinematicIntro({ onFinish }) {
  const [show, setShow] = useState(true);
  const [audio, setAudio] = useState(null);

  useEffect(() => {
    const music = new Audio("/interstellar-theme.mp3");
    music.volume = 0.3;
    music.play().catch(() => console.log("Autoplay blocked"));
    setAudio(music);

    const timer = setTimeout(() => {
      setShow(false);
      music.pause();
      music.currentTime = 0;
      onFinish();
    }, 6000);

    return () => {
      clearTimeout(timer);
      music.pause();
    };
  }, [onFinish]);

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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
