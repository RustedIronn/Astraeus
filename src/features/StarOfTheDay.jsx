import { useEffect, useState } from "react";
import "../css/StarOfTheDay.css";

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
      <div className="space-brief loading-card">
        <p>Fetching today's space brief...</p>
      </div>
    );

  const text =
    showMore && data.explanation
      ? data.explanation
      : (data.explanation || "").slice(0, 160) + "...";

  return (
    <div className="space-brief">
      <h3>⭐ The Space Brief</h3>

      <p className="brief-title">{data.title}</p>

      {data.media_type === "image" && data.url && (
        <img src={data.url} alt={data.title} className="brief-image" />
      )}

      <p className="brief-text">{text}</p>

      <button
        onClick={() => setShowMore(!showMore)}
        className="brief-button"
      >
        {showMore ? "Show Less" : "Read More"}
      </button>

      {data.articleUrl && (
        <a
          href={data.articleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="brief-link"
        >
          Explore the full article →
        </a>
      )}
    </div>
  );
}
