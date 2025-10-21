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
    const type = (star.spect?.trim()?.charAt(0)?.toUpperCase() || "G");
    const dist = !isNaN(parseFloat(star.dist)) ? parseFloat(star.dist) : Math.floor(Math.random() * 800 + 20);
    const mag = !isNaN(parseFloat(star.mag)) ? parseFloat(star.mag) : 5.5;
    const con = star.con?.trim() || "an uncharted constellation";

    const personalities = {
      O: "a fierce blue supergiant burning at extreme heat",
      B: "a luminous blue-white giant",
      A: "a bright white star with icy brilliance",
      F: "a yellow-white star of balanced warmth",
      G: "a steady yellow star like our Sun",
      K: "an orange star cooler and older than Sol",
      M: "a quiet red dwarf — small but long-lived",
      L: "a fading ember of ancient light",
      T: "a cool brown dwarf, faint and ghostly",
      Y: "an ultra-cool brown dwarf barely glowing",
    };

    let distanceMood =
      dist < 20
        ? "A nearby cosmic neighbor."
        : dist < 200
        ? "Its light crosses nearby space."
        : dist < 1000
        ? "Light centuries away."
        : "Ancient light from deep space.";

    let brightnessMood =
      mag < 1.5
        ? "Among the brightest in its sky."
        : mag < 3.5
        ? "Easily visible on clear nights."
        : "Barely visible without aid.";

    const endings = [
      "Often studied for its stellar makeup.",
      "Possibly surrounded by exoplanets.",
      "Used as a calibration star in astronomy.",
      "A core part of its constellation.",
      "Observed regularly for spectral shifts.",
    ];

    const ending = endings[Math.floor(Math.random() * endings.length)];

    return `A ${personalities[type] || "mysterious star"}, about ${Math.round(dist)} ly away in ${con}. ${brightnessMood} ${distanceMood} ${ending}`;
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
        x: parseFloat(s.x ?? s.X) * 7,
        y: parseFloat(s.y ?? s.Y) * 7,
        z: parseFloat(s.z ?? s.Z) * 7,
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
