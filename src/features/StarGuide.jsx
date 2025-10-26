import React, { useState, useEffect, useMemo } from "react";

export default function StarGuide({ stars, onSelect, theme, setTheme, selectedStar }) {
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState("brightness");
  const [openMenu, setOpenMenu] = useState(false);

  const sortOptions = [
    { key: "brightness", label: "Luminosity Index", gradient: "from-yellow-200 via-amber-300 to-orange-300" },
    { key: "distance", label: "Light-year Distance", gradient: "from-emerald-300 via-teal-300 to-cyan-400" },
    { key: "alphabet", label: "Designation Order", gradient: "from-pink-300 via-purple-300 to-fuchsia-400" },
    { key: "constellation", label:"Constellation Grouping", gradient: "from-violet-300 via-purple-400 to-indigo-400" },
    { key: "spectral", label: "Spectral Type", gradient: "from-teal-300 via-violet-400 to-purple-300" },
  ];

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Nova+Square&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  if (!stars || stars.length === 0) return null;

  const sorted = useMemo(() => {
    let sortedStars = [...stars];
    switch (sortMode) {
      case "distance":
        sortedStars.sort((a, b) => (a.dist ?? Infinity) - (b.dist ?? Infinity));
        break;
      case "alphabet":
        sortedStars.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "constellation":
        sortedStars.sort((a, b) => (a.con || "").localeCompare(b.con || ""));
        break;
      case "spectral":
        sortedStars.sort((a, b) => (a.spect || "").localeCompare(b.spect || ""));
        break;
      default:
        sortedStars.sort((a, b) => (a.mag ?? 99) - (b.mag ?? 99));
        break;
    }

    if (selectedStar?.con) {
      const con = selectedStar.con.toUpperCase();
      sortedStars.sort((a, b) => {
        if (a.con === con && b.con !== con) return -1;
        if (b.con === con && a.con !== con) return 1;
        return 0;
      });
    }

    if (query.trim() !== "") {
      sortedStars = sortedStars.filter((s) =>
        (s.name || "").toLowerCase().includes(query.toLowerCase())
      );
    } else {
      sortedStars = sortedStars.slice(0, 1000);
    }

    return sortedStars;
  }, [stars, sortMode, query, selectedStar]);

  // 🌌 Main glass panel gradient (translucent)
  const auroraGradient = `linear-gradient(
    130deg,
    rgba(0, 255, 210, 0.18),
    rgba(0, 200, 180, 0.18),
    rgba(110, 0, 255, 0.18),
    rgba(150, 0, 255, 0.18)
  )`;

  // 💎 Static, opaque dropdown gradient using your exact colors
  const staticAurora = `linear-gradient(
    135deg,
    #00483f 0%,
    #231354 100%
  )`;

  return (
    <div
      style={{
        backgroundImage: auroraGradient,
        backgroundSize: "400% 400%",
        animation: "auroraFloat 18s ease-in-out infinite",
        backdropFilter: "blur(3px) saturate(160%)",
        backgroundColor: "rgba(20, 20, 30, 0.3)",
      }}
      className="
        fixed top-[1vh] left-[0.8vw]
        flex flex-col 
        w-[clamp(250px,22vw,260px)] 
        h-[clamp(300px,40vh,350px)]
        border border-[rgba(140,100,255,0.3)] rounded-2xl
        shadow-[0_0_35px_rgba(0,255,255,0.25)]
        text-gray-100 font-[Nova_Square] text-[clamp(0.8rem,0.9vw,1rem)]
        p-[1rem] space-y-3 overflow-hidden
        transition-all duration-500 ease-out
        hover:shadow-[0_0_45px_rgba(150,0,255,0.4)]
        z-[9999]
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <h3
          className="
            text-[1.1rem]
            bg-gradient-to-r from-teal-200 via-cyan-300 to-violet-300
            bg-clip-text text-transparent tracking-wide
          "
        >
          STAR GUIDE
        </h3>
        <button
          onClick={() => setTheme(theme === "night" ? "dawn" : "night")}
          className="
            bg-violet-800/30 border border-teal-400/30 rounded-md
            px-2 py-[2px] text-[0.75rem] text-cyan-100
            hover:bg-violet-700/40 transition
          "
        >
          {theme === "night" ? "🌑" : "🌕"}
        </button>
      </div>

      {/* Search */}
      <div className="flex justify-between items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a star..."
          className="
            w-full px-3 py-2 rounded-lg border border-teal-300/40
            bg-white/5 text-white text-[0.8rem] outline-none
            placeholder:text-gray-300
            focus:border-violet-400 focus:bg-white/10 transition
          "
        />
      </div>

      {/* Sort Dropdown */}
      <div className="relative mt-3">
        <button
          style={{
            backgroundImage: auroraGradient,
            backgroundSize: "400% 400%",
            animation: "auroraFloat 18s ease-in-out infinite",
          }}
          onClick={() => setOpenMenu(!openMenu)}
          className="
            w-full px-3 py-[10px]
            text-[0.8rem] rounded-lg
            text-white font-[Nova_Square]
            border border-[rgba(0,255,255,0.25)]
            shadow-[0_0_10px_rgba(0,255,255,0.25)]
            hover:shadow-[0_0_15px_rgba(150,0,255,0.4)]
            hover:scale-[1.02]
            transition-all duration-300 ease-out
            flex justify-between items-center cursor-pointer
          "
        >
          {sortOptions.find((opt) => opt.key === sortMode)?.label}
          <span className="text-[0.7rem] opacity-80">▼</span>
        </button>

        {openMenu && (
          <ul
            style={{
              backgroundImage: staticAurora,
              backgroundSize: "100% 100%",
              boxShadow: "inset 0 0 8px rgba(255,255,255,0.05), 0 0 20px rgba(0,255,255,0.25)",
            }}
            className="
              absolute top-[105%] left-0 right-0
              border border-[rgba(0,255,255,0.3)]
              rounded-lg overflow-hidden
              animate-fadeIn z-50
            "
          >
            {sortOptions.map((opt) => (
              <li
                key={opt.key}
                onClick={() => {
                  setSortMode(opt.key);
                  setOpenMenu(false);
                }}
                className={`px-3 py-2 text-[0.8rem] cursor-pointer transition-all duration-200 ease-out
                  ${
                    sortMode === opt.key
                      ? "bg-[rgba(0,255,255,0.25)] text-cyan-100"
                      : "hover:bg-[rgba(150,0,255,0.25)] text-gray-100"
                  }`}
              >
                <span
                  className={`bg-gradient-to-r ${opt.gradient} bg-clip-text text-transparent font-semibold tracking-wide`}
                >
                  {opt.label}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Scrollable list */}
      <div
        className="
          flex-1 overflow-y-auto pr-[6px] scroll-smooth
          scrollbar-thin scrollbar-thumb-[rgba(0,255,255,0.35)]
          scrollbar-track-[rgba(255,255,255,0.05)]
          hover:scrollbar-thumb-[rgba(130,160,255,0.55)]
          [&::-webkit-scrollbar]:w-[8px]
          [&::-webkit-scrollbar-thumb]:rounded-full
        "
      >
        <ul className="list-none m-0 p-0">
          {sorted.map((star, i) => (
            <li
              key={i}
              onClick={() => onSelect(star)}
              className={`cursor-pointer px-3 py-2 mb-1 rounded-md transition-all duration-200 ease-out
                ${
                  selectedStar?.hip === star.hip
                    ? "bg-[rgba(0,255,255,0.4)] shadow-[0_0_15px_rgba(0,255,255,0.45)]"
                    : selectedStar?.con?.toUpperCase() === star.con
                    ? "bg-[rgba(120,0,255,0.4)] shadow-[0_0_10px_rgba(160,130,255,0.35)]"
                    : "hover:bg-[rgba(0,200,255,0.3)] hover:shadow-[0_0_10px_rgba(0,255,255,0.35)]"
                }
                active:scale-[0.98]
              `}
            >
              <span className="font-semibold text-white">{star.name}</span>{" "}
              <span className="opacity-70 text-[0.8rem] tracking-wide text-gray-200">
                ({star.con})
              </span>
            </li>
          ))}
        </ul>
      </div>

      <style>{`
        @keyframes auroraFloat {
          0% { background-position: 0% 50%; }
          25% { background-position: 50% 60%; }
          50% { background-position: 100% 50%; }
          75% { background-position: 50% 40%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
