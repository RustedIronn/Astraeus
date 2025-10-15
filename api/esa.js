export default async function handler(req, res) {
  try {
    const response = await fetch("https://www.esa.int/api/v1/media?order=-date&limit=1");
    if (!response.ok) throw new Error("ESA API error");
    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching ESA API:", error);
    res.status(500).json({ error: "ESA feed unavailable" });
  }
}
