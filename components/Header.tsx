import React from 'react';
import { LineChart, BookOpen, Shield, Wallet } from 'lucide-react';

interface HeaderProps {
  onOpenModal: (modal: 'docs' | 'risk' | 'broker') => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenModal }) => {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/70 border-b border-white/50 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        {/* Brand */}
        <div className="flex items-center gap-3 group cursor-pointer hover:opacity-80 transition-opacity">
          <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
            <LineChart className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">TradeSight<span className="text-blue-600">.ai</span></span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => onOpenModal('docs')}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-full transition-all"
          >
            <BookOpen className="w-4 h-4" />
            Documentation
          </button>

          <button
            onClick={() => onOpenModal('risk')}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-full transition-all"
          >
            <Shield className="w-4 h-4" />
            Risk Models
          </button>

          <button
            onClick={() => onOpenModal('broker')}
            className="flex items-center gap-2 px-5 py-2.5 ml-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <Wallet className="w-4 h-4" />
            Connect Broker
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
