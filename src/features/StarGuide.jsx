import React, { useState, useEffect } from "react";

export default function StarGuide({ stars, onSelect, theme, setTheme }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Nova+Square&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  if (!stars || stars.length === 0) return null;

  // Sort and filter logic
  let sorted = [...stars].sort((a, b) => {
    const magA = isNaN(a.mag) ? 99 : a.mag;
    const magB = isNaN(b.mag) ? 99 : b.mag;
    if (magA !== magB) return magA - magB;
    const conA = a.con?.toUpperCase() || "";
    const conB = b.con?.toUpperCase() || "";
    if (conA < conB) return -1;
    if (conA > conB) return 1;
    return (a.name || "").localeCompare(b.name || "");
  });

  if (query.trim() !== "") {
    sorted = sorted.filter((s) =>
      (s.name || "").toLowerCase().includes(query.toLowerCase())
    );
  } else {
    sorted = sorted.slice(0, 1000);
  }

  return (
    <div
      style={{
        backgroundImage: `linear-gradient(
          120deg,
          rgba(70, 40, 120, 0.12),
          rgba(60, 90, 180, 0.1),
          rgba(80, 30, 160, 0.15),
          rgba(120, 80, 220, 0.12)
        )`,
        backgroundSize: "300% 300%",
        animation: "auroraFloat 20s ease-in-out infinite",
      }}
      className="
        fixed top-[1vh] left-[0.8vw]
        flex flex-col
        w-[clamp(250px,22vw,260px)] 
        h-[clamp(300px,40vh,350px)]
        backdrop-blur-[4px] saturate-[180%]
        border border-[rgba(140,100,255,0.2)] rounded-2xl
        shadow-[0_0_15px_rgba(160,80,255,0.2)]
        text-gray-100 font-[Nova_Square] text-[clamp(0.8rem,0.9vw,1rem)]
        p-[1rem] space-y-3 overflow-hidden
        transition-all duration-500 ease-out
        hover:shadow-[0_0_25px_rgba(160,130,255,0.4)]
        z-[9999]
      "
    >
      {/* Header */}
      <div
        className="
          flex items-center justify-between
          border-b border-white/10 pb-2
        "
      >
        <h3
          className="
            text-[1.1rem]
            bg-gradient-to-r from-sky-200 via-indigo-300 to-purple-200
            bg-clip-text text-transparent tracking-wide
            drop-shadow-[0_0_4px_rgba(140,160,255,0.3)]
          "
        >
          STAR GUIDE
        </h3>
        <button
          onClick={() => setTheme(theme === 'night' ? 'dawn' : 'night')}
          className="
            bg-indigo-700/20 border border-indigo-400/20 rounded-md
            px-2 py-[2px] text-[0.75rem] text-sky-100
            hover:bg-indigo-500/25 transition
          "
        >
          {theme === "night" ? "🌑" : "🌕"}
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex justify-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a star..."
          className="
            w-[95%] px-3 py-2 rounded-lg border border-indigo-400/20
            bg-white/5 text-white text-[0.85rem] outline-none
            placeholder:text-gray-400
            focus:border-sky-400 focus:bg-white/10 transition
          "
        />
      </div>

      {/* Scrollable List */}
      <div
        className="
          flex-1 overflow-y-auto pr-[6px]
          scrollbar-thin scrollbar-thumb-[rgba(130,160,255,0.35)]
          scrollbar-track-[rgba(255,255,255,0.03)]
          hover:scrollbar-thumb-[rgba(150,190,255,0.55)]
          [&::-webkit-scrollbar]:w-[8px]
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-[rgba(130,160,255,0.35)]
          [&::-webkit-scrollbar-thumb:hover]:bg-[rgba(150,190,255,0.55)]
          [&::-webkit-scrollbar-track]:bg-[rgba(255,255,255,0.03)]
        "
      >
        <ul className="list-none m-0 p-0">
          {sorted.map((star, i) => (
            <li
              key={i}
              onClick={() => onSelect(star)}
              className="
                cursor-pointer px-3 py-2 mb-1 rounded-md
                transition-all duration-200 ease-out
                hover:bg-[rgba(180,130,255,0.15)]
                hover:shadow-[0_0_10px_rgba(120,150,255,0.25)]
                active:scale-[0.98]
              "
            >
              <span className="font-semibold text-sky-200">{star.name}</span>{" "}
              <span className="opacity-60 text-[0.8rem] tracking-wide text-sky-100/80">
                ({star.con})
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Aurora Keyframes */}
      <style>{`
        @keyframes auroraFloat {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
