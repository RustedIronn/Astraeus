import { useState, useEffect } from "react";
import Papa from "papaparse";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, LabelList, PieChart, Pie, Cell, ScatterChart, Scatter
} from "recharts";

export default function StarAnalytics() {
  const [stats, setStats] = useState({});
  const [spectralData, setSpectralData] = useState([]);
  const [highlight, setHighlight] = useState("");
  const [loading, setLoading] = useState(true);
  const [showGraphs, setShowGraphs] = useState(false);
  const [activeTab, setActiveTab] = useState("spectral");

  const nudgeRecharts = () => {
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() =>
        window.dispatchEvent(new Event("resize"))
      );
    }
  };

  useEffect(() => {
    Papa.parse("/hyg_v42.csv", {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data.filter(
          (s) =>
            s &&
            !isNaN(s.mag) &&
            !isNaN(s.dist) &&
            s.spect &&
            s.spect.trim() !== "" &&
            !(s.proper && /sol/i.test(s.proper))
        );

        if (!data.length) {
          setLoading(false);
          return;
        }

        const avg = (arr) =>
          arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
        const median = (arr) => {
          const sorted = [...arr].sort((a, b) => a - b);
          const mid = Math.floor(sorted.length / 2);
          return sorted.length % 2
            ? sorted[mid]
            : (sorted[mid - 1] + sorted[mid]) / 2;
        };

        const magnitudes = data.map((s) => s.mag);
        const distances = data.map((s) => s.dist);
        const lumValues = data
          .map((s) => parseFloat(s.lum))
          .filter((x) => !isNaN(x));

        const avgMag = avg(magnitudes);
        const medMag = median(magnitudes);
        const avgDist = avg(distances);
        const avgLum = avg(lumValues);

        const nearest = data.reduce((a, b) => (a.dist < b.dist ? a : b));
        const brightest = data.reduce((a, b) => (a.mag < b.mag ? a : b));
        const mostLuminous = data.reduce((a, b) => (a.lum > b.lum ? a : b));

        const specCount = {};
        const lumByType = {};
        data.forEach((s) => {
          const t = (s.spect || "")[0]?.toUpperCase();
          const lum = parseFloat(s.lum);
          if (/[OBAFGKMLTY]/.test(t)) {
            specCount[t] = (specCount[t] || 0) + 1;
            if (!lumByType[t]) lumByType[t] = [];
            if (isFinite(lum) && lum > 0 && lum < 1e6)
              lumByType[t].push(Math.log10(lum + 1));
          }
        });

        const spectralArr = Object.entries(specCount)
          .map(([type, count]) => ({
            type,
            count,
            percentStr: ((count / data.length) * 100).toFixed(1) + "%",
            avgLumNum:
              lumByType[type] && lumByType[type].length
                ? avg(lumByType[type])
                : 0,
          }))
          .sort(
            (a, b) => "OBAFGKMLTY".indexOf(a.type) - "OBAFGKMLTY".indexOf(b.type)
          );

        const dominant = spectralArr.reduce((a, b) =>
          a.count > b.count ? a : b
        );
        const correlation = data
          .filter((s) => s.dist > 0 && s.dist < 10000 && isFinite(s.mag))
          .slice(0, 80)
          .map((s) => ({ mag: s.mag, logDist: Math.log10(s.dist) }));

        const warm = ["O", "B", "A", "F"].reduce(
          (sum, t) => sum + (specCount[t] || 0),
          0
        );
        const cold = ["K", "M", "L", "T", "Y"].reduce(
          (sum, t) => sum + (specCount[t] || 0),
          0
        );

        setSpectralData(spectralArr);
        setStats({
          totalStars: data.length,
          avgMag: avgMag.toFixed(2),
          medMag: medMag.toFixed(2),
          avgDist: avgDist.toFixed(2),
          avgLum: avgLum.toFixed(2),
          nearest: nearest.proper || "—",
          nearestDist: nearest.dist.toFixed(1),
          brightest: brightest.proper || "—",
          brightestMag: brightest.mag.toFixed(2),
          mostLuminous: mostLuminous.proper || "—",
          mostLuminousLum: mostLuminous.lum?.toFixed(1),
          dominantType: dominant.type,
          warm,
          cold,
          correlation,
          diversity: Object.keys(specCount).length,
        });

        const highlights = [
          `Dominant spectral class: ${dominant.type}`,
          `Average apparent magnitude: ${avgMag.toFixed(
            2
          )} (median ${medMag.toFixed(2)})`,
          `Closest star: ${nearest.proper} (${nearest.dist.toFixed(2)} ly)`,
        ];
        setHighlight(highlights[Math.floor(Math.random() * highlights.length)]);
        setLoading(false);
      },
    });
  }, []);

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

  const ChartWrapper = ({ children }) => (
    <div
      className="w-full transition-opacity duration-500 ease-in-out"
      style={{ height: "250px" }}
    >
      {children}
    </div>
  );

  const renderSpectralChart = () => (
    <ChartWrapper>
      <ResponsiveContainer width="100%" height="100%">
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
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.95} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0.95} />
            </linearGradient>
          </defs>
          <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="url(#barGradient)">
            <LabelList
              dataKey="percentStr"
              position="top"
              fill="#c7d2fe"
              fontSize={10}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );

  const renderCorrelation = () => (
    <ChartWrapper>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 10, bottom: 20, left: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.08)"
            vertical={false}
          />
          <XAxis
            type="number"
            dataKey="logDist"
            stroke="#cbd5e1"
            fontSize={11}
            tickFormatter={(v) => (10 ** v).toFixed(0)}
            tickCount={6}
            domain={["dataMin - 0.2", "dataMax + 0.2"]}
            label={{
              value: "Distance (ly)",
              fill: "#a5b4fc",
              fontSize: 12,
              dy: 10,
            }}
          />
          <YAxis
            type="number"
            dataKey="mag"
            stroke="#cbd5e1"
            fontSize={11}
            tickCount={6}
            reversed
            domain={["dataMin - 1", "dataMax + 1"]}
            label={{
              value: "Apparent Magnitude",
              angle: -90,
              fill: "#a5b4fc",
              fontSize: 12,
              dx: -15,
            }}
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3", stroke: "rgba(180,180,255,0.25)" }}
            contentStyle={{
              background: "rgba(15,20,40,0.95)",
              border: "1px solid rgba(160,140,255,0.35)",
              borderRadius: "10px",
              boxShadow: "0 0 10px rgba(150,130,255,0.25)",
              color: "#e0e7ff",
            }}
            labelStyle={{ color: "#a5b4fc", fontSize: 12 }}
            itemStyle={{
              color: "#e0e7ff",
              fontSize: 12,
              textShadow: "0 0 6px rgba(140,150,255,0.8)",
            }}
            formatter={(val, name) =>
              name === "logDist"
                ? [`${(10 ** val).toFixed(1)} ly`, "Distance"]
                : [val.toFixed(2), "Magnitude"]
            }
          />
          <Scatter
            data={stats.correlation?.slice(0, 80) || []}
            shape="circle"
            r={4}
            fill="#7dd3fc"
            stroke="#a855f7"
            strokeWidth={0.6}
            opacity={0.7}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );

  const renderLuminosity = () => (
    <ChartWrapper>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={spectralData}
            dataKey="avgLumNum"
            nameKey="type"
            outerRadius={60}
            label
          >
            {spectralData.map((e, i) => (
              <Cell key={i} fill={spectralColors[e.type]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(val, name, e) => {
              const approx = val ? (10 ** val).toFixed(1) : "0";
              return [`~${approx}x solar`, `Class ${e.payload.type}`];
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );

  return (
    <div
      className="
        w-full h-full flex flex-col border border-[rgba(140,100,255,0.25)]
        rounded-2xl p-4 md:p-6 overflow-y-auto text-gray-200 custom-scrollbar
        bg-[rgba(25,30,60,0.25)] animate-[fadeIn_0.6s_ease-out]
      "
    >
      <h3 className="mb-2 font-[Iceberg] tracking-wide text-[1.2rem] bg-gradient-to-r from-sky-400 via-purple-400 to-cyan-300 text-transparent bg-clip-text">
        Star Analytics ☄️
      </h3>

      {loading ? (
        <p className="text-gray-400 py-4">Analyzing celestial data...</p>
      ) : (
        <>
          <div className="text-sm space-y-1 mb-3">
            <p>
              Catalogued:{" "}
              <b className="text-indigo-200">
                {stats.totalStars?.toLocaleString()}
              </b>
            </p>
            <p>
              Dominant:{" "}
              <b className="text-cyan-300">{stats.dominantType}</b>
            </p>
            <p className="text-amber-300">
              Brightest: <b>{stats.brightest}</b> (mag {stats.brightestMag})
            </p>
            <p className="italic text-[0.85rem] text-[rgba(180,220,255,0.9)]">
              {highlight}
            </p>
          </div>

          {showGraphs ? (
            <>
              <div className="flex justify-center gap-2 flex-wrap mb-4">
                {["spectral", "correlation", "luminosity"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setTimeout(() => nudgeRecharts(), 120);
                    }}
                    className={`px-3 py-1.5 text-sm rounded-md border transition-all
                      ${
                        activeTab === tab
                          ? "bg-[rgba(120,130,255,0.14)] text-cyan-200 border-[rgba(160,190,255,0.12)]"
                          : "bg-[rgba(70,80,130,0.08)] text-gray-300 hover:text-sky-200"
                      }`}
                  >
                    {tab === "spectral"
                      ? "Spectral Distribution"
                      : tab === "correlation"
                      ? "Brightness vs Distance"
                      : "Luminosity Map"}
                  </button>
                ))}
              </div>

              {activeTab === "spectral" && renderSpectralChart()}
              {activeTab === "correlation" && renderCorrelation()}
              {activeTab === "luminosity" && renderLuminosity()}
            </>
          ) : (
            <div className="text-sm space-y-2 mt-3">
              <p>
                Spectral Diversity:{" "}
                <b className="text-sky-300">{stats.diversity}</b> classes
              </p>
              <p>
                Warm : Cold Ratio —{" "}
                <b className="text-cyan-200">{stats.warm}</b> :{" "}
                <b className="text-purple-300">{stats.cold}</b>
              </p>
              <p>
                Mean Distance:{" "}
                <b className="text-sky-300">{stats.avgDist} ly</b>
              </p>
              <p>
                Median Brightness:{" "}
                <b className="text-violet-300">{stats.medMag}</b>
              </p>
              <p>
                Average Luminosity:{" "}
                <b className="text-cyan-200">{stats.avgLum}</b>
              </p>
              <p>
                Nearest System:{" "}
                <b className="text-indigo-200">{stats.nearest}</b> (
                {stats.nearestDist} ly)
              </p>
              <p>
                Peak Lum Source:{" "}
                <b className="text-sky-200">{stats.mostLuminous}</b> (
                {stats.mostLuminousLum})
              </p>
            </div>
          )}

          <button
            onClick={() => {
              setShowGraphs((s) => {
                const next = !s;
                setTimeout(() => nudgeRecharts(), 150);
                return next;
              });
            }}
            className="mt-4 bg-[rgba(120,130,255,0.08)] text-sky-200 border border-[rgba(140,160,255,0.06)]
            rounded-md px-4 py-1.5 text-[0.82rem] transition hover:bg-[rgba(100,150,255,0.12)]"
          >
            {showGraphs ? "Hide Graphs ▲" : "Show Graphs ▼"}
          </button>

          <p className="mt-3 text-[0.78rem] text-[rgba(180,220,255,0.62)] italic">
            Data: HYG Star Catalog (v4.2)
          </p>
        </>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
