import { useState, useEffect } from "react";
import Papa from "papaparse";

export default function useStars() {
  const [stars, setStars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStar, setSelectedStar] = useState(null);

  // 🌠 Custom fun facts for well-known stars
  const funFacts = {
    0: "Sol — our Sun — is the only star known to support life.",
    32349: "Sirius is the brightest star in the night sky.",
    27989: "Betelgeuse is a red supergiant that will go supernova one day.",
    91262: "Vega was once the North Star and part of the Summer Triangle.",
    24436: "Rigel is a blue supergiant, thousands of times brighter than the Sun.",
    11767: "Polaris is Earth’s current North Star.",
    70890: "Proxima Centauri is the closest star to the Sun.",
  };

  // 🪐 Random fallback fact generator
  const generateFact = (star) => {
    const spectralType = (star.spect?.trim()?.charAt(0)?.toUpperCase() || "G");
    const dist = !isNaN(parseFloat(star.dist)) ? parseFloat(star.dist) : Math.floor(Math.random() * 500 + 10);
    const mag = !isNaN(parseFloat(star.mag)) ? parseFloat(star.mag) : Math.random() * 6;
    const con = star.con?.trim() || "an unknown constellation";

    const types = {
      O: "a blazing blue star reaching over 30,000 K",
      B: "a bright blue-white giant",
      A: "a brilliant white star",
      F: "a warm yellow-white star",
      G: "a yellow main-sequence star like our Sun",
      K: "an orange star cooler than the Sun",
      M: "a cool red dwarf",
    };
    const desc = types[spectralType] || types.G;
    const endings = [
      "Its light has traveled for centuries.",
      "A key part of its constellation.",
      "Cataloged in the Hipparcos star index.",
      "Studied for its unique color spectrum.",
    ];

    return `This is ${desc}, located about ${Math.round(dist)} ly away in ${con}. ${endings[Math.floor(Math.random() * endings.length)]}`;
  };

  const clean = (val) =>
    val === undefined || val === null || val === "" ? null : String(val).trim();

  // 🧭 Parse & normalize star data
  // 🧭 Parse & normalize star data
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
      // 🌌 Proper name logic — best fallback chain
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

      // 🪩 Spatial & visual data
      x: parseFloat(s.x ?? s.X) * 5,
      y: parseFloat(s.y ?? s.Y) * 5,
      z: parseFloat(s.z ?? s.Z) * 5,
      mag: parseFloat(s.mag ?? s.Mag),
      dist: parseFloat(s.dist ?? s.Dist),
      con: clean(s.con ?? s.Con) || "—",
      spect: clean(s.spect ?? s.Spect) || "—",

      // 🌟 Fun fact generator
      funfact:
        funFacts[String(s.hip ?? s.HIP)] ||
        funFacts[Number(s.hip ?? s.HIP)] ||
        generateFact(s),
    }))
    // 🔭 Sort priority:
    // 1️⃣ Brightest (lowest mag first)
    // 2️⃣ Grouped by constellation
    // 3️⃣ Then alphabetically by name
    .sort((a, b) => {
      const magA = isNaN(a.mag) ? 99 : a.mag;
      const magB = isNaN(b.mag) ? 99 : b.mag;

      if (magA !== magB) return magA - magB; // ⭐ Brightest first (smaller mag = brighter)

      const conA = a.con?.toUpperCase() || "";
      const conB = b.con?.toUpperCase() || "";
      if (conA < conB) return -1;
      if (conA > conB) return 1;

      const nameA = a.name?.toUpperCase() || "";
      const nameB = b.name?.toUpperCase() || "";
      return nameA.localeCompare(nameB);
    });

  // ☁️ Fetch from AWS API, fallback to CSV
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
          dynamicTyping: false,
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
