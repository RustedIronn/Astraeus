import { useState, useRef, useEffect, memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Globe2, Rainbow, BarChart3 } from "lucide-react";
import SpaceBrief from "../features/SpaceBrief";
import SpectralLegend from "../analytics/SpectralLegend";
import StarAnalytics from "../analytics/StarAnalytics";

/* --- Aurora overlay (unchanged, slightly tweaked colors) --- */
const AuroraOverlay = memo(({ active }) => (
  <span
    className={`
      absolute inset-0 rounded-xl
      bg-gradient-to-r from-cyan-400/25 via-blue-500/25 to-violet-500/25
      blur-[16px] transition-opacity duration-500
      will-change-transform will-change-opacity
      ${active ? "opacity-70 animate-aurora" : "opacity-0 hover:opacity-40"}
    `}
    style={{ pointerEvents: "none" }}
  />
));

/* --- Tooltip: positions itself using measurements of the anchor button --- */
function Tooltip({ anchorRect, visible, text }) {
  const tipRef = useRef(null);
  const [style, setStyle] = useState({ top: 0, left: 0, opacity: 0 });

  useEffect(() => {
    if (!visible || !anchorRect) {
      setStyle((s) => ({ ...s, opacity: 0 }));
      return;
    }

    const update = () => {
      if (!anchorRect || !tipRef.current) return;
      const tipEl = tipRef.current;
      const tipRect = tipEl.getBoundingClientRect();

      // place tooltip to the LEFT of the button (since dock is on the right)
      const gap = 20; // px gap between button and tooltip
      const left = anchorRect.left - tipRect.width - gap;

      // center vertically on the button using translateY(-50%)
      const top = anchorRect.top + anchorRect.height / 2 - 10;

      // clamp so tooltip doesn't go off top/bottom of viewport
      const clampedTop = Math.max(10 + tipRect.height / 2, Math.min(window.innerHeight - 10 - tipRect.height / 2, top));

      setStyle({ top: clampedTop, left, opacity: 1 });
    };

    // update next tick so tooltip can measure itself
    const t = requestAnimationFrame(update);

    // also update on resize/scroll (keeps alignment)
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      cancelAnimationFrame(t);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [visible, anchorRect]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.span
          ref={tipRef}
          initial={{ opacity: 0, y: 6, scale: 0.96 }}
          animate={{ opacity: style.opacity, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.96 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          style={{
            position: "fixed",
            top: style.top ? `${style.top}px` : "-9999px",
            left: style.left ? `${style.left}px` : "-9999px",
            transform: "translateY(-50%)",
            zIndex: 60,
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
          className={`
            rounded-md px-3 py-[0.35rem]
            text-[0.8rem] text-cyan-200
            border border-[rgba(120,100,255,0.25)]
            shadow-[0_4px_18px_rgba(10,10,30,0.6)]
            bg-[rgba(20,20,40,0.55)]
            backdrop-blur-[10px]
          `}
        >
          <span
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 8,
              background:
                "linear-gradient(135deg, rgba(0,220,255,0.15), rgba(100,140,255,0.18), rgba(180,80,255,0.12))",
              backgroundSize: "200% 200%",
              animation: "auroraMove 18s ease-in-out infinite",
              zIndex: -1,
              opacity: 0.7,
              pointerEvents: "none",
            }}
          />
          {text}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

/* --- Main DashboardHub (uses tooltip anchors) --- */
export default function DashboardHub({ theme }) {
  const [active, setActive] = useState(null);
  const [hoveredKey, setHoveredKey] = useState(null);

  // we'll store refs/rects per button so tooltip can position itself
  const buttonRefs = useRef({}); // { key: HTMLElement }
  const [anchorRect, setAnchorRect] = useState(null);

  const togglePanel = (panel) => setActive((prev) => (prev === panel ? null : panel));

  const panels = {
    space: <SpaceBrief />,
    legend: <SpectralLegend />,
    analytics: <StarAnalytics />,
  };

  const panelButtons = [
    { key: "space", icon: <Globe2 size={20} />, title: "Space Brief" },
    { key: "legend", icon: <Rainbow size={20} />, title: "Spectral Legend" },
    { key: "analytics", icon: <BarChart3 size={20} />, title: "Star Analytics" },
  ];

  // update anchorRect when hoveredKey (or active) changes
  useEffect(() => {
    const key = hoveredKey ?? active; // prefer hovered for immediate hover alignment
    if (!key) {
      setAnchorRect(null);
      return;
    }
    const btnEl = buttonRefs.current[key];
    if (!btnEl) {
      setAnchorRect(null);
      return;
    }
    const rect = btnEl.getBoundingClientRect();
    setAnchorRect(rect);
  }, [hoveredKey, active]);

  return (
    <>
      {/* Dock */}
      <div
        className="
          fixed top-[2vh] right-[2vh]
          flex flex-col items-center gap-3
          z-[1000] p-3 overflow-visible
          rounded-2xl
          bg-[rgba(15,15,35,0.6)]
          border border-[rgba(120,120,255,0.25)]
          shadow-[0_0_25px_rgba(100,120,255,0.25)]
        "
        style={{ backdropFilter: "blur(10px)" }}
      >
        <div
          aria-hidden
          className="absolute inset-0 rounded-2xl before:content-['']"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,220,255,0.12), rgba(80,120,255,0.18), rgba(200,100,255,0.15))",
            backgroundSize: "180% 180%",
            animation: "auroraMove 18s ease-in-out infinite",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        {panelButtons.map((btn) => (
          <motion.div
            key={btn.key}
            className="relative z-[50]"
            onMouseEnter={() => {
              setHoveredKey(btn.key);
              // update rect right away
              const el = buttonRefs.current[btn.key];
              if (el) setAnchorRect(el.getBoundingClientRect());
            }}
            onMouseLeave={() => setHoveredKey((h) => (h === btn.key ? null : h))}
          >
            <motion.button
              ref={(el) => (buttonRefs.current[btn.key] = el)}
              onClick={() => togglePanel(btn.key)}
              aria-label={`Open ${btn.title}`}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.95 }}
              className={`
                w-12 h-12 flex items-center justify-center
                rounded-xl transition-all duration-300 ease-out
                border border-[rgba(160,140,255,0.25)]
                overflow-hidden relative
                ${active === btn.key
                  ? "bg-[rgba(90,70,255,0.5)] text-cyan-200 shadow-[0_0_20px_rgba(120,100,255,0.5)]"
                  : "bg-[rgba(25,25,55,0.45)] text-gray-300 hover:text-cyan-200"}
              `}
            >
              <AuroraOverlay active={active === btn.key} />
              <span className="relative z-10 pointer-events-none">{btn.icon}</span>
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* Tooltip - visible when hovered or when active (so it stays when clicked open) */}
      <Tooltip
        anchorRect={anchorRect}
        visible={Boolean(hoveredKey || active)}
        text={(panelButtons.find((p) => p.key === (hoveredKey ?? active)) || {}).title}
      />

      {/* Expanded panel (unchanged) */}
      <AnimatePresence mode="wait">
        {active && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setActive(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-[3px] z-[999]"
            />

            <motion.div
              key="glowBridge"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="
                fixed top-[calc(2vh+45px)] right-[calc(2vh+40px)]
                w-[2px] h-[80px]
                bg-gradient-to-b from-cyan-300/60 to-violet-400/40
                blur-[3px] z-[1000]
              "
            />

            <motion.div
              key="panel"
              initial={{ opacity: 0, scale: 0.85, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              onAnimationComplete={() => window.dispatchEvent(new Event("resize"))}
              className="
                fixed top-[calc(2vh+60px)] right-[calc(2vh+75px)]
                w-[min(50vw,720px)] h-[min(75vh,600px)]
                rounded-2xl overflow-hidden
                z-[1000]
                border border-[rgba(150,120,255,0.15)]
                bg-[rgba(15,15,35,0.65)]
                shadow-[-4px_4px_20px_rgba(120,90,255,0.25)]
                backdrop-blur-[12px]
                flex flex-col
                before:content-[''] before:absolute before:inset-0
                before:bg-[linear-gradient(135deg,rgba(0,200,255,0.16),rgba(100,120,255,0.18),rgba(180,80,255,0.18))]
                before:bg-[length:200%_200%] before:animate-auroraMove
                before:rounded-2xl before:z-[-1]
                after:content-[''] after:absolute after:top-0 after:left-0
                after:w-full after:h-[3px]
                after:bg-gradient-to-r after:from-cyan-400/40 after:to-blue-400/40
              "
            >
              <button
                onClick={() => setActive(null)}
                aria-label="Close panel"
                className="absolute top-3 right-4 text-cyan-200 text-lg hover:text-white z-[10]"
              >
                ✕
              </button>

              <div className="relative z-[2] p-4 overflow-auto flex-1 custom-scroll">
                <div className="relative z-[3] w-full h-full flex flex-col justify-start items-start gap-4">
                  {panels[active]}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(0,220,255,0.4), rgba(100,120,255,0.5));
          border-radius: 10px;
        }
        @keyframes auroraMove {
          0% { background-position: 0% 50%; opacity: 0.6; }
          50% { background-position: 100% 50%; opacity: 1; }
          100% { background-position: 0% 50%; opacity: 0.6; }
        }
      `}</style>
    </>
  );
}
