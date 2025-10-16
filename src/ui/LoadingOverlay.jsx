import { useEffect, useState } from "react";

export default function LoadingOverlay() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        color: "white",
        background: "rgba(0, 0, 0, 0.7)",
        padding: isMobile ? "12px 18px" : "14px 24px",
        borderRadius: "12px",
        fontSize: "clamp(0.85rem, 1vw, 1.1rem)",
        zIndex: 9999,
        boxShadow: "0 0 20px rgba(168,85,247,0.4)",
        textAlign: "center",
        backdropFilter: "blur(10px) saturate(150%)",
        WebkitBackdropFilter: "blur(10px) saturate(150%)",
        letterSpacing: "0.8px",
        fontFamily: "'Nova Square', sans-serif",
        transition: "all 0.25s ease-out",
      }}
    >
      🚀 Loading stars from AWS API...
    </div>
  );
}
