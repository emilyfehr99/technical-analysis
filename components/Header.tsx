import React from 'react';
import { BarChart2 } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="w-full py-6 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-white/20">
      <div className="flex items-center space-x-2">
        <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/20">
            <BarChart2 className="w-5 h-5" />
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-900">TradeSight<span className="text-slate-400">AI</span></span>
      </div>
      
      <nav className="hidden md:flex items-center space-x-6">
        <span className="text-sm font-medium text-slate-500 hover:text-slate-800 cursor-pointer transition-colors">Documentation</span>
        <span className="text-sm font-medium text-slate-500 hover:text-slate-800 cursor-pointer transition-colors">Risk Models</span>
        <button className="text-sm font-semibold bg-slate-900 text-white px-4 py-2 rounded-full hover:bg-slate-800 transition-all shadow-md hover:shadow-lg">
            Connect Broker
        </button>
      </nav>
    </header>
  );
};

export default Header;
