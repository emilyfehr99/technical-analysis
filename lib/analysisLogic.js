import yahooFinance from 'yahoo-finance2';
import { MACD, RSI, SMA, BollingerBands } from 'technicalindicators';

// Helper: Calculate SMMA (Smoothed Moving Average)
// SMMA_i = (SMMA_{i-1} * (n - 1) + Price_i) / n
function calculateSMMA(values, period) {
    let smma = [];
    if (values.length < period) return smma;

    // First value is SMA
    let sum = 0;
    for (let i = 0; i < period; i++) sum += values[i];
    smma[period - 1] = sum / period;

    for (let i = period; i < values.length; i++) {
        smma[i] = (smma[i - 1] * (period - 1) + values[i]) / period;
    }
    return smma;
}

// Helper: Calculate Alligator
function calculateAlligator(highs, lows) {
    const medians = highs.map((h, i) => (h + lows[i]) / 2);

    // Calculate SMMAs
    // Jaw: 13 period, shift 8
    // Teeth: 8 period, shift 5
    // Lips: 5 period, shift 3
    const jawSMMA = calculateSMMA(medians, 13);
    const teethSMMA = calculateSMMA(medians, 8);
    const lipsSMMA = calculateSMMA(medians, 5);

    // Apply Shifts (Current Value = SMMA from N bars ago)
    const lastIndex = medians.length - 1;

    return {
        jaw: jawSMMA[lastIndex - 8] || 0,
        teeth: teethSMMA[lastIndex - 5] || 0,
        lips: lipsSMMA[lastIndex - 3] || 0
    };
}

export async function analyzeSymbol(symbol) {
    try {
        // Fetch last 150 days to ensure enough data for 26+9 MACD + shifts
        const today = new Date();
        const pastDate = new Date();
        pastDate.setDate(today.getDate() - 200); // 200 days approx

        const queryOptions = { period1: pastDate, interval: '1d' };
        let chartData = [];
        let usedSymbol = symbol;

        const fetchWithFallback = async (sym) => {
            try {
                const res = await yahooFinance.chart(sym, queryOptions);
                if (res && res.quotes && res.quotes.length > 0) return res.quotes;
                throw new Error("No quotes");
            } catch (e) {
                // Try historical as backup
                return await yahooFinance.historical(sym, queryOptions);
            }
        };

        try {
            chartData = await fetchWithFallback(symbol);
        } catch (e) {
            console.warn(`Initial fetch failed for ${symbol}. Trying ${symbol}-USD...`);
            try {
                // Try appending -USD for crypto common case
                usedSymbol = `${symbol}-USD`;
                chartData = await fetchWithFallback(usedSymbol);
            } catch (e2) {
                console.error(`All fetch attempts failed for ${symbol}`);
                throw new Error(`Could not find market data for ${symbol}. Try adding '-USD' for crypto.`);
            }
        }

        if (!chartData || chartData.length < 50) {
            throw new Error("Insufficient data fetched");
        }

        // Prepare arrays
        const closes = chartData.map(q => q.close);
        const highs = chartData.map(q => q.high);
        const lows = chartData.map(q => q.low);

        // --- RSI ---
        const rsiInput = {
            values: closes,
            period: 14
        };
        const rsiValues = RSI.calculate(rsiInput);
        const currentRSI = rsiValues[rsiValues.length - 1];

        // --- MACD (12, 26, 9) ---
        const macdInput = {
            values: closes,
            fastPeriod: 12,
            slowPeriod: 26,
            signalPeriod: 9,
            SimpleMAOscillator: false,
            SimpleMASignal: false
        };
        const macdValues = MACD.calculate(macdInput);
        const currentMACD = macdValues[macdValues.length - 1];

        // --- Alligator ---
        const alligator = calculateAlligator(highs, lows);

        // --- Institutional Indicators (Golden Cross Engine) ---
        // SMA 50 & 200
        const sma50Values = SMA.calculate({ period: 50, values: closes });
        const sma200Values = SMA.calculate({ period: 200, values: closes });
        const currentSMA50 = sma50Values[sma50Values.length - 1];
        const currentSMA200 = sma200Values[sma200Values.length - 1];

        // Bollinger Bands (20, 2)
        const bbInput = { period: 20, stdDev: 2, values: closes };
        const bbResult = BollingerBands.calculate(bbInput);
        const currentBB = bbResult[bbResult.length - 1];

        // Signal Logic
        const goldenCross = (currentSMA50 > currentSMA200) && (sma50Values[sma50Values.length - 2] <= sma200Values[sma200Values.length - 2]);
        const deathCross = (currentSMA50 < currentSMA200) && (sma50Values[sma50Values.length - 2] >= sma200Values[sma200Values.length - 2]);
        const bbSqueeze = currentBB ? ((currentBB.upper - currentBB.lower) / currentBB.middle) < 0.10 : false; // <10% width = squeeze

        // --- Sentiment (News) ---
        let newsSummary = "";
        try {
            const newsSearch = await yahooFinance.search(usedSymbol, { newsCount: 3 });
            if (newsSearch.news && newsSearch.news.length > 0) {
                newsSummary = "\n### RECENT NEWS HEADLINES (Sentiment Context)\n" +
                    newsSearch.news.map(n => `- [${new Date(n.providerPublishTime || Date.now()).toLocaleDateString()}] ${n.title}`).join('\n');
            }
        } catch (e) {
            console.warn("News fetch failed", e);
        }

        // Format Output
        const summary = `
${newsSummary}

### REAL-TIME TECHNICAL INDICATORS (Source: Yahoo Finance + Local Calc)
- **Symbol**: ${usedSymbol}
- **Price**: $${closes[closes.length - 1].toFixed(2)}
- **RSI (14)**: ${currentRSI ? currentRSI.toFixed(2) : 'N/A'}
- **MACD**: Histogram: ${currentMACD.histogram ? currentMACD.histogram.toFixed(3) : 'N/A'} (Signal: ${currentMACD.signal ? currentMACD.signal.toFixed(3) : 'N/A'})

### INSTITUTIONAL SIGNALS (The "Engine")
- **SMA 50**: $${currentSMA50 ? currentSMA50.toFixed(2) : 'N/A'}
- **SMA 200**: $${currentSMA200 ? currentSMA200.toFixed(2) : 'N/A'}
- **Trend**: ${currentSMA50 > currentSMA200 ? "BULLISH (Price > SMA50 > SMA200)" : "BEARISH (SMA50 < SMA200)"}
- **Golden Cross**: ${goldenCross ? "⚠️ JUST TRIGGERED (Bullish)" : "No"}
- **Death Cross**: ${deathCross ? "⚠️ JUST TRIGGERED (Bearish)" : "No"}
- **Bollinger Bands**: ${currentBB ? `Upper: ${currentBB.upper.toFixed(2)} | Lower: ${currentBB.lower.toFixed(2)}` : 'N/A'}
- **Volatility Squeeze**: ${bbSqueeze ? "⚠️ YES (Explosive Move Imminent)" : "No"}

### WILLIAMS ALLIGATOR
- **Williams Alligator**:
    - Jaw (13,8): ${alligator.jaw.toFixed(4)}
    - Teeth (8,5): ${alligator.teeth.toFixed(4)}
    - Lips (5,3): ${alligator.lips.toFixed(4)}
    - RSI Status: ${currentRSI > 70 ? 'Overbought' : currentRSI < 30 ? 'Oversold' : 'Neutral'}
    - MACD Status: ${currentMACD && currentMACD.histogram > 0 ? 'Bullish' : 'Bearish'}
`;

        return {
            summary,
            raw: {
                rsi: currentRSI,
                macd: currentMACD,
                alligator: alligator,
                price: closes[closes.length - 1]
            }
        };

    } catch (error) {
        console.error("Analysis Error:", error);
        throw error;
    }
}
