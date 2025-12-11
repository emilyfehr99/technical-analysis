import React from 'react';
import { Flag, ArrowRight, XCircle, Target } from 'lucide-react';

interface TradeTimelineProps {
    entryPrice: string;
    stopLoss: string;
    targets: string[];
    currentPrice: string;
}

export const TradeTimeline: React.FC<TradeTimelineProps> = ({ entryPrice, stopLoss, targets, currentPrice }) => {
    // Helper to strip non-numeric and parse
    const parsePrice = (p: any) => {
        if (typeof p === 'number') return p;
        if (!p) return 0;
        return parseFloat(String(p).replace(/[^0-9.]/g, '')) || 0;
    };

    const current = parsePrice(currentPrice);
    const entry = parsePrice(entryPrice);
    const stop = parsePrice(stopLoss);

    // Sort targets numerically
    const TP = targets.map(t => parsePrice(t)).sort((a, b) => a - b);

    // Determine trend direction (Long if Targets > Entry)
    const isLong = TP[0] > entry;

    return (
        <div className="w-full bg-slate-50 dark:bg-neutral-900/40 rounded-2xl p-6 border border-slate-200 dark:border-neutral-800 mt-8">
            <h3 className="text-md font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-blue-600" />
                Trade Execution Timeline
            </h3>

            <div className="relative flex items-center justify-between w-full min-h-[100px] px-4">

                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-red-400 via-blue-500 to-green-500 rounded-full opacity-30 z-0" />

                {/* STOP LOSS */}
                <div className="relative z-10 flex flex-col items-center group">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-500 rounded-full flex items-center justify-center border-4 border-white dark:border-neutral-900 shadow-sm ring-1 ring-red-200 dark:ring-red-900/50 group-hover:scale-110 transition-transform">
                        <XCircle className="w-5 h-5" />
                    </div>
                    <div className="mt-2 text-center">
                        <span className="block text-xs font-bold text-red-600 dark:text-red-400">STOP LOSS</span>
                        <span className="text-sm font-mono font-medium text-slate-600 dark:text-slate-400">{stopLoss}</span>
                    </div>
                </div>

                {/* ENTRY */}
                <div className="relative z-10 flex flex-col items-center group">
                    {/* Pulsing Effect for Entry */}
                    <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20"></div>
                    <div className="w-12 h-12 bg-blue-600 dark:bg-blue-600 text-white rounded-full flex items-center justify-center border-4 border-white dark:border-neutral-900 shadow-lg z-10 group-hover:scale-110 transition-transform">
                        <span className="font-bold text-xs">ENTRY</span>
                    </div>
                    <div className="mt-2 text-center">
                        <span className="block text-xs font-bold text-blue-600 dark:text-blue-400">TRIGGER ZONE</span>
                        <span className="text-sm font-mono font-bold text-slate-800 dark:text-white">{entryPrice}</span>
                    </div>
                </div>

                {/* TARGETS */}
                {targets.map((target, idx) => (
                    <div key={idx} className="relative z-10 flex flex-col items-center group">
                        <div className="w-10 h-10 bg-green-100 dark:bg-emerald-950/30 text-green-600 dark:text-emerald-500 rounded-full flex items-center justify-center border-4 border-white dark:border-neutral-900 shadow-sm ring-1 ring-green-200 dark:ring-emerald-900/50 group-hover:scale-110 transition-transform">
                            <Target className="w-5 h-5" />
                        </div>
                        <div className="mt-2 text-center">
                            <span className="block text-xs font-bold text-green-600 dark:text-green-400">TARGET {idx + 1}</span>
                            <span className="text-sm font-mono font-medium text-slate-600 dark:text-slate-400">{target}</span>
                        </div>
                    </div>
                ))}

            </div>

            {/* Current Price Marker (Simplified visual placement) */}
            <div className="mt-6 text-center">
                <span className="inline-flex items-center px-3 py-1 bg-slate-200 dark:bg-neutral-800 rounded-full text-xs font-semibold text-slate-600 dark:text-neutral-400 border border-transparent dark:border-neutral-700">
                    Current Price Reference: <span className="font-mono ml-2 text-slate-900 dark:text-white">{currentPrice}</span>
                </span>
            </div>
        </div>
    );
};
