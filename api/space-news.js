export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  try {
    const response = await fetch("https://api.spaceflightnewsapi.net/v4/articles/?limit=1");
    if (!response.ok) throw new Error("Spaceflight API error");
    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    const articleData = Array.isArray(data.results) ? data.results : [data];
    res.status(200).json({ results: articleData });
  } catch (error) {
    console.error("Error fetching Spaceflight API:", error);
    res.status(500).json({ error: "Spaceflight News unavailable" });
  }
}
