import React, { useEffect } from "react";

export default function SpectralLegend() {
  const classes = [
    { type: "O", color: "#6ea2ff" },
    { type: "B", color: "#8fc0ff" },
    { type: "A", color: "#bfe6ff" },
    { type: "F", color: "#fff8e1" }, 
    { type: "G", color: "#ffd580" },
    { type: "K", color: "#ff9950" },
    { type: "M", color: "#ff635a" },
    { type: "L", color: "#e64a4a" },
    { type: "T", color: "#a94bff" },
    { type: "Y", color: "#741fbf" },
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
        overflow-hidden
      "
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(160,100,255,0.1)_0%,transparent_80%)] blur-3xl opacity-60 z-0"></div>

      <h3
        className="
          text-[clamp(0.8rem,0.9vw,1rem)]
          bg-gradient-to-r from-[#b3e5ff] via-[#e6f7ff] to-[#bfa1ff]
          bg-clip-text text-transparent
          tracking-wide text-center border-b border-white/10 pb-1 w-full
          drop-shadow-[0_0_6px_rgba(200,200,255,0.3)]
          relative z-10
        "
      >
        • Spectral Classes •
      </h3>

      <div
        className="
          grid grid-cols-5 gap-y-2 gap-x-3 justify-items-center
          w-full mt-1 relative z-10
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
                boxShadow: `0 0 10px ${c.color}, 0 0 20px ${c.color}40`,
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