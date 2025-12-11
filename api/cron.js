import { createClient } from '@supabase/supabase-js';

// Init Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

export default async function handler(req, res) {
    // Vercel Cron jobs are GET requests
    // Can ensure it's from Vercel by checking headers if needed, but for now we keep it open or check CRON_SECRET

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // 7 Days ago
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);
    const weekAgoISO = weekAgo.toISOString();

    try {
        // 1. Signups Today
        const { count: signupsToday } = await supabase.from('waitlist').select('*', { count: 'exact', head: true }).gte('created_at', todayISO);

        // 2. Analysis Runs Today
        const { count: analysisToday } = await supabase.from('analysis_logs').select('*', { count: 'exact', head: true }).gte('created_at', todayISO);

        // 3. Weekly Stats (for context)
        const { count: signupsWeek } = await supabase.from('waitlist').select('*', { count: 'exact', head: true }).gte('created_at', weekAgoISO);

        // 4. Total Waitlist
        const { count: totalWaitlist } = await supabase.from('waitlist').select('*', { count: 'exact', head: true });

        // Build Embed
        const embed = {
            title: "📈 Daily Performance Report",
            description: `**Date:** ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
            color: 0x3b82f6,
            fields: [
                { name: "🚀 Signups (24h)", value: `+${signupsToday}`, inline: true },
                { name: "⚡️ Analyses (24h)", value: `${analysisToday}`, inline: true },
                { name: "📅 Signups (7d)", value: `+${signupsWeek}`, inline: true },
                { name: "🏆 Total Waitlist", value: `**${totalWaitlist}**`, inline: false }
            ],
            footer: { text: "Kairos.AI | Automated Report" },
            timestamp: new Date().toISOString()
        };

        // Send to Discord
        const discordRes = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: "Kairos Analytics",
                avatar_url: "https://cdn-icons-png.flaticon.com/512/2782/2782058.png",
                embeds: [embed]
            })
        });

        if (!discordRes.ok) throw new Error('Discord Hook Failed');

        res.status(200).json({ success: true, REPORT_GENERATED: true });

    } catch (error) {
        console.error("Cron Failed:", error);
        res.status(500).json({ error: error.message });
    }
}
