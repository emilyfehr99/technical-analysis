import React from 'react';
import { Sparkles, Check, Zap, Shield, BrainCircuit, Lock, Star, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface PaywallModalProps {
    isOpen: boolean;
    onClose?: () => void;
}

const PaywallModal: React.FC<PaywallModalProps> = ({ isOpen, onClose, onAuth, isLoggedIn }) => {
    if (!isOpen) return null;

    const features = [
        { icon: <Zap className="w-5 h-5 text-blue-600" />, text: "Unlimited AI Technical Analysis" },
        { icon: <BrainCircuit className="w-5 h-5 text-purple-600" />, text: "Advanced Pattern Recognition Models" },
        { icon: <Shield className="w-5 h-5 text-emerald-600" />, text: "Institutional-Grade Risk Engine" },
        { icon: <Sparkles className="w-5 h-5 text-amber-500" />, text: "Real-Time Trade Scenarios" },
    ];

    const [selectedPlan, setSelectedPlan] = React.useState<'monthly' | 'annual'>('annual');
    const [email, setEmail] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [isJoined, setIsJoined] = React.useState(false);


    const handleSubscribe = async () => {
        setLoading(true);
        try {
            // Call Backend to get Stripe URL
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    plan: selectedPlan,
                    email: email || undefined // Send if we have it
                }),
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error(data.error || 'Failed to initiate checkout');
            }
        } catch (error) {
            console.error('Checkout failed:', error);
            alert('Checkout initialization failed. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col md:flex-row">
                {onClose && (
                    <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                )}

                {/* Left Side: Value Prop (Visual) */}
                <div className="w-full md:w-2/5 bg-slate-900 p-8 md:p-12 relative overflow-hidden flex flex-col justify-between text-white">
                    {/* Background FX */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/30 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/30 rounded-full blur-[80px] -ml-16 -mb-16 pointer-events-none"></div>

                    <div className="relative z-10">
                        {/* Access Status Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/50 rounded-full mb-6">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            <span className="text-xs font-bold text-red-400 tracking-wide uppercase">Free Limit Reached (3/3)</span>
                        </div>

                        <h2 className="text-3xl font-bold tracking-tight mb-4 leading-tight">
                            Trade like an <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Institution</span>.
                        </h2>
                        <p className="text-slate-400 leading-relaxed">
                            You've exhausted your free trial. Upgrade to continue discovering high-probability setups with Unlimited AI.
                        </p>
                    </div>

                    <div className="relative z-10 mt-8 space-y-4">
                        {features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center backdrop-blur-sm border border-white/10">
                                    {React.cloneElement(feature.icon as React.ReactElement, { className: "w-4 h-4" })}
                                </div>
                                <span className="text-sm font-medium text-slate-200">{feature.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Pricing / Waitlist */}
                <div className="w-full md:w-3/5 p-8 md:p-12 bg-white">
                    {!isJoined ? (
                        <>
                            <div className="text-center md:text-left mb-8">
                                <h3 className="text-2xl font-bold text-slate-900">Choose Your Plan</h3>
                                <p className="text-slate-500 mt-2">Unlock institutional-grade analysis for all valid assets.</p>
                            </div>

                            <div className="space-y-4">
                                {/* Plan Selection (Visual only now) */}
                                <div
                                    onClick={() => setSelectedPlan('monthly')}
                                    className={`group relative p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between
                                        ${selectedPlan === 'monthly' ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-slate-100 hover:border-blue-500 hover:bg-blue-50/30'}
                                    `}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                                            ${selectedPlan === 'monthly' ? 'border-blue-600 bg-blue-600' : 'border-slate-300 group-hover:border-blue-500'}
                                        `}>
                                            {selectedPlan === 'monthly' && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900">Monthly</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-slate-900">CA$39.99</div>
                                    </div>
                                </div>

                                <div
                                    onClick={() => setSelectedPlan('annual')}
                                    className={`group relative p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between shadow-sm
                                        ${selectedPlan === 'annual' ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-slate-100 hover:border-blue-500 hover:bg-blue-50/30'}
                                    `}
                                >
                                    <div className="absolute -top-3 right-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                                        SAVE 30%
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-5 h-5 rounded-full border-[5px] transition-colors
                                            ${selectedPlan === 'annual' ? 'border-blue-600 bg-white' : 'border-slate-300 bg-white group-hover:border-blue-500'}
                                        `}></div>
                                        <div>
                                            <div className="font-bold text-slate-900">Annual</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-slate-900">CA$29.17</div>
                                        <div className="text-xs text-slate-500 font-medium">/mo</div>
                                    </div>
                                </div>
                            </div>

                            {/* Email Input (Optional for Checkout) */}
                            {/* Email Input Removed per user request */}

                            <button
                                onClick={handleSubscribe}
                                disabled={loading}
                                className="w-full mt-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-blue-600 hover:to-indigo-600 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {loading ? 'Redirecting to Stripe...' : `Upgrade to ${selectedPlan === 'monthly' ? 'Monthly' : 'Annual'}`}
                                <ChevronRight className="w-5 h-5" />
                            </button>

                            <p className="text-center text-xs text-slate-400 mt-4">
                                Secure payment via Stripe. Cancel anytime.
                            </p>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4">
                            {/* This state is reached theoretically after success, but Stripe redirects externally. 
                                We keep this just in case we handle success via params later. */}
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                <Check className="w-10 h-10" strokeWidth={3} />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 mb-2">Success!</h3>
                            <button
                                onClick={onClose}
                                className="mt-8 text-slate-500 font-semibold hover:text-slate-900 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaywallModal;
