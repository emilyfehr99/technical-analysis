import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import AnalysisDashboard from './components/AnalysisDashboard';
import { AnalysisState, AnalysisResult, TradeAction } from './types';
import { analyzeChart } from './services/geminiService';
import { RefreshCw, Wallet, Sparkles, Search, Shield, LineChart } from 'lucide-react';
import { Modal } from './components/Modal';
import PaywallModal from './components/PaywallModal';
import { AuthModal } from './components/AuthModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { supabase } from './lib/supabaseClient';
import { Analytics } from './lib/analytics';
import { Testimonials } from './components/Testimonials';

import { Guides } from './components/Guides';

import { EmailGateModal } from './components/EmailGateModal';

// Init Scans on Mount (Helper, but actually needs to be inside component or global constant, let's put inside)

function App() {
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    status: 'idle',
    result: null,
    error: null,
    imageUrl: null,
    isDemo: false
  });
  const [manualTicker, setManualTicker] = useState<string>(''); // For confidence boost
  const [activeModal, setActiveModal] = useState<'docs' | 'risk' | 'broker' | 'auth' | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'guides'>('home');
  const [showPaywall, setShowPaywall] = useState(false);
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [hasUnlocked, setHasUnlocked] = useState(false);

  // Free Scan Count
  const [scansLeft, setScansLeft] = useState<number>(3); // Default 3 (Visual)

  // Random traders count (5-30)
  const [tradersCount] = useState<number>(() => Math.floor(Math.random() * 26) + 5);

  useEffect(() => {
    // Use v2 key to ensure all users get a fresh set of 3 scans
    const stored = localStorage.getItem('kairos_scan_limit_v2');
    if (stored) {
      setScansLeft(parseInt(stored));
    } else {
      localStorage.setItem('kairos_scan_limit_v2', '3'); // Fresh Start
    }

    // Admin Opt-Out via URL
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('admin_opt_out') === 'true') {
      localStorage.setItem('kairos_opt_out', 'true');
      alert('Admin Optimization Enabled: Your traffic is now hidden from analytics.');
    }
  }, []);

  // Auth State
  const [session, setSession] = useState<any>(null);
  const [usage, setUsage] = useState<{ used: number; limit: number; tier: string } | null>(null);

  const fetchUsage = async () => {
    try {
      const headers: Record<string, string> = {};
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;

        // Admin Check REMOVED
      }

      const res = await fetch('/api/status', { headers });
      if (res.ok) {
        const data = await res.json();
        setUsage(data);
      }
    } catch (e) {
      console.error("Failed to fetch usage", e);
    }
  };

  useEffect(() => {
    // Initialize Analytics
    Analytics.initSession().then(() => {
      Analytics.trackPageView('/home');
    });

    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUsage(); // Fetch usage on load
    });

    // 2. Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        // Re-fetch usage and admin status when session changes
        fetchUsage();
      } else {
        setUsage(null);
      }
    });

    // Global Paste Listener
    const handleGlobalPaste = (e: ClipboardEvent) => {
      if (analysisState.status === 'analyzing') return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault(); // Prevent default only if we found and handled an image
            setAnalysisState(prev => ({
              ...prev,
              status: 'idle',
              error: null,
              imageUrl: URL.createObjectURL(file),
              isDemo: false // EXPLICTLY RESET DEMO STATE
            }));

            // Also reset Gate for new analysis
            setHasUnlocked(false);
            return;
          }
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => {
      subscription.unsubscribe(); // Unsubscribe from auth changes
      window.removeEventListener('paste', handleGlobalPaste); // Clean up paste listener
    };
  }, [analysisState.status]); // Keep analysisState.status for paste listener re-evaluation

  const handleFileSelect = (file: File) => {
    // Reset state for new analysis
    setAnalysisState({
      status: 'idle',
      result: null,
      error: null,
      imageUrl: URL.createObjectURL(file),
      isDemo: false // EXPLICITLY RESET DEMO STATE
    });
    setHasUnlocked(false); // Reset Gate
    // Track Upload
    Analytics.trackEvent('upload_chart_select', { fileName: file.name, type: file.type });
  };

  const handleReset = () => {
    setAnalysisState({
      status: 'idle',
      result: null,
      error: null,
      imageUrl: null,
    });
    setManualTicker(''); // clear ticker
  };

  // STATIC DEMO DATA (INSTANT LOAD)
  const STATIC_DEMO_RESULTS: Record<string, AnalysisResult> = {
    'BTC': {
      action: TradeAction.SELL,
      confidenceScore: 89,
      asset: 'Bitcoin (BTC/USD)',
      currentPrice: '$42,105',
      timeframe: '4H',
      headline: 'Bear Flag Confirmed: Downside Likely',
      reasoning: 'Price has broken down from a consolidation pattern with increasing sell volume. The text-book bear flag suggests a continuation of the downtrend.',
      technicalAnalysis: {
        macd: 'Bearish Crossover',
        alligator: 'Mouth Open Down',
        trend: 'BEARISH'
      },
      keyLevels: {
        support: ['$40,500', '$38,200'],
        resistance: ['$43,000', '$44,500']
      },
      setup: {
        entryZone: '$42,000 - $42,300',
        stopLoss: '$43,500',
        takeProfitTargets: ['$40,500', '$38,800']
      },
      risk: {
        riskToRewardRatio: '1:2.8',
        suggestedPositionSize: '2%',
        activeRiskParameters: 'High Volatility'
      },
      pattern: {
        name: 'Bear Flag',
        type: 'CONTINUATION',
        confidence: 92
      },
      validationChecklist: [
        { label: 'Volume Confirmation', passed: true },
        { label: 'Trend Alignment', passed: true },
        { label: ' Momentum Bearish', passed: true }
      ],
      tradeHorizon: 'Intraday (6-12h)',
      marketCondition: 'TRENDING',
      scenarios: [
        { name: 'base', probability: 75, priceTarget: '$38,200', description: 'Continuation of impulsive move down.' },
        { name: 'bull', probability: 25, priceTarget: '$44,000', description: 'False breakdown and reversal.' }
      ] as any, // Type cast for loose scenario matching if strict
      tradeRadar: []
    },
    'NVDA': {
      action: TradeAction.BUY,
      confidenceScore: 94,
      asset: 'NVIDIA (NVDA)',
      currentPrice: '$895.20',
      timeframe: 'Daily',
      headline: 'Ascending Triangle Breakout',
      reasoning: 'Clear breakout above key resistance at $890 on high volume. Institutional accumulation detected.',
      technicalAnalysis: {
        macd: 'Bullish Expansion',
        alligator: 'Feeding (Strong Trend)',
        trend: 'BULLISH'
      },
      keyLevels: {
        support: ['$880', '$850'],
        resistance: ['$920', '$950']
      },
      setup: {
        entryZone: '$890 - $900',
        stopLoss: '$875',
        takeProfitTargets: ['$950', '$1000']
      },
      risk: {
        riskToRewardRatio: '1:4',
        suggestedPositionSize: '3%',
        activeRiskParameters: 'Trend Continuation'
      },
      pattern: {
        name: 'Ascending Triangle',
        type: 'CONTINUATION',
        confidence: 96
      },
      validationChecklist: [
        { label: 'Volume Breakout', passed: true },
        { label: ' RSI Not Overbought', passed: true }
      ],
      tradeHorizon: 'Swing (3-10 Days)',
      marketCondition: 'TRENDING',
      scenarios: [
        { name: 'base', probability: 80, priceTarget: '$950', description: 'Measured move to psychological resistance.' },
        { name: 'bear', probability: 20, priceTarget: '$850', description: 'Failed breakout / Fakeout.' }
      ] as any,
      tradeRadar: []
    },
    'SPY': {
      action: TradeAction.WAIT,
      confidenceScore: 65,
      asset: 'S&P 500 ETF (SPY)',
      currentPrice: '$510.15',
      timeframe: '1H',
      headline: 'Choppy Consolidation near ATH',
      reasoning: 'Market is indecisive waiting for CPI data. No clear edge until range breaks.',
      technicalAnalysis: {
        macd: 'Flat / Whipsaw',
        alligator: 'Sleeping',
        trend: 'NEUTRAL'
      },
      keyLevels: {
        support: ['$508', '$505'],
        resistance: ['$512', '$515']
      },
      setup: {
        entryZone: 'WAIT',
        stopLoss: 'N/A',
        takeProfitTargets: []
      },
      risk: {
        riskToRewardRatio: '0:0',
        suggestedPositionSize: '0%',
        activeRiskParameters: 'Event Risk'
      },
      pattern: {
        name: 'Rectangle Range',
        type: 'INDECISION',
        confidence: 70
      },
      validationChecklist: [
        { label: 'Volume Low', passed: true }
      ],
      tradeHorizon: 'N/A',
      marketCondition: 'RANGING',
      scenarios: [
        { name: 'base', probability: 50, priceTarget: '$515', description: 'Range rotation up.' },
        { name: 'bear', probability: 50, priceTarget: '$508', description: 'Range rotation down.' }
      ] as any,
      tradeRadar: []
    }
  };

  const handleDemoAnalysis = async (type: 'BTC' | 'NVDA' | 'SPY' = 'BTC') => {
    // 1. Track Click Immediately
    Analytics.trackEvent('click_demo_mode', { asset: type });

    try {
      // INSTANT LOAD - No Fetch
      const filenameMap: Record<string, string> = {
        'BTC': '/demo-btc.png',
        'NVDA': '/demo-nvda.png',
        'SPY': '/demo-spy.png'
      };

      const imageUrl = filenameMap[type] || '/demo-chart.png';
      const staticResult = STATIC_DEMO_RESULTS[type];

      // Set State IMMEDIATELY with Success
      setAnalysisState({
        status: 'success',
        result: staticResult,
        error: null,
        imageUrl: imageUrl, // Uses public path directly
        isDemo: true
      });

      // Unlock gate immediately for demo
      setHasUnlocked(true);

    } catch (e) {
      console.error("Demo load failed", e);
    }
  };

  const handleAnalyze = async (autoImageUrl?: string, isDemoRun: boolean = false) => {
    // Input Source: Arg or State
    const activeImageUrl = autoImageUrl || analysisState.imageUrl;

    if (!activeImageUrl) return;

    // DEBUG LOGGING
    console.log("=== HANDLE ANALYZE DEBUG ===");
    console.log("activeImageUrl:", activeImageUrl);
    console.log("isDemoRun:", isDemoRun);
    console.log("prev.isDemo:", analysisState.isDemo);
    console.log("============================");

    // Sunk Cost Trigger: Update state to 'analyzing'
    setAnalysisState(prev => ({
      ...prev,
      status: 'analyzing',
      error: null,
      imageUrl: activeImageUrl,
      isDemo: isDemoRun // ONLY use the parameter, NOT prev.isDemo
    }));

    try {
      let base64Data: string | null = null;
      let mimeType = 'image/png';

      // 1. Convert activeImageUrl to base64
      console.log("Fetching image from:", activeImageUrl);
      const response = await fetch(activeImageUrl);
      const blob = await response.blob();
      console.log("Blob size:", blob.size, "type:", blob.type);

      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      base64Data = (base64 as string).split(',')[1];
      mimeType = blob.type;

      // 3. Send to API
      // Pass token if we have one
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      // Payload 
      const payload = {
        image: base64Data,
        mimeType,
        symbol: manualTicker || null, // Pass manual ticker if user typed it
        isDemo: isDemoRun // ONLY use the parameter, NOT prev.isDemo
      };

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.status === 403 && data.error === 'LIMIT_REACHED') {
        setAnalysisState(prev => ({ ...prev, status: 'idle' }));
        setShowPaywall(true);
        return;
      }

      if (!res.ok) {
        const errorMsg = data.details ? `${data.error}: ${data.details}` : (data.error || 'Analysis failed');
        throw new Error(errorMsg);
      }

      // SUCCESS!
      const result = data;

      setAnalysisState(prev => ({
        ...prev,
        status: 'success',
        result
      }));

      // Usage Logic
      console.log("Checking Usage. Session:", session);

      if (session?.user) {
        setHasUnlocked(true);
        fetchUsage();
      } else {
        const currentStored = localStorage.getItem('kairos_scan_limit_v2');
        const scansLeft = parseInt(currentStored || '3');
        console.log("Anon Usage. Stored:", currentStored, "Parsed:", scansLeft);

        if (scansLeft > 0) {
          const newVal = scansLeft - 1;
          console.log("Decrementing to:", newVal);
          setScansLeft(newVal);
          localStorage.setItem('kairos_scan_limit_v2', newVal.toString());
          setHasUnlocked(true);
        } else {
          console.log("Limit reached. Gating.");
          if (!hasUnlocked) {
            // Replaced Email Gate with Paywall (Pricing) per user request
            setShowPaywall(true);
          }
        }
      }

    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to analyze chart'
      }));
    }
  };



  return (
    <div className="min-h-screen w-full relative bg-[#F5F5F7] dark:bg-black text-slate-900 dark:text-neutral-200 transition-colors duration-300">

      {/* Background Gradients for Subtle Depth */}
      {/* Background Gradients for Subtle Depth - Desaturated/Darkened for "Pure Black" feel */}
      <div className="hidden dark:block fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header
          onOpenModal={setActiveModal}
          onAuth={() => {
            Analytics.trackEvent('click_auth_header');
            setActiveModal('auth');
          }}
          onPricing={() => {
            Analytics.trackEvent('click_pricing_header');
            setShowPaywall(true);
          }}
          onAdmin={() => { }}
          onHome={() => setCurrentView('home')}
          onGuides={() => setCurrentView('guides')}
          user={session?.user}
          // isAdmin={isAdmin}
          usage={usage}
          scansLeft={scansLeft}
        />

        {/* Active Simulated Trade Banner */}
        {usage?.activeTrade && (
          <div className="bg-blue-600 text-white text-center py-2 px-4 text-sm font-semibold animate-in slide-in-from-top-4">
            🤖 SIMULATED TRADE ACTIVE: <span className="text-blue-100">{usage.activeTrade.direction} {usage.activeTrade.asset_symbol}</span> @ ${usage.activeTrade.entry_price} (Status: {usage.activeTrade.status})
          </div>
        )}

        <main className="flex-grow p-6 md:p-12 max-w-7xl mx-auto w-full">

          {/* NEW: Sunk Cost / Email Gate Modal */}
          <EmailGateModal
            isOpen={showEmailGate}
            imageUrl={analysisState.imageUrl}
            onClose={() => setShowEmailGate(false)} // Prevent closing without email? User said "Ask for email". Let's allow close but not show result? Nah, standard gate.
            onSuccess={() => {
              setShowEmailGate(false);
              // Set flag to show result
              setHasUnlocked(true);
            }}
          />

          {currentView === 'guides' ? (
            <Guides onBack={() => setCurrentView('home')} />
          ) : (
            <>
              {/* Refactored Hero Section */}
              {analysisState.status === 'idle' && !analysisState.imageUrl && (
                <div className="text-center mb-10 mt-6 space-y-6 animate-fade-in-up">
                  {/* Headline Change */}
                  <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-[1.05] drop-shadow-sm">
                    Roast My Chart.
                  </h1>

                  <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
                    Paste a tradingview chart to see if you're about to <span className="text-red-500 font-bold">lose money</span>.
                  </p>

                  {/* PSYCHOLOGY: Social Proof & Trust */}
                  <div className="flex flex-col items-center gap-4 mt-8 animate-fade-in">
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-green-600 dark:text-green-400 text-sm font-bold">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      {tradersCount} traders analyzing right now
                    </div>

                    <div className="flex items-center gap-6 text-sm text-slate-400 dark:text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Shield className="w-4 h-4" /> Bank-Grade Security
                      </span>
                      <span className="flex items-center gap-1.5">
                        <LineChart className="w-4 h-4" /> Real-Time Data verification
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Section */}
              {analysisState.status !== 'success' && (
                <div className="space-y-6 max-w-2xl mx-auto">

                  {/* File Upload Hero */}
                  {!analysisState.imageUrl ? (
                    <>

                      {/* 3 "Pre-Loaded" TRUST BUILDER Demos */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                        <button onClick={() => handleDemoAnalysis('NVDA')} className="flex flex-col items-center p-4 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all group">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Breakout</span>
                          <span className="font-bold text-slate-800 dark:text-white group-hover:text-blue-500 transition-colors">$NVDA Setup</span>
                        </button>
                        <button onClick={() => handleDemoAnalysis('BTC')} className="flex flex-col items-center p-4 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl hover:border-red-500 dark:hover:border-red-500 hover:shadow-md transition-all group">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Warning</span>
                          <span className="font-bold text-slate-800 dark:text-white group-hover:text-red-500 transition-colors">$BTC Crash</span>
                        </button>
                        <button onClick={() => handleDemoAnalysis('SPY')} className="flex flex-col items-center p-4 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl hover:border-green-500 dark:hover:border-green-500 hover:shadow-md transition-all group">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Reversal</span>
                          <span className="font-bold text-slate-800 dark:text-white group-hover:text-green-500 transition-colors">$SPY Dip Buy</span>
                        </button>
                      </div>
                      {/* Optional Ticker Input - Confidence Booster */}
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                          type="text"
                          placeholder="Enter Ticker (Optional - Increases Accuracy)"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-mono uppercase tracking-wider text-slate-700 dark:text-slate-200"
                          value={manualTicker}
                          onChange={(e) => setManualTicker(e.target.value.toUpperCase())}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <span className="text-xs text-green-500 font-medium px-2 py-1 bg-green-500/10 rounded-md opacity-0 group-focus-within:opacity-100 transition-opacity">
                            +30% Confidence
                          </span>
                        </div>
                      </div>

                      <FileUpload
                        onFileSelect={handleFileSelect}
                        isAnalyzing={false}
                      />

                    </>
                  ) : (
                    /* Preview State - (If they uploaded but haven't analyzed yet. 
                       BUT: User wanted "Paste -> Immediately start loading". 
                       If they Paste, handleGlobalPaste sets ImageUrl. 
                       We should probably auto-trigger analyze in useEffect if it came from paste?
                       Let's keep the button for now as "Confirmation" is often safer, 
                       or update handleGlobalPaste to set status: 'analyzing' directly?
                       User said: "If they paste an image, IMMEDIATELY start the loading animation."
                       I will update handleGlobalPaste logic for that.) */
                    <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95">
                      <div className="aspect-video relative rounded-2xl overflow-hidden mb-6 bg-slate-100 border border-slate-200">
                        <img src={analysisState.imageUrl} alt="Preview" className="w-full h-full object-contain" />
                      </div>
                      <div className="space-y-3">
                        <button
                          onClick={() => handleAnalyze()}
                          disabled={analysisState.status === 'analyzing'}
                          className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                          {analysisState.status === 'analyzing' ? (
                            <>
                              <RefreshCw className="w-5 h-5 animate-spin" />
                              Analyzing{manualTicker ? ` [${manualTicker}]` : ''}...
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
                          Cancel / Upload Different
                        </button>

                        {/* Risk Reversal */}
                        <p className="text-xs text-center text-slate-400 mt-2">
                          100% Free • No Credit Card Required • Instant Result
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Social Proof (Testimonials) */}
              {analysisState.status === 'idle' && !analysisState.imageUrl && (
                <Testimonials />
              )}

              {/* Error State */}
              {analysisState.status === 'error' && (
                <div className="max-w-xl mx-auto mt-8 p-6 bg-white/80 backdrop-blur-md border border-red-100 rounded-3xl text-center shadow-lg animate-shake">
                  {/* ... error content ... */}
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

              {/* Success / Dashboard State - GATED */}
              {analysisState.status === 'success' && analysisState.result && hasUnlocked && (
                <div className="relative animate-fade-in-up">
                  {/* Context Bar: Image Preview + Reset */}
                  <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-200/60">
                    <div className="flex items-center gap-6">
                      {analysisState.imageUrl && (
                        <div className="relative group cursor-pointer">
                          <img
                            src={analysisState.imageUrl}
                            alt="Chart Preview"
                            className="relative w-28 h-20 object-cover rounded-2xl border-2 border-white shadow-md"
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

                  <ErrorBoundary>
                    <AnalysisDashboard data={analysisState.result} />
                  </ErrorBoundary>
                </div>
              )}
            </>
          )}

        </main>
      </div>

      {/* --- MODALS --- */}

      {/* 1. DOCUMENTATION */}
      <Modal
        isOpen={activeModal === 'docs'}
        onClose={() => setActiveModal(null)}
        title="Documentation & Usage"
      >
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-600">
            Kairos.AI combines <strong>Computer Vision (Gemini 2.5)</strong> with <strong>Hard Mathematical Indicators</strong> (MACD, RSI from Yahoo Finance) to give you an institutional-grade validation of your chart setup.
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

      {/* 4. AUTH & PAYWALL */}
      <AuthModal
        isOpen={activeModal === 'auth'}
        onClose={() => setActiveModal(null)}
        onSuccess={() => { }} // Handled by listener
      />



      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onAuth={() => {
          setShowPaywall(false);
          setActiveModal('auth');
        }}

        isLoggedIn={!!session?.user}
        usage={usage}
      />

    </div >
  );
}

export default App;