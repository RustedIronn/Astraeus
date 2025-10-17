import React, { useEffect } from "react";
import "../css/SpectralLegend.css";

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
    <div className="spectral-legend">
      <strong className="legend-title">• Spectral Classes •</strong>

      <div className="legend-grid">
        {classes.map((c) => (
          <div className="legend-item" key={c.type}>
            <div
              className="legend-dot"
              style={{
                background: c.color,
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
