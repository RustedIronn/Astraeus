import React, { useState } from "react";

export default function StarGuide({ stars, onSelect }) {
  const [query, setQuery] = useState("");

  if (!stars || stars.length === 0) return null;

  // Sort alphabetically
  let sorted = [...stars].sort((a, b) =>
    (a.name || "").localeCompare(b.name || "")
  );

  // Filter by search
  if (query.trim() !== "") {
    sorted = sorted.filter((s) =>
      (s.name || "").toLowerCase().includes(query.toLowerCase())
    );
  } else {
    // Limit default view for speed
    sorted = sorted.slice(0, 5000);
  }

  return (
    <div
      style={{
        position: "absolute",
        left: "10px",
        top: "5px",
        background: "rgba(255, 255, 255, 0.07)", // glass base
        border: "1px solid rgba(255, 255, 255, 0.05)", // subtle border
        borderRadius: "16px",
        padding: "16px",
        width: "200px",
        maxHeight: "67vh",
        color: "#e5e7eb",
        fontSize: "0.9rem",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        backdropFilter: "blur(12px) saturate(140%)", // ✨ real glassmorph
        WebkitBackdropFilter: "blur(12px) saturate(140%)",
      }}
    >
      <h3
        style={{
          margin: 0,
          marginBottom: "12px",
          fontSize: "1.2rem",
          fontWeight: "600",
          color: "#c084fc", // nice violet accent
          borderBottom: "1px solid rgba(255,255,255,0.15)",
          paddingBottom: "6px",
        }}
      >
        🌌 Star Guide
      </h3>

      {/* 🔎 Search Bar */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search a star..."
        style={{
          width: "85%",
          padding: "8px 10px",
          marginBottom: "12px",
          borderRadius: "10px",
          border: "1px solid rgba(255,255,255,0.2)",
          background: "rgba(255,255,255,0.1)",
          color: "#fff",
          fontSize: "0.85rem",
          outline: "none",
        }}
      />

      {/* Scrollable List */}
      <div
        style={{
          overflowY: "auto",
          flex: 1,
          paddingRight: "6px",
        }}
      >
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {sorted.map((star, i) => (
            <li
  key={i}
  onClick={() => onSelect(star)}
  style={{
    cursor: "pointer",
    padding: "8px 6px",
    borderRadius: "8px",
    marginBottom: "4px",
    position: "relative",
    transition: "all 0.25s ease",
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.background = "rgba(255,255,255,0.12)";
    e.currentTarget.style.transform = "scale(1.03)"; // subtle zoom instead of shifting
    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background = "transparent";
    e.currentTarget.style.transform = "scale(1)";
    e.currentTarget.style.boxShadow = "none";
  }}
>
  {/* Accent bar on left */}
  <div
    style={{
      position: "absolute",
      left: 0,
      top: "50%",
      transform: "translateY(-50%)",
      height: "70%",
      width: "3px",
      borderRadius: "2px",
      background: "linear-gradient(to bottom, #c084fc, #9333ea)",
      opacity: 0,
      transition: "opacity 0.3s ease",
    }}
    className="hover-bar"
  />
  <span style={{ fontWeight: 500 }}>{star.name}</span>{" "}
  <span style={{ opacity: 0.6, fontSize: "0.8rem" }}>({star.con})</span>
</li>

          ))}
        </ul>
      </div>
    </div>
  );
}
