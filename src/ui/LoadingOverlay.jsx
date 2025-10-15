import { useEffect, useState } from "react";

export default function LoadingOverlay() {
  const [scale, setScale] = useState(Math.min(window.innerWidth / 1920, 1));

  useEffect(() => {
    const handleResize = () => setScale(Math.min(window.innerWidth / 1920, 1));
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: `translate(-50%, -50%) scale(${scale})`,
        transformOrigin: "center center",
        color: "white",
        background: "rgba(0, 0, 0, 0.7)",
        padding: "14px 24px",
        borderRadius: "10px",
        fontSize: "1rem",
        zIndex: 9999,
        boxShadow: "0 0 20px rgba(168,85,247,0.4)",
        textAlign: "center",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        transition: "transform 0.2s ease-out",
      }}
    >
      🚀 Loading stars from AWS API...
    </div>
  );
}
