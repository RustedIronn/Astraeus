export default async function handler(req, res) {
  try {
    const response = await fetch("https://api.spaceflightnewsapi.net/v4/articles/?limit=1");
    if (!response.ok) throw new Error("Spaceflight API error");
    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching Spaceflight API:", error);
    res.status(500).json({ error: "Spaceflight News unavailable" });
  }
}
