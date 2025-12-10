import React from 'react';
import { Sparkles, Check, Zap, Shield, BrainCircuit, Lock } from 'lucide-react';

interface PaywallModalProps {
    isOpen: boolean;
}

const PaywallModal: React.FC<PaywallModalProps> = ({ isOpen }) => {
    if (!isOpen) return null;

    const features = [
        { icon: <Zap className="w-4 h-4 text-amber-400" />, text: "Unlimited AI Technical Analysis" },
        { icon: <BrainCircuit className="w-4 h-4 text-amber-400" />, text: "Advanced Pattern Recognition Models" },
        { icon: <Shield className="w-4 h-4 text-amber-400" />, text: "Institutional-Grade Risk Engine" },
        { icon: <Sparkles className="w-4 h-4 text-amber-400" />, text: "Real-Time Trade Scenarios" },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop - No click to close */}
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" />

            <div className="relative w-full max-w-lg overflow-hidden bg-slate-900 rounded-[2rem] shadow-2xl border border-amber-500/30 animate-in fade-in zoom-in-95 duration-300">

                {/* Premium Header Decoration */}
                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-amber-500/20 to-transparent pointer-events-none" />
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl" />
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />

                <div className="relative p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl shadow-lg shadow-amber-500/20">
                        <Lock className="w-8 h-8 text-white" />
                    </div>

                    <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
                        Unlock Pro Access
                    </h2>
                    <p className="text-slate-400 mb-8 max-w-sm mx-auto leading-relaxed">
                        You've used your 3 free preview analyses. Upgrade to continue discovering high-probability setups.
                    </p>

                    <div className="bg-slate-800/50 rounded-2xl p-6 mb-8 border border-white/5 text-left">
                        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Pro Features</h3>
                        <div className="space-y-3">
                            {features.map((feature, idx) => (
                                <div key={idx} className="flex items-center text-slate-200">
                                    <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center mr-3 shrink-0">
                                        <Check className="w-3.5 h-3.5 text-amber-400" />
                                    </div>
                                    <span className="text-sm font-medium">{feature.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        {/* Monthly Option */}
                        <div className="relative group cursor-pointer border border-white/10 hover:border-amber-500/50 rounded-xl p-4 transition-all bg-white/5 hover:bg-white/10">
                            <div className="text-left">
                                <div className="text-sm font-medium text-slate-400 mb-1">Monthly</div>
                                <div className="text-2xl font-bold text-white">$29.99<span className="text-sm text-slate-500 font-normal">/mo</span></div>
                            </div>
                        </div>

                        {/* Annual Option */}
                        <div className="relative group cursor-pointer border-2 border-amber-500 rounded-xl p-4 transition-all bg-gradient-to-br from-amber-500/10 to-transparent">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                                Best Value
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-medium text-amber-200 mb-1">Annual</div>
                                <div className="text-2xl font-bold text-white">$249.99<span className="text-sm text-slate-500 font-normal">/yr</span></div>
                                <div className="text-[10px] text-amber-400 font-bold mt-1">Save 30%</div>
                            </div>
                        </div>
                    </div>

                    <button className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-amber-500/25 transition-all active:scale-[0.98] mb-4">
                        Get Instant Access
                    </button>

                    <p className="text-xs text-slate-500 text-center">
                        Secure processing by Stripe. Cancel anytime.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaywallModal;
