import React from 'react';
import { LineChart, BookOpen, Shield, Wallet, Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface HeaderProps {
  onOpenModal: (modal: 'docs' | 'risk' | 'broker') => void;
  onAuth: () => void;
  onPricing: () => void;
  user: any | null;
  usage: { used: number; limit: number; tier: string } | null;
}

const Header: React.FC<HeaderProps> = ({ onOpenModal, onAuth, onPricing, user, usage }) => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/70 dark:bg-black/80 border-b border-white/50 dark:border-neutral-800 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        {/* Brand */}
        <div className="flex items-center gap-3 group cursor-pointer hover:opacity-80 transition-opacity">
          <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
            <LineChart className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">Kairos<span className="text-blue-600">.AI</span></span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 rounded-full text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-all mr-2"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button
            onClick={() => onOpenModal('docs')}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-neutral-800 rounded-full transition-all"
          >
            <BookOpen className="w-4 h-4" />
            Documentation
          </button>

          {/* ... Risk & Pricing (Skipping middle repetitive updates for brevity, focus on dark mode classes for them if needed) ... */}

          <button
            onClick={() => onOpenModal('risk')}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-neutral-800 rounded-full transition-all"
          >
            <Shield className="w-4 h-4" />
            Risk Models
          </button>

          <button
            onClick={onPricing}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-neutral-800 rounded-full transition-all"
          >
            <Wallet className="w-4 h-4" />
            Pricing
          </button>

          {/* Usage Badge */}
          {usage && usage.tier === 'free' && (
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-neutral-900 rounded-full border border-slate-200 dark:border-neutral-800 ml-2">
              <div className={`w-2 h-2 rounded-full ${usage.used >= 3 ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {Math.min(usage.used, usage.limit)} / {usage.limit} <span className="text-slate-400 font-normal">Credits</span>
              </span>
            </div>
          )}

          <button
            onClick={() => {
              // Feature Request Logic
              alert("Feature Requested! Brokerage connection is coming in v2.");
            }}
            className="flex items-center gap-2 px-5 py-2.5 ml-2 text-sm font-bold text-white bg-slate-900 dark:bg-white dark:text-black hover:bg-slate-800 dark:hover:bg-neutral-200 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <Wallet className="w-4 h-4" />
            Connect Broker
          </button>

          {!user ? (
            <button
              onClick={onAuth}
              className="flex items-center gap-2 px-5 py-2.5 ml-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              Sign In
            </button>
          ) : (
            <div className="flex items-center gap-2 ml-4 px-4 py-2 bg-slate-100 dark:bg-neutral-900 rounded-full border border-slate-200 dark:border-neutral-800">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Welcome</span>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
