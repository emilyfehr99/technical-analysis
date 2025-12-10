import express from 'express';
import cors from 'cors';
import { analyzeSymbol } from '../lib/analysisLogic.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post('/api/analyze', async (req, res) => {
    try {
        const { symbol } = req.body;

        if (!symbol) {
            return res.status(400).json({ error: 'Symbol is required' });
        }

        console.log(`Analyzing ${symbol}...`);
        const result = await analyzeSymbol(symbol);

        res.json(result);

    } catch (error) {
        console.error('Analysis failed:', error.message);
        res.status(500).json({
            error: 'Analysis failed',
            details: error.message,
            summary: `
### ANALYSIS FAILED
Could not fetch data for ${req.body?.symbol}. Please check the ticker symbol (e.g. use 'BTC-USD' for crypto, 'AAPL' for stocks).
`
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
