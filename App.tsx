import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import AnalysisDashboard from './components/AnalysisDashboard';
import SafeAdminDashboard from './components/AdminDashboard';
import { AnalysisState } from './types';
import { analyzeChart } from './services/geminiService';
import { RefreshCw, Wallet, Sparkles, Search } from 'lucide-react';
import { Modal } from './components/Modal';
import PaywallModal from './components/PaywallModal';
import { AuthModal } from './components/AuthModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { supabase } from './lib/supabaseClient';
import { Analytics } from './lib/analytics';

function App() {
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    status: 'idle',
    result: null,
    error: null,
    imageUrl: null,
    isDemo: false
  });
  const [activeModal, setActiveModal] = useState<'docs' | 'risk' | 'broker' | 'auth' | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'admin'>('home');
  const [showPaywall, setShowPaywall] = useState(false);

  // Auth State
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [usage, setUsage] = useState<{ used: number; limit: number; tier: string } | null>(null);

  const fetchUsage = async () => {
    try {
      const headers: Record<string, string> = {};
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;

        // Fetch Admin Status
        console.log("Checking admin status for:", session.user.email);

        // 1. Hardcoded Bypass (for debugging/recovery)
        const normalize = (s: string) => s?.trim().toLowerCase();
        if (normalize(session.user.email) === normalize('8emilyfehr@gmail.com')) {
          console.log("Admin Email Matched - Bypass");
          setIsAdmin(true);
        }

        // 2. DB Check
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();

        if (profileError) console.error("Profile check error:", profileError);
        if (profile?.is_admin) setIsAdmin(true);
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
              imageUrl: URL.createObjectURL(file)
            }));
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
      imageUrl: URL.createObjectURL(file)
    });
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
  };

  const handleDemoAnalysis = async () => {
    // 1. Track Click Immediately
    Analytics.trackEvent('click_demo_mode', { asset: 'BTC' });

    try {
      // Load the demo image from public folder
      const response = await fetch('/demo-chart.png');
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);

      setAnalysisState({
        status: 'idle',
        result: null,
        error: null,
        imageUrl: imageUrl,
        isDemo: true // Flag this as a demo run
      });

      // Optional: Auto-run analysis or let user click "Run AI Analysis"
      // Let's letting them click "Run" feels more interactive/empowering, 
      // but "One-Click" usually suggests immediate action. 
      // Let's set the image and let them click "Run" to match the "Preview" flow 
      // OR we can automate it. 
      // Let's just set the image so they can see the "Trusted by 10k" preview state 
      // replaced by the chart, then they hit the big button.

    } catch (e) {
      console.error("Failed to load demo chart", e);
      alert("Failed to load demo chart. Please try again.");
    }
  };

  const handleAnalyze = async () => {
    // Determine input source (Image Only)
    if (!analysisState.imageUrl) return;

    setAnalysisState(prev => ({ ...prev, status: 'analyzing', error: null }));

    try {
      let base64Data: string | null = null;
      let mimeType = 'image/png';

      if (analysisState.imageUrl) {
        // 1. Convert image to base64
        const response = await fetch(analysisState.imageUrl);
        const blob = await response.blob();
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        base64Data = (base64 as string).split(',')[1];
        mimeType = blob.type;
      }

      // 3. Send to API
      // Pass token if we have one
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      // Payload (Symbol is removed/null)
      const payload = {
        image: base64Data,
        mimeType,
        symbol: null,
        isDemo: analysisState.isDemo // Send flag to backend
      };

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.status === 403 && data.error === 'LIMIT_REACHED') {
        setAnalysisState(prev => ({ ...prev, status: 'idle' }));
        // Always show pricing/paywall for limit reached
        setShowPaywall(true);
        return;
      }

      if (!response.ok) {
        const errorMsg = data.details ? `${data.error}: ${data.details}` : (data.error || 'Analysis failed');
        throw new Error(errorMsg);
      }

      const result = data; // Success result

      setAnalysisState(prev => ({
        ...prev,
        status: 'success',
        result
      }));

      // Update usage stats
      fetchUsage();

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
          onAdmin={() => setCurrentView('admin')}
          onHome={() => setCurrentView('home')}
          user={session?.user}
          isAdmin={isAdmin}
          usage={usage}
        />

        <main className="flex-grow p-6 md:p-12 max-w-7xl mx-auto w-full">

          {currentView === 'admin' ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
              {console.log("SafeAdminDashboard type:", typeof SafeAdminDashboard, SafeAdminDashboard)}
              <SafeAdminDashboard />
            </div>
          ) : (
            <>
              {/* Intro Text - Only show when idle */}
              {analysisState.status === 'idle' && !analysisState.imageUrl && (
                <div className="text-center mb-12 mt-10 space-y-4 animate-fade-in-up">
                  <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                    Institutional <br className="md:hidden" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-600 to-neutral-900 dark:from-white dark:to-neutral-400">Technical Intelligence</span>
                  </h1>
                  <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
                    Upload your trading setup. Receive an institutional-grade validation plan, risk protocol, and execution targets in seconds.
                  </p>
                </div>
              )}

              {/* Upload Section */}
              {analysisState.status !== 'success' && (
                <div className="space-y-6 max-w-xl mx-auto">
                  {/* File Upload or Preview State */}
                  {!analysisState.imageUrl ? (
                    <>
                      <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-100 dark:border-slate-700 mb-4">
                          <div className="flex -space-x-2">
                            <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white dark:border-slate-800"></div>
                            <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-white dark:border-slate-800"></div>
                            <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800"></div>
                          </div>
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300"> Trusted by 10k+ Traders</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                          Instant Technical Analysis. <br />
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                            Powered by AI Motion.
                          </span>
                        </h1>
                        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                          Upload any chart screenshot (from TradingView, etc).<br />
                          Our AI Agent automatically detects the ticker, identifies setups, and generates a plan.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                          <button
                            onClick={handleDemoAnalysis}
                            className="inline-flex items-center px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-full font-bold shadow-lg shadow-purple-500/20 transition-all hover:scale-105 active:scale-95 group"
                          >
                            <Sparkles className="w-4 h-4 mr-2 text-purple-400 dark:text-purple-600" />
                            Try Demo Chart
                          </button>
                          <span className="text-sm text-slate-400 font-medium">or upload your own below ↓</span>
                        </div>
                      </div>

                      <FileUpload
                        onFileSelect={handleFileSelect}
                        isAnalyzing={analysisState.status === 'analyzing'}
                      />

                      <p className="text-center text-slate-400 text-sm mt-6 animate-pulse hidden md:block">
                        Tip: You can just press <strong>CMD+V</strong> to paste a screenshot directly!
                      </p>


                    </>
                  ) : (
                    <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95">
                      <div className="aspect-video relative rounded-2xl overflow-hidden mb-6 bg-slate-100 border border-slate-200">
                        <img src={analysisState.imageUrl} alt="Preview" className="w-full h-full object-contain" />
                      </div>
                      <div className="space-y-3">
                        <p className="text-center text-slate-500 text-sm">
                          Ready to analyze <strong>this chart</strong>?
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

                  <ErrorBoundary>
                    <AnalysisDashboard data={analysisState.result} />
                  </ErrorBoundary>
                </div>
              )}
            </>
          )}

        </main>
      </div>

      <footer className="relative z-10 text-center py-8 text-slate-400 text-sm">
        <p className="font-medium tracking-wide">© {new Date().getFullYear()} Kairos.AI</p>
        {/* DEBUG INFO - REMOVE LATER */}
        <div className="mt-2 text-xs text-slate-600 font-mono">
          Status: {session ? 'Logged In' : 'Logged Out'} |
          User: {session?.user?.email || 'None'} |
          Admin: {isAdmin ? 'YES' : 'NO'} |
          UID: {session?.user?.id?.substring(0, 6) || 'N/A'}
        </div>
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
      />

    </div >
  );
}

export default App;