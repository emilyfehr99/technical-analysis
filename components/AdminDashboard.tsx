
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { BarChart, Users, Clock, MousePointer, RefreshCw } from 'lucide-react';

interface Stats {
    totalUsers: number;
    totalAnalysis: number;
    totalSessions: number;
    bounceRate: number;
    topEvents: string[];
    tiers: { free: number; premium: number; institutional: number };
}

export const AdminDashboard = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        setLoading(true);
        try {
            // 1. Waitlist
            const { count: totalUsers } = await supabase.from('waitlist').select('*', { count: 'exact', head: true });

            // 2. Analysis Logs
            const { count: totalAnalysis } = await supabase.from('analysis_logs').select('*', { count: 'exact', head: true });

            // 3. Client Analytics
            const { data: sessions } = await supabase.from('analytics_sessions').select('*');
            const { data: events } = await supabase.from('analytics_events').select('*');

            // 4. Profiles
            const { data: profiles } = await supabase.from('profiles').select('tier');

            // Process Data
            const totalSessions = sessions ? sessions.length : 0;
            let bounced = 0;
            if (sessions) {
                sessions.forEach(s => {
                    const duration = (new Date(s.last_seen_at).getTime() - new Date(s.started_at).getTime()) / 1000;
                    if (duration < 10) bounced++;
                });
            }
            const bounceRate = totalSessions > 0 ? Math.round((bounced / totalSessions) * 100) : 0;

            const eventCounts: Record<string, number> = {};
            if (events) {
                events.forEach(e => {
                    eventCounts[e.event_name] = (eventCounts[e.event_name] || 0) + 1;
                });
            }
            const topEvents = Object.entries(eventCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([k, v]) => `${k}: ${v}`);

            const tiers = { free: 0, premium: 0, institutional: 0 };
            if (profiles) {
                profiles.forEach((p: any) => {
                    if (tiers[p.tier as keyof typeof tiers] !== undefined) {
                        tiers[p.tier as keyof typeof tiers]++;
                    }
                });
            }

            setStats({
                totalUsers: totalUsers || 0,
                totalAnalysis: totalAnalysis || 0,
                totalSessions,
                bounceRate,
                topEvents,
                tiers
            });

        } catch (e) {
            console.error("Dashboard Create Error", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-500">Loading Analytics...</div>;

    return (
        <div className="space-y-6">

            {/* Header Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                        <Users className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase">Total Users</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                        {stats?.totalUsers}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                        {stats?.tiers.premium} Premium
                    </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                        <RefreshCw className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase">AI Scans</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                        {stats?.totalAnalysis}
                    </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase">Sessions</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                        {stats?.totalSessions}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                        {stats?.bounceRate}% Bounce Rate
                    </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                        <MousePointer className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase">Top Action</span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {stats?.topEvents[0]?.split(':')[0] || 'None'}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                        {stats?.topEvents[0]?.split(':')[1] || 0} times
                    </div>
                </div>
            </div>

            {/* Top Events List */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Top User Actions</h3>
                <div className="space-y-3">
                    {stats?.topEvents.map((e, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-neutral-800 rounded-lg">
                            <span className="font-medium text-slate-700 dark:text-slate-200">{e.split(':')[0]}</span>
                            <span className="font-bold text-slate-900 dark:text-white">{e.split(':')[1]}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end">
                <button onClick={fetchStats} className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" /> Refresh Data
                </button>
            </div>

        </div>
    );
};
