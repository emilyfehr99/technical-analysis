// scripts/send_historical_report.js
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to parse Env file
const loadEnv = (filePath) => {
    const env = {};
    try {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            content.split('\n').forEach(line => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    const val = match[2].trim().replace(/^['"]|['"]$/g, ''); // Remove quotes
                    if (key && !key.startsWith('#')) env[key] = val;
                }
            });
        }
    } catch (e) { console.error(`Failed to read ${filePath}`, e); }
    return env;
};

// 1. Load Both Env Files
const envMain = loadEnv(path.resolve(__dirname, '../.env'));
const envLocal = loadEnv(path.resolve(__dirname, '../.env.local'));
const env = { ...envMain, ...envLocal }; // Local overrides Main

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY; // Use Service Role for Admin Access
const DISCORD_URL = env.DISCORD_WEBHOOK_URL;

if (!SUPABASE_URL || !SUPABASE_KEY || !DISCORD_URL) {
    console.error("❌ Missing Credentials in .env / .env.local");
    console.log("Found URL:", !!SUPABASE_URL);
    console.log("Found KEY:", !!SUPABASE_KEY);
    console.log("Found Discord:", !!DISCORD_URL);
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function generateReport() {
    console.log("📊 Generating Historical Report...");

    try {
        // A. Waitlist Signups (Direct Count)
        const { count: waitlistCount } = await supabase
            .from('waitlist')
            .select('*', { count: 'exact', head: true });

        // B. Total Visitors (Sessions)
        const { count: sessionCount } = await supabase
            .from('analytics_sessions')
            .select('*', { count: 'exact', head: true });

        // C. Clicks (Events)
        // Check for 'click_signup', 'click_cta', or generic 'click'
        const { count: ctaClicks } = await supabase
            .from('analytics_events')
            .select('*', { count: 'exact', head: true })
            .ilike('event_name', '%click%');

        // D. Analysis Runs
        const { count: analysisRuns } = await supabase
            .from('analysis_logs')
            .select('*', { count: 'exact', head: true });

        // E. Last Signup Info
        const { data: lastUser } = await supabase
            .from('waitlist')
            .select('email, created_at')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        // F. Avg Session Duration
        const { data: recentSessions } = await supabase
            .from('analytics_sessions')
            .select('started_at, last_seen_at')
            .order('started_at', { ascending: false })
            .limit(100);

        let avgDuration = 0;
        if (recentSessions && recentSessions.length > 0) {
            const totalMs = recentSessions.reduce((acc, sess) => {
                const start = new Date(sess.started_at).getTime();
                const end = new Date(sess.last_seen_at).getTime();
                return acc + (end - start);
            }, 0);
            avgDuration = Math.round((totalMs / recentSessions.length) / 1000 / 60);
        }

        // Construct Embed
        const embed = {
            title: "📜 Historical Analytics Recap",
            description: "Full history summary from Kairos.AI database.",
            color: 0x8b5cf6, // Violet
            fields: [
                { name: "👥 Total Waitlist", value: `**${waitlistCount || 0}**`, inline: true },
                { name: "👀 Unique Visitors", value: `${sessionCount || 0}`, inline: true },
                { name: "⚡️ Analyses Run", value: `${analysisRuns || 0}`, inline: true },
                { name: "🖱️ Engagement Clicks", value: `${ctaClicks || 0}`, inline: true },
                { name: "⏱️ Avg Session", value: `~${avgDuration} mins`, inline: true },
                { name: "🆕 Latest Joined", value: lastUser ? `${lastUser.email} (${new Date(lastUser.created_at).toLocaleDateString()})` : "None", inline: false }
            ],
            footer: { text: "Kairos.AI | Deep Dive Report" },
            timestamp: new Date().toISOString()
        };

        // Send to Discord
        console.log("🚀 Sending to Discord...");
        const res = await fetch(DISCORD_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: "Kairos Analytics",
                avatar_url: "https://cdn-icons-png.flaticon.com/512/2782/2782058.png",
                embeds: [embed]
            })
        });

        if (res.ok) {
            console.log("✅ Report Sent Successfully!");
        } else {
            console.error("❌ Failed to send:", await res.text());
        }

    } catch (err) {
        console.error("Critical Error:", err);
    }
}

generateReport();
