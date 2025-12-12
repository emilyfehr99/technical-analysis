
import { analyzeSymbol } from '../lib/analysisLogic.js';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Init Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Init Gemini (Legacy SDK)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.API_KEY);

const getIp = (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    return forwarded ? forwarded.split(',')[0] : req.connection.remoteAddress;
};

const SYSTEM_INSTRUCTION = `
You are a world-class Senior Technical Analyst.
### YOUR MISSION
Analyze the chart image and/or market data to generate an institutional-grade trading plan.

### CRITICAL FIRST STEP
**IDENTIFY THE TICKER SYMBOL**: Look at the chart image and READ THE EXACT TICKER TEXT displayed on it.
This is usually at the top-left or center-top of the chart (e.g., "TSLA", "BTC/USD", "SPY").
DO NOT GUESS. DO NOT ASSUME. READ THE TEXT FROM THE IMAGE CAREFULLY.
If you cannot clearly read the ticker, respond with "asset": "UNKNOWN - Cannot read ticker from image".

### RULES
1. **Identify Asset**: FIRST read the ticker text from the chart image before anything else.
2. **"WAIT" Action**: If checking "WAIT", define specific Trigger Levels.
3. **Scenarios**: Provide Bull, Bear, and Base case probabilities.
4. **Trade Radar**: Generate 3 specific execution setups (Scalp, Day, Swing).
5. **Output JSON**: Strictly follow the requested JSON schema.
`;

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { symbol, image, mimeType } = req.body;

        // Validation: Need at least one input
        if (!symbol && !image) {
            return res.status(400).json({ error: 'Please provide a Symbol or upload a Chart Image.' });
        }

        // --- USAGE TRACKING (Supabase) ---
        const authHeader = req.headers.authorization;
        let userId = null;

        // 1. Check Auth User
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const { data: { user }, error } = await supabase.auth.getUser(token);

            if (error) {
                console.log("Auth Error:", error.message);
            }

            if (user && !error) {
                userId = user.id;
                console.log("User Identified:", userId);

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('credits, tier')
                    .eq('id', userId)
                    .single();

                console.log("Profile Found:", profile);

                if (profile) {
                    // STRICT PAYWALL: Free tier has 0 allowance after sign up.
                    // (The 3 free tries are anonymous only)
                    if (profile.tier === 'free') {
                        console.log("Paywall Hit: User is Free Tier");
                        return res.status(403).json({ error: 'LIMIT_REACHED', isAuth: true });
                    }
                    console.log("Paywall Bypassed: User is", profile.tier);
                }
            }
        } else {
            console.log("No Auth Header provided.");
        }

        // 2. Fallback Anonymous (IP)
        if (!userId) {
            // BYPASS FOR DEMO MODE
            if (req.body.isDemo) {
                console.log("Demo Mode: Bypassing IP Limit Check");
            } else {
                const ip = getIp(req);
                console.log("Checking IP limits for:", ip);
                const { data: ipData } = await supabase.from('ip_tracking').select('analysis_count').eq('ip_address', ip).single();
                const currentCount = ipData ? ipData.analysis_count : 0;
                console.log("IP Count:", currentCount);

                if (currentCount >= 3) {
                    console.log("Paywall Hit: IP Limit Reached");
                    return res.status(403).json({ error: 'LIMIT_REACHED', isAuth: false });
                }

                await supabase.from('ip_tracking').upsert({
                    ip_address: ip,
                    analysis_count: currentCount + 1,
                    last_used: new Date().toISOString()
                }, { onConflict: 'ip_address' });
            }
        }
        // ---------------------------------

        // --- ANALYSIS LOGIC ---

        // 1. Fetch Hard Data (if symbol exists)
        let marketContext = "";
        let technicalData = null;
        if (symbol) {
            try {
                technicalData = await analyzeSymbol(symbol);
                marketContext = technicalData.summary;
            } catch (e) {
                console.warn(`Yahoo fetch failed for ${symbol}:`, e.message);
                marketContext = `Could not fetch live data for ${symbol}. Relying on Vision analysis only.`;
            }
        }

        // 2. Prepare Gemini Request
        console.log("Sending analysis request - isDemo:", req.body.isDemo, "hasImage:", !!image, "imageSize:", image ? image.length : 0);

        const promptText = `CRITICAL: Carefully examine the chart image to identify the EXACT ticker symbol shown.
        
Analyze this trading chart.
        ${symbol ? `IMPORTANT: The user has EXPLICITLY confirmed this asset is "${symbol}". TRUST THIS over any OCR text from the image. Use the provided market data context for "${symbol}".` : "The user claims it's: Unknown (Detect from Chart). Look at the chart image and confirm the actual ticker symbol displayed. DO NOT assume or guess."}

Context: ${marketContext}

Return valid JSON matching the schema: {
  asset, currentPrice, timeframe, action (BUY/SELL/WAIT), confidenceScore (0-100),
  headline, reasoning, marketCondition, 
  pattern: { name, type, confidence },
  tradeHorizon,
  tradeRadar: [{ style, side, entryPrice, stopLoss, targetPrice, reasoning }],
  scenarios: [{ name, probability, priceTarget, description }],
  technicalAnalysis: { macd, alligator, trend, volume },
  keyLevels: { support, resistance, pivotPoint },
  setup: { entryZone, stopLoss, takeProfitTargets, optionsStrategy },
  risk: { riskToRewardRatio, suggestedPositionSize, activeRiskParameters },
  validationChecklist: [{ label, passed }]
}`;

        const parts = [{ text: promptText }];
        if (image) {
            parts.push({
                inlineData: {
                    data: image,
                    mimeType: mimeType || 'image/png'
                }
            });
        }

        // 3. Call Gemini with fallback ladder
        const startTime = Date.now();
        let result;

        try {
            // Primary: gemini-2.0-flash-001 (proven to work well with vision)
            const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash-001",
                systemInstruction: SYSTEM_INSTRUCTION,
                generationConfig: { responseMimeType: "application/json" }
            });

            result = await model.generateContent({
                contents: [{ role: 'user', parts }]
            });
        } catch (primaryError) {
            console.error("Primary model (2.0-flash-001) failed:", primaryError.message);

            try {
                // Fallback to gemini-2.5-flash
                const fallbackModel = genAI.getGenerativeModel({
                    model: "gemini-2.5-flash",
                    systemInstruction: SYSTEM_INSTRUCTION,
                    generationConfig: { responseMimeType: "application/json" }
                });

                result = await fallbackModel.generateContent({
                    contents: [{ role: 'user', parts }]
                });
            } catch (secondaryError) {
                console.error("Secondary model (2.5-flash) failed:", secondaryError.message);

                // Final fallback to gemini-1.5-pro (Stable Backup)
                // Note: 1.5-flash caused 404 errors, so we use 1.5-pro
                const backupModel = genAI.getGenerativeModel({
                    model: "gemini-1.5-pro",
                    systemInstruction: SYSTEM_INSTRUCTION,
                    generationConfig: { responseMimeType: "application/json" }
                });

                result = await backupModel.generateContent({
                    contents: [{ role: 'user', parts }]
                });
            }
        }

        const durationMs = Date.now() - startTime;

        let aiResponseText = result.response.text();

        // Clean markdown formatting if present
        aiResponseText = aiResponseText.replace(/```json\n/g, '').replace(/```/g, '').trim();

        const aiData = JSON.parse(aiResponseText);

        // Merge hard technical data if available (optional enhancement)
        if (technicalData && technicalData.raw) {
            // We could overlay generic AI data with precise Yahoo data here if we wanted
            // For now, trust the AI's synthesis
        }

        // --- SUCCESS LOGGING ---
        // Fire and forget log (don't await to avoid slowing down response)
        supabase.from('analysis_logs').insert({
            user_id: userId,
            ip_address: getIp(req),
            user_agent: req.headers['user-agent'],
            symbol: symbol || aiData.asset || 'UNKNOWN', // Try to capture detected asset if symbol was missing
            input_type: image ? (symbol ? 'HYBRID' : 'IMAGE') : 'TEXT',
            status: 'SUCCESS',
            duration_ms: durationMs
        }).then(({ error }) => {
            if (error) console.error("Failed to write success log:", error.message);
        });
        // -----------------------

        res.status(200).json(aiData);

    } catch (error) {
        console.error('Backend Analysis Failed:', error);

        // --- ERROR LOGGING ---
        const { symbol, image } = req.body;
        supabase.from('analysis_logs').insert({
            user_id: null, // We might not have user ID if auth failed, but context would be nice. 
            // Note: userId variable is available in scope if auth passed earlier.
            ip_address: getIp(req),
            user_agent: req.headers['user-agent'],
            symbol: symbol || 'UNKNOWN',
            input_type: image ? (symbol ? 'HYBRID' : 'IMAGE') : 'TEXT',
            status: 'FAILED',
            error_message: error.message
        }).then(({ error: logError }) => {
            if (logError) console.error("Failed to write error log:", logError.message);
        });
        // ---------------------

        res.status(500).json({ error: 'Analysis failed', details: error.message });
    }
}
