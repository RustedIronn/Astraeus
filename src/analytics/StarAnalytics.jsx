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
      style={{
        position: "fixed",
        bottom: "1vh",
        right: "1.2vw",
        background: "rgba(20, 20, 30, 0.07)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        borderRadius: "18px",
        padding: "16px",
        width: "290px",
        color: "#e5e7eb",
        fontSize: "0.95rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        backdropFilter: "blur(14px) saturate(140%)",
        WebkitBackdropFilter: "blur(14px) saturate(140%)",
        textAlign: "center",
        overflow: "hidden",
        maxHeight: expanded ? "600px" : "320px",
        transition: "max-height 0.6s ease, transform 0.2s ease-out",
        zIndex: 9999,
      }}
    >
      <h3
        style={{
          marginBottom: "4px",
          color: "#a855f7",
          fontFamily: "'Iceberg', sans-serif",
          letterSpacing: "0.5px",
        }}
      >
        Star Analytics ✨
      </h3>

      {loading ? (
        <p style={{ color: "#9ca3af" }}>Analyzing celestial data...</p>
      ) : (
        <>
          <p>
            Catalogued Stars: <b>{stats.totalStars.toLocaleString()}</b>
          </p>
          <p>
            Dominant Class: <b>{stats.dominantType}</b>
          </p>
          <p style={{ color: "#fbbf24" }}>
            Brightest: <b>{stats.brightest}</b> (mag {stats.brightestMag})
          </p>

          {/* 🔭 Spectral Distribution */}
          <div style={{ width: "100%", height: 140, marginTop: "4px" }}>
            <ResponsiveContainer>
              <BarChart data={spectralData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis dataKey="type" stroke="#a1a1aa" fontSize={11} />
                <YAxis stroke="#a1a1aa" fontSize={10} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(20,20,30,0.9)",
                    border: "1px solid rgba(168, 85, 247, 0.4)",
                    color: "white",
                  }}
                  formatter={(value, name, entry) => [
                    `${value} stars`,
                    `Type ${entry.payload.type}`,
                  ]}
                />
                <Bar dataKey="count" fill="#a855f7" radius={[6, 6, 0, 0]}>
                  <LabelList
                    dataKey="percent"
                    position="top"
                    fill="#93c5fd"
                    fontSize={10}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ✨ Dynamic Highlight */}
          <p
            style={{
              marginTop: "10px",
              fontSize: "0.85rem",
              fontStyle: "italic",
              color: "#93c5fd",
              lineHeight: "1.3rem",
            }}
          >
            {highlight}
          </p>

          {expanded && (
            <div
              style={{
                marginTop: "10px",
                textAlign: "left",
                width: "100%",
                overflowY: "auto",
              }}
            >
              <p>
                Mean Distance: <b>{stats.avgDist} ly</b>
              </p>
              <p>
                Median Brightness: <b>{stats.medMag}</b>
              </p>
              <p>
                Average Luminosity: <b>{stats.avgLum}</b>
              </p>
              <p>
                Nearest Named System: <b>{stats.nearest}</b> ({stats.nearestDist} ly)
              </p>
              <p>
                Peak Luminosity Source: <b>{stats.mostLuminous}</b> (
                {stats.mostLuminousLum})
              </p>
            </div>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              marginTop: "10px",
              background: "rgba(168, 85, 247, 0.15)",
              color: "#d8b4fe",
              border: "1px solid rgba(168, 85, 247, 0.3)",
              borderRadius: "8px",
              padding: "5px 10px",
              cursor: "pointer",
              fontSize: "0.8rem",
              transition: "0.3s",
            }}
          >
            {expanded ? "Show Less ▲" : "Expand ▼"}
          </button>

          <p
            style={{
              marginTop: "6px",
              fontSize: "0.8rem",
              color: "#a3e635",
            }}
          >
            HYG Star Catalog (v4.2)
          </p>
        </>
      )}

      {/* Responsive tweak */}
      <style>
        {`
          @media (max-width: 600px) {
            div[style*="position: fixed"] {
              width: 260px !important;
              font-size: 0.85rem !important;
              padding: 12px !important;
            }
            h3 {
              font-size: 1rem !important;
            }
          }
        `}
      </style>
    </div>
  );
}
