
import { createClient } from '@supabase/supabase-js';

// Init Supabase (Server Side)
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use Service Role Key/Anon Key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const getIp = (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    return forwarded ? forwarded.split(',')[0] : req.connection.remoteAddress;
};

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const authHeader = req.headers.authorization;
        let userId = null;
        let tier = 'anon';
        let used = 0;
        let limit = 3;

        // 1. Check User Auth
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const { data: { user }, error } = await supabase.auth.getUser(token);

            if (user && !error) {
                userId = user.id;

                // Check User Credits (Profiles table)
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('credits, tier, weekly_credits')
                    .eq('id', userId)
                    .single();

                if (profile) {
                    tier = profile.tier || 'free';

                    if (tier === 'free') {
                        // Free Tier: Uses weekly_credits (starts at 1, goes to 0)
                        const remaining = profile.weekly_credits ?? 1; // Default to 1 if null
                        limit = 1;
                        used = 1 - remaining;
                    } else {
                        // Premium: Unlimited
                        limit = Infinity;
                        used = 0;
                    }
                }
            }
        }

        // 2. Anonymous Fallback
        if (!userId) {
            const ip = getIp(req);
            const { data: ipData } = await supabase
                .from('ip_tracking')
                .select('analysis_count')
                .eq('ip_address', ip)
                .single();

            used = ipData ? ipData.analysis_count : 0;
            // Fix: newly created IPs start at 0 but the DB default might be 1 on first insert?
            // Actually my analyze logic inserts with 1. So 0 means untouched.
        }

        if (!userId) { // Re-check to send response
            res.status(200).json({
                used: Math.max(0, used),
                limit,
                tier,
                remaining: Math.max(0, limit - used),
                activeTrade: null
            });
            return;
        }
        // Fetch Active Simulated Trade
        const { data: activeTrade } = await supabase
            .from('simulated_trades')
            .select('*')
            .eq('user_id', userId)
            .in('status', ['PENDING', 'OPEN'])
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        res.status(200).json({
            used: Math.max(0, used),
            limit,
            tier,
            remaining: Math.max(0, limit - used),
            activeTrade
        });

    } catch (error) {
        console.error('Status check failed:', error);
        res.status(500).json({ error: 'Status check failed' });
    }
}
