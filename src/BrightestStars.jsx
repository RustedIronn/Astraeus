function BrightestStars({ stars, onSelect }) {
  // sort by apparent magnitude (smaller = brighter)
  const topStars = [...stars]
    .filter((s) => s.mag !== undefined && s.mag !== null)
    .sort((a, b) => a.mag - b.mag)
    .slice(0, 20);

  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        left: "20px",
        background: "rgba(20,20,30,0.95)",
        padding: "12px 16px",
        borderRadius: "12px",
        maxHeight: "70vh",
        overflowY: "auto",
        width: "200px",
        color: "white",
        fontFamily: "sans-serif",
        fontSize: "0.9rem",
        boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: "8px" }}>🌟 Brightest Stars</h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {topStars.map((star, i) => (
          <li
            key={i}
            style={{
              padding: "4px 0",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              cursor: "pointer",
            }}
            onClick={() => onSelect(star)}
          >
            {star.name} <span style={{ opacity: 0.6 }}>({star.mag})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BrightestStars;
