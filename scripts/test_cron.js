// scripts/test_cron.js
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
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
    console.log("🚀 Starting Cron Test...");

    // 1. Define Timeframes
    const now = new Date();
    const today = new Date(now); today.setHours(0, 0, 0, 0);

    console.log("Querying stats since:", today.toISOString());

    // 2. Fetch New Analytics
    const { count: dau } = await supabase
        .from('analytics_sessions')
        .select('*', { count: 'exact', head: true })
        .gte('started_at', today.toISOString());

    const { count: demoClicks } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_name', 'click_demo_mode')
        .gte('occurred_at', today.toISOString());

    const { count: pricingClicks } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_name', 'click_pricing_header')
        .gte('occurred_at', today.toISOString());

    // 2. Fetch New Analytics
    // Fetch ALL sessions for today to calculate Bounce Rate & Time of Day
    // LIMIT to 1000 to prevent memory blowup on free tier
    const { data: sessions } = await supabase
        .from('analytics_sessions')
        .select('*')
        .gte('started_at', today.toISOString())
        .limit(1000);

    const { data: events } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('occurred_at', today.toISOString())
        .limit(2000);

    // --- DEEP DIVE CALCULATIONS ---
    const { data: recentSessions } = await supabase
        .from('analytics_sessions')
        .select('*')
        .gte('started_at', today.toISOString())
        .limit(1000);

    const { data: recentEvents } = await supabase
        .from('analytics_events')
        .select('event_name')
        .gte('occurred_at', today.toISOString())
        .neq('event_name', 'test_event_backend')
        .limit(2000);

    // Bounce Rate
    let bounced = 0;
    const totalSessions = recentSessions ? recentSessions.length : 0;
    const hourMap = {};

    if (recentSessions) {
        recentSessions.forEach(s => {
            const duration = (new Date(s.last_seen_at) - new Date(s.started_at)) / 1000;
            if (duration < 10) bounced++;
            const hour = new Date(s.started_at).getHours();
            hourMap[hour] = (hourMap[hour] || 0) + 1;
        });
    }
    const bounceRate = totalSessions > 0 ? Math.round((bounced / totalSessions) * 100) : 0;

    // Peak Time
    let peakHour = "N/A";
    let maxVisits = 0;
    Object.entries(hourMap).forEach(([hour, count]) => {
        if (count > maxVisits) {
            maxVisits = count;
            const h = parseInt(hour);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const displayH = h % 12 || 12;
            peakHour = `${displayH} ${ampm}`;
        }
    });

    // Top Actions
    const eventCounts = {};
    if (recentEvents) {
        recentEvents.forEach(e => {
            eventCounts[e.event_name] = (eventCounts[e.event_name] || 0) + 1;
        });
    }
    const topEvents = Object.entries(eventCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([name, count]) => `> ${name.replace(/_/g, ' ')}: **${count}**`)
        .join('\n');


    // 3. Construct Embed
    const embed = {
        title: "📊 Kairos Manual Report",
        description: `**Data snapshot as of ${new Date().toLocaleTimeString()}**`,
        color: 0x3b82f6,
        fields: [
            // SECTION 1: VISITOR TRAFFIC
            { name: "🌍 __**Site Visitors**__", value: "_Anonymous Traffic_", inline: false },
            { name: "Unique Visits (DAU)", value: `${dau}`, inline: true },
            { name: "Bounce Rate", value: `${bounceRate}%`, inline: true },
            { name: "Peak Hour", value: `${peakHour}`, inline: true },

            // SECTION 2: PRODUCT USAGE
            { name: "👥 __**User Growth**__", value: "_Registered / Active_", inline: false },
            { name: "Key Events (Demos)", value: `${demoClicks}`, inline: true },
            { name: "Pricing Interest", value: `${pricingClicks}`, inline: true },

            // SECTION 3: BEHAVIOR
            { name: "👆 __**Top Actions**__", value: topEvents || "No significant activity", inline: false }
        ],
        timestamp: new Date().toISOString()
    };

    if (!WEBHOOK_URL) {
        console.log("⚠️ No Webhook URL found. Skipping send.");
        console.log(JSON.stringify(embed, null, 2));
        return;
    }

    // 4. Send
    console.log("Sending to Discord...");
    const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: "Kairos Test Bot",
            embeds: [embed]
        })
    });

    if (res.ok) console.log("✅ Sent successfully!");
    else console.error("❌ Send failed:", await res.text());
}

runTest();
