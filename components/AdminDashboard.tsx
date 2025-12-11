
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import {
    Users, Clock, MousePointer, RefreshCw, TrendingUp,
    Activity, Globe, Smartphone, Shield, Wallet
} from 'lucide-react';
import { DashboardErrorBoundary } from './DashboardErrorBoundary';



interface DailyStat {
    date: string;
    sessions: number;
    signups: number;
}

interface ActivityLog {
    id: string;
    event_name: string;
    created_at: string;
    user_id?: string;
    metadata?: any;
}

// Sub-component for KPIs
const MetricCard = ({ label, value, subvalue, icon, trend }: { label: string, value: string, subvalue: string, icon: React.ReactNode, trend?: 'up' | 'down' }) => (
    <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-slate-200 dark:border-neutral-800 shadow-sm relative overflow-hidden group hover:border-slate-300 dark:hover:border-neutral-700 transition-colors">
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-slate-50 dark:bg-neutral-800 rounded-2xl group-hover:scale-110 transition-transform">
                {icon}
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {trend === 'up' ? '↑' : '↓'}
                </div>
            )}
        </div>
        <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
            {value}
        </div>
        <div className="text-xs font-medium text-slate-400 uppercase tracking-widest">
            {label}
        </div>
        <div className="absolute bottom-6 right-6 text-xs text-slate-400 font-medium">
            {subvalue}
        </div>
    </div>
);

const AdminDashboard = () => {
    // Debug Recharts imports
    useEffect(() => {
        console.log("AdminDashboard Check:", {
            BarChart: !!BarChart,
            ResponsiveContainer: !!ResponsiveContainer,
            MetricCard: !!MetricCard
        });
    }, []);

    const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
    const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState({
        totalUsers: 0,
        totalSessions: 0,
        premiumUsers: 0,
        bounceRate: 0,
        avgDuration: 0,
        mobile_percentage: 0
    });

    const [topPages, setTopPages] = useState<{ name: string, count: number }[]>([]);

    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        fetchDeepDive();
    }, []);

    const fetchDeepDive = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            // CALL RPC FUNCTION (Bypasses RLS)
            const { data, error } = await supabase.rpc('get_admin_dashboard_stats');

            if (error) {
                console.error("RPC Error:", error);
                setErrorMsg(error.message);
                // Fallback or Alert?
                return;
            }

            if (!data) {
                console.warn("RPC returned no data");
                return;
            }

            // Defensive destructuring
            const sessions = Array.isArray(data.sessions) ? data.sessions : [];
            const signups = Array.isArray(data.signups) ? data.signups : [];
            const recents = Array.isArray(data.recents) ? data.recents : [];
            const profiles_counts = data.profiles_counts || {};

            // --- AGGREGATION LOGIC (Reuse existing processing) ---

            // A. Daily Graph Data
            const daysMap = new Map<string, DailyStat>();

            // Allow looping 30 days to fill gaps
            for (let d = 0; d <= 30; d++) {
                const date = new Date();
                date.setDate(date.getDate() - (30 - d));
                const key = date.toISOString().split('T')[0];
                daysMap.set(key, { date: key, sessions: 0, signups: 0 });
            }

            if (sessions) {
                sessions.forEach((s: any) => {
                    const key = s.started_at.split('T')[0];
                    if (daysMap.has(key)) {
                        const stat = daysMap.get(key)!;
                        stat.sessions++;
                    }
                });
            }

            if (signups) {
                signups.forEach((u: any) => {
                    const key = u.created_at.split('T')[0];
                    if (daysMap.has(key)) {
                        const stat = daysMap.get(key)!;
                        stat.signups++;
                    }
                });
            }

            setDailyStats(Array.from(daysMap.values()));

            // B. Metrics Calculation
            const totalSessions = sessions?.length || 0;
            let bounced = 0;
            let totalDuration = 0;
            let mobileCount = 0;

            if (sessions) {
                sessions.forEach((s: any) => {
                    // Duration
                    const dur = (new Date(s.last_seen_at).getTime() - new Date(s.started_at).getTime()) / 1000;
                    totalDuration += dur;
                    if (dur < 10) bounced++;

                    // Mobile Check
                    if (s.user_agent?.toLowerCase().includes('mobile')) mobileCount++;
                });
            }

            // Total Users is trickier with partial fetch, but signups has last 30 days.
            // RPC could fetch total count. Assume signups.length for now or use profile counts?
            // Actually profiles_counts has 'premium' and 'free'. Sum them for total users estimate
            const totalUsersEstimate = (profiles_counts?.free || 0) + (profiles_counts?.premium || 0);

            setMetrics({
                totalUsers: totalUsersEstimate,
                totalSessions,
                premiumUsers: profiles_counts?.premium || 0,
                bounceRate: totalSessions ? Math.round((bounced / totalSessions) * 100) : 0,
                avgDuration: totalSessions ? Math.round(totalDuration / totalSessions) : 0,
                mobile_percentage: totalSessions ? Math.round((mobileCount / totalSessions) * 100) : 0
            });

            // C. Recent Logs
            if (recents) {
                setRecentActivity(recents);

                // Top Pages from Recents
                const eventCounts: Record<string, number> = {};
                recents.forEach((e: any) => {
                    eventCounts[e.event_name] = (eventCounts[e.event_name] || 0) + 1;
                });

                const top = Object.entries(eventCounts)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([name, count]) => ({ name, count }));
                setTopPages(top);
            }

        } catch (e) {
            console.error("Deep Dive Error", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
            <RefreshCw className="w-12 h-12 text-slate-300 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Crunching the numbers...</p>
        </div>
    );

    return (
        <div className="p-4 md:p-8 space-y-8 bg-slate-50/50 dark:bg-[#0A0A0A] min-h-screen">

            {/* 1. HERO METRICS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                    label="Total Traffic"
                    value={metrics.totalSessions.toString()}
                    subvalue="Last 30 Days"
                    icon={<Globe className="w-5 h-5 text-blue-500" />}
                    trend="up"
                />
                <MetricCard
                    label="User Growth"
                    value={metrics.totalUsers.toString()}
                    subvalue={`${metrics.premiumUsers} Premium`}
                    icon={<Users className="w-5 h-5 text-purple-500" />}
                    trend="up"
                />
                <MetricCard
                    label="Avg Session"
                    value={`${metrics.avgDuration}s`}
                    subvalue={`${metrics.bounceRate}% Bounce`}
                    icon={<Clock className="w-5 h-5 text-emerald-500" />}
                    trend={metrics.bounceRate > 60 ? 'down' : 'up'}
                />
                <MetricCard
                    label="Mobile Usage"
                    value={`${metrics.mobile_percentage}%`}
                    subvalue="Vs Desktop"
                    icon={<Smartphone className="w-5 h-5 text-orange-500" />}
                />
            </div>

            {/* 2. CHARTS ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
                {/* Traffic Trend */}
                <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-slate-200 dark:border-neutral-800 shadow-sm flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-500" /> Traffic Volume
                    </h3>
                    <div className="flex-grow">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailyStats}>
                                <defs>
                                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(str) => str.substring(5)} // Show MM-DD
                                    stroke="#888"
                                />
                                <YAxis stroke="#888" tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Area type="monotone" dataKey="sessions" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorSessions)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* User Growth */}
                <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-slate-200 dark:border-neutral-800 shadow-sm flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-500" /> New Signups
                    </h3>
                    <div className="flex-grow">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dailyStats}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(str) => str.substring(5)}
                                    stroke="#888"
                                />
                                <YAxis stroke="#888" tick={{ fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="signups" fill="#A855F7" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 3. DETAILS: Top Actions & Recent Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* DEBUG PANEL (Temporary) */}
                <div className="lg:col-span-3 bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-200 dark:border-red-800">
                    <h4 className="text-sm font-bold text-red-600 dark:text-red-400 mb-2">Debug Diagnostics</h4>
                    <code className="text-xs text-red-500 block mb-1">
                        User: {supabase.auth.getUser().then(u => u.data.user?.email || 'None')}
                    </code>
                    <code className="text-xs text-red-500 block mb-1">
                        UID: {supabase.auth.getUser().then(u => u.data.user?.id || 'None')}
                    </code>
                    {errorMsg && (
                        <div className="mt-2 text-xs font-mono font-bold text-red-600 bg-red-100 p-2 rounded">
                            RPC FAILURE: {errorMsg}
                        </div>
                    )}
                    {metrics.totalSessions === 0 && !errorMsg && (
                        <div className="mt-2 text-xs font-mono text-red-600">
                            Warning: Zero Sessions found. RPC returned success but no data (or empty).
                        </div>
                    )}
                </div>

                {/* Top Actions */}
                <div className="lg:col-span-1 bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-slate-200 dark:border-neutral-800 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Top Actions</h3>
                    <div className="space-y-3">
                        {topPages.map((page, i) => (
                            <div key={i} className="flex justify-between items-center p-3 hover:bg-slate-50 dark:hover:bg-neutral-800/50 rounded-xl transition-colors group cursor-default">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-slate-500 font-bold text-xs">
                                        {i + 1}
                                    </div>
                                    <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-500 transition-colors">
                                        {page.name}
                                    </span>
                                </div>
                                <span className="font-bold text-slate-900 dark:text-white">{page.count}</span>
                            </div>
                        ))}
                        {topPages.length === 0 && <div className="text-slate-400 text-sm">No data yet.</div>}
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="lg:col-span-2 bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-slate-200 dark:border-neutral-800 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-emerald-500" /> Live Feed
                        </h3>
                        <button onClick={fetchDeepDive} className="p-2 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                            <RefreshCw className="w-4 h-4 text-slate-500" />
                        </button>
                    </div>

                    <div className="overflow-hidden">
                        <div className="max-h-[400px] overflow-y-auto space-y-0 scrollbar-hide">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-400 uppercase bg-slate-50 dark:bg-neutral-900/50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3">Event</th>
                                        <th className="px-4 py-3">Time</th>
                                        <th className="px-4 py-3 text-right">User ID</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                                    {recentActivity.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                                                {log.event_name}
                                                {log.metadata && (
                                                    <span className="ml-2 text-xs text-slate-400 font-normal">
                                                        {JSON.stringify(log.metadata).substring(0, 30)}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-slate-500">
                                                {new Date(log.created_at).toLocaleTimeString()}
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono text-xs text-slate-400">
                                                {log.user_id ? log.user_id.substring(0, 8) + '...' : 'Anon'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {recentActivity.length === 0 && <div className="p-8 text-center text-slate-400">No recent activity found.</div>}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default function SafeAdminDashboard() {
    return (
        <DashboardErrorBoundary>
            <AdminDashboard />
        </DashboardErrorBoundary>
    );
};


