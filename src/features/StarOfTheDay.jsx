import { useEffect, useState } from "react";

export default function StarOfTheDay() {
  const [data, setData] = useState(null);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const cachedData = localStorage.getItem("spaceNewsData");
    const cachedDate = localStorage.getItem("spaceNewsDate");

    if (cachedData && cachedDate === today) {
      setData(JSON.parse(cachedData));
      return;
    }

    const fetchNews = async () => {
      try {
        const res = await fetch("/api/space-news");
        const json = await res.json();
        const article = json.results?.[0];

        if (!article) throw new Error("No valid article returned");

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
        console.error("Error fetching space news:", err);
        setData({
  title: "Space News Unavailable",
  explanation:
    "Live space news is temporarily unreachable. Please check back later! " +
    "But if you wanna learn about this image — it's the Carina Nebula, captured by the James Webb Space Telescope. " +
    "This massive stellar nursery is packed with young stars and cosmic dust, sitting about 7,600 light-years away in the constellation Carina.",
  url: "https://assets.science.nasa.gov/dynamicimage/assets/science/missions/webb/science/2022/07/STScI-01GA6KKWG229B16K4Q38CH3BXS.png?w=900&h=521&fit=crop&crop=faces%2Cfocalpoint",
  media_type: "image",
});
      }
    };

    fetchNews();
  }, []);

  if (!data)
    return (
      <div
        style={{
          position: "fixed",
          top: "1.5vh",
          right: "0.01vw",
          width: "315px",
          padding: "16px",
          borderRadius: "12px",
          background: "rgba(20,20,30,0.3)",
          color: "white",
          fontFamily: "Iceberg, sans-serif",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
        }}
      >
        <p>Fetching today's space brief...</p>
      </div>
    );

  const text =
    showMore && data.explanation
      ? data.explanation
      : (data.explanation || "").slice(0, 160) + "...";

  return (
    <div
      style={{
        position: "fixed",
        top: "1.5vh",
        right: "1.5vw",
        width: "290px", // fixed slim width like StarGuide
        background: "rgba(20,20,30,0.07)",
        backdropFilter: "blur(14px) saturate(140%)",
        WebkitBackdropFilter: "blur(14px) saturate(140%)",
        padding: "16px",
        borderRadius: "18px",
        color: "#e5e7eb",
        fontFamily: "Iceberg, sans-serif",
        maxHeight: "480px",
        overflowY: "auto",
        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        transition: "all 0.25s ease-out",
        scrollbarWidth: "thin",
        scrollBehavior: "smooth",
        zIndex: 9999,
      }}
    >
      <h3
        style={{
          margin: "0 0 6px 0",
          fontSize: "1.1rem",
          color: "#a78bfa",
          fontFamily: "'Iceberg', sans-serif",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          paddingBottom: "6px",
          textShadow: "0 0 6px rgba(167,139,250,0.4)",
        }}
      >
        ⭐ The Space Brief
      </h3>

      <p
        style={{
          margin: "8px 0 10px 0",
          fontWeight: "bold",
          fontSize: "0.95rem",
          fontFamily: "'Iceland', sans-serif",
          color: "#e0d9ff",
        }}
      >
        {data.title}
      </p>

      {data.media_type === "image" && data.url && (
        <img
          src={data.url}
          alt={data.title}
          style={{
            width: "100%",
            borderRadius: "10px",
            marginTop: "6px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
            objectFit: "cover",
            maxHeight: "180px",
          }}
        />
      )}

      <p
        style={{
          marginTop: "10px",
          fontSize: "0.85rem",
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
          fontSize: "0.8rem",
          fontFamily: "'Iceberg', sans-serif",
          letterSpacing: "0.8px",
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
            padding: "8px 12px",
            fontFamily: "'Iceland', sans-serif",
            fontSize: "0.8rem",
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
          Explore the full article →
        </a>
      )}

      {/* Responsive fix for small screens */}
      <style>
        {`
          @media (max-width: 600px) {
            div[style*="position: fixed"] {
              width: 180px !important;
              font-size: 0.8rem !important;
              padding: 12px !important;
            }
            img {
              max-height: 140px !important;
            }
          }
        `}
      </style>
    </div>
  );
}
