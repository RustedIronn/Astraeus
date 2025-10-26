import { useState, useEffect } from "react";
import Papa from "papaparse";

export default function useStars() {
  const [stars, setStars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStar, setSelectedStar] = useState(null);

  const funFacts = {
    0: "Sol — our Sun — is the only star known to support life.",
    32349: "Sirius is the brightest star in the night sky.",
    27989: "Betelgeuse is a red supergiant that will go supernova one day.",
    91262: "Vega was once the North Star and part of the Summer Triangle.",
    24436: "Rigel is a blue supergiant, thousands of times brighter than the Sun.",
    11767: "Polaris is Earth’s current North Star.",
    70890: "Proxima Centauri is the closest star to the Sun.",
  };

  const generateFact = (star) => {
  const type = star.spect?.trim()?.charAt(0)?.toUpperCase() || "G";
  const dist = !isNaN(parseFloat(star.dist)) ? parseFloat(star.dist) : Math.floor(Math.random() * 800 + 20);
  const mag = !isNaN(parseFloat(star.mag)) ? parseFloat(star.mag) : 5.5;
  const con = star.con?.trim() || "an uncharted region";

  const classifications = {
    O: "hot, massive blue main-sequence star",
    B: "blue-white star of high luminosity",
    A: "white star with strong hydrogen lines",
    F: "yellow-white star with moderate temperature",
    G: "yellow main-sequence star similar to the Sun",
    K: "orange star cooler than the Sun",
    M: "red dwarf star with low surface temperature",
    L: "cool substellar brown dwarf",
    T: "methane-dominated brown dwarf",
    Y: "ultra-cool brown dwarf with minimal luminosity",
  };

  const distanceDesc =
    dist < 20
      ? "Relatively close to the Solar System."
      : dist < 200
      ? "Located within the local stellar neighborhood."
      : dist < 1000
      ? "Positioned within the nearby galactic region."
      : "Situated in the outer regions of the Milky Way.";

  const visibility =
    mag < 1.5
      ? "Visible to the naked eye under most conditions."
      : mag < 3.5
      ? "Visible under dark-sky conditions."
      : "Requires optical aid for observation.";

  return `${star.name || "This star"} is a ${classifications[type] || "main-sequence star"} approximately ${Math.round(dist)} light years from Earth, in ${con}. It has an apparent magnitude of ${mag.toFixed(1)}. ${distanceDesc} ${visibility}`;
};

  const clean = (val) =>
    val === undefined || val === null || val === "" ? null : String(val).trim();

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
        hip: Number(s.hip ?? s.HIP) || null, // 🔹 ensure HIP is always numeric
        name:
          clean(s.proper ?? s.Proper) ||
          (clean(s.bf ?? s.BF) ? s.bf : null) ||
          (clean(s.bayer ?? s.Bayer) && clean(s.flam ?? s.Flam)
            ? `${s.flam} ${s.bayer}`
            : clean(s.bayer ?? s.Bayer)) ||
          (clean(s.hd ?? s.HD)
            ? `HD ${s.hd ?? s.HD}`
            : clean(s.hip ?? s.HIP)
            ? `HIP ${s.hip ?? s.HIP}`
            : "Unnamed Star"),
        x: parseFloat(s.x ?? s.X) * 10,
        y: parseFloat(s.y ?? s.Y) * 10,
        z: parseFloat(s.z ?? s.Z) * 10,
        mag: parseFloat(s.mag ?? s.Mag),
        dist: parseFloat(s.dist ?? s.Dist),
        con: clean(s.con ?? s.Con) || "—",
        spect: clean(s.spect ?? s.Spect) || "—",
        funfact:
          funFacts[String(s.hip ?? s.HIP)] ||
          funFacts[Number(s.hip ?? s.HIP)] ||
          generateFact(s),
      }))
      .sort((a, b) => {
        const magA = isNaN(a.mag) ? 99 : a.mag;
        const magB = isNaN(b.mag) ? 99 : b.mag;
        if (magA !== magB) return magA - magB;
        const conA = a.con?.toUpperCase() || "";
        const conB = b.con?.toUpperCase() || "";
        if (conA < conB) return -1;
        if (conA > conB) return 1;
        const nameA = a.name?.toUpperCase() || "";
        const nameB = b.name?.toUpperCase() || "";
        return nameA.localeCompare(nameB);
      });

  useEffect(() => {
    fetch("https://z53iyy74wb.execute-api.eu-north-1.amazonaws.com/stars")
      .then((res) => {
        if (!res.ok) throw new Error("CORS blocked");
        return res.json();
      })
      .then((data) => {
        const mapped = mapStars(data);
        if (mapped.length > 0) {
          setStars(mapped);
          setLoading(false);
        } else throw new Error("Empty data");
      })
      .catch(() => {
        console.warn("Using local CSV fallback due to CORS");
        Papa.parse("/hyg_v42.csv", {
          download: true,
          header: true,
          dynamicTyping: true, // ✅ convert numbers properly
          skipEmptyLines: true,
          complete: (results) => {
            const mapped = mapStars(results.data);
            setStars(mapped);
            setLoading(false);
          },
        });
      });
  }, []);

  return { stars, loading, selectedStar, setSelectedStar };
}
