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
        className="
          fixed top-[1.5vh] right-[1.5vw]
          w-[315px] p-4 rounded-xl
          bg-[rgba(20,20,30,0.3)] text-white font-[Iceberg]
          backdrop-blur-md shadow-[0_6px_20px_rgba(0,0,0,0.4)]
          text-center
        "
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
        backgroundImage: `linear-gradient(
          130deg,
          rgba(0, 220, 255, 0.18),
          rgba(0, 160, 255, 0.15),
          rgba(80, 120, 255, 0.12),
          rgba(160, 60, 255, 0.15),
          rgba(0, 255, 160, 0.18)
        )`,
        backgroundSize: "400% 400%",
        animation: "auroraFlow 22s ease-in-out infinite",
      }}
      className="
        fixed top-[1.5vh] right-[1.5vw]
        w-[clamp(230px,18vw,245px)] h-[clamp(320px,45vh,390px)]
        text-gray-100 font-[Iceberg]
        border border-[rgba(100,180,255,0.3)] rounded-2xl
        backdrop-blur-[3px] saturate-[160%]
        p-[clamp(0.8rem,1vw,1rem)]
        overflow-y-auto
        shadow-[0_0_25px_rgba(0,180,255,0.25)]
        transition-all duration-300 ease-out
        hover:shadow-[0_0_35px_rgba(0,200,255,0.35)]
        scrollbar-thin scroll-smooth
        z-[9999]
        custom-scrollbar
      "
    >
      <h3
        className="
          text-[1.1rem] mb-2
          bg-gradient-to-r from-cyan-300 via-blue-300 to-teal-200
          bg-clip-text text-transparent border-b border-white/10 pb-1
          drop-shadow-[0_0_6px_rgba(130,200,255,0.4)]
        "
      >
        ⭐ The Space Brief
      </h3>

      <p className="mt-1 mb-2 font-bold text-[0.95rem] text-cyan-200 font-[Iceland]">
        {data.title}
      </p>

      {data.media_type === "image" && data.url && (
        <img
          src={data.url}
          alt={data.title}
          className="
            w-full rounded-lg mt-2 object-cover
            shadow-[0_2px_8px_rgba(0,0,0,0.4)]
            max-h-[180px] sm:max-h-[140px]
          "
        />
      )}

      <p className="mt-3 text-[0.85rem] leading-[1.4] font-[Iceland] text-cyan-100/90">
        {text}
      </p>

      <button
        onClick={() => setShowMore(!showMore)}
        className="
          mt-3 px-3 py-1.5 text-[0.8rem]
          text-cyan-300 font-[Iceberg] border border-cyan-300 rounded-md
          hover:bg-cyan-300 hover:text-black hover:scale-105
          transition-all duration-200
        "
      >
        {showMore ? "Show Less" : "Read More"}
      </button>

      {data.articleUrl && (
        <a
          href={data.articleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="
            inline-block mt-3 text-[0.8rem] font-[Iceland]
            text-blue-300 hover:text-white
            transition-transform duration-300 hover:translate-x-1
          "
        >
          Explore the full article →
        </a>
      )}

      {/* Aurora + Scrollbar Styling */}
      <style>{`
        @keyframes auroraFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* 🌊 Custom Scrollbar Styling */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(0,255,255,0.4), rgba(0,180,255,0.5));
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0,180,255,0.4);
          transition: all 0.3s ease;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(0,255,255,0.7), rgba(0,180,255,0.8));
          box-shadow: 0 0 12px rgba(0,255,255,0.6);
        }
      `}</style>
    </div>
  );
}
