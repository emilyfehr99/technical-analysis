import { analyzeSymbol } from '../lib/analysisLogic.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { symbol } = req.body;

        if (!symbol) {
            return res.status(400).json({ error: 'Symbol is required' });
        }

        const result = await analyzeSymbol(symbol);
        res.status(200).json(result);

    } catch (error) {
        console.error('Vercel Analysis failed:', error.message);
        res.status(500).json({
            error: 'Analysis failed',
            details: error.message,
            summary: `
### ANALYSIS FAILED
Could not fetch data for ${req.body?.symbol}. Please check the ticker symbol.
`
        });
    }
}
