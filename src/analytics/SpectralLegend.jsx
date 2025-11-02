import React, { useEffect } from "react";

export default function SpectralLegend() {
  const classes = [
    {
      type: "O",
      color: "#7dc8ff",
      name: "Blue Supergiants",
      temp: "30,000–50,000 K",
      rarity: "<0.1%",
    },
    {
      type: "B",
      color: "#9ed1ff",
      name: "Blue-White Stars",
      temp: "10,000–30,000 K",
      rarity: "0.1%",
    },
    {
      type: "A",
      color: "#cfe8ff",
      name: "White Stars",
      temp: "7,500–10,000 K",
      rarity: "0.6%",
    },
    {
      type: "F",
      color: "#fff8e1",
      name: "Yellow-White Stars",
      temp: "6,000–7,500 K",
      rarity: "3%",
    },
    {
      type: "G",
      color: "#ffd580",
      name: "Yellow Dwarfs",
      temp: "5,000–6,000 K",
      rarity: "7.5%",
    },
    {
      type: "K",
      color: "#ff9950",
      name: "Orange Stars",
      temp: "3,500–5,000 K",
      rarity: "12%",
    },
    {
      type: "M",
      color: "#ff6b5a",
      name: "Red Dwarfs",
      temp: "2,000–3,500 K",
      rarity: "~76%",
    },
    {
      type: "L",
      color: "#e64a4a",
      name: "Brown Dwarfs",
      temp: "1,300–2,000 K",
      rarity: "Rare",
    },
    {
      type: "T",
      color: "#b46bff",
      name: "Methane Dwarfs",
      temp: "700–1,300 K",
      rarity: "Rare",
    },
    {
      type: "Y",
      color: "#7b2cff",
      name: "Cool Brown Dwarfs",
      temp: "<700 K",
      rarity: "Extremely Rare",
    },
  ];

  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Nova+Square&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const gradient = `linear-gradient(
    135deg,
    rgba(111,162,255,0.18) 0%,
    rgba(143,192,255,0.16) 10%,
    rgba(191,230,255,0.14) 22%,
    rgba(255,248,225,0.12) 34%,
    rgba(255,213,128,0.14) 48%,
    rgba(255,153,80,0.14) 60%,
    rgba(255,99,90,0.15) 72%,
    rgba(230,74,74,0.15) 80%,
    rgba(169,75,255,0.16) 90%,
    rgba(116,31,191,0.18) 100%
  )`;

  return (
    <div
      style={{
        backgroundImage: gradient,
        backgroundSize: "400% 400%",
        animation: "auroraSpectrum 20s ease-in-out infinite",
      }}
      className="
        w-full h-full flex flex-col items-center justify-start
        backdrop-blur-[4px] saturate-[150%]
        border border-[rgba(180,100,255,0.25)]
        rounded-2xl shadow-[0_0_18px_rgba(160,80,255,0.25)]
        p-4 md:p-6
        font-[Nova_Square] text-gray-100
        overflow-y-auto custom-scrollbar
        animate-[fadeIn_0.6s_ease-out]
      "
    >
      <h3
        className="
          text-[clamp(1rem,1.2vw,1.3rem)]
          bg-gradient-to-r from-[#b3e5ff] via-[#e6f7ff] to-[#bfa1ff]
          bg-clip-text text-transparent
          tracking-wide text-center
          drop-shadow-[0_0_6px_rgba(200,200,255,0.3)]
          mb-4
        "
      >
        • Spectral Classification •
      </h3>

      <div
        className="
          grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5
          gap-y-6 gap-x-4 justify-items-center w-full
        "
      >
        {classes.map((c) => (
          <div
            key={c.type}
            className="flex flex-col items-center text-center space-y-2 group"
          >
            {/* Glowing Star */}
            <div
              className="relative transition-transform duration-300 group-hover:scale-125"
              style={{
                width: "clamp(1.1rem, 1.6vw, 1.8rem)",
                height: "clamp(1.1rem, 1.6vw, 1.8rem)",
              }}
            >
              <div
                style={{
                  background: `radial-gradient(circle at 35% 35%, #fff, ${c.color} 60%)`,
                  boxShadow: `0 0 10px ${c.color}66, 0 0 25px ${c.color}44, inset 0 0 4px ${c.color}`,
                }}
                className="w-full h-full rounded-full relative z-10 border border-[rgba(255,255,255,0.1)]"
              ></div>
            </div>

            {/* Star Type */}
            <span
              className="
                text-[clamp(0.9rem,1vw,1.1rem)]
                transition-all duration-200 group-hover:text-cyan-200
              "
            >
              {c.type}
            </span>

            {/* Info */}
            <div className="text-[clamp(0.65rem,0.8vw,0.8rem)] leading-tight opacity-90">
              <p style={{ color: c.color }}>{c.name}</p>
              <p className="text-gray-300">{c.temp}</p>
              <p className="text-gray-400">{c.rarity}</p>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes auroraSpectrum {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(0,255,255,0.4), rgba(140,100,255,0.5));
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
