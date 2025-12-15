import { createClient } from '@supabase/supabase-js';

// Init Supabase (Reuse existing envs)
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // Validate request
    const { type, data } = req.body;

    // Only allow internal calls or valid types
    // In a real app, you might want an API secret for this endpoint

    try {
        let embed = null;

        // 1. New Waitlist Signup
        if (type === 'WAITLIST_JOIN') {
            embed = {
                title: "🎉 New Waitlist Signup!",
                color: 0x10b981, // Emerald Green
                fields: [
                    { name: "Email", value: data.email, inline: true },
                    { name: "Plan Interest", value: data.plan || "Unspecified", inline: true },
                    // We could fetch the count here if we wanted
                ],
                timestamp: new Date().toISOString()
            };
        }

        // 2. New Paid Subscriber
        else if (type === 'PAYMENT_SUCCESS') {
            embed = {
                title: "💰 New Paid Subscriber!",
                description: `**${data.email}** just upgraded to **${data.plan.toUpperCase()}**`,
                color: 0xfacc15, // Gold
                thumbnail: {
                    url: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" // VIP/Crown Icon
                },
                fields: [
                    { name: "Plan", value: data.plan.toUpperCase(), inline: true },
                    { name: "Amount", value: data.amount ? `$${data.amount}` : 'N/A', inline: true },
                    { name: "Email", value: data.email, inline: true }
                ],
                timestamp: new Date().toISOString()
            };
        }

        // 2. Daily Analytics Report (Triggered by Cron)
        else if (type === 'DAILY_REPORT') {
            // Fetch stats from Supabase
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayISO = today.toISOString();

            // A. Signups Today
            const { count: signupsToday } = await supabase
                .from('waitlist')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', todayISO);

            // B. Analysis Runs Today
            const { count: analysisToday } = await supabase
                .from('analysis_logs')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', todayISO);

            // C. Total Waitlist
            const { count: totalWaitlist } = await supabase.from('waitlist').select('*', { count: 'exact', head: true });

            embed = {
                title: "📊 Daily Analytics Report",
                description: `Activity for ${new Date().toLocaleDateString()}`,
                color: 0x3b82f6, // Blue
                fields: [
                    { name: "📝 New Signups Today", value: `${signupsToday}`, inline: true },
                    { name: "⚡️ Analyses Ran", value: `${analysisToday}`, inline: true },
                    { name: "👥 Total Waitlist", value: `${totalWaitlist}`, inline: true }
                ],
                footer: { text: "Kairos.AI Analytics" },
                timestamp: new Date().toISOString()
            };
        }

        if (!embed) {
            return res.status(400).json({ error: 'Invalid notification type' });
        }

        // Send to Discord
        const discordRes = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: "Kairos Bot",
                avatar_url: "https://cdn-icons-png.flaticon.com/512/4712/4712009.png", // Generic Analysis Icon
                embeds: [embed]
            })
        });

        if (!discordRes.ok) throw new Error('Failed to send to Discord');

        res.status(200).json({ success: true });

    } catch (error) {
        console.error('Discord Notification Error:', error);
        res.status(500).json({ error: error.message });
    }
}
