import { useState, useEffect } from "react";
import Papa from "papaparse";

export default function useDeepSkyObjects() {
  const [objects, setObjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Papa.parse("/ngc_ic_messier_ready.csv", {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const mapped = results.data.map((o) => ({
          name: o.Name || o["Object type"] || "Unknown",
          x: parseFloat(o.x),
          y: parseFloat(o.y),
          z: parseFloat(o.z),
          type: o["Object Type abrev."] || o["Object type"] || "Object",
          constellation: o.Constellation || "",
          mag: parseFloat(o.v_mag) || null,
        }));
        setObjects(mapped);
        setLoading(false);
      },
    });
  }, []);

  return { objects, loading };
}
