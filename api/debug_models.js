
export default async function handler(req, res) {
    const key = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!key) return res.status(500).json({ error: "No API Key found" });

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();
        res.status(200).json({
            key_configured: true,
            models: data.models || data
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}
