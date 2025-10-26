import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function LoadingOverlay() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <motion.div
      key="loading-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="
        absolute inset-0 flex flex-col justify-center items-center
        z-[9999] text-center overflow-hidden
        bg-[rgba(5,0,20,0.4)] backdrop-blur-[6px]
      "
    >
      {/* 🌈 Animated Aurora Background */}
      <div
        className="absolute inset-0 opacity-[0.7] animate-[auroraFlow_20s_ease-in-out_infinite]"
        style={{
          backgroundImage: `
            linear-gradient(120deg, rgba(0,255,255,0.12), rgba(180,60,255,0.15), rgba(0,180,255,0.18), rgba(120,40,255,0.15))
          `,
          backgroundSize: "300% 300%",
          filter: "blur(60px)",
        }}
      />

      {/* 🪩 Spinner */}
      <div
        className="relative z-10 border-[3px] border-[rgba(157,77,255,0.25)] border-t-[#b266ff] rounded-full animate-spin shadow-[0_0_15px_#c77dff88]"
        style={{
          width: isMobile ? "12vw" : "8vw",
          height: isMobile ? "12vw" : "8vw",
        }}
      />

      {/* 🪐 Text */}
      <h2
        className="relative z-10 font-[Iceland] text-[#b266ff] font-normal tracking-wide animate-pulse drop-shadow-[0_0_8px_rgba(200,120,255,0.5)]"
        style={{
          fontSize: isMobile ? "1rem" : "clamp(1rem,2vw,1.5rem)",
          marginTop: "2vh",
        }}
      >
        Retrieving star data from AWS Execute API endpoint..
      </h2>

      {/* ✨ Ambient Twinkle */}
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.08)_0%,transparent_70%)] bg-[length:400%_400%] animate-[twinkle_8s_ease-in-out_infinite]"
      />

      {/* 🎨 Animations */}
      <style>{`
        @keyframes auroraFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes twinkle {
          0%, 100% { background-position: 0% 50%; opacity: 0.8; }
          50% { background-position: 100% 50%; opacity: 1; }
        }
      `}</style>
    </motion.div>
  );
}
