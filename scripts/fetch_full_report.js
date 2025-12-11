import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load envs
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchAll() {
    console.log("📊 Fetching Comprehensive Analytics Report...");

    // 1. Total Waitlist
    const { count: totalUsers } = await supabase.from('waitlist').select('*', { count: 'exact', head: true });

    // 2. Total Analyses
    const { count: totalAnalysis } = await supabase.from('analysis_logs').select('*', { count: 'exact', head: true });

    // 3. Usage by Tier (Profiles)
    // Note: Profiles might not exist for everyone yet if they are just waitlist
    const { data: profiles } = await supabase.from('profiles').select('tier');
    const tiers = { free: 0, premium: 0, institutional: 0 };
    if (profiles) {
        profiles.forEach(p => {
            tiers[p.tier] = (tiers[p.tier] || 0) + 1;
        });
    }

    // 4. Client Analytics (Sessions & Events)
    const { data: sessions } = await supabase.from('analytics_sessions').select('*');
    const { data: events } = await supabase.from('analytics_events').select('*');

    const totalSessions = sessions ? sessions.length : 0;
    const totalEvents = events ? events.length : 0;

    // Calculations
    let bounced = 0;
    const eventCounts = {};
    if (sessions) {
        sessions.forEach(s => {
            const duration = (new Date(s.last_seen_at) - new Date(s.started_at)) / 1000;
            if (duration < 10) bounced++;
        });
    }
    const bounceRate = totalSessions > 0 ? Math.round((bounced / totalSessions) * 100) : 0;

    if (events) {
        events.forEach(e => {
            eventCounts[e.event_name] = (eventCounts[e.event_name] || 0) + 1;
        });
    }

    // Sort Top Events
    const topEvents = Object.entries(eventCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([k, v]) => `${k}: ${v}`);

    console.log("\n--- 📈 REPORT SUMMARY ---");
    console.log(`Creating since inception...`);
    console.log(`\n👥 User Base:`);
    console.log(`- Total Waitlist/Signups: ${totalUsers}`);
    console.log(`- Tiers: ${JSON.stringify(tiers)}`);

    console.log(`\n⚡️ Core Usage:`);
    console.log(`- Total AI Analyses Run: ${totalAnalysis}`);

    console.log(`\n🌍 Traffic (Client Analytics):`);
    console.log(`- Total Visits (Sessions): ${totalSessions}`);
    console.log(`- Total Interactions (Events): ${totalEvents}`);
    console.log(`- Overall Bounce Rate: ${bounceRate}%`);

    console.log(`\n🔥 Top Actions:`);
    if (topEvents.length > 0) {
        topEvents.forEach(e => console.log(`- ${e}`));
    } else {
        console.log("- No events recorded yet.");
    }
    console.log("\n-------------------------");
}

fetchAll();
