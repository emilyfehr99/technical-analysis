import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import AnalysisDashboard from './components/AnalysisDashboard';
import { AnalysisState } from './types';
import { analyzeImage } from './services/geminiService';
import { RefreshCw, Wallet, Sparkles, Search } from 'lucide-react';
import { Modal } from './components/Modal';
import PaywallModal from './components/PaywallModal';

function App() {
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    status: 'idle',
    result: null,
    error: null,
    imageUrl: null,
  });
  const [ticker, setTicker] = useState('');
  const [activeModal, setActiveModal] = useState<'docs' | 'risk' | 'broker' | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [analysisCount, setAnalysisCount] = useState(0);

  useEffect(() => {
    const savedCount = localStorage.getItem('user_analysis_count');
    if (savedCount) {
      setAnalysisCount(parseInt(savedCount, 10));
    }
  }, []);

  const handleFileSelect = (file: File) => {
    // Reset state for new analysis
    setAnalysisState({
      status: 'idle',
      result: null,
      error: null,
      imageUrl: URL.createObjectURL(file)
    });
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
        <Header onOpenModal={setActiveModal} />

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
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
                <div className="relative group w-full max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-bold">$</span>
                  </div>
                  <input
                    type="text"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value.toUpperCase())}
                    placeholder="BTC, AAPL, SPX..."
                    className="w-full pl-8 pr-12 py-4 bg-white border border-slate-200 rounded-2xl text-lg font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={!analysisState.imageUrl || analysisState.status === 'analyzing'}
                  className={`px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2 ${analysisState.imageUrl
                    ? 'bg-blue-600 hover:bg-blue-500 text-white translate-y-0'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                >
                  {analysisState.status === 'analyzing' ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Analyze Chart
                    </>
                  )}
                </button>
              </div>

              {/* File Upload or Preview State */}
              {!analysisState.imageUrl ? (
                <>
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100 mb-4">
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white"></div>
                        <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-white"></div>
                        <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white"></div>
                      </div>
                      <span className="text-xs font-semibold text-slate-600"> Trusted by 10k+ Traders</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                      Instant Technical Analysis. <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                        Powered by AI Motion.
                      </span>
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                      Upload any chart screenshot. Our multi-model AI agent identifies setups, support/resistance, and risk parameters in seconds.
                    </p>
                  </div>

                  <FileUpload
                    onFileSelect={handleFileSelect}
                    isAnalyzing={analysisState.status === 'analyzing'}
                  />
                </>
              ) : (
                <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95">
                  <div className="aspect-video relative rounded-2xl overflow-hidden mb-6 bg-slate-100 border border-slate-200">
                    <img src={analysisState.imageUrl} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                  <div className="space-y-3">
                    <p className="text-center text-slate-500 text-sm">
                      Ready to analyze <strong>{ticker || "this asset"}</strong>?
                    </p>
                    <button
                      onClick={handleAnalyze}
                      disabled={analysisState.status === 'analyzing'}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      {analysisState.status === 'analyzing' ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Run AI Analysis
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleReset}
                      className="w-full py-3 text-slate-500 font-semibold hover:bg-slate-50 rounded-xl transition-colors"
                    >
                      Cancel / Upload Different Chart
                    </button>
                  </div>
                </div>
              )}
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

      {/* --- MODALS --- */}

      {/* 1. DOCUMENTATION */}
      <Modal
        isOpen={activeModal === 'docs'}
        onClose={() => setActiveModal(null)}
        title="Documentation & Usage"
      >
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-600">
            TradeSight AI combines <strong>Computer Vision (Gemini 2.5)</strong> with <strong>Hard Mathematical Indicators</strong> (MACD, RSI from Yahoo Finance) to give you an institutional-grade validation of your chart setup.
          </p>
          <h4>How to Use</h4>
          <ol>
            <li><strong>Enter Ticker</strong>: Type user ticker (e.g. <code>BTC-USD</code>) for accurate ground-truth data.</li>
            <li><strong>Upload Chart</strong>: Take a screenshot of your TradingView chart. Ensure price axes are visible.</li>
            <li><strong>Analyze</strong>: The AI will identify patterns, key levels, and generate a 3-scenario trade plan.</li>
          </ol>
          <h4>Indicators Supported</h4>
          <ul>
            <li><strong>MACD (12, 26, 9)</strong>: For trend direction and momentum.</li>
            <li><strong>Williams Alligator</strong>: For sleeping/awakening trends.</li>
            <li><strong>RSI (14)</strong>: For overbought/oversold conditions.</li>
          </ul>
        </div>
      </Modal>

      {/* 2. RISK MODELS (Calculator) */}
      <Modal
        isOpen={activeModal === 'risk'}
        onClose={() => setActiveModal(null)}
        title="Position Size Calculator"
      >
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 text-sm">
            <strong>Standard Risk Protocol:</strong> Never risk more than 1-2% of your account on a single trade.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Account Balance ($)</label>
              <input type="number" placeholder="10000" className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Risk per Trade (%)</label>
              <input type="number" placeholder="1.0" className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Entry Price</label>
              <input type="number" placeholder="0.00" className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stop Loss Price</label>
              <input type="number" placeholder="0.00" className="w-full p-2 border rounded-lg" />
            </div>
          </div>

          <button className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl mt-4">
            Calculate Max Position Size
          </button>

          {/* Result Placeholder */}
          <div className="mt-4 p-4 bg-slate-100 rounded-xl text-center">
            <p className="text-sm text-slate-500">Result will appear here...</p>
          </div>
        </div>
      </Modal>

      {/* 3. CONNECT BROKER */}
      <Modal
        isOpen={activeModal === 'broker'}
        onClose={() => setActiveModal(null)}
        title="Connect Brokerage"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {['Binance', 'Coinbase', 'Kraken', 'Alpaca', 'MetaTrader 5'].map((broker) => (
            <button key={broker} className="flex items-center p-4 border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all group">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mr-4 group-hover:bg-blue-100 text-slate-500 group-hover:text-blue-600">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="font-semibold text-slate-700">{broker}</span>
            </button>
          ))}
        </div>
      </Modal>

    </div>
  );
}

export default App;