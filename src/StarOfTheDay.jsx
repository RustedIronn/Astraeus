import { useEffect, useState } from "react";

function StarOfTheDay() {
  const [data, setData] = useState(null);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_NASA_API_KEY;
    fetch(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}`)
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) return <p style={{ color: "white" }}>Loading The Space Brief...</p>;

  const text = showMore
    ? data.explanation
    : data.explanation.slice(0, 160) + "...";

  return (
    <div
      style={{
        position: "absolute",
        top: "0px",
        right: "0px",
        width: "315px",
        background: "rgba(20,20,30,0.07)", // 👈 transparent background
        backdropFilter: "blur(12px) saturate(140%)",       // 👈 glass effect
        WebkitBackdropFilter: "blur(12px) saturate(140%)", // Safari support
        padding: "16px",
        borderRadius: "12px",
        color: "#e5e7eb",
        fontFamily: "Segoe UI, Roboto, sans-serif",
        maxHeight: "480px",
        overflowY: "auto",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        border: "1px solid rgba(255, 255, 255, 0.03)",
      }}
    >
      <h3 style={{ margin: "0 0 6px 0", fontSize: "18px", color: "#a78bfa" }}>
        ⭐ The Space Brief
      </h3>
      <p style={{ margin: "0 0 10px 0", fontWeight: "bold", fontSize: "15px" }}>
        {data.title}
      </p>

      {data.media_type === "image" && (
        <img
          src={data.url}
          alt={data.title}
          style={{
            width: "100%",
            borderRadius: "8px",
            marginTop: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
          }}
        />
      )}

      <p style={{ marginTop: "10px", fontSize: "14px", lineHeight: "1.4" }}>
        {text}
      </p>

      <button
        onClick={() => setShowMore(!showMore)}
        style={{
          marginTop: "10px",
          padding: "6px 12px",
          fontSize: "13px",
          fontWeight: "600",
          color: "violet",
          background: "transparent",
          border: "1px solid violet",
          borderRadius: "6px",
          cursor: "pointer",
          transition: "all 0.25s ease",
        }}
        onMouseOver={(e) => {
          e.target.style.background = "violet";
          e.target.style.color = "black";
          e.target.style.transform = "scale(1.05)";
        }}
        onMouseOut={(e) => {
          e.target.style.background = "transparent";
          e.target.style.color = "violet";
          e.target.style.transform = "scale(1)";
        }}
        onMouseDown={(e) => {
          e.target.style.transform = "scale(0.95)";
        }}
        onMouseUp={(e) => {
          e.target.style.transform = "scale(1.05)";
        }}
      >
        {showMore ? "Show Less" : "Read More"}
      </button>
    </div>
  );
}

export default StarOfTheDay;
