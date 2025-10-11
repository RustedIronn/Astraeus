import React, { useEffect } from "react";

function SpectralLegend() {
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

  // 🪶 Load Nova Square font
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Nova+Square&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        bottom: "10px",
        left: "10px",
        background: "rgba(255,255,255,0.07)",
        backdropFilter: "blur(12px) saturate(140%)",
        WebkitBackdropFilter: "blur(12px) saturate(140%)",
        padding: "10px 12px",
        borderRadius: "10px",
        color: "#e5e7eb",
        fontSize: "0.8rem",
        fontFamily: "'Nova Square', sans-serif", // ✅ new font
        border: "1px solid rgba(255, 255, 255, 0.09)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        maxHeight: "260px",
        width: "200px",
        overflowY: "auto",
      }}
    >
      <strong
        style={{
          fontSize: "0.9rem",
          color: "#a78bfa",
          marginBottom: "6px",
          textAlign: "center",
          fontFamily: "'Nova Square', sans-serif",
          letterSpacing: "0.5px",
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
        }}
      >
        {classes.map((c) => (
          <div
            key={c.type}
            style={{
              width: "40%",
              textAlign: "center",
              fontSize: "0.75rem",
              fontFamily: "'Nova Square', sans-serif",
              letterSpacing: "0.4px",
            }}
          >
            <div
              style={{
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                background: c.color,
                margin: "0 auto 3px",
                boxShadow: `0 0 6px ${c.color}`,
              }}
            />
            {c.type}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SpectralLegend;
