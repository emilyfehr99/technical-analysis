import React from 'react';
import { LineChart, BookOpen, Shield, Wallet, Sun, Moon, Menu, X } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useState } from 'react';

interface HeaderProps {
  onOpenModal: (modal: 'docs' | 'risk' | 'broker') => void;
  onAuth: () => void;
  onPricing: () => void;
  onAdmin: () => void;
  onHome: () => void;
  onGuides: () => void;
  onProfile: () => void; // New prop
  user: any | null;
  usage: { used: number; limit: number; tier: string; activeTrade?: any } | null;
  scansLeft: number;
}

const Header: React.FC<HeaderProps> = ({ onOpenModal, onAuth, onPricing, onAdmin, onHome, onGuides, onProfile, user, usage, scansLeft }) => {
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/70 dark:bg-black/80 border-b border-white/50 dark:border-neutral-800 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

          {/* Brand */}
          <div onClick={onHome} className="flex items-center gap-3 group cursor-pointer hover:opacity-80 transition-opacity">
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

            {/* Admin removed */}

            <button
              onClick={onGuides}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-neutral-800 rounded-full transition-all"
            >
              <BookOpen className="w-4 h-4" />
              Guides
            </button>

            <button
              onClick={() => onOpenModal('docs')}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-neutral-800 rounded-full transition-all"
            >
              <Shield className="w-4 h-4" />
              Docs
            </button>

            {/* ... Risk & Pricing ... */}

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

            {/* Usage Badge (Auth Users) */}
            {usage && usage.tier === 'free' && (
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-neutral-900 rounded-full border border-slate-200 dark:border-neutral-800 ml-2">
                <div className={`w-2 h-2 rounded-full ${usage.used >= usage.limit ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {Math.min(usage.used, usage.limit)} / {usage.limit} <span className="text-slate-400 font-normal">Credits</span>
                </span>
              </div>
            )}

            {/* Scarcity Badge (Anonymous) */}
            {!user && (
              <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-neutral-900 rounded-full border border-slate-200 dark:border-neutral-800 ml-2 animate-fade-in">
                <div className={`w-2 h-2 rounded-full ${scansLeft > 0 ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {scansLeft} Free Scans Left
                </span>
              </div>
            )}

            <button
              onClick={() => {
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
              <button
                onClick={onProfile}
                className="flex items-center gap-2 ml-4 px-4 py-2 bg-slate-100 dark:bg-neutral-900 rounded-full border border-slate-200 dark:border-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer group"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600">Profile</span>
              </button>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

        </div >
      </header >

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-black p-6 flex flex-col animate-in slide-in-from-right duration-200 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <span className="font-bold text-2xl text-slate-900 dark:text-white">Menu</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 -mr-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
          </div>

          <nav className="flex flex-col gap-4 text-lg">

            {/* Theme Toggle Mobile */}
            <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-neutral-800">
              <span className="font-medium text-slate-700 dark:text-slate-200">Appearance</span>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-900 dark:text-white"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>

            {/* Admin removed */}

            {user && (
              <button
                onClick={() => { onProfile(); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-4 py-3 font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                Profile & History
              </button>
            )}

            <button
              onClick={() => { onGuides(); setIsMobileMenuOpen(false); }}
              className="flex items-center gap-4 py-3 font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <BookOpen className="w-6 h-6" />
              Guides
            </button>

            <button
              onClick={() => { onOpenModal('docs'); setIsMobileMenuOpen(false); }}
              className="flex items-center gap-4 py-3 font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Shield className="w-6 h-6" />
              Documentation
            </button>

            <button
              onClick={() => { onOpenModal('risk'); setIsMobileMenuOpen(false); }}
              className="flex items-center gap-4 py-3 font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Shield className="w-6 h-6" />
              Risk Models
            </button>

            <button
              onClick={() => { onPricing(); setIsMobileMenuOpen(false); }}
              className="flex items-center gap-4 py-3 font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Wallet className="w-6 h-6" />
              Pricing
            </button>

            <button
              onClick={() => {
                alert("Feature Requested! Brokerage connection is coming in v2.");
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-4 py-3 font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Wallet className="w-6 h-6" />
              Connect Broker
            </button>

            <hr className="my-2 border-slate-100 dark:border-neutral-800" />

            {!user && (
              <button
                onClick={() => { onAuth(); setIsMobileMenuOpen(false); }}
                className="w-full py-4 mt-2 text-white bg-blue-600 font-bold rounded-xl shadow-lg hover:bg-blue-500 transition-all"
              >
                Sign In
              </button>
            )}

            {/* Mobile Usage Badge */}
            {usage && (
              <div className="mt-4 text-center text-sm text-slate-500 dark:text-slate-500">
                {usage.tier === 'free' ? `${usage.limit - usage.used} credits left` : 'Premium Active'}
              </div>
            )}

          </nav>
        </div>
      )}
    </>
  );
};

export default Header;
