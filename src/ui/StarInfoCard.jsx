import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import "../css/StarInfoCard.css";

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
          className="starinfo-container"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ duration: 0.4 }}
        >
          <div className={`starinfo-card ${isMobile ? "mobile" : ""}`}>
            <h2 className="starinfo-name">{star.name}</h2>
            <p className="starinfo-details">
              {star.con} • Mag {star.mag} • {star.dist} ly
            </p>

            {star.funfact && (
              <p className="starinfo-funfact">💡 {star.funfact}</p>
            )}

            <button className="starinfo-close" onClick={onClose}>
              Close
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
