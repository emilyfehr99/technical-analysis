import { createClient } from '@supabase/supabase-js';

// Init Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // Check for Weekly (Sunday)
    const isSunday = today.getDay() === 0;

    try {
        // --- WEEKLY FREE TIER RESET ---
        if (isSunday) {
            // Reset all Free Tier users to 1 credit
            const { error: resetError } = await supabase
                .from('profiles')
                .update({ weekly_credits: 1 })
                .eq('tier', 'free');

            if (resetError) console.error("Weekly Reset Failed:", resetError);
            else console.log("Weekly Reset Complete: Free credits restored.");
        }

        // --- NEW: SIMULATED TRADE EXECUTION ---
        console.log("Running Trade Simulation...");
        const yahooFinance = await import('yahoo-finance2').then(module => module.default); // Dynamic import for Serverless

        // 1. Fetch Active Trades
        const { data: activeTrades } = await supabase
            .from('simulated_trades')
            .select('*')
            .in('status', ['PENDING', 'OPEN']);

        if (activeTrades && activeTrades.length > 0) {
            const symbols = [...new Set(activeTrades.map(t => t.asset_symbol))];

            // 2. Batch Fetch Prices
            // Note: yahoo-finance2 quote can take array? Wrapper usually better one by one or loop if library supports.
            // quote summary supports individual symbols. Let's loop for safety in serverless.
            const prices = {};
            for (const sym of symbols) {
                try {
                    const quote = await yahooFinance.quote(sym);
                    if (quote && quote.regularMarketPrice) {
                        prices[sym] = quote.regularMarketPrice;
                    }
                } catch (e) {
                    console.error(`Price fetch failed for ${sym}`, e);
                }
            }

            // 3. Process Trades
            for (const trade of activeTrades) {
                const currentPrice = prices[trade.asset_symbol];
                if (!currentPrice) continue;

                if (trade.status === 'PENDING') {
                    // Check Entry
                    // BUY: If Current <= Entry (Limit Buy logic? Or text says "Wait for X"). 
                    // Let's assume simpler: If we hit text price range. 
                    // For "WAIT", usually we wait for dip.
                    // If direction is SELL (Short), we wait for pop?
                    // Let's implement generic: If price is "close" or "better" than entry.

                    // Simple Trigger: If price touches Entry +/- 0.5%
                    const entry = parseFloat(trade.entry_price);
                    if (Math.abs(currentPrice - entry) / entry < 0.01) {
                        // Trigger Open
                        await supabase.from('simulated_trades').update({
                            status: 'OPEN',
                            entry_price: currentPrice // Record actual fill
                        }).eq('id', trade.id);

                        // Notify User? (Scope shift, skip for now)
                    } else if (trade.direction === 'BUY' && currentPrice <= entry) {
                        // Limit hit
                        await supabase.from('simulated_trades').update({ status: 'OPEN', entry_price: currentPrice }).eq('id', trade.id);
                    } else if (trade.direction === 'SELL' && currentPrice >= entry) {
                        // Limit hit
                        await supabase.from('simulated_trades').update({ status: 'OPEN', entry_price: currentPrice }).eq('id', trade.id);
                    }
                }
                else if (trade.status === 'OPEN') {
                    // Check SL / TP
                    const stop = parseFloat(trade.stop_loss);
                    const target = parseFloat(trade.take_profit);

                    let outcome = null;

                    if (trade.direction === 'BUY') {
                        if (currentPrice >= target) outcome = 'won';
                        else if (currentPrice <= stop) outcome = 'lost';
                    } else if (trade.direction === 'SELL') {
                        if (currentPrice <= target) outcome = 'won';
                        else if (currentPrice >= stop) outcome = 'lost';
                    }

                    if (outcome) {
                        // Close Trade
                        const isWin = outcome === 'won';
                        const entry = parseFloat(trade.entry_price); // Real fill
                        const exit = isWin ? target : stop; // Assumed fill at limit
                        const pnl = isWin
                            ? ((Math.abs(exit - entry) / entry) * 100)
                            : -((Math.abs(exit - entry) / entry) * 100);

                        await supabase.from('simulated_trades').update({
                            status: outcome,
                            close_date: new Date().toISOString(),
                            pnl_percent: pnl.toFixed(2)
                        }).eq('id', trade.id);
                    }
                }
            }
        }

        res.status(200).json({ success: true });

    } catch (error) {
        console.error("Cron Failed:", error);
        res.status(500).json({ error: error.message });
    }
}
