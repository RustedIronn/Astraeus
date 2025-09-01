import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import StarOfTheDay from "./StarOfTheDay";
import { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import * as THREE from "three";
import StarField from "./StarField";
import ConstellationViewer from "./ConstellationViewer";
import SpectralLegend from "./SpectralLegend";
import BrightestStars from "./BrightestStars";

// 📱 detect mobile
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

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
  const [showNasa, setShowNasa] = useState(!isMobile);
  const [showStarsList, setShowStarsList] = useState(false);
  const [showLegend, setShowLegend] = useState(!isMobile);
  const pointsRef = useRef();

  const funFacts = {
    32349: "Sirius is the brightest star in the night sky.",
    27989: "Betelgeuse is a red supergiant that will go supernova one day.",
    91262: "Vega was once the North Star and is part of the Summer Triangle.",
    24436: "Rigel is a blue supergiant, thousands of times brighter than the Sun.",
    11767: "Polaris is Earth's current North Star.",
    70890: "Proxima Centauri is the closest star to the Sun.",
  };

  useEffect(() => {
    Papa.parse("/hyg_v42.csv", {
      download: true,
      header: true,
      dynamicTyping: false,
      skipEmptyLines: true,
      complete: (results) => {
        const clean = (val) =>
          val === undefined || val === null || val === ""
            ? null
            : String(val).trim();

        const data = results.data
          .filter((s) => s.mag !== undefined && s.x != null && s.y != null && s.z != null)
          .filter((s) => parseFloat(s.mag) <= 7)
          .map((s) => ({
            name:
              clean(s.proper) ||
              (clean(s.flam) && clean(s.bayer)
                ? `${s.flam} ${s.bayer}`
                : null) ||
              clean(s.bayer) ||
              (clean(s.hd)
                ? `HD ${s.hd}`
                : clean(s.hip)
                ? `HIP ${s.hip}`
                : "Unnamed Star"),

            x: parseFloat(s.x) * 5,
            y: parseFloat(s.y) * 5,
            z: parseFloat(s.z) * 5,
            mag: parseFloat(s.mag),
            bv: s.ci ?? 0.0,
            dist: parseFloat(s.dist),

            hip: clean(s.hip),
            hd: clean(s.hd),
            hr: clean(s.hr),
            gl: clean(s.gl),
            bf: clean(s.bf),

            bayer: clean(s.bayer) || "—",
            flam: clean(s.flam) || "—",
            con: clean(s.con) || "—",
            spect: clean(s.spect) || "—",
            lum: clean(s.lum) || "—",

            var: clean(s.var),
            var_min: clean(s.var_min),
            var_max: clean(s.var_max),

            funfact: funFacts[s.hip] || null,
          }));

        setStars(data);
      },
    });
  }, []);

  const ClickHandler = () => {
    const { camera, gl } = useThree();

    useEffect(() => {
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      function handleClick(event) {
        const rect = gl.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.params.Points.threshold = 3;
        raycaster.setFromCamera(mouse, camera);

        if (!pointsRef.current) return;
        const intersects = raycaster.intersectObject(pointsRef.current);

        if (intersects.length > 0) {
          const nearest = intersects.reduce((a, b) =>
            a.distance < b.distance ? a : b
          );
          setSelectedStar(stars[nearest.index]);
        }
      }

      gl.domElement.addEventListener("click", handleClick);
      return () => gl.domElement.removeEventListener("click", handleClick);
    }, [stars, camera, gl]);

    return null;
  };

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
          zIndex: 9999,
        }}
      >
        {isMobile ? "📱 Drag = rotate | Pinch = zoom/pan" : "🖱️ Scroll to zoom, drag to rotate"}
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
      <Canvas camera={{ position: [0, 0, 2000] }}>
        <StarField
          stars={stars}
          pointsRef={pointsRef}
          selectedStar={selectedStar}
        />
        <ConstellationViewer stars={stars} selectedStar={selectedStar} />
        <ClickHandler />
        <FlyToStar target={selectedStar} />
        <OrbitControls
          makeDefault
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          zoomSpeed={0.8}
          panSpeed={0.8}
          enableDamping={true}
          dampingFactor={0.05}
          touches={{
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN,
          }}
          onChange={() => setShowDisclaimer(false)}
        />
      </Canvas>

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
            zIndex: 9999,
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

      {/* 📸 NASA APOD */}
      <div style={{ position: "absolute", right: "20px", top: "20px", zIndex: 9999 }}>
        {isMobile ? (
          <>
            <button
              onClick={() => setShowNasa(!showNasa)}
              style={{
                background: "#2563eb",
                color: "white",
                padding: "6px 10px",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.85rem",
              }}
            >
              {showNasa ? "Hide NASA APOD" : "Show NASA APOD"}
            </button>
            {showNasa && <StarOfTheDay />}
          </>
        ) : (
          <StarOfTheDay />
        )}
      </div>

      {/* 🌟 Brightest Stars */}
      {isMobile ? (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            textAlign: "center",
            zIndex: 9999,
          }}
        >
          <button
            onClick={() => setShowStarsList((prev) => !prev)}
            style={{
              background: "#9333ea",
              color: "white",
              border: "none",
              padding: "8px 14px",
              borderRadius: "8px",
              fontWeight: "600",
            }}
          >
            {showStarsList ? "Hide Brightest Stars" : "🌟 Brightest Stars"}
          </button>

          {showStarsList && (
            <div
              style={{
                marginTop: "10px",
                background: "rgba(20,20,30,0.95)",
                color: "white",
                padding: "12px",
                borderRadius: "10px",
                maxHeight: "40vh",
                overflowY: "auto",
                width: "85vw",
              }}
            >
              <BrightestStars
                stars={stars}
                onSelect={(star) => setSelectedStar(star)}
              />
            </div>
          )}
        </div>
      ) : (
        <BrightestStars
          stars={stars}
          onSelect={(star) => setSelectedStar(star)}
        />
      )}

      {/* 🎨 Spectral Legend */}
      <div style={{ position: "absolute", left: "20px", bottom: "20px", zIndex: 9999 }}>
        {isMobile ? (
          <>
            <button
              onClick={() => setShowLegend(!showLegend)}
              style={{
                background: "#14b8a6",
                color: "white",
                padding: "6px 10px",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.85rem",
              }}
            >
              {showLegend ? "Hide Spectral Legend" : "🎨 Spectral Legend"}
            </button>
            {showLegend && <SpectralLegend />}
          </>
        ) : (
          <SpectralLegend />
        )}
      </div>

      <Disclaimer />
    </div>
  );
}

export default App;
