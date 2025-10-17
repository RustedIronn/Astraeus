import React, { useState, useEffect } from "react";
import "../css/StarGuide.css";

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
    <div className="star-guide">
      <h3 className="guide-header">
        STAR GUIDE
        <button
          onClick={() => setTheme(theme === "night" ? "dawn" : "night")}
          className="theme-toggle"
        >
          {theme === "night" ? "🌅" : "🌌"}
        </button>
      </h3>

      {/* Search Bar */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search a star..."
        className="guide-search"
      />

      {/* Scrollable List */}
      <div className="guide-list">
        <ul>
          {sorted.map((star, i) => (
            <li key={i} onClick={() => onSelect(star)} className="guide-item">
              <span className="star-name">{star.name}</span>{" "}
              <span className="star-constellation">({star.con})</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
