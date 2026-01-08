import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

const TESTIMONIALS = [
    {
        name: "Alex M.",
        role: "Day Trader",
        content: "I was about to FOMO into a breakout on NVDA, but Kairos flagged a bearish divergence on the 4H that I completely missed. Saved me from a 15% drawdown. The risk calculator alone is worth it.",
        rating: 5,
        verified: true
    },
    {
        name: "Sarah Jenkins",
        role: "Crypto Analyst",
        content: "Most 'AI' trading tools are just random number generators. This actually explains the MATH behind the analysis. The alligator indicator explanation helped me finally understand trend exhaustion.",
        rating: 5,
        verified: true
    },
    {
        name: "David Chen",
        role: "Swing Trader",
        content: "I use 3 different paid indicators and Kairos still catches things they don't. It's like having a senior analyst looking over my shoulder before I press buy. Essential for my morning routine.",
        rating: 5,
        verified: true
    }
];

export const Testimonials = () => {
    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-12 md:py-24">
            <div className="text-center mb-12 space-y-4">
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                    Don't just take our word for it.
                </h2>
                <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                    Join thousands of traders who use AI to validate their edge and protect their capital.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {TESTIMONIALS.map((t, i) => (
                    <div
                        key={i}
                        className="relative p-8 rounded-3xl bg-white/50 dark:bg-neutral-900/50 border border-slate-100 dark:border-neutral-800 backdrop-blur-sm hover:border-blue-500/30 transition-all hover:shadow-lg group"
                    >
                        {/* Quote Icon Background */}
                        <div className="absolute top-6 right-6 text-slate-100 dark:text-neutral-800 group-hover:text-blue-50 dark:group-hover:text-blue-900/20 transition-colors">
                            <Quote className="w-12 h-12 fill-current" />
                        </div>

                        <div className="relative z-10 space-y-6">
                            {/* Stars */}
                            <div className="flex items-center gap-1">
                                {[...Array(t.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                                ))}
                            </div>

                            {/* Content */}
                            <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                                "{t.content}"
                            </p>

                            {/* Author */}
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-neutral-800">
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-white">
                                        {t.name}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-500 font-medium uppercase tracking-wider">
                                        {t.role}
                                    </div>
                                </div>
                                {t.verified && (
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-full">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>Verified</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
