import { createClient } from '@supabase/supabase-js';

// Init Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

export default async function handler(req, res) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // Check for Weekly (Monday) and Monthly (1st)
    const isMonday = today.getDay() === 1;
    const isFirstOfMonth = today.getDate() === 1;

    // Time ranges
    const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 7);
    const monthAgo = new Date(today); monthAgo.setMonth(today.getMonth() - 1);

    try {
        // --- 1. DAILY STATS ---
        const { count: signupsToday } = await supabase.from('waitlist').select('*', { count: 'exact', head: true }).gte('created_at', todayISO);
        const { count: analysisToday } = await supabase.from('analysis_logs').select('*', { count: 'exact', head: true }).gte('created_at', todayISO);

        // New Analytics (Sessions & Page Views)
        const { count: dau } = await supabase.from('analytics_sessions').select('*', { count: 'exact', head: true })
            .gte('started_at', todayISO);

        const { count: pageViews } = await supabase.from('analytics_page_views').select('*', { count: 'exact', head: true })
            .gte('viewed_at', todayISO);

        // --- DEEP DIVE CALCULATIONS ---
        const { data: recentSessions } = await supabase
            .from('analytics_sessions')
            .select('*')
            .gte('started_at', todayISO)
            .limit(1000);

        const { data: recentEvents } = await supabase
            .from('analytics_events')
            .select('event_name')
            .gte('occurred_at', todayISO)
            .neq('event_name', 'test_event_backend') // FILTER TEST EVENTS
            .neq('event_name', 'upload_chart_select') // Optional: Filter high-volume noise if needed
            .limit(2000);

        // A. Bounce Rate & Time of Day
        let bounced = 0;
        const hourMap = {};
        const totalSessions = recentSessions ? recentSessions.length : 0;

        if (recentSessions) {
            recentSessions.forEach(s => {
                const duration = (new Date(s.last_seen_at) - new Date(s.started_at)) / 1000;
                if (duration < 10) bounced++;
                const hour = new Date(s.started_at).getHours();
                hourMap[hour] = (hourMap[hour] || 0) + 1;
            });
        }
        const bounceRate = totalSessions > 0 ? Math.round((bounced / totalSessions) * 100) : 0;

        // B. Peak Time
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

        // C. Top Actions (Filtered)
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

        const { count: totalWaitlist } = await supabase.from('waitlist').select('*', { count: 'exact', head: true });

        // Compile Embeds
        const embeds = [];

        // A. Daily Embed (Split Visitors vs Users)
        embeds.push({
            title: "📊 Kairos Daily Insight",
            description: `**${today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}**`,
            color: 0x3b82f6,
            fields: [
                // SECTION 1: VISITOR TRAFFIC
                { name: "🌍 __**Site Visitors**__", value: "_Anonymous Traffic_", inline: false },
                { name: "Unique Visits", value: `${dau}`, inline: true },
                { name: "Page Views", value: `${pageViews}`, inline: true },
                { name: "Bounce Rate", value: `${bounceRate}%`, inline: true },
                { name: "Peak Hour", value: `${peakHour}`, inline: true },

                // SECTION 2: PRODUCT USAGE
                { name: "👥 __**User Growth**__", value: "_Registered / Active_", inline: false },
                { name: "New Signups", value: `+${signupsToday}`, inline: true },
                { name: "Total Database", value: `${totalWaitlist}`, inline: true },
                { name: "AI Analyses", value: `${analysisToday}`, inline: true },

                // SECTION 3: BEHAVIOR
                { name: "👆 __**Top Actions**__", value: topEvents || "No significant activity", inline: false }
            ],
            footer: { text: "Kairos.AI Analytics | Filtered Data" },
            timestamp: new Date().toISOString()
        });

        // B. Weekly Embed (Mondays)
        if (isMonday) {
            const { count: weekSignups } = await supabase.from('waitlist').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString());
            const { count: weekAnalyses } = await supabase.from('analysis_logs').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString());
            const { count: weekSessions } = await supabase.from('analytics_sessions').select('*', { count: 'exact', head: true }).gte('started_at', weekAgo.toISOString());

            embeds.push({
                title: "🗓️ Weekly Recap",
                description: `Last 7 Days`,
                color: 0x8b5cf6, // Purple
                fields: [
                    { name: "Traffic", value: `${weekSessions} Visits`, inline: true },
                    { name: "Growth", value: `+${weekSignups} Users`, inline: true },
                    { name: "Activity", value: `${weekAnalyses} Scans`, inline: true }
                ],
                timestamp: new Date().toISOString()
            });
        }

        // C. Monthly Embed (1st)
        if (isFirstOfMonth) {
            const { count: monthSignups } = await supabase.from('waitlist').select('*', { count: 'exact', head: true }).gte('created_at', monthAgo.toISOString());

            embeds.push({
                title: "📅 Monthly Overview",
                color: 0xf59e0b, // Amber
                fields: [
                    { name: "Monthly Growth", value: `+${monthSignups} Users`, inline: true },
                    { name: "Total Database", value: `${totalWaitlist}`, inline: true }
                ],
                timestamp: new Date().toISOString()
            });
        }

        // Send All Embeds
        if (WEBHOOK_URL) {
            await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: "Kairos Analytics",
                    avatar_url: "https://cdn-icons-png.flaticon.com/512/2782/2782058.png",
                    embeds: embeds
                })
            });
        }

        res.status(200).json({ success: true, daily: true, weekly: isMonday, monthly: isFirstOfMonth });

    } catch (error) {
        console.error("Cron Failed:", error);
        res.status(500).json({ error: error.message });
    }
}
