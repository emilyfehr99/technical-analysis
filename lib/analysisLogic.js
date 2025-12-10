import YahooFinance from 'yahoo-finance2';
import { MACD, RSI } from 'technicalindicators';

const yahooFinance = new YahooFinance();

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

        try {
            const result = await yahooFinance.chart(symbol, queryOptions);
            if (result && result.quotes) {
                chartData = result.quotes;
            }
        } catch (e) {
            console.warn(`Chart fetch failed for ${symbol}, trying historical...`);
            // Fallback if chart fails
            const result = await yahooFinance.historical(symbol, queryOptions);
            chartData = result;
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

        // Format Output
        const summary = `
### REAL-TIME TECHNICAL INDICATORS (Source: Yahoo Finance + Local Calc)
- **Symbol**: ${symbol}
- **Price**: $${closes[closes.length - 1].toFixed(2)}
- **RSI (14)**: ${currentRSI ? currentRSI.toFixed(2) : 'N/A'}
- **MACD (12, 26, 9)**:
    - Value: ${currentMACD ? currentMACD.MACD.toFixed(4) : 'N/A'}
    - Signal: ${currentMACD ? currentMACD.signal.toFixed(4) : 'N/A'}
    - Histogram: ${currentMACD ? currentMACD.histogram.toFixed(4) : 'N/A'}
- **Williams Alligator**:
    - Jaw (13,8): ${alligator.jaw.toFixed(4)}
    - Teeth (8,5): ${alligator.teeth.toFixed(4)}
    - Lips (5,3): ${alligator.lips.toFixed(4)}
- **Trend Analysis**:
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
