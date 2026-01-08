import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { TrendingUp, TrendingDown, Clock, Shield, Award, Calendar } from 'lucide-react';

interface ProfileHistoryProps {
    user: any;
    usage: { used: number; limit: number; tier: string; activeTrade?: any } | null;
    onBack: () => void;
}

export const ProfileHistory: React.FC<ProfileHistoryProps> = ({ user, usage, onBack }) => {
    const [trades, setTrades] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('simulated_trades')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (data) setTrades(data);
                if (error) console.error("Error fetching trades:", error);
            } catch (e) {
                console.error("Failed to load history", e);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [user]);

    // Derived Stats
    const totalTrades = trades.length;
    const wins = trades.filter(t => t.status === 'won').length;
    const losses = trades.filter(t => t.status === 'lost').length;
    const winRate = totalTrades > 0 ? ((wins / (wins + losses || 1)) * 100).toFixed(0) : 0;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Back */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white">Trader Profile</h2>
                    <p className="text-slate-500 dark:text-slate-400">Track your simulated AI performance.</p>
                </div>
                <button
                    onClick={onBack}
                    className="px-6 py-2 bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-full font-semibold hover:bg-slate-50 dark:hover:bg-neutral-700 transition-colors"
                >
                    Back to Dashboard
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {/* Membership Card */}
                <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <Shield className="w-5 h-5 text-blue-400" />
                            <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">Membership</span>
                        </div>
                        <div className="text-2xl font-bold capitalize">{usage?.tier || 'Free'} Tier</div>
                        <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                            <Clock className="w-4 h-4" />
                            {usage?.limit === Infinity ? 'Unlimited Access' : `${usage?.remaining} Credits Remaining`}
                        </div>
                    </div>
                </div>

                {/* Performance Card */}
                <div className="p-6 bg-white dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 rounded-3xl shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Win Rate</span>
                    </div>
                    <div className="text-4xl font-black text-slate-900 dark:text-white">{winRate}%</div>
                    <div className="mt-2 text-sm text-slate-500">
                        {wins} Wins / {losses} Losses
                    </div>
                </div>

                {/* Total Trades */}
                <div className="p-6 bg-white dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 rounded-3xl shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Trades</span>
                    </div>
                    <div className="text-4xl font-black text-slate-900 dark:text-white">{totalTrades}</div>
                    <div className="mt-2 text-sm text-slate-500">
                        Lifetime AI Simulations
                    </div>
                </div>
            </div>

            {/* Active Trade Section */}
            {usage?.activeTrade && (
                <div className="mb-10">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Active Simulation</h3>
                    <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center">
                                <Clock className="w-6 h-6 animate-pulse" />
                            </div>
                            <div>
                                <div className="font-bold text-lg text-slate-900 dark:text-white">
                                    {usage.activeTrade.direction} {usage.activeTrade.asset_symbol}
                                </div>
                                <div className="text-slate-500 dark:text-slate-400 text-sm">
                                    Entry: ${usage.activeTrade.entry_price} • Status: <span className="text-blue-600 font-bold uppercase">{usage.activeTrade.status}</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-black px-4 py-2 rounded-lg border border-slate-200 dark:border-neutral-700 text-sm font-mono">
                            TP: ${usage.activeTrade.take_profit} | SL: ${usage.activeTrade.stop_loss}
                        </div>
                    </div>
                </div>
            )}

            {/* Trade History Table */}
            <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Trade History</h3>

                {loading ? (
                    <div className="text-center py-10 text-slate-500">Loading history...</div>
                ) : trades.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 dark:bg-neutral-900 rounded-2xl border border-dashed border-slate-200 dark:border-neutral-800">
                        <p className="text-slate-500 font-medium">No trades recorded yet.</p>
                        <p className="text-slate-400 text-sm mt-1">Run an analysis to start your first simulation.</p>
                    </div>
                ) : (
                    <div className="overflow-hidden bg-white dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 rounded-2xl shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-neutral-800 border-b border-slate-100 dark:border-neutral-700">
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Asset</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Side</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Entry</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Result</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">PnL</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                                {trades.map((trade) => (
                                    <tr key={trade.id} className="hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition-colors">
                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400 font-mono">
                                            {new Date(trade.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 font-bold text-slate-900 dark:text-white">
                                            {trade.asset_symbol}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${trade.direction === 'BUY'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                                                }`}>
                                                {trade.direction}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                                            ${Number(trade.entry_price).toLocaleString()}
                                        </td>
                                        <td className="p-4">
                                            {trade.status === 'won' && (
                                                <div className="flex items-center gap-1 text-green-600 font-bold text-sm">
                                                    <TrendingUp className="w-4 h-4" /> Won
                                                </div>
                                            )}
                                            {trade.status === 'lost' && (
                                                <div className="flex items-center gap-1 text-red-500 font-bold text-sm">
                                                    <TrendingDown className="w-4 h-4" /> Lost
                                                </div>
                                            )}
                                            {(trade.status === 'OPEN' || trade.status === 'PENDING') && (
                                                <div className="flex items-center gap-1 text-blue-500 font-bold text-sm">
                                                    <Clock className="w-4 h-4" /> {trade.status}
                                                </div>
                                            )}
                                        </td>
                                        <td className={`p-4 text-right font-bold text-sm ${Number(trade.pnl_percent) > 0 ? 'text-green-600' : Number(trade.pnl_percent) < 0 ? 'text-red-500' : 'text-slate-400'
                                            }`}>
                                            {trade.pnl_percent ? `${Number(trade.pnl_percent) > 0 ? '+' : ''}${trade.pnl_percent}%` : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
