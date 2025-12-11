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

    // --- CALCULATIONS ---
    const totalSessions = sessions ? sessions.length : 0;

    // A. Bounce Rate: Sessions < 30s AND No Events (Approximation)
    // We can join events, but for now let's use duration if available, or just single-page-visit logic if we had pages.
    // Better proxy: "Bounced" if duration is small (e.g. < 10s) and NOT in the list of sessions that fired key events.
    // Let's keep it simple: Duration < 10s.
    let bounced = 0;
    const hourMap = {}; // for Time of Day

    if (sessions) {
        sessions.forEach(s => {
            // Bounce Calc
            const duration = (new Date(s.last_seen_at) - new Date(s.started_at)) / 1000;
            if (duration < 10) bounced++;

            // Time of Day
            const hour = new Date(s.started_at).getHours();
            hourMap[hour] = (hourMap[hour] || 0) + 1;
        });
    }

    const bounceRate = totalSessions > 0 ? Math.round((bounced / totalSessions) * 100) : 0;

    // B. Most Active Hour
    let peakHour = "N/A";
    let maxVisits = 0;
    Object.entries(hourMap).forEach(([hour, count]) => {
        if (count > maxVisits) {
            maxVisits = count;
            // Format 13 -> "1 PM"
            const h = parseInt(hour);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const displayH = h % 12 || 12;
            peakHour = `${displayH} ${ampm}`;
        }
    });

    // C. Top Buttons (Events)
    const eventCounts = {};
    if (events) {
        events.forEach(e => {
            eventCounts[e.event_name] = (eventCounts[e.event_name] || 0) + 1;
        });
    }
    // Sort and get Top 3
    const topEvents = Object.entries(eventCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([name, count]) => `${name.replace(/_/g, ' ')}: **${count}**`)
        .join('\n');

    console.log("Calculated metrics:", { totalSessions, bounceRate, peakHour, topEvents });

    // 3. Construct Embed
    const embed = {
        title: "🧠 Deep Dive Analytics",
        color: 0x8b5cf6, // Purple
        fields: [
            { name: "📉 Bounce Rate", value: `${bounceRate}%`, inline: true },
            { name: "⏰ Peak Time", value: `${peakHour}`, inline: true },
            { name: "👆 Top Actions", value: topEvents || "No data", inline: false }
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
