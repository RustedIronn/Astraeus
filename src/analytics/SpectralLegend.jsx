import React, { useEffect } from "react";

export default function SpectralLegend() {
  const classes = [
    { type: "O", color: "#6f9eff" },
    { type: "B", color: "#8cb4ff" },
    { type: "A", color: "#b5e0ff" },
    { type: "F", color: "#f8f7ff" },
    { type: "G", color: "#ffe6c7" },
    { type: "K", color: "#ffb06b" },
    { type: "M", color: "#ff6f61" },
    { type: "L", color: "#d64b4b" },
    { type: "T", color: "#a855f7" },
    { type: "Y", color: "#6b21a8" },
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
    rgba(111,158,255,0.18) 0%,
    rgba(140,180,255,0.16) 10%,
    rgba(181,224,255,0.14) 22%,
    rgba(248,247,255,0.12) 34%,
    rgba(255,230,199,0.14) 48%,
    rgba(255,176,107,0.14) 60%,
    rgba(255,111,97,0.15) 72%,
    rgba(214,75,75,0.15) 80%,
    rgba(168,85,247,0.16) 90%,
    rgba(107,33,168,0.18) 100%
  )`;

  return (
    <div
      style={{
        backgroundImage: gradient,
        backgroundSize: "400% 400%",
        animation: "auroraSpectrum 20s ease-in-out infinite",
      }}
      className="
        fixed bottom-[1vh] left-[0.8vw]
        bg-transparent
        backdrop-blur-[3px] saturate-[150%]
        border border-[rgba(180,100,255,0.25)] rounded-2xl
        shadow-[0_0_18px_rgba(160,80,255,0.25)]
        p-[clamp(0.6rem,0.8vw,0.9rem)]
        w-[clamp(240px,20vw,260px)] h-[clamp(120px,22vh,150px)]
        text-gray-100 font-[Nova_Square]
        flex flex-col items-center space-y-2
        z-[9999] transition-all duration-300 ease-out
        hover:shadow-[0_0_30px_rgba(192,132,252,0.35)]
      "
    >
      {/* Header */}
      <h3
        className="
          text-[clamp(0.8rem,0.9vw,1rem)]
          bg-gradient-to-r from-[#b3e5ff] via-[#e6f7ff] to-[#bfa1ff]
          bg-clip-text text-transparent
          tracking-wide text-center border-b border-white/10 pb-1 w-full
          drop-shadow-[0_0_6px_rgba(200,200,255,0.3)]
        "
      >
        • Spectral Classes •
      </h3>

      {/* Grid (5 per row, perfect symmetry) */}
      <div
        className="
          grid grid-cols-5 gap-y-2 gap-x-3 justify-items-center
          w-full mt-1
        "
      >
        {classes.map((c) => (
          <div
            key={c.type}
            className="
              flex flex-col items-center justify-center
              space-y-[2px] transition-transform duration-200
              hover:scale-[1.08]
            "
          >
            <div
              className="w-[clamp(0.75rem,0.9vw,1rem)] h-[clamp(0.75rem,0.9vw,1rem)] rounded-full"
              style={{
                background: c.color,
                boxShadow: `0 0 6px ${c.color}`,
              }}
            ></div>
            <span className="text-gray-100 text-[clamp(0.7rem,0.8vw,0.85rem)]">
              {c.type}
            </span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes auroraSpectrum {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
