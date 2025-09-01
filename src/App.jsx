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

function FlyToStar({ target }) {
  const { camera, controls } = useThree();
  const anim = useRef(null);

  useEffect(() => {
    if (target) {
      const start = {
        pos: camera.position.clone(),
        time: performance.now(),
      };

      // distance based on brightness (magnitude)
      const scale = THREE.MathUtils.clamp(10 - target.mag, 2, 20);
      const safeDist = scale * 20;

      const starPos = new THREE.Vector3(target.x, target.y, target.z);
      const endPos = starPos.clone().add(new THREE.Vector3(0, 0, safeDist));

      anim.current = { start, endPos, starPos, duration: 2000 };

      if (controls) controls.enabled = false; // 🔒 lock controls while animating
    }
  }, [target, camera, controls]);

  useFrame(() => {
    if (anim.current) {
      const { start, endPos, starPos, duration } = anim.current;
      const elapsed = performance.now() - start.time;
      const t = Math.min(elapsed / duration, 1);

      // smooth easeInOut cubic
      const ease =
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      camera.position.lerpVectors(start.pos, endPos, ease);
      camera.lookAt(starPos);

      if (t >= 1) {
        anim.current = null;
        if (controls) {
          controls.enabled = true;
          controls.target.copy(starPos); // ✅ Orbit around star
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
      complete: (results) => {
        const clean = (val) =>
          val === undefined || val === null || val === ""
            ? null
            : String(val).trim();

        const data = results.data
          .filter(
            (s) =>
              s.mag !== undefined &&
              s.x != null &&
              s.y != null &&
              s.z != null
          )
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
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "rgba(0,0,0,0.8)",
          color: "white",
          padding: "12px 20px",
          borderRadius: "10px",
          fontFamily: "sans-serif",
          fontSize: "1rem",
          textAlign: "center",
        }}
      >
        ℹ️ Zoom in to see the stars
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
          onChange={() => setShowDisclaimer(false)} // hide disclaimer once user zooms/pans
        />
      </Canvas>

      <BrightestStars
        stars={stars}
        onSelect={(star) => setSelectedStar(star)}
      />

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
            pointerEvents: "auto",
            maxWidth: "360px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
            fontFamily: "sans-serif",
          }}
        >
          <h2
            style={{
              margin: "0 0 10px 0",
              fontSize: "1.4rem",
              fontWeight: "600",
            }}
          >
            {selectedStar.name}
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "6px 12px",
              fontSize: "0.9rem",
            }}
          >
            <span style={{ opacity: 0.7 }}>Bayer:</span>
            <span>{selectedStar.bayer}</span>

            <span style={{ opacity: 0.7 }}>Flamsteed:</span>
            <span>{selectedStar.flam}</span>

            <span style={{ opacity: 0.7 }}>Constellation:</span>
            <span>{selectedStar.con}</span>

            <span style={{ opacity: 0.7 }}>Distance:</span>
            <span>{selectedStar.dist} ly</span>

            <span style={{ opacity: 0.7 }}>Magnitude:</span>
            <span>{selectedStar.mag}</span>

            <span style={{ opacity: 0.7 }}>Spectral:</span>
            <span>{selectedStar.spect}</span>

            <span style={{ opacity: 0.7 }}>Luminosity:</span>
            <span>{selectedStar.lum} L☉</span>
          </div>

          <hr
            style={{
              border: "none",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              margin: "10px 0",
            }}
          />

          <div style={{ fontSize: "0.85rem", lineHeight: 1.4 }}>
            <strong>Catalog IDs:</strong>
            <br />
            {selectedStar.hip && `HIP ${selectedStar.hip} `}
            {selectedStar.hd && `| HD ${selectedStar.hd} `}
            {selectedStar.hr && `| HR ${selectedStar.hr} `}
            {selectedStar.gl && `| Gliese ${selectedStar.gl} `}
            {selectedStar.bf && `| ${selectedStar.bf}`}
          </div>

          {selectedStar.var && (
            <div style={{ fontSize: "0.85rem", marginTop: "6px" }}>
              <strong>Variable:</strong> {selectedStar.var} (
              {selectedStar.var_min} → {selectedStar.var_max})
            </div>
          )}

          {selectedStar.funfact && (
            <p
              style={{
                fontSize: "0.85rem",
                marginTop: "8px",
                fontStyle: "italic",
                color: "#facc15",
              }}
            >
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
              fontWeight: "600",
              fontSize: "0.85rem",
            }}
          >
            Close
          </button>
        </div>
      )}

      <div
        style={{
          position: "absolute",
          right: "20px",
          top: "20px",
          pointerEvents: "auto",
        }}
      >
        <StarOfTheDay />
      </div>

      <SpectralLegend />

      <Disclaimer />
    </div>
  );
}

export default App;
