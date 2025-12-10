import React, { useState } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import AnalysisDashboard from './components/AnalysisDashboard';
import { AnalysisState } from './types';
import { analyzeChart } from './services/geminiService';
import { RefreshCw } from 'lucide-react';

function App() {
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    status: 'idle',
    result: null,
    error: null,
    imageUrl: null,
  });
  const [ticker, setTicker] = useState('');

  const handleFileSelect = async (base64: string, mimeType: string) => {
    // Set loading state and store preview image
    setAnalysisState(prev => ({
      ...prev,
      status: 'analyzing',
      error: null,
      imageUrl: `data:${mimeType};base64,${base64}`
    }));

    try {
      const result = await analyzeChart(base64, mimeType, ticker);
      setAnalysisState(prev => ({
        ...prev,
        status: 'success',
        result: result,
      }));
    } catch (err) {
      setAnalysisState(prev => ({
        ...prev,
        status: 'error',
        error: "Failed to analyze the chart. Please ensure the image is clear and try again.",
      }));
    }
  };

  const handleReset = () => {
    setAnalysisState({
      status: 'idle',
      result: null,
      error: null,
      imageUrl: null,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F7] relative overflow-x-hidden selection:bg-blue-500/30">

      {/* Background Gradients for Subtle Depth */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-indigo-100/40 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-grow p-6 md:p-12 max-w-7xl mx-auto w-full">

          {/* Intro Text - Only show when idle */}
          {analysisState.status === 'idle' && (
            <div className="text-center mb-12 mt-10 space-y-4 animate-fade-in-up">
              <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                Institutional <br className="md:hidden" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Technical Intelligence</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium">
                Upload your trading setup. Receive an institutional-grade validation plan, risk protocol, and execution targets in seconds.
              </p>
            </div>
          )}

          {/* Upload Section - Always show if not success, or if we want to allow re-upload (could hide on success) */}
          {analysisState.status !== 'success' && (
            <div className="space-y-6 max-w-xl mx-auto">
              <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-white/50 animate-fade-in-up">
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Asset Ticker (Crypto/Stocks)</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. BTC/USDT, ETH/USDT"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value.toUpperCase())}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-slate-800 placeholder:text-slate-400"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2 ml-1">Enter symbol to fetch real-time MACD & Alligator data from Taapi.io.</p>
              </div>

              <FileUpload
                onFileSelect={handleFileSelect}
                isAnalyzing={analysisState.status === 'analyzing'}
              />
            </div>
          )}

          {/* Error State */}
          {analysisState.status === 'error' && (
            <div className="max-w-xl mx-auto mt-8 p-6 bg-white/80 backdrop-blur-md border border-red-100 rounded-3xl text-center shadow-lg animate-shake">
              <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Analysis Failed</h3>
              <p className="text-slate-500 mb-6">{analysisState.error}</p>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Success / Dashboard State */}
          {analysisState.status === 'success' && analysisState.result && (
            <div className="relative animate-fade-in-up">
              {/* Context Bar: Image Preview + Reset */}
              <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-200/60">
                <div className="flex items-center gap-6">
                  {analysisState.imageUrl && (
                    <div className="relative group cursor-pointer">
                      <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                      <img
                        src={analysisState.imageUrl}
                        alt="Chart Preview"
                        className="relative w-28 h-20 object-cover rounded-2xl border-2 border-white shadow-md transition-transform hover:scale-105"
                      />
                    </div>
                  )}
                </div>

                <button
                  onClick={handleReset}
                  className="flex items-center px-5 py-2.5 bg-white border border-slate-200 shadow-sm rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all hover:shadow-md"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  New Analysis
                </button>
              </div>

              <AnalysisDashboard data={analysisState.result} />
            </div>
          )}

        </main>
      </div>

      <footer className="relative z-10 text-center py-8 text-slate-400 text-sm">
        <p className="font-medium tracking-wide">© {new Date().getFullYear()} TradeSight AI</p>
      </footer>
    </div>
  );
}

export default App;