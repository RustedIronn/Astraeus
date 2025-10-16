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
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          style={{
            position: "fixed",
            bottom: "2vh",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            zIndex: 9999,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              background: "rgba(20, 20, 30, 0.12)",
              backdropFilter: "blur(20px) saturate(160%)",
              WebkitBackdropFilter: "blur(20px) saturate(160%)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              padding: isMobile ? "14px 16px" : "18px 22px",
              borderRadius: "16px",
              color: "white",
              width: isMobile ? "280px" : "340px",
              textAlign: "center",
              boxShadow: "0 0 20px rgba(168,85,247,0.4)",
              fontFamily: "'Playwrite US Modern', sans-serif",
              pointerEvents: "auto",
              transition: "all 0.25s ease-out",
            }}
          >
            <h2
              style={{
                margin: "0 0 8px 0",
                color: "#c084fc",
                fontFamily: "'Playwrite DE Grund', cursive",
                fontSize: "clamp(1.1rem, 1.5vw, 1.3rem)",
                fontWeight: 600,
              }}
            >
              {star.name}
            </h2>

            <p
              style={{
                fontSize: "clamp(0.75rem, 1vw, 0.85rem)",
                color: "#d1d5db",
                marginBottom: "6px",
              }}
            >
              {star.con} • Mag {star.mag} • {star.dist} ly
            </p>

            {star.funfact && (
              <p
                style={{
                  fontStyle: "italic",
                  color: "#a3e635",
                  marginTop: "4px",
                  fontSize: "clamp(0.7rem, 0.9vw, 0.8rem)",
                  lineHeight: "1.2rem",
                }}
              >
                💡 {star.funfact}
              </p>
            )}

            <button
              onClick={onClose}
              style={{
                marginTop: "12px",
                background: "#a855f7",
                border: "none",
                padding: "6px 14px",
                borderRadius: "8px",
                cursor: "pointer",
                color: "white",
                fontWeight: "bold",
                fontSize: "clamp(0.75rem, 0.9vw, 0.85rem)",
                fontFamily: "'Playwrite US Modern', sans-serif",
                transition: "background 0.25s ease, transform 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#9333ea";
                e.target.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#a855f7";
                e.target.style.transform = "scale(1)";
              }}
            >
              Close
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
