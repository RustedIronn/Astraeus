import { motion, AnimatePresence } from "framer-motion";

export default function StarInfoCard({ star, onClose }) {
  return (
    <AnimatePresence>
      {star && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.9 }}
          transition={{ duration: 0.4 }}
          style={{
            position: "fixed",
            bottom: "12px",
            left: "735px",
            transform: "translateX(-50%)",
            background: "rgba(20, 20, 30, 0.12)",
            backdropFilter: "blur(20px) saturate(160%)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "18px 22px",
            borderRadius: "16px",
            color: "white",
            width: "340px",
            maxWidth: "90vw",
            textAlign: "center",
            boxShadow: "0 0 20px rgba(168,85,247,0.4)",
            zIndex: 9999,
            fontFamily: "'Playwrite US Modern', sans-serif",
          }}
        >
          <h2
            style={{
              margin: "0 0 8px 0",
              color: "#c084fc",
              fontFamily: "'Playwrite DE Grund', cursive",
              fontSize: "1.3rem",
              fontWeight: 600,
            }}
          >
            {star.name}
          </h2>

          <p style={{ fontSize: "0.85rem", color: "#d1d5db", marginBottom: "6px" }}>
            {star.con} • Mag {star.mag} • {star.dist} ly
          </p>

          {star.funfact && (
            <p
              style={{
                fontStyle: "italic",
                color: "#a3e635",
                marginTop: "4px",
                fontSize: "0.8rem",
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
              fontSize: "0.85rem",
              fontFamily: "'Playwrite US Modern', sans-serif",
              transition: "background 0.25s ease",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#9333ea")}
            onMouseLeave={(e) => (e.target.style.background = "#a855f7")}
          >
            Close
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
