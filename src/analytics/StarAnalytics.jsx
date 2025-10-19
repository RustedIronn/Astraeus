import { useState, useEffect } from "react";
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
} from "recharts";

export default function StarAnalytics() {
  const [stats, setStats] = useState(null);
  const [spectralData, setSpectralData] = useState([]);
  const [highlight, setHighlight] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

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
            !isNaN(parseFloat(s.mag)) &&
            !isNaN(parseFloat(s.dist)) &&
            s.spect &&
            s.spect.trim() !== ""
        );

        if (data.length === 0) {
          setLoading(false);
          return;
        }

        const valid = (num) => (!isNaN(num) && num !== null ? num : 0);
        const totalStars = data.length;
        const avg = (arr) =>
          arr.reduce((a, b) => a + valid(b), 0) / arr.length || 0;
        const median = (arr) => {
          const sorted = [...arr].sort((a, b) => a - b);
          const mid = Math.floor(sorted.length / 2);
          return sorted.length % 2
            ? sorted[mid]
            : (sorted[mid - 1] + sorted[mid]) / 2;
        };

        const magnitudes = data.map((s) => parseFloat(s.mag));
        const distances = data.map((s) => parseFloat(s.dist));
        const lumValues = data.map((s) => parseFloat(s.lum));
        const avgMag = avg(magnitudes);
        const avgDist = avg(distances);
        const avgLum = avg(lumValues);
        const medMag = median(magnitudes);

        const nearest = data.reduce((a, b) =>
          valid(a.dist) < valid(b.dist) ? a : b
        );
        const brightest = data.reduce((a, b) =>
          valid(a.mag) < valid(b.mag) ? a : b
        );
        const mostLuminous = data.reduce((a, b) =>
          valid(a.lum) > valid(b.lum) ? a : b
        );

        const specCount = {};
        data.forEach((s) => {
          const type = s.spect?.trim()[0]?.toUpperCase();
          if (/[OBAFGKMLTY]/.test(type)) {
            specCount[type] = (specCount[type] || 0) + 1;
          }
        });

        const spectralArr = Object.entries(specCount)
          .map(([type, count]) => ({
            type,
            count,
            percent: ((count / totalStars) * 100).toFixed(1),
            estTemp:
              {
                O: "~30,000 K",
                B: "~20,000 K",
                A: "~9,500 K",
                F: "~7,200 K",
                G: "~5,700 K",
                K: "~4,000 K",
                M: "~3,200 K",
                L: "~2,200 K",
                T: "~1,200 K",
                Y: "~600 K",
              }[type] || "—",
          }))
          .sort(
            (a, b) =>
              "OBAFGKMLTY".indexOf(a.type) - "OBAFGKMLTY".indexOf(b.type)
          );

        const dominant =
          spectralArr.length > 0
            ? spectralArr.reduce((a, b) => (a.count > b.count ? a : b))
            : { type: "?", count: 0 };

        const named = {
          nearest:
            nearest.proper && nearest.proper.trim() !== ""
              ? nearest.proper
              : null,
          brightest:
            brightest.proper && brightest.proper.trim() !== ""
              ? brightest.proper
              : null,
          mostLuminous:
            mostLuminous.proper && mostLuminous.proper.trim() !== ""
              ? mostLuminous.proper
              : null,
        };

        const highlights = [
          `Dominant spectral class: ${dominant.type}`,
          `Average apparent magnitude: ${avgMag.toFixed(2)} (median ${medMag.toFixed(
            2
          )})`,
          named.nearest
            ? `Closest named system: ${named.nearest} — ${nearest.dist.toFixed(
                2
              )} ly`
            : null,
        ].filter(Boolean);

        setHighlight(highlights[Math.floor(Math.random() * highlights.length)]);

        setStats({
          totalStars,
          avgMag: avgMag.toFixed(2),
          medMag: medMag.toFixed(2),
          avgDist: avgDist.toFixed(2),
          avgLum: avgLum.toFixed(2),
          nearest: named.nearest || "—",
          nearestDist: nearest.dist,
          brightest: named.brightest || "—",
          brightestMag: brightest.mag,
          mostLuminous: named.mostLuminous || "—",
          mostLuminousLum: mostLuminous.lum,
          dominantType: dominant.type,
        });
        setSpectralData(spectralArr);
        setLoading(false);
      },
    });
  }, []);

  return (
    <div
  className={`
    fixed bottom-[1vh] right-[1.3vw]
    bg-[linear-gradient(135deg,rgba(25,30,60,0.2)_0%,rgba(60,20,80,0.25)_100%)]
    border border-[rgba(130,100,255,0.25)]
    rounded-2xl p-5 w-[360px] text-gray-200 text-[0.95rem]
    flex flex-col items-center text-center
    shadow-[0_0_25px_rgba(90,100,180,0.4)]
    backdrop-blur-[3px] saturate-[160%]
    transition-all duration-500 ease-out z-[9999]
    ${expanded ? "max-h-[680px]" : "max-h-[280px]"}
    overflow-hidden
    sm:w-[250px] sm:text-[0.85rem]
    hover:shadow-[0_0_35px_rgba(130,180,255,0.45)]
  `}
>
  <h3 className="mb-2 font-[Iceberg] tracking-wide text-[1.1rem] sm:text-[1rem] bg-gradient-to-r from-sky-400 via-purple-400 to-cyan-300 text-transparent bg-clip-text drop-shadow-[0_0_8px_rgba(130,200,255,0.4)]">
    Star Analytics ☄️
  </h3>

  {loading ? (
    <p className="text-gray-400">Analyzing celestial data...</p>
  ) : (
    <>
      <div className="space-y-1">
        <p>
          Catalogued Stars:{" "}
          <b className="text-indigo-200">{stats.totalStars.toLocaleString()}</b>
        </p>
        <p>
          Dominant Class:{" "}
          <b className="text-cyan-300">{stats.dominantType}</b>
        </p>
        <p className="text-amber-300">
          Brightest: <b>{stats.brightest}</b> (mag {stats.brightestMag})
        </p>
        <p className="mt-2 italic text-[0.85rem] text-[rgba(180,220,255,0.9)] leading-[1.3rem]">
          {highlight}
        </p>
      </div>

      {expanded && (
        <>
          <div className="w-full h-[160px] mt-4">
            <ResponsiveContainer>
              <BarChart data={spectralData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis dataKey="type" stroke="#cbd5e1" fontSize={11} />
                <YAxis
                  stroke="#cbd5e1"
                  fontSize={10}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(20,25,40,0.9)",
                    border: "1px solid rgba(130,160,255,0.4)",
                    color: "white",
                  }}
                  formatter={(value, name, entry) => [
                    `${value} stars`,
                    `Type ${entry.payload.type}`,
                  ]}
                />
                <Bar
                  dataKey="count"
                  radius={[6, 6, 0, 0]}
                  fill="url(#barGradient)"
                >
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0.9} />
                    </linearGradient>
                  </defs>
                  <LabelList
                    dataKey="percent"
                    position="top"
                    fill="#c7d2fe"
                    fontSize={10}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 text-left w-full space-y-1">
            <p>
              Mean Distance: <b className="text-sky-300">{stats.avgDist} ly</b>
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
              Nearest Named System:{" "}
              <b className="text-indigo-200">{stats.nearest}</b> (
              {stats.nearestDist} ly)
            </p>
            <p>
              Peak Luminosity Source:{" "}
              <b className="text-sky-200">{stats.mostLuminous}</b> (
              {stats.mostLuminousLum})
            </p>
          </div>
        </>
      )}

      <button
        onClick={() => setExpanded(!expanded)}
        className="
          mt-4 bg-[rgba(120,130,255,0.15)] text-sky-200 border border-[rgba(140,160,255,0.3)]
          rounded-md px-3 py-1 text-[0.8rem] cursor-pointer transition
          hover:bg-[rgba(100,150,255,0.25)] hover:text-cyan-200
        "
      >
        {expanded ? "Show Less ▲" : "Expand ▼"}
      </button>

      <p className="mt-3 text-[0.8rem] text-[rgba(160,220,255,0.9)]">
        HYG Star Catalog (v4.2)
      </p>
    </>
  )}
</div>
  );
}
