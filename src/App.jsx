import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import StarOfTheDay from "./StarOfTheDay";
import { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import * as THREE from "three";
import StarField from "./StarField";
import ConstellationViewer from "./ConstellationViewer";
import SpectralLegend from "./SpectralLegend";
import StarGuide from "./StarGuide";

function FlyToStar({ target }) {
  const { camera, controls } = useThree();
  const anim = useRef(null);

  useEffect(() => {
    if (target) {
      const start = {
        pos: camera.position.clone(),
        time: performance.now(),
      };

      const scale = THREE.MathUtils.clamp(10 - target.mag, 2, 20);
      const safeDist = scale * 20;

      const starPos = new THREE.Vector3(target.x, target.y, target.z);
      const endPos = starPos.clone().add(new THREE.Vector3(0, 0, safeDist));

      anim.current = { start, endPos, starPos, duration: 2000 };

      if (controls) controls.enabled = false;
    }
  }, [target, camera, controls]);

  useFrame(() => {
    if (anim.current) {
      const { start, endPos, starPos, duration } = anim.current;
      const elapsed = performance.now() - start.time;
      const t = Math.min(elapsed / duration, 1);

      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      camera.position.lerpVectors(start.pos, endPos, ease);
      camera.lookAt(starPos);

      if (t >= 1) {
        anim.current = null;
        if (controls) {
          controls.enabled = true;
          controls.target.copy(starPos);
        }
      }
    }
  });

  return null;
}

function App() {
  const [stars, setStars] = useState([]);
  const [selectedStar, setSelectedStar] = useState(null);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [loading, setLoading] = useState(true);
  const pointsRef = useRef();

  const funFacts = {
    32349: "Sirius is the brightest star in the night sky.",
    27989: "Betelgeuse is a red supergiant that will go supernova one day.",
    91262: "Vega was once the North Star and is part of the Summer Triangle.",
    24436: "Rigel is a blue supergiant, thousands of times brighter than the Sun.",
    11767: "Polaris is Earth's current North Star.",
    70890: "Proxima Centauri is the closest star to the Sun.",
  };

  const clean = (val) =>
    val === undefined || val === null || val === "" ? null : String(val).trim();

  // ⭐ Mapper function (works for both AWS + CSV)
  const mapStars = (data) =>
    data
      .filter(
        (s) =>
          (s.mag ?? s.Mag) !== undefined &&
          (s.x ?? s.X) != null &&
          (s.y ?? s.Y) != null &&
          (s.z ?? s.Z) != null
      )
      .filter((s) => parseFloat(s.mag ?? s.Mag) <= 7)
      .map((s) => ({
        name:
          clean(s.proper ?? s.Proper) ||
          (clean(s.flam ?? s.Flam) && clean(s.bayer ?? s.Bayer)
            ? `${s.flam ?? s.Flam} ${s.bayer ?? s.Bayer}`
            : null) ||
          clean(s.bayer ?? s.Bayer) ||
          (clean(s.hd ?? s.HD)
            ? `HD ${s.hd ?? s.HD}`
            : clean(s.hip ?? s.HIP)
            ? `HIP ${s.hip ?? s.HIP}`
            : "Unnamed Star"),

        x: parseFloat(s.x ?? s.X) * 5,
        y: parseFloat(s.y ?? s.Y) * 5,
        z: parseFloat(s.z ?? s.Z) * 5,
        mag: parseFloat(s.mag ?? s.Mag),
        bv: parseFloat(s.ci ?? s.CI) || 0.0,
        dist: parseFloat(s.dist ?? s.Dist),

        hip: clean(s.hip ?? s.HIP),
        hd: clean(s.hd ?? s.HD),
        hr: clean(s.hr ?? s.HR),
        gl: clean(s.gl ?? s.GL),
        bf: clean(s.bf ?? s.BF),

        bayer: clean(s.bayer ?? s.Bayer) || "—",
        flam: clean(s.flam ?? s.Flam) || "—",
        con: clean(s.con ?? s.Con) || "—",
        spect: clean(s.spect ?? s.Spect) || "—",
        lum: clean(s.lum ?? s.Lum) || "—",

        var: clean(s.var ?? s.Var),
        var_min: clean(s.var_min ?? s.VarMin),
        var_max: clean(s.var_max ?? s.VarMax),

        funfact: funFacts[s.hip ?? s.HIP] || null,
      }));

  useEffect(() => {
    // Try AWS first
    fetch("https://z53iyy74wb.execute-api.eu-north-1.amazonaws.com/stars")
      .then((res) => res.json())
      .then((data) => {
        console.log("AWS API sample:", data[0]);
        const mapped = mapStars(data);
        if (mapped.length > 0) {
          console.log("Loaded stars from AWS:", mapped.length);
          setStars(mapped);
          setLoading(false);
        } else {
          throw new Error("AWS returned no stars");
        }
      })
      .catch((err) => {
        console.warn("AWS failed, using CSV fallback:", err);

        Papa.parse("/hyg_v42.csv", {
          download: true,
          header: true,
          dynamicTyping: false,
          skipEmptyLines: true,
          complete: (results) => {
            const mapped = mapStars(results.data);
            console.log("Loaded stars from CSV:", mapped.length);
            setStars(mapped);
            setLoading(false);
          },
        });
      });
  }, []);

  const Disclaimer = () =>
    showDisclaimer && (
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.7)",
          color: "white",
          padding: "6px 12px",
          borderRadius: "8px",
          fontSize: "0.8rem",
        }}
      >
        🖱️ Scroll to zoom, drag to rotate
      </div>
    );

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "black",
        position: "relative",
      }}
    >
      {/* 🚀 Loading overlay */}
      {loading && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "white",
            background: "rgba(0,0,0,0.8)",
            padding: "12px 20px",
            borderRadius: "8px",
            fontSize: "1rem",
            zIndex: 10,
          }}
        >
          🚀 Loading stars from AWS API...
        </div>
      )}

      <Canvas camera={{ position: [0, 0, 2000] }}>
        <StarField
          stars={stars}
          pointsRef={pointsRef}
          selectedStar={selectedStar}
          onStarClick={setSelectedStar}
        />
        <ConstellationViewer stars={stars} selectedStar={selectedStar} />
        <FlyToStar target={selectedStar} />
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          zoomSpeed={0.5}
          panSpeed={0.5}
          touches={{
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN,
          }}
          onChange={() => setShowDisclaimer(false)}
        />
      </Canvas>

      <StarGuide stars={stars} onSelect={(star) => setSelectedStar(star)} />

      {/* ⭐ Star detail modal */}
      {selectedStar && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(20, 20, 30, 0.95)",
            padding: "16px 20px",
            borderRadius: "12px",
            color: "white",
            maxWidth: "360px",
          }}
        >
          <h2 style={{ margin: "0 0 10px 0" }}>{selectedStar.name}</h2>
          <p style={{ fontSize: "0.85rem" }}>
            {selectedStar.con} • Mag {selectedStar.mag} • {selectedStar.dist} ly
          </p>
          {selectedStar.funfact && (
            <p style={{ fontStyle: "italic", color: "#facc15" }}>
              💡 {selectedStar.funfact}
            </p>
          )}
          <button
            onClick={() => setSelectedStar(null)}
            style={{
              marginTop: "12px",
              background: "#f43f5e",
              border: "none",
              padding: "6px 12px",
              borderRadius: "8px",
              cursor: "pointer",
              color: "white",
            }}
          >
            Close
          </button>
        </div>
      )}

      {/* 🌌 NASA APOD always visible */}
      <div style={{ position: "absolute", right: "20px", top: "20px" }}>
        <StarOfTheDay />
      </div>

      <SpectralLegend />
      <Disclaimer />
    </div>
  );
}

export default App;
