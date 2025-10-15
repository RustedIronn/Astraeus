import { useEffect, useState } from "react";

function StarOfTheDay() {
  const [data, setData] = useState(null);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const cachedData = localStorage.getItem("spaceNewsData");
    const cachedDate = localStorage.getItem("spaceNewsDate");

    // 🕒 Use cache if it's from the same day
    if (cachedData && cachedDate === today) {
      setData(JSON.parse(cachedData));
      return;
    }

    const fetchNews = async () => {
      try {
        // 🛰 Primary: Your Vercel serverless function (Spaceflight API proxy)
        const res = await fetch("/api/space-news");
        if (!res.ok) throw new Error(`Spaceflight API error: ${res.status}`);
        const json = await res.json();

        const article = json.results?.[0];
        if (!article) throw new Error("No article found in response");

        const formattedData = {
          title: article.title,
          explanation: article.summary,
          url: article.image_url,
          articleUrl: article.url,
          media_type: "image",
        };

        setData(formattedData);
        localStorage.setItem("spaceNewsData", JSON.stringify(formattedData));
        localStorage.setItem("spaceNewsDate", today);
      } catch (err) {
        console.error("Error fetching Spaceflight News:", err);

        // 🌌 Fallback: Your ESA serverless function
        try {
          const res2 = await fetch("/api/esa");
          if (!res2.ok) throw new Error(`ESA API error: ${res2.status}`);
          const json2 = await res2.json();
          const entry = json2?.items?.[0];

          if (!entry) throw new Error("No ESA image found");

          const formattedData = {
            title: entry.title,
            explanation:
              entry.summary ||
              "A captivating capture from the European Space Agency archives.",
            url: entry.image,
            articleUrl: entry.source_url || "https://www.esa.int",
            media_type: "image",
          };

          setData(formattedData);
          localStorage.setItem("spaceNewsData", JSON.stringify(formattedData));
          localStorage.setItem("spaceNewsDate", today);
        } catch (fallbackErr) {
          console.error("Error fetching ESA image:", fallbackErr);
          setData({
            title: "Space News Unavailable",
            explanation:
              "All space data sources are temporarily unreachable. Please check back later!",
            url: "/fallback.jpg",
            media_type: "image",
          });
        }
      }
    };

    fetchNews();
  }, []);

  if (!data)
    return (
      <div
        style={{
          position: "absolute",
          top: "0px",
          right: "0px",
          width: "315px",
          padding: "16px",
          borderRadius: "12px",
          background: "rgba(20,20,30,0.3)",
          color: "white",
          fontFamily: "Iceberg, sans-serif",
        }}
      >
        <p>Fetching today's space brief...</p>
      </div>
    );

  const text = showMore
    ? data.explanation
    : data.explanation.slice(0, 160) + "...";

  return (
    <div
      style={{
        position: "absolute",
        top: "0px",
        right: "0px",
        width: "315px",
        background: "rgba(20,20,30,0.07)",
        backdropFilter: "blur(12px) saturate(140%)",
        WebkitBackdropFilter: "blur(12px) saturate(140%)",
        padding: "16px",
        borderRadius: "12px",
        color: "#e5e7eb",
        fontFamily: "Iceberg, sans-serif",
        maxHeight: "480px",
        overflowY: "auto",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        border: "1px solid rgba(255, 255, 255, 0.03)",
      }}
    >
      <h3
        style={{
          margin: "0 0 6px 0",
          fontSize: "18px",
          color: "#a78bfa",
          fontFamily: "'Iceberg', sans-serif",
        }}
      >
        ⭐ The Space Brief
      </h3>

      <p
        style={{
          margin: "0 0 10px 0",
          fontWeight: "bold",
          fontSize: "15px",
          fontFamily: "'Iceland', sans-serif",
        }}
      >
        {data.title}
      </p>

      {data.media_type === "image" && (
        <img
          src={data.url}
          alt={data.title}
          style={{
            width: "100%",
            borderRadius: "8px",
            marginTop: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
          }}
        />
      )}

      <p
        style={{
          marginTop: "10px",
          fontSize: "14px",
          lineHeight: "1.4",
          fontFamily: "'Iceland', sans-serif",
        }}
      >
        {text}
      </p>

      <button
        onClick={() => setShowMore(!showMore)}
        style={{
          marginTop: "10px",
          padding: "6px 12px",
          fontSize: "14px",
          fontFamily: "'Iceberg', sans-serif",
          letterSpacing: "0.8px",
          fontWeight: "400",
          color: "violet",
          background: "transparent",
          border: "1px solid violet",
          borderRadius: "6px",
          cursor: "pointer",
          transition: "all 0.25s ease",
        }}
        onMouseOver={(e) => {
          e.target.style.background = "violet";
          e.target.style.color = "black";
          e.target.style.transform = "scale(1.05)";
        }}
        onMouseOut={(e) => {
          e.target.style.background = "transparent";
          e.target.style.color = "violet";
          e.target.style.transform = "scale(1)";
        }}
      >
        {showMore ? "Show Less" : "Read More"}
      </button>

      {data.articleUrl && (
        <a
          href={data.articleUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            marginTop: "10px",
            padding: "8px 16px",
            fontFamily: "'Iceland', sans-serif",
            fontSize: "14px",
            letterSpacing: "0.8px",
            color: "#b88cff",
            background: "transparent",
            borderRadius: "6px",
            cursor: "pointer",
            transition: "all 0.3s ease",
            textDecoration: "none",
          }}
          onMouseOver={(e) => {
            e.target.style.color = "#ffffff";
            e.target.style.textShadow = "0 0 8px #b88cff";
            e.target.style.transform = "translateX(4px)";
          }}
          onMouseOut={(e) => {
            e.target.style.color = "#b88cff";
            e.target.style.textShadow = "none";
            e.target.style.transform = "translateX(0)";
          }}
        >
          Explore the full article
        </a>
      )}
    </div>
  );
}

export default StarOfTheDay;
