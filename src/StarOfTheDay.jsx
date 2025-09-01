import { useEffect, useState } from "react";

function StarOfTheDay() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_NASA_API_KEY;
    fetch(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) return <p style={{ color: "white" }}>Loading Star of the Day...</p>;

  return (
    <div style={{
      position: "absolute",
      top: "20px",
      right: "20px",
      width: "320px",
      background: "rgba(0,0,0,0.85)",
      padding: "14px",
      borderRadius: "14px",
      color: "white",
      fontFamily: "sans-serif"
    }}>
      <h3>⭐ Star of the Day</h3>
      <p><b>{data.title}</b></p>
      {data.media_type === "image" && (
        <img 
          src={data.url} 
          alt={data.title} 
          style={{ width: "100%", borderRadius: "8px", marginTop: "8px" }} 
        />
      )}
      <p style={{ marginTop: "8px", fontSize: "14px" }}>
        {data.explanation.slice(0, 120)}...
      </p>
      <p style={{ marginTop: "8px", color: "violet" }}>
        
      </p>
    </div>
  );
}

export default StarOfTheDay;
