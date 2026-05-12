import { analyzeSymbol } from '../lib/analysisLogic.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Init Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.API_KEY);

const SYMBOLS = [
    'BTC-USD', 
    'ETH-USD', 
    'SOL-USD',
    'NVDA', 
    'TSLA', 
    'SPY', 
    'AAPL', 
    'MSFT', 
    'AMD', 
    'COIN', 
    'MARA',
    'PLTR',
    'MSTR'
];

export default async function handler(req, res) {
    // Only allow CRON or Manual with Secret for security in production
    // For now we allow it to be triggered for testing
    
    try {
        // 1. Pick a random trending symbol
        const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        console.log(`Generating Daily Roast for ${symbol}...`);

        // 2. Fetch technical data
        const analysis = await analyzeSymbol(symbol);
        
        // 3. Generate Roast with Gemini
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash",
            systemInstruction: "You are Kairos, a snarky, institutional-grade AI trading analyst who hates retail traders. Your mission is to roast a specific market setup based on technical data. Be funny, mean, and accurate."
        });
        
        const prompt = `Roast this market setup for ${symbol}. 
        
        TECHNICAL DATA:
        ${analysis.summary}
        
        CONSTRAINTS:
        - Be funny, snarky, and brutally honest about the setup.
        - Keep the total roast under 240 characters (Twitter limit).
        - End with a one-word VERDICT: (BUY, SELL, or COPE).
        - Use emojis sparingly but effectively.
        - Reference the RSI or MACD if they are particularly ugly.
        - Include the site URL: technical-analysis-emilyfehr.vercel.app
        `;

        const result = await model.generateContent(prompt);
        let roast = result.response.text().trim();

        // Ensure it fits Twitter
        if (roast.length > 280) {
            roast = roast.substring(0, 277) + "...";
        }

        // 4. Distribution: Discord
        if (process.env.DISCORD_WEBHOOK_URL) {
            try {
                await fetch(process.env.DISCORD_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: "Kairos Market Roaster",
                        avatar_url: "https://cdn-icons-png.flaticon.com/512/4712/4712009.png",
                        content: `🔥 **DAILY MARKET ROAST: ${symbol}**\n\n"${roast}"`
                    })
                });
                console.log("Discord notification sent.");
            } catch (e) {
                console.error("Discord send failed:", e);
            }
        }

        // 5. Distribution: Twitter (Placeholder for manual push or future integration)
        // Note: Twitter API requires a paid tier for most automated posts now.
        // We log it here so the user can see what would have been posted.
        console.log("------------------------------");
        console.log("PROPOSED TWEET:");
        console.log(roast);
        console.log("------------------------------");

        res.status(200).json({ 
            success: true, 
            symbol, 
            roast,
            data: analysis.raw 
        });

    } catch (error) {
        console.error("Market Roast Job Failed:", error);
        res.status(500).json({ error: error.message });
    }
}
