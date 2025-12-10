
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, TradeAction } from "../types";

// Initialize AI client lazily to avoid crash on load if key is missing
function getAIClient(key?: string) {
  const apiKey = key || process.env.API_KEY;
  if (!apiKey || apiKey === "dummy_key") return null;
  return new GoogleGenAI({ apiKey });
}

const SYSTEM_INSTRUCTION = `
You are a world-class Senior Technical Analyst and Quantitative Strategist (ex-Citadel/Bridgewater). 
Your expertise lies in reading charts, specifically utilizing the MACD, Williams Alligator, Volume, and Market Structure.

### YOUR MISSION
Analyze the provided chart image and generate a highly structured, institutional-grade trading plan.

### CRITICAL RULES
1. **Identify the Asset**: Look at the top left of the chart for Ticker/Symbol and Timeframe.
2. **Extract Price**: Look at the Y-axis or the active candle label to find the **Current Price**.
3. **Pattern Recognition**: You MUST identify the specific chart pattern (e.g. Bull Flag, Double Bottom, Channel).
4. **"WAIT" means "PLAN THE FUTURE TRADE"**:
   - If the action is **WAIT**, you **MUST** provide the **Trigger Levels**.
   - **Entry Zone**: Write "Watch for breakout above [Price]" or "Wait for retest of [Price]".
   - **Stop Loss**: Write "Invalidation below [Price]".
   - **Targets**: "Projected move to [Price]".
   - **NEVER return "N/A" for setup fields.** Always provide the hypothetical setup levels.

5. **Probabilistic Thinking**:
   - Do not just give one prediction. Generate 3 scenarios: BULL CASE, BEAR CASE, and BASE CASE.
   - Assign probabilities to each (must sum to ~100%).

6. **Real-Time Execution Radar**:
   - Provide 3 distinct actionable trade setups based on the current chart state:
     a. **SCALP**: Aggressive, quick timeframe (minutes).
     b. **DAY_TRADE**: The standard intraday setup.
     c. **SWING**: A wider stop/target setup for overnight holding.

7. **Confidence Scoring**:
   - If the chart is readable, Confidence should be **>75%**. 
   - Only use low confidence if the image is blurry or unreadable.

### OUTPUT SCHEMA INSTRUCTIONS
- **asset**: Detect the ticker (e.g., "SPY", "BTCUSD").
- **currentPrice**: The price visible on the chart right now (e.g. "4,120.50").
- **timeframe**: Detect the time (e.g., "5m", "1H").
- **pattern**: Identify the geometric pattern (Name) and Type (Continuation/Reversal).
- **tradeHorizon**: Estimate duration (e.g., "Intraday", "Swing 1-3 Days").
- **tradeRadar**: Generate 3 specific execution orders (Scalp/Day/Swing).
- **keyLevels**: List specific support/resistance prices found on the chart.
- **validationChecklist**: Create 4 boolean checks relevant to the trade (e.g. "Trend Aligned", "Volume Spike", "Key Level Broken", "RSI Not Overbought").
- **marketCondition**: Classify the environment (TRENDING, RANGING, VOLATILE, CHOPPY).
- **scenarios**: Generate 3 scenarios (Bull, Bear, Base) with probability % and specific targets.
`;

// Helper to fetch indicators
async function fetchIndicators(ticker: string): Promise<string> {
  try {
    const response = await fetch('http://localhost:3001/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol: ticker })
    });
    if (!response.ok) return "";
    const data = await response.json();
    return data.summary;
  } catch (e) {
    console.warn("Failed to fetch indicators", e);
    return "";
  }
}

const MOCK_RESULT: AnalysisResult = {
  action: TradeAction.WAIT,
  confidenceScore: 85,
  asset: "BTC/USD (Mock)",
  currentPrice: "42,000.00",
  timeframe: "4h",
  headline: "Mock Analysis: API Key Invalid or Missing",
  reasoning: "This is a demonstration mode because no valid Gemini API Key was found. Please add your key to .env.local to see real AI analysis.",
  marketCondition: 'RANGING',
  pattern: {
    name: "Symmetrical Triangle",
    type: 'CONTINUATION',
    confidence: 80
  },
  tradeHorizon: "Intraday",
  tradeRadar: [
    {
      style: "SCALP",
      side: "LONG",
      entryPrice: "42,100",
      stopLoss: "41,900",
      targetPrice: "42,500",
      reasoning: "Quick bounce off support",
      leverageRecommendation: "10x"
    },
    {
      style: "DAY_TRADE",
      side: "SHORT",
      entryPrice: "42,500",
      stopLoss: "42,800",
      targetPrice: "41,500",
      reasoning: "Rejection at resistance",
      leverageRecommendation: "5x"
    },
    {
      style: "SWING",
      side: "LONG",
      entryPrice: "41,000",
      stopLoss: "40,000",
      targetPrice: "45,000",
      reasoning: "Major weekly support",
      leverageRecommendation: "Spot"
    }
  ],
  scenarios: [
    {
      name: 'BULL_CASE',
      probability: 40,
      priceTarget: "45,000",
      description: "Breakout above triangle resistance"
    },
    {
      name: 'BEAR_CASE',
      probability: 30,
      priceTarget: "38,000",
      description: "Breakdown below support trendline"
    },
    {
      name: 'BASE_CASE',
      probability: 30,
      priceTarget: "42,000",
      description: "Continued chopping within range"
    }
  ],
  technicalAnalysis: {
    macd: "Bullish Crossover (Mock)",
    alligator: "Sleeping (Mock)",
    trend: 'NEUTRAL',
    volume: "Low volume consolidation"
  },
  keyLevels: {
    support: ["41,000", "40,500"],
    resistance: ["43,000", "44,000"],
    pivotPoint: "42,200"
  },
  setup: {
    entryZone: "Wait for break of 42,500",
    stopLoss: "41,800",
    takeProfitTargets: ["43,500", "45,000"],
    optionsStrategy: "Iron Condor"
  },
  risk: {
    riskToRewardRatio: "1:3",
    suggestedPositionSize: "2%",
    activeRiskParameters: "Choppy market conditions"
  },
  validationChecklist: [
    { label: "Trend Alignment", passed: true },
    { label: "Volume Confirmation", passed: false },
    { label: "RSI Neutral", passed: true },
    { label: "Key Level Hold", passed: true }
  ]
};

export const analyzeChart = async (base64Image: string | null, mimeType: string = 'image/png', ticker?: string): Promise<AnalysisResult> => {
  // Check for API Key - If missing, return MOCK data instead of crashing
  if (!process.env.API_KEY || process.env.API_KEY === "dummy_key") {
    console.warn("Using MOCK MODE: No valid API Key found.");
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { ...MOCK_RESULT, asset: ticker || "MOCK ASSET" };
  }

  try {
    let marketContext = "";
    if (ticker) {
      marketContext = await fetchIndicators(ticker);
    }

    // CRITICAL CHECK: In text-only mode, if we failed to get data, DO NOT HALLUCINATE.
    if (!base64Image && (!marketContext || marketContext.length < 50)) {
      throw new Error(`Could not retrieve market data for "${ticker}". Please check the ticker symbol (e.g. try "BTC-USD" instead of "BTC").`);
    }
    // ... rest of the function remains same but wrapped in the existing try block 
    // Initialize client here (Lazy load)
    let ai = getAIClient(process.env.API_KEY);

    // Wrapper to attempt generation with fallback
    const generateWithFallback = async (model: string, contents: any, config: any) => {
      try {
        if (!ai) throw new Error("Primary Client Init Failed");
        return await ai.models.generateContent({ model, contents, config });
      } catch (primaryError) {
        const backupKey = process.env.GEMINI_API_KEY_BACKUP;
        if (!backupKey) throw primaryError; // No backup, throw original

        console.warn("Primary API Key failed, attempting backup...", primaryError);
        const backupAi = getAIClient(backupKey);
        if (!backupAi) throw primaryError;

        return await backupAi.models.generateContent({ model, contents, config });
      }
    };

    // If no client at all (and no backup), fall to mock mode check
    if (!ai && !process.env.GEMINI_API_KEY_BACKUP) {
      throw new Error("AI Client init failed - should use mock mode");
    }

    const promptParts: any[] = [];

    if (base64Image) {
      promptParts.push({
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        },
      });
      promptParts.push({
        text: `Analyze this chart. Identify the ticker and timeframe. If the action is WAIT, give me the exact trigger prices for the future entry. Do not return N/A. ${marketContext}`,
      });
    } else {
      // Text-Only Mode (Data Analysis)
      promptParts.push({
        text: `Perform a technical analysis on **${ticker || "the provided asset"}** based on the following market data context: ${marketContext}. 
            
            Since no chart image was provided:
            1. Infer the trend and structure from the indicator data (MACD, RSI, etc).
            2. Provide key levels based on psychological numbers or typical volatility.
            3. Generate a cautious trading plan.
            
            If the action is WAIT, give me the exact trigger prices. Do not return N/A.`
      });
    }

    const response = await generateWithFallback(
      "gemini-2.5-flash",
      {
        parts: promptParts,
      },
      {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            // ... Schema is passed through logic ...
            asset: { type: Type.STRING, description: "The ticker symbol detected (e.g. BTCUSD, AAPL)." },
            timeframe: { type: Type.STRING, description: "The timeframe detected (e.g. 15m, 4h)." },
            currentPrice: { type: Type.STRING, description: "The current market price visible on the chart." },
            action: {
              type: Type.STRING,
              enum: ['BUY', 'SELL', 'WAIT', 'HOLD'],
              description: 'The primary recommendation.',
            },
            confidenceScore: {
              type: Type.INTEGER,
              description: 'Confidence in the clarity of the setup and analysis (0-100).',
            },
            headline: {
              type: Type.STRING,
              description: 'A short, punchy summary (e.g., "Bull Flag Breakout Imminent").',
            },
            reasoning: {
              type: Type.STRING,
              description: 'Detailed explanation of why this action is recommended.',
            },
            marketCondition: {
              type: Type.STRING,
              enum: ['TRENDING', 'RANGING', 'VOLATILE', 'CHOPPY'],
              description: 'The general state of the market.',
            },
            pattern: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Name of the chart pattern (e.g. Bull Flag)" },
                type: { type: Type.STRING, enum: ['CONTINUATION', 'REVERSAL', 'INDECISION'], description: "Type of pattern" },
                confidence: { type: Type.INTEGER, description: "Confidence in pattern (0-100)" }
              },
              required: ['name', 'type', 'confidence']
            },
            tradeHorizon: {
              type: Type.STRING,
              description: "Estimated duration of the trade (e.g. 2-4 Hours, 1-2 Days)"
            },
            tradeRadar: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  style: { type: Type.STRING, enum: ['SCALP', 'DAY_TRADE', 'SWING'] },
                  side: { type: Type.STRING, enum: ['LONG', 'SHORT'] },
                  entryPrice: { type: Type.STRING, description: "Specific entry price limit" },
                  stopLoss: { type: Type.STRING, description: "Specific stop loss price" },
                  targetPrice: { type: Type.STRING, description: "Specific take profit price" },
                  leverageRecommendation: { type: Type.STRING, description: "e.g. 5x, 10x, Spot" },
                  reasoning: { type: Type.STRING, description: "Very brief reason (e.g. 'Bounce off VWAP')" }
                },
                required: ['style', 'side', 'entryPrice', 'stopLoss', 'targetPrice', 'reasoning']
              },
              description: "3 distinct actionable orders based on the chart state."
            },
            scenarios: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, enum: ['BULL_CASE', 'BEAR_CASE', 'BASE_CASE'] },
                  probability: { type: Type.INTEGER, description: "Percentage probability (0-100)" },
                  priceTarget: { type: Type.STRING, description: "Target price for this scenario" },
                  description: { type: Type.STRING, description: "Short description of this outcome" }
                },
                required: ['name', 'probability', 'priceTarget', 'description']
              },
              description: "3 distinct probabilistic outcomes."
            },
            technicalAnalysis: {
              type: Type.OBJECT,
              properties: {
                macd: { type: Type.STRING, description: 'Specific observation of MACD.' },
                alligator: { type: Type.STRING, description: 'Specific observation of Alligator indicator.' },
                trend: { type: Type.STRING, enum: ['BULLISH', 'BEARISH', 'NEUTRAL'] },
                volume: { type: Type.STRING, description: 'Volume analysis if visible.' },
              },
              required: ['macd', 'alligator', 'trend'],
            },
            keyLevels: {
              type: Type.OBJECT,
              properties: {
                support: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of support price levels" },
                resistance: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of resistance price levels" },
                pivotPoint: { type: Type.STRING, description: "Key pivot or midway point" }
              },
              required: ['support', 'resistance']
            },
            setup: {
              type: Type.OBJECT,
              properties: {
                entryZone: { type: Type.STRING, description: 'Price range to enter OR the specific trigger level to watch for.' },
                stopLoss: { type: Type.STRING, description: 'Specific price level for invalidation.' },
                takeProfitTargets: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'List of price targets.',
                },
                optionsStrategy: { type: Type.STRING, description: 'Suggested options strategy.' },
              },
              required: ['entryZone', 'stopLoss', 'takeProfitTargets'],
            },
            risk: {
              type: Type.OBJECT,
              properties: {
                riskToRewardRatio: { type: Type.STRING, description: 'Estimated R:R ratio in strictly "1:X" format (e.g. "1:3").' },
                suggestedPositionSize: { type: Type.STRING, description: 'Recommended size based on volatility.' },
                activeRiskParameters: { type: Type.STRING, description: 'Current active risks.' },
              },
              required: ['riskToRewardRatio', 'suggestedPositionSize', 'activeRiskParameters'],
            },
            validationChecklist: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING, description: "Criterion name (e.g. Trend Alignment)" },
                  passed: { type: Type.BOOLEAN, description: "Whether this criterion is met" }
                }
              },
              description: "A list of 4-5 technical criteria used to validate this trade idea."
            }
          },
          required: ['action', 'confidenceScore', 'headline', 'reasoning', 'technicalAnalysis', 'setup', 'risk', 'keyLevels', 'pattern', 'tradeHorizon', 'validationChecklist', 'marketCondition', 'scenarios', 'tradeRadar'],
        }
      }
    );

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};
