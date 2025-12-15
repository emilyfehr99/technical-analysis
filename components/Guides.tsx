import React from 'react';
import { ArrowLeft, BookOpen, TrendingUp, AlertTriangle, Target } from 'lucide-react';

interface GuidesProps {
    onBack: () => void;
}

export const Guides: React.FC<GuidesProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-gray-100 transition-colors duration-300">
            <div className="max-w-4xl mx-auto px-6 py-12">
                {/* Back Button */}
                <button
                    onClick={onBack}
                    className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-semibold">Back to Analyzer</span>
                </button>

                {/* Header */}
                <div className="mb-12 text-center animate-fade-in-up">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl mb-6 shadow-sm">
                        <BookOpen className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 dark:from-white dark:via-blue-200 dark:to-white">
                        Mastering Technical Analysis
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        A comprehensive guide to understanding chart patterns, indicators, and risk management strategies used by institutional traders.
                    </p>
                </div>

                {/* Content Container */}
                <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100 dark:border-neutral-800 animate-fade-in">

                    {/* Placeholder Content - Waiting for User Input */}
                    <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
                        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                                <Target className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Content Coming Soon</h3>
                            <p className="text-slate-500 dark:text-gray-400 max-w-md">
                                We are currently curating high-quality educational material to help you trade smater. Check back shortly for deep dives into:
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center mt-4">
                                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold">MACD Strategies</span>
                                <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full text-sm font-semibold">Risk Management</span>
                                <span className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-sm font-semibold">Chart Patterns</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
