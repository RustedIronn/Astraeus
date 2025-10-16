import React, { useState, useEffect } from "react";

export default function StarGuide({ stars, onSelect, theme, setTheme }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Nova+Square&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  if (!stars || stars.length === 0) return null;

  // Sort by brightness → constellation → name
  let sorted = [...stars].sort((a, b) => {
    const magA = isNaN(a.mag) ? 99 : a.mag;
    const magB = isNaN(b.mag) ? 99 : b.mag;
    if (magA !== magB) return magA - magB;

    const conA = a.con?.toUpperCase() || "";
    const conB = b.con?.toUpperCase() || "";
    if (conA < conB) return -1;
    if (conA > conB) return 1;

    const nameA = a.name?.toUpperCase() || "";
    const nameB = b.name?.toUpperCase() || "";
    return nameA.localeCompare(nameB);
  });

  // Filter
  if (query.trim() !== "") {
    sorted = sorted.filter((s) =>
      (s.name || "").toLowerCase().includes(query.toLowerCase())
    );
  } else {
    sorted = sorted.slice(0, 5000);
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "0.5vh",
        left: "0.01vw",
        background: "rgba(255, 255, 255, 0.06)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "18px",
        padding: "16px",
        width: "220px", // fixed slim width, won’t expand or compress
        maxHeight: "370px",
        color: "#e5e7eb",
        fontFamily: "'Nova Square', sans-serif",
        fontSize: "0.9rem",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 8px 28px rgba(0,0,0,0.5)",
        backdropFilter: "blur(14px) saturate(150%)",
        WebkitBackdropFilter: "blur(14px) saturate(150%)",
        zIndex: 9999,
        transition: "all 0.25s ease-out",
      }}
    >
      <h3
        style={{
          margin: 0,
          marginBottom: "14px",
          fontSize: "1.15rem",
          fontFamily: "'Nova Square', sans-serif",
          letterSpacing: "0.6px",
          color: "#c084fc",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          paddingBottom: "6px",
          textShadow: "0 0 6px rgba(192,132,252,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        STAR GUIDE
        <button
          onClick={() => setTheme(theme === "night" ? "day" : "night")}
          style={{
            background: "rgba(255,255,255,0.1)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "8px",
            padding: "4px 8px",
            cursor: "pointer",
            fontSize: "0.7rem",
            fontFamily: "'Nova Square', sans-serif",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) =>
            (e.target.style.background = "rgba(255,255,255,0.2)")
          }
          onMouseLeave={(e) =>
            (e.target.style.background = "rgba(255,255,255,0.1)")
          }
        >
          {theme === "night" ? "☀️" : "🌙"}
        </button>
      </h3>

      {/* Search Bar */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search a star..."
        style={{
          width: "90%",
          padding: "8px 10px",
          marginBottom: "12px",
          borderRadius: "10px",
          border: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(255,255,255,0.08)",
          color: "#fff",
          fontSize: "0.85rem",
          fontFamily: "'Nova Square', sans-serif",
          outline: "none",
          transition: "all 0.25s ease",
        }}
        onFocus={(e) => (e.target.style.border = "1px solid #a855f7")}
        onBlur={(e) =>
          (e.target.style.border = "1px solid rgba(255,255,255,0.15)")
        }
      />

      {/* Scrollable List */}
      <div
        style={{
          overflowY: "auto",
          flex: 1,
          paddingRight: "6px",
          scrollbarWidth: "thin",
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
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                e.currentTarget.style.transform = "scale(1.03)";
                e.currentTarget.style.boxShadow =
                  "0 2px 10px rgba(168,85,247,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <span style={{ fontWeight: 600 }}>{star.name}</span>{" "}
              <span
                style={{
                  opacity: 0.6,
                  fontSize: "0.8rem",
                  letterSpacing: "0.4px",
                }}
              >
                ({star.con})
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Responsive tweak only for very small screens */}
      <style>
        {`
          @media (max-width: 600px) {
            div[style] {
              width: 180px !important;
              font-size: 0.8rem !important;
              padding: 12px !important;
            }
          }
        `}
      </style>
    </div>
  );
}
