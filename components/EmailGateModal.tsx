import React, { useState } from 'react';
import { Mail, Check, ArrowRight, Lock } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface EmailGateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    imageUrl?: string | null;
}

export const EmailGateModal: React.FC<EmailGateModalProps> = ({ isOpen, onClose, onSuccess, imageUrl }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Track the "Lead" - In a real app we'd save this to a leads table or CRM
        // For now, we simulate a "Unlock" and maybe trigger a "Magic Link" later
        // But per user request, we just "Ask for email -> Show Result"

        // Attempt to stash this email in localStorage so we remember them
        localStorage.setItem('user_email_gate', email);

        // Optional: Fire an event
        // Analytics.trackEvent('lead_captured', { email }); 

        setTimeout(() => {
            setLoading(false);
            onSuccess();
        }, 800);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop with blur to hide the result behind it */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" />

            <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">

                {/* Header Image (Blurry version of their upload?) */}
                <div className="h-32 bg-slate-100 dark:bg-neutral-800 relative overflow-hidden">
                    {imageUrl ? (
                        <img src={imageUrl} className="w-full h-full object-cover opacity-50 blur-sm" />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Lock className="w-12 h-12 text-slate-300 dark:text-neutral-600" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-neutral-900 to-transparent" />
                </div>

                <div className="p-8 pt-2 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-6 -mt-8 relative z-10 border-4 border-white dark:border-neutral-900 shadow-sm">
                        <Check className="w-6 h-6" />
                    </div>

                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Analysis Complete</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">
                        Your institutional validation plan is ready. <br />
                        Enter your email to unlock the full report.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                            <input
                                type="email"
                                required
                                placeholder="trader@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2 group"
                        >
                            {loading ? 'Unlocking...' : 'Reveal My Analysis'}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <p className="mt-6 text-xs text-slate-400">
                        Join 10,000+ traders getting daily alpha. No spam.
                    </p>
                </div>
            </div>
        </div>
    );
};
