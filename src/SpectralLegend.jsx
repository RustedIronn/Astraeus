function SpectralLegend() {
  const classes = [
    { type: "O", color: "#6f9eff" }, // blue-violet
    { type: "B", color: "#8cb4ff" }, // bright blue
    { type: "A", color: "#b5e0ff" }, // cyan-white
    { type: "F", color: "#f8f7ff" }, // soft white
    { type: "G", color: "#ffe6c7" }, // warm yellow
    { type: "K", color: "#ffb06b" }, // amber
    { type: "M", color: "#ff6f61" }, // deep red-orange
    { type: "L", color: "#d64b4b" }, // crimson
    { type: "T", color: "#a855f7" }, // magenta-violet
    { type: "Y", color: "#6b21a8" }, // dark purple
  ];

  return (
    <div
      style={{
        position: "absolute",
        bottom: "15px",
        right: "32px", // 👉 stays on the right
        background: "rgba(20,20,30,0.35)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        padding: "10px 14px",
        borderRadius: "10px",
        color: "white",
        fontSize: "0.8rem",
        fontFamily: "Segoe UI, Roboto, sans-serif",
        border: "1px solid rgba(255, 255, 255, 0.09)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.35)",
        zIndex: 9999,
        whiteSpace: "nowrap",
      }}
    >
      <strong style={{ fontSize: "0.9rem", color: "#a78bfa", display: "block", marginBottom: "6px" }}>
        🌈 Spectral Classes
      </strong>
      <div
        style={{
          display: "flex",
          gap: "14px", // 👈 row spacing
          alignItems: "center",
        }}
      >
        {classes.map((c) => (
          <div
            key={c.type}
            style={{
              textAlign: "center",
              fontSize: "0.75rem",
            }}
          >
            <div
              style={{
                width: "18px",
                height: "18px",
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
