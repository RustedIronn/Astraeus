import { useEffect, useState } from "react";

export default function SpaceBrief() {
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
      const cacheAndSet = (formattedData) => {
        setData(formattedData);
        localStorage.setItem("spaceNewsData", JSON.stringify(formattedData));
        localStorage.setItem("spaceNewsDate", today);
      };

      try {
        const res = await fetch("/api/space-news");
        if (!res.ok) throw new Error("Spaceflight API failed");
        const json = await res.json();
        const article = json.results?.[0];
        if (!article) throw new Error("No valid article returned");

        cacheAndSet({
          title: article.title,
          explanation: article.summary,
          url: article.image_url,
          articleUrl: article.url,
          media_type: "image",
          source: "Spaceflight News",
        });
      } catch {
        try {
          const res2 = await fetch("/api/esa-news");
          if (!res2.ok) throw new Error("ESA API failed");
          const json2 = await res2.json();
          const item = json2?.[0] || json2.results?.[0] || json2.items?.[0];
          cacheAndSet({
            title: item?.title || "ESA Media Update",
            explanation:
              item?.description || "European Space Agency feed fetched successfully.",
            url: item?.image?.url || item?.url || "",
            articleUrl:
              item?.permalink ||
              item?.links?.[0]?.href ||
              "https://www.esa.int/",
            media_type: "image",
            source: "European Space Agency",
          });
        } catch {
          cacheAndSet({
            title: "Space News Unavailable",
            explanation:
              "Live space news is temporarily unreachable. But this image shows the Carina Nebula — a massive stellar nursery captured by the James Webb Space Telescope, located 7,600 light-years away.",
            url: "https://assets.science.nasa.gov/dynamicimage/assets/science/missions/webb/science/2022/07/STScI-01GA6KKWG229B16K4Q38CH3BXS.png?w=900&h=521&fit=crop&crop=faces%2Cfocalpoint",
            articleUrl:
              "https://science.nasa.gov/missions/webb/nasas-webb-reveals-cosmic-cliffs-glittering-landscape-of-star-birth/",
            media_type: "image",
            source: "Static NASA Fallback",
          });
        }
      }
    };

    fetchNews();
  }, []);

  if (!data)
    return (
      <div className="w-full h-full flex justify-center items-center text-cyan-200 font-[Iceland]">
        Fetching today’s space brief...
      </div>
    );

  const text =
    showMore && data.explanation
      ? data.explanation
      : (data.explanation || "").slice(0, 160) + "...";

  return (
    <div
      className="
        w-full h-full flex flex-col
        text-gray-100 font-[Iceberg]
        border border-[rgba(100,180,255,0.25)]
        rounded-2xl p-4 md:p-6
        backdrop-blur-[3px] saturate-[160%]
        overflow-y-auto
        animate-[fadeIn_0.6s_ease-out]
        custom-scrollbar
      "
      style={{
        backgroundImage: `linear-gradient(
          130deg,
          rgba(0,220,255,0.18),
          rgba(0,160,255,0.15),
          rgba(80,120,255,0.12),
          rgba(160,60,255,0.15),
          rgba(0,255,160,0.18)
        )`,
        backgroundSize: "400% 400%",
        animation: "auroraFlow 22s ease-in-out infinite",
      }}
    >
      <h3
        className="
          text-[1.3rem] md:text-[1.5rem] mb-2
          bg-gradient-to-r from-cyan-300 via-blue-300 to-teal-200
          bg-clip-text text-transparent border-b border-white/10 pb-1
          drop-shadow-[0_0_6px_rgba(130,200,255,0.4)]
        "
      >
        ⭐ The Space Brief
      </h3>

      <p className="mt-1 mb-2 font-bold text-[1rem] text-cyan-200 font-[Iceland]">
        {data.title}
      </p>

      {data.media_type === "image" && data.url && (
        <img
          src={data.url}
          alt={data.title}
          className="
            w-full rounded-lg mt-2 object-cover
            shadow-[0_2px_8px_rgba(0,0,0,0.4)]
            max-h-[240px]
          "
        />
      )}

      <p className="mt-3 text-[0.9rem] leading-[1.5] font-[Iceland] text-cyan-100/90">
        {text}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => setShowMore(!showMore)}
          className="
            px-3 py-1.5 text-[0.8rem]
            text-cyan-300 font-[Iceberg] border border-cyan-300 rounded-md
            hover:bg-cyan-300 hover:text-black hover:scale-105
            transition-all duration-200
          "
        >
          {showMore ? "Show Less" : "Read More"}
        </button>

        {data.articleUrl && (
          <button
            onClick={() => window.open(data.articleUrl, "_blank")}
            className="
              px-3 py-1.5 text-[0.8rem]
              text-cyan-300 font-[Iceland]
              border border-transparent
              hover:text-white hover:underline
              transition-all duration-200
            "
          >
            Explore Full Article →
          </button>
        )}
      </div>

      <style>{`
        @keyframes auroraFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(0,255,255,0.4), rgba(0,180,255,0.5));
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
