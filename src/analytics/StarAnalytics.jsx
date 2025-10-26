import { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
} from "recharts";

export default function StarAnalytics() {
  const [stats, setStats] = useState({
    totalStars: 0,
    avgMag: "0.00",
    medMag: "0.00",
    avgDist: "0.00",
    avgLum: "0.00",
    nearest: "—",
    nearestDist: 0,
    brightest: "—",
    brightestMag: 0,
    mostLuminous: "—",
    mostLuminousLum: 0,
    dominantType: "?",
    correlation: [],
  });
  const [spectralData, setSpectralData] = useState([]);
  const [highlight, setHighlight] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("spectral");

  const contentRef = useRef(null);
  const [contentMaxH, setContentMaxH] = useState("0px");

  useEffect(() => {
    if (expanded && contentRef.current) {
      const h = contentRef.current.scrollHeight;
      setContentMaxH(`${h + 16}px`);
    } else {
      setContentMaxH("0px");
    }
  }, [expanded, activeTab, spectralData.length, loading]);

  useEffect(() => {
    Papa.parse("/hyg_v42.csv", {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const raw = Array.isArray(results.data) ? results.data : [];
        const data = raw.filter(
          (s) =>
            s &&
            !isNaN(parseFloat(s.mag)) &&
            !isNaN(parseFloat(s.dist)) &&
            s.spect &&
            s.spect.trim() !== "" &&
            !(s.proper && /sol/i.test(s.proper))
        );

        if (data.length === 0) {
          console.warn("StarAnalytics: no usable rows from CSV");
          setLoading(false);
          return;
        }

        const valid = (num) => (!isNaN(num) && num !== null ? num : 0);
        const avg = (arr) =>
          arr && arr.length ? arr.reduce((a, b) => a + valid(b), 0) / arr.length : 0;
        const median = (arr) => {
          if (!arr || !arr.length) return 0;
          const sorted = [...arr].sort((a, b) => a - b);
          const mid = Math.floor(sorted.length / 2);
          return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
        };

        const magnitudes = data.map((s) => parseFloat(s.mag));
        const distances = data.map((s) => parseFloat(s.dist));
        const lumValues = data.map((s) => parseFloat(s.lum)).filter((x) => !isNaN(x));

        const avgMag = avg(magnitudes);
        const avgDist = avg(distances);
        const avgLum = avg(lumValues);
        const medMag = median(magnitudes);

        const nearest = data.reduce((a, b) => (valid(a.dist) < valid(b.dist) ? a : b));
        const brightest = data.reduce((a, b) => (valid(a.mag) < valid(b.mag) ? a : b));
        const mostLuminous = data.reduce((a, b) => (valid(a.lum) > valid(b.lum) ? a : b));

        const specCount = {};
        const lumByType = {};
        data.forEach((s) => {
          const type = (s.spect || "").trim()[0]?.toUpperCase();
          const lum = parseFloat(s.lum);
          if (/[OBAFGKMLTY]/.test(type)) {
            specCount[type] = (specCount[type] || 0) + 1;
            if (!lumByType[type]) lumByType[type] = [];
            if (isFinite(lum) && lum > 0 && lum < 1e6) {
              lumByType[type].push(Math.log10(lum + 1));
            }
          }
        });

        const spectralArr = Object.entries(specCount)
          .map(([type, count]) => {
            const avgLumNum =
              lumByType[type] && lumByType[type].length ? avg(lumByType[type]) : 0;
            return {
              type,
              count,
              percentStr: ((count / data.length) * 100).toFixed(1) + "%",
              avgLumNum,
            };
          })
          .sort((a, b) => "OBAFGKMLTY".indexOf(a.type) - "OBAFGKMLTY".indexOf(b.type));

        const dominant = spectralArr.length
          ? spectralArr.reduce((a, b) => (a.count > b.count ? a : b))
          : { type: "?", count: 0 };

        const named = {
          nearest: nearest?.proper && nearest.proper.trim() !== "" ? nearest.proper : null,
          brightest: brightest?.proper && brightest.proper.trim() !== "" ? brightest.proper : null,
          mostLuminous:
            mostLuminous?.proper && mostLuminous.proper.trim() !== ""
              ? mostLuminous.proper
              : null,
        };

        const highlights = [
          `Dominant spectral class: ${dominant.type}`,
          `Average apparent magnitude: ${avgMag.toFixed(2)} (median ${medMag.toFixed(2)})`,
          named.nearest
            ? `Closest named system: ${named.nearest} — ${nearest.dist.toFixed(2)} ly`
            : null,
        ].filter(Boolean);

        const correlation = data
          .filter((s) => s.dist > 0 && s.dist < 10000 && isFinite(parseFloat(s.mag)))
          .slice(0, 150)
          .map((s) => ({
            mag: parseFloat(s.mag),
            logDist: Math.log10(parseFloat(s.dist)),
          }));

        setHighlight(highlights[Math.floor(Math.random() * highlights.length)]);
        setStats({
          totalStars: data.length,
          avgMag: avgMag.toFixed(2),
          medMag: medMag.toFixed(2),
          avgDist: avgDist.toFixed(2),
          avgLum: avgLum.toFixed(2),
          nearest: named.nearest || "—",
          nearestDist: nearest.dist || 0,
          brightest: named.brightest || "—",
          brightestMag: brightest.mag || 0,
          mostLuminous: named.mostLuminous || "—",
          mostLuminousLum: mostLuminous.lum || 0,
          dominantType: dominant.type,
          correlation,
        });

        setSpectralData(spectralArr);
        setLoading(false);
      },
      error: (err) => {
        console.error("Papa parse error:", err);
        setLoading(false);
      },
    });
  }, []);

  const trend =
    ["O", "B", "A", "F"].includes(stats?.dominantType)
      ? "🔥 Warm Regime"
      : ["K", "M", "L", "T", "Y"].includes(stats?.dominantType)
      ? "🌙 Cold Regime"
      : "—";

  const renderSpectralChart = () =>
    spectralData.length ? (
      <div className="w-full h-[140px]">
        <ResponsiveContainer>
          <BarChart data={spectralData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="type" stroke="#cbd5e1" fontSize={11} />
            <YAxis stroke="#cbd5e1" fontSize={10} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: "rgba(20,25,40,0.95)",
                border: "1px solid rgba(130,160,255,0.18)",
                color: "white",
              }}
              formatter={(v) => [`${v} stars`, "Count"]}
            />
            <defs>
              <linearGradient id="barGradient2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.95} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0.95} />
              </linearGradient>
            </defs>
            <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="url(#barGradient2)">
              <LabelList dataKey="percentStr" position="top" fill="#c7d2fe" fontSize={10} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    ) : null;

  const renderCorrelation = () =>
    stats.correlation?.length ? (
      <div className="w-full h-[160px]">
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.07)" vertical={false} />
            <XAxis
              type="number"
              dataKey="logDist"
              name="Log Distance"
              domain={["auto", "auto"]}
              stroke="#cbd5e1"
              fontSize={10}
              tickFormatter={(v) => (10 ** v).toFixed(0)}
              label={{
                value: "Distance (ly)",
                position: "bottom",
                fill: "#94a3b8",
                fontSize: 10,
              }}
            />
            <YAxis
              type="number"
              dataKey="mag"
              name="Apparent Magnitude"
              stroke="#cbd5e1"
              fontSize={10}
              reversed
              domain={["auto", "auto"]}
              label={{
                value: "Brightness (mag)",
                angle: -90,
                position: "insideLeft",
                fill: "#94a3b8",
                fontSize: 10,
              }}
            />
            <Tooltip
              cursor={{ strokeDasharray: "3 3", stroke: "rgba(180,180,255,0.25)" }}
              contentStyle={{
                background: "#0a0f1d",
                border: "1px solid rgba(130,160,255,0.35)",
                borderRadius: "6px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.6)",
                color: "#ffffff",
                fontSize: "0.8rem",
                lineHeight: "1.2",
              }}
              itemStyle={{ color: "#ffffff" }}
              formatter={(value, name) =>
                name === "logDist"
                  ? [`${(10 ** value).toFixed(1)} ly`, "Distance"]
                  : [value.toFixed(2), "Magnitude"]
              }
            />
            <Scatter
              data={stats.correlation}
              shape={(props) => {
                const { cx, cy, fill } = props;
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={1.8}
                    fill={fill || "#7dd3fc"}
                    opacity={0.85}
                    shapeRendering="crispEdges"
                  />
                );
              }}
              fill="#7dd3fc"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    ) : (
      <p className="text-gray-400 text-[0.8rem] italic">Not enough correlation data</p>
    );

  const renderLuminosity = () => {
    const spectralColors = {
      O: "#6f9eff",
      B: "#8cb4ff",
      A: "#b5e0ff",
      F: "#f8f7ff",
      G: "#ffe6c7",
      K: "#ffb06b",
      M: "#ff6f61",
      L: "#d64b4b",
      T: "#a855f7",
      Y: "#6b21a8",
    };

    return spectralData.length ? (
      <div className="w-full h-[140px]">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={spectralData}
              dataKey="avgLumNum"
              nameKey="type"
              outerRadius={56}
              label={(entry) => `${entry.type}`}
            >
              {spectralData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={spectralColors[entry.type] || "#8884d8"}
                  stroke="rgba(255,255,255,0.1)"
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(val, name, entry) => {
                const approx = val ? (10 ** val).toFixed(1) : "0";
                return [`~${approx}x solar (log)`, `Class ${entry.payload.type}`];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    ) : null;
  };

  return (
    <div
      style={{
        backgroundImage: `
          linear-gradient(130deg,
            rgba(56,189,248,0.16),
            rgba(147,51,234,0.14),
            rgba(103,232,249,0.15),
            rgba(147,51,234,0.12),
            rgba(56,189,248,0.16)
          )
        `,
        backgroundSize: "400% 400%",
        animation: "auroraFloat 18s ease-in-out infinite",
        backdropFilter: "blur(8px) saturate(180%)",
        WebkitBackdropFilter: "blur(8px) saturate(180%)",
        border: "1px solid rgba(140,100,255,0.25)",
        boxShadow: "0 0 20px rgba(160,130,255,0.2)",
        transition: "background-image 1s ease",
      }}
      className={`fixed bottom-[1vh] right-[1.5vw]
        border rounded-2xl p-4
        w-[clamp(260px,20vw,300px)] min-w-[240px] text-gray-200 text-[0.95rem]
        flex flex-col items-center shadow-[0_6px_30px_rgba(20,24,40,0.6)]
        transition-all duration-500 ease-out z-[9999]
        hover:shadow-[0_0_25px_rgba(160,130,255,0.35)]
        ${
          expanded
            ? "bg-[linear-gradient(135deg,rgba(15,18,30,0.55)_0%,rgba(45,18,70,0.55)_100%)]"
            : "bg-[linear-gradient(135deg,rgba(25,30,60,0.25)_0%,rgba(60,20,80,0.3)_100%)] justify-center text-center"
        }`}
    >
      <h3 className="mb-1 font-[Iceberg] tracking-wide text-[1.05rem] bg-gradient-to-r from-sky-400 via-purple-400 to-cyan-300 text-transparent bg-clip-text">
        Star Analytics ☄️
      </h3>

      {loading ? (
        <p className="text-gray-400 py-3">Analyzing celestial data...</p>
      ) : (
        <>
          <div className={`${!expanded ? "text-center" : "text-left w-full"} space-y-1`}>
            <p>
              Catalogued: <b className="text-indigo-200">{stats.totalStars.toLocaleString()}</b>
            </p>
            <p>
              Dominant: <b className="text-cyan-300">{stats.dominantType}</b>{" "}
              <span className="text-xs text-gray-400">{trend}</span>
            </p>
            <p className="text-amber-300">
              Brightest: <b>{stats.brightest}</b> (mag {stats.brightestMag})
            </p>
            <p className="mt-1 italic text-[0.83rem] text-[rgba(180,220,255,0.9)] leading-[1.2rem]">
              {highlight}
            </p>
          </div>

          <div
            ref={contentRef}
            style={{
              maxHeight: contentMaxH,
              transition: "max-height 420ms cubic-bezier(.2,.8,.2,1)",
              overflow: "hidden",
              width: "100%",
            }}
            className="w-full mt-3"
          >
            <div className="w-full flex flex-col items-center space-y-3 p-1">
              <div className="flex justify-center gap-2 flex-wrap w-full">
                {["spectral", "correlation", "luminosity"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 text-sm rounded-md border transition-all
                    ${
                      activeTab === tab
                        ? "bg-[rgba(120,130,255,0.14)] text-cyan-200 border-[rgba(160,190,255,0.12)]"
                        : "bg-[rgba(70,80,130,0.08)] text-gray-300 border-transparent hover:border-[rgba(140,160,255,0.08)] hover:text-sky-200"
                    }`}
                  >
                    {tab === "spectral"
                      ? "Spectral"
                      : tab === "correlation"
                      ? "Brightness vs Distance"
                      : "Luminosity"}
                  </button>
                ))}
              </div>

              {activeTab === "spectral" && expanded && renderSpectralChart()}
              {activeTab === "correlation" && expanded && renderCorrelation()}
              {activeTab === "luminosity" && expanded && renderLuminosity()}

              <div className="text-left w-full space-y-1 text-sm px-1">
                <p>
                  Mean Distance: <b className="text-sky-300">{stats.avgDist} ly</b>
                </p>
                <p>
                  Median Brightness: <b className="text-violet-300">{stats.medMag}</b>
                </p>
                <p>
                  Average Luminosity: <b className="text-cyan-200">{stats.avgLum}</b>
                </p>
                <p>
                  Nearest Named:{" "}
                  <b className="text-indigo-200">{stats.nearest}</b> ({stats.nearestDist} ly)
                </p>
                <p>
                  Peak Lum Source:{" "}
                  <b className="text-sky-200">{stats.mostLuminous}</b> ({stats.mostLuminousLum})
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 bg-[rgba(120,130,255,0.08)] text-sky-200 border border-[rgba(140,160,255,0.06)]
            rounded-md px-4 py-1.5 text-[0.82rem] cursor-pointer transition hover:bg-[rgba(100,150,255,0.12)]"
          >
            {expanded ? "Show Less ▲" : "Expand ▼"}
          </button>

          <p className="mt-3 text-[0.78rem] text-[rgba(180,220,255,0.62)] italic">
            Data: HYG Star Catalog (v4.2)
          </p>
        </>
      )}
      <style>{`
        @keyframes auroraFloat {
          0% { background-position: 0% 50%; }
          25% { background-position: 50% 65%; }
          50% { background-position: 100% 50%; }
          75% { background-position: 50% 35%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
