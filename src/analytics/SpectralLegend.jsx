import React, { useEffect } from "react";

export default function SpectralLegend() {
  const classes = [
    { type: "O", color: "#6f9eff" },
    { type: "B", color: "#8cb4ff" },
    { type: "A", color: "#b5e0ff" },
    { type: "F", color: "#f8f7ff" },
    { type: "G", color: "#ffe6c7" },
    { type: "K", color: "#ffb06b" },
    { type: "M", color: "#ff6f61" },
    { type: "L", color: "#d64b4b" },
    { type: "T", color: "#a855f7" },
    { type: "Y", color: "#6b21a8" },
  ];

  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Nova+Square&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "0.5vh",
        left: "0.3vw",
        background: "rgba(255,255,255,0.07)",
        backdropFilter: "blur(12px) saturate(140%)",
        WebkitBackdropFilter: "blur(12px) saturate(140%)",
        padding: "14px",
        borderRadius: "14px",
        color: "#e5e7eb",
        fontFamily: "'Nova Square', sans-serif",
        border: "1px solid rgba(255,255,255,0.09)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "220px",
        maxHeight: "270px",
        overflowY: "auto",
        scrollbarWidth: "thin",
        scrollBehavior: "smooth",
        transition: "all 0.25s ease-out",
      }}
    >
      <strong
        style={{
          fontSize: "1rem",
          color: "#a78bfa",
          marginBottom: "8px",
          textAlign: "center",
          letterSpacing: "0.5px",
          textShadow: "0 0 6px rgba(167,139,250,0.4)",
        }}
      >
        • Spectral Classes •
      </strong>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "10px",
          width: "100%",
        }}
      >
        {classes.map((c) => (
          <div
            key={c.type}
            style={{
              width: "40%",
              textAlign: "center",
              fontSize: "0.8rem",
              letterSpacing: "0.4px",
              color: "#e5e7eb",
            }}
          >
            <div
              style={{
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                background: c.color,
                margin: "0 auto 4px",
                boxShadow: `0 0 6px ${c.color}`,
              }}
            />
            {c.type}
          </div>
        ))}
      </div>

      {/* responsive fix for smaller screens */}
      <style>
        {`
          @media (max-width: 600px) {
            div[style*="position: fixed"] {
              width: 180px !important;
              font-size: 0.85rem !important;
              padding: 10px !important;
            }
            strong {
              font-size: 0.9rem !important;
            }
          }
        `}
      </style>
    </div>
  );
}
