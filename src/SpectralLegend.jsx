function SpectralLegend() {
  const classes = [
    { type: "O", color: "#9bb0ff" },
    { type: "B", color: "#aabfff" },
    { type: "A", color: "#cad7ff" },
    { type: "F", color: "#f8f7ff" },
    { type: "G", color: "#fff4ea" },
    { type: "K", color: "#ffd2a1" },
    { type: "M", color: "#ffcc6f" },
  ];

  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        right: "20px",
        background: "rgba(0,0,0,0.7)",
        padding: "10px 14px",
        borderRadius: "8px",
        color: "white",
        fontSize: "0.85rem",
        fontFamily: "sans-serif",
      }}
    >
      <strong>Spectral Classes</strong>
      <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
        {classes.map((c) => (
          <div key={c.type} style={{ textAlign: "center" }}>
            <div
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background: c.color,
                margin: "0 auto 2px",
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
