
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
                    .select('credits, tier')
                    .eq('id', userId)
                    .single();

                if (profile) {
                    // Logic: credits starts at 3 and goes down? Or counts up?
                    // "credits" implies remaining. The prompt said "1 out of 3 analyses done" (count up).
                    // But previous implementation used "credits" descending (credits - 1).
                    // Let's normalize to: "used = 3 - credits".
                    tier = profile.tier || 'free';
                    const remaining = profile.credits ?? 0;
                    used = (tier === 'free') ? (3 - remaining) : 0; // Approximate
                    if (tier !== 'free') limit = Infinity;
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

        res.status(200).json({
            used: Math.max(0, used),
            limit,
            tier,
            remaining: Math.max(0, limit - used)
        });

    } catch (error) {
        console.error('Status check failed:', error);
        res.status(500).json({ error: 'Status check failed' });
    }
}
