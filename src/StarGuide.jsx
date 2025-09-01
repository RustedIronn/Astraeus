export default function StarGuide({ onSelect }) {
  const famousStars = [
    { name: "Sirius", funfact: "The brightest star in the night sky.", hip: 32349 },
    { name: "Betelgeuse", funfact: "A red supergiant that will explode one day.", hip: 27989 },
    { name: "Vega", funfact: "Used as a reference star, part of the Summer Triangle.", hip: 91262 },
    { name: "Rigel", funfact: "A luminous blue supergiant.", hip: 24436 },
    { name: "Polaris", funfact: "The North Star, almost above Earth's axis.", hip: 11767 },
    { name: "Proxima Centauri", funfact: "The closest star to the Sun.", hip: 70890 },
  ];

  return (
    <div style={{
      position: "absolute",
      top: "20px",
      left: "20px",
      background: "rgba(0,0,0,0.7)",
      padding: "10px",
      borderRadius: "8px",
      color: "white",
      width: "250px",
      fontSize: "14px"
    }}>
      <h3>🌟 Star Guide</h3>
      {famousStars.map((star, idx) => (
        <div
          key={idx}
          style={{ marginBottom: "10px", cursor: "pointer" }}
          onClick={() => onSelect(star)}
        >
          <strong>{star.name}</strong>
          <p style={{ margin: "2px 0" }}>{star.funfact}</p>
        </div>
      ))}
    </div>
  );
}
