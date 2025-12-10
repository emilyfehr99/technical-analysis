
import React, { useState, useEffect } from 'react';
import { AnalysisResult, TradeAction, TradeOrder } from '../types';
import {
    TrendingUp,
    TrendingDown,
    AlertCircle,
    ShieldCheck,
    Target,
    Activity,
    Eye,
    Sliders,
    Layers,
    BrainCircuit,
    Clock,
    Hash,
    CheckCircle2,
    XCircle,
    Copy,
    Check,
    Zap,
    ScanEye,
    Share2,
    X as CloseIcon,
    Calculator,
    Percent,
    Coins,
    Radar,
    ArrowRight,
    AlertTriangle, // Added
    ShieldAlert,   // Added
    BarChart3,     // Added
    Binary         // Added
} from 'lucide-react';
import { TradeTimeline } from './TradeTimeline';

interface AnalysisDashboardProps {
    data: AnalysisResult;
}

const XLogo = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const ActionBadge: React.FC<{ action: TradeAction }> = ({ action }) => {
    const styles = {
        [TradeAction.BUY]: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
        [TradeAction.SELL]: "bg-rose-500/10 text-rose-600 border-rose-200",
        [TradeAction.WAIT]: "bg-amber-500/10 text-amber-600 border-amber-200",
        [TradeAction.HOLD]: "bg-blue-500/10 text-blue-600 border-blue-200",
    };

    const icons = {
        [TradeAction.BUY]: <TrendingUp className="w-4 h-4 mr-2" />,
        [TradeAction.SELL]: <TrendingDown className="w-4 h-4 mr-2" />,
        [TradeAction.WAIT]: <Eye className="w-4 h-4 mr-2" />,
        [TradeAction.HOLD]: <ShieldCheck className="w-4 h-4 mr-2" />,
    };

    return (
        <div className={`inline-flex items-center px-4 py-1.5 rounded-full font-bold text-xs tracking-wide uppercase border backdrop-blur-sm ${styles[action]}`}>
            {icons[action]}
            {action === TradeAction.WAIT ? 'Watchlist Mode' : `${action} Signal`}
        </div>
    );
};

const Card: React.FC<{ title?: string; children: React.ReactNode; icon?: React.ReactNode, className?: string, gradient?: boolean }> = ({ title, children, icon, className = "", gradient = false }) => (
    <div className={`relative overflow-hidden rounded-[2rem] p-6 transition-all duration-300 hover:shadow-lg border border-white/40 ${gradient ? 'bg-gradient-to-br from-white/80 to-white/40' : 'bg-white/60'} backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${className}`}>
        {title && (
            <div className="flex items-center mb-4 text-slate-400">
                {icon && <span className="mr-2 text-slate-500">{icon}</span>}
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{title}</h3>
            </div>
        )}
        {children}
    </div>
);

const TradeOrderCard: React.FC<{ order: TradeOrder }> = ({ order }) => {
    const isLong = order.side === 'LONG';
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 1500);
    };

    const CopyButton = ({ text, field }: { text: string, field: string }) => (
        <button
            onClick={() => handleCopy(text, field)}
            className="ml-2 p-1 hover:bg-black/5 rounded transition-colors group"
            title="Copy price"
        >
            {copiedField === field ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-300 group-hover:text-slate-500" />}
        </button>
    );

    return (
        <div className={`relative p-5 rounded-2xl border ${isLong ? 'bg-emerald-50/30 border-emerald-100/60' : 'bg-rose-50/30 border-rose-100/60'} transition-all hover:scale-[1.02] duration-300`}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                    <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isLong ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {order.style.replace('_', ' ')}
                    </span>
                    <span className={`text-sm font-black uppercase ${isLong ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {order.side}
                    </span>
                </div>
                {order.leverageRecommendation && (
                    <span className="px-2 py-1 bg-white/60 rounded-md text-[10px] font-mono font-bold text-slate-500 border border-white/40">
                        {order.leverageRecommendation}
                    </span>
                )}
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 text-xs">Entry</span>
                    <div className="flex items-center font-mono font-bold text-slate-700">
                        {order.entryPrice}
                        <CopyButton text={order.entryPrice} field={`entry-${order.style}`} />
                    </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 text-xs">Target</span>
                    <div className="flex items-center font-mono font-bold text-emerald-600">
                        {order.targetPrice}
                        <CopyButton text={order.targetPrice} field={`target-${order.style}`} />
                    </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 text-xs">Stop</span>
                    <div className="flex items-center font-mono font-bold text-rose-500">
                        {order.stopLoss}
                        <CopyButton text={order.stopLoss} field={`stop-${order.style}`} />
                    </div>
                </div>
            </div>

            <div className="pt-3 border-t border-black/5">
                <p className="text-[10px] text-slate-500 leading-tight">
                    <span className="font-bold text-slate-600 mr-1">Logic:</span>
                    {order.reasoning}
                </p>
            </div>
        </div>
    );
};

const ShareModal: React.FC<{ isOpen: boolean; onClose: () => void; data: AnalysisResult }> = ({ isOpen, onClose, data }) => {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    // --- Dynamic X Post Generator (Optimized for max 275 chars) ---

    // 1. Clean Asset Ticker
    const rawAsset = data.asset || 'Asset';
    const ticker = rawAsset.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    // 2. Formatting Helpers
    const actionEmoji = data.action === 'BUY' ? '🟢' : data.action === 'SELL' ? '🔴' : '👀';
    const target = data.setup.takeProfitTargets[0] || 'TBD';
    const pattern = data.pattern?.name || 'Setup';

    // 3. Construct Static Parts
    const header = `⚡️ $${ticker} Analysis`;
    const metrics = `${actionEmoji} ${data.action} | ${pattern}
🎯 Target: ${target}
⚖️ RR: ${data.risk.riskToRewardRatio}`;
    const tags = `#AI #Trading`;

    // 4. Calculate Remaining Budget
    // Layout: Header \n\n Metrics \n\n Body \n\n Tags
    // Newlines: 2 + 2 + 2 = 6 chars
    const staticLen = header.length + metrics.length + tags.length + 6;
    const maxLen = 275;
    const availableForBody = Math.max(0, maxLen - staticLen);

    // 5. Construct Body (Headline + Reasoning)
    let body = data.headline || '';
    const cleanReasoning = (data.reasoning || '').replace(/\s+/g, ' ').trim();

    // If headline alone is too long (unlikely but safe check)
    if (body.length >= availableForBody) {
        body = body.substring(0, availableForBody - 1) + '…';
    } else if (cleanReasoning) {
        // We have space for reasoning
        const separator = "\n\n";
        const remaining = availableForBody - body.length - separator.length;

        // Only append if we can fit a meaningful amount (e.g. > 15 chars)
        if (remaining > 15) {
            if (cleanReasoning.length > remaining) {
                // Truncate reasoning to fit
                body += separator + cleanReasoning.substring(0, remaining - 1) + '…';
            } else {
                // Fit entire reasoning
                body += separator + cleanReasoning;
            }
        }
    }

    // 6. Final Assembly
    const postText = `${header}

${metrics}

${body}

${tags}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(postText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePostDirectly = () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(postText)}`;
        window.open(twitterUrl, '_blank');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-white/50 animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-slate-900">
                        <XLogo className="w-5 h-5" />
                        <h3 className="font-bold text-lg">Post Analysis</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
                    <p className="whitespace-pre-wrap text-sm text-slate-600 font-medium leading-relaxed font-mono">
                        {postText}
                    </p>
                    <div className="mt-3 flex justify-end">
                        <span className={`text-xs font-bold ${postText.length > 280 ? 'text-red-500' : 'text-emerald-500'}`}>
                            {postText.length} / 280 chars
                        </span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleCopy}
                        className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] transition-all text-slate-700 font-semibold rounded-xl flex items-center justify-center"
                    >
                        {copied ? (
                            <>
                                <Check className="w-4 h-4 mr-2" />
                                Copied
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4 mr-2" />
                                Copy Text
                            </>
                        )}
                    </button>
                    <button
                        onClick={handlePostDirectly}
                        className="flex-1 py-3 bg-black hover:bg-slate-800 active:scale-[0.98] transition-all text-white font-semibold rounded-xl flex items-center justify-center shadow-lg shadow-black/20"
                    >
                        <XLogo className="w-4 h-4 mr-2" />
                        Post to X
                    </button>
                </div>
            </div>
        </div>
    );
};

const KellyCalculator: React.FC<{ rrRatioString: string }> = ({ rrRatioString }) => {
    const [accountSize, setAccountSize] = useState<number>(10000);
    const [winRate, setWinRate] = useState<number>(50); // Default 50%

    // Robust parsing for R:R strings like "1:3", "Risk 1 Reward 3", "3.0", "N/A"
    const getRR = (str: string): number => {
        if (!str || str === 'N/A') return 2; // Safe default

        try {
            // Normalize: Replace "to", "risk", "reward" with generic delimiters or empty
            // "1 to 3" -> "1:3"
            // "1/3" -> "1:3"
            const clean = str.toLowerCase().replace(/to/g, ':').replace(/\//g, ':');

            // Try to match "Number ...delimiter... Number"
            // Matches "1 : 3", "1.5 : 4", "1:3"
            const match = clean.match(/([\d.]+)\s*[:]\s*([\d.]+)/);

            if (match) {
                const risk = parseFloat(match[1]);
                const reward = parseFloat(match[2]);
                if (risk > 0 && !isNaN(reward)) {
                    return reward / risk;
                }
            }

            // Fallback: If it's just a single number (e.g. "3" implying 3R)
            const singleNum = parseFloat(clean.replace(/[^\d.]/g, ''));
            if (!isNaN(singleNum) && singleNum > 0) {
                // Heuristic: If number is > 100, it's likely not an R:R (maybe a price), return default
                if (singleNum < 50) return singleNum;
            }

            return 2;
        } catch {
            return 2;
        }
    };

    const rr = getRR(rrRatioString);
    const safeRR = isNaN(rr) || rr === 0 ? 2 : rr;

    // Kelly Formula: K% = W - (1-W)/R
    // Where W = Win Probability (0.50), R = Reward/Risk Ratio
    const w = winRate / 100;
    const kellyPercent = w - ((1 - w) / safeRR);

    // Safety: Quarter Kelly (most traders use this or Half Kelly to reduce variance)
    const quarterKelly = Math.max(0, kellyPercent / 4);

    // Convert to dollar amount
    const suggestedRiskAmount = Math.floor(accountSize * quarterKelly);

    return (
        <div className="bg-white/50 rounded-xl p-4 border border-white/60">
            <div className="flex items-center gap-2 mb-4 text-slate-500">
                <Calculator className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Kelly Criterion Calculator</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="text-[10px] uppercase text-slate-400 font-bold block mb-1">Account Balance ($)</label>
                    <input
                        type="number"
                        value={accountSize}
                        onChange={(e) => setAccountSize(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>
                <div>
                    <label className="text-[10px] uppercase text-slate-400 font-bold block mb-1">Est. Win Rate (%)</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="range"
                            min="10"
                            max="90"
                            value={winRate}
                            onChange={(e) => setWinRate(Number(e.target.value))}
                            className="w-full accent-blue-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm font-mono text-slate-700 w-8">{winRate}</span>
                    </div>
                </div>
            </div>

            <div className="p-3 bg-slate-900 rounded-lg text-white">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-400">Optimal Risk (Quarter Kelly)</span>
                    <span className="text-lg font-bold text-emerald-400">${suggestedRiskAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span>Implied R:R: <span className="text-slate-300">1:{safeRR.toFixed(1)}</span></span>
                    <span>Fraction: <span className="text-slate-300">{(quarterKelly * 100).toFixed(2)}%</span></span>
                </div>
            </div>
        </div>
    );
};

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ data }) => {
    const [copied, setCopied] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const isWait = data.action === TradeAction.WAIT || data.action === TradeAction.HOLD;

    const copyToClipboard = () => {
        const text = `
🎯 TRADE PLAN: ${data.asset} (${data.timeframe})
Price: ${data.currentPrice || 'N/A'}
Action: ${data.action}
Entry: ${data.setup.entryZone}
Stop Loss: ${data.setup.stopLoss}
Targets: ${data.setup.takeProfitTargets.join(', ')}
Pattern: ${data.pattern.name} (${data.pattern.type})
Risk/Reward: ${data.risk.riskToRewardRatio}
Note: ${data.headline}
    `.trim();
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full max-w-7xl mx-auto animate-fade-in-up pb-12">
            <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} data={data} />

            {/* Dynamic Background Mesh */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px] mix-blend-multiply opacity-70 animate-blob"></div>
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-[100px] mix-blend-multiply opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-400/20 rounded-full blur-[100px] mix-blend-multiply opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            {/* Header Info Bar */}
            <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        {(data.asset || data.timeframe) && (
                            <span className="text-3xl font-bold text-slate-900 tracking-tight flex items-center">
                                {data.asset || 'Unknown Asset'}
                                <span className="ml-2 text-lg text-slate-400 font-medium align-top">{data.timeframe}</span>
                                {data.currentPrice && (
                                    <span className="ml-4 px-3 py-1 bg-slate-200/50 rounded-lg text-sm font-mono text-slate-600 border border-slate-200">
                                        {data.currentPrice}
                                    </span>
                                )}
                            </span>
                        )}
                        <ActionBadge action={data.action} />
                    </div>
                    <h1 className="text-lg text-slate-500 font-medium max-w-2xl leading-relaxed">
                        {data.headline}
                    </h1>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowShareModal(true)}
                            className="flex items-center justify-center w-10 h-10 bg-black hover:bg-slate-800 backdrop-blur-md border border-white/40 shadow-sm rounded-full text-white transition-all active:scale-95"
                            title="Share on X"
                        >
                            <XLogo className="w-4 h-4" />
                        </button>
                        <button
                            onClick={copyToClipboard}
                            className="group flex items-center px-4 py-2 bg-white/60 hover:bg-white backdrop-blur-md border border-white/40 shadow-sm rounded-full text-sm font-medium text-slate-600 hover:text-blue-600 transition-all active:scale-95"
                        >
                            {copied ? <Check className="w-4 h-4 mr-2 text-emerald-500" /> : <Copy className="w-4 h-4 mr-2" />}
                            {copied ? 'Copied' : 'Copy Plan'}
                        </button>
                        <div className="flex items-center bg-white/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/40 shadow-sm">
                            <span className="text-xs font-bold text-slate-400 uppercase mr-2">Confidence</span>
                            <span className={`text-sm font-bold ${data.confidenceScore > 75 ? 'text-emerald-600' : 'text-amber-500'}`}>{data.confidenceScore}%</span>
                        </div>
                    </div>
                    <div className="flex items-center text-[10px] text-slate-400 font-medium bg-slate-100/50 px-3 py-1 rounded-full border border-slate-200/50" title="This analysis is generated by AI Vision reading your screenshot, not live API data.">
                        <ScanEye className="w-3 h-3 mr-1.5" />
                        Source: Visual Chart Analysis
                    </div>
                </div>
            </div>

            {/* BENTO GRID LAYOUT */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* ROW 1: Real-Time Trade Radar (New Feature) */}
                <div className="md:col-span-12">
                    <Card title="Live Execution Radar" icon={<Radar className="w-4 h-4" />} className="bg-gradient-to-r from-slate-50 via-white to-slate-50 border-blue-100">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {data.tradeRadar?.map((order, i) => (
                                <TradeOrderCard key={i} order={order} />
                            ))}
                            {!data.tradeRadar && (
                                <div className="col-span-3 text-center py-8 text-slate-400 italic">
                                    Live Execution Radar data unavailable for this chart.
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* ROW 2: Execution & Key Levels */}

                {/* Main Execution Card */}
                <div className="md:col-span-8">
                    <Card title={isWait ? "Conditional Trade Protocol" : "Execution Setup"} icon={<Target className="w-4 h-4" />} className="h-full">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                            {/* Entry */}
                            <div className={`p-5 rounded-2xl border transition-colors ${isWait ? 'bg-amber-50/50 border-amber-100/50' : 'bg-emerald-50/50 border-emerald-100/50'}`}>
                                <span className={`text-[10px] font-bold uppercase tracking-wider mb-2 block ${isWait ? 'text-amber-600' : 'text-emerald-600'}`}>
                                    {isWait ? 'Watch For Trigger' : 'Entry Zone'}
                                </span>
                                <span className="text-lg font-bold text-slate-800 leading-tight block">
                                    {data.setup.entryZone}
                                </span>
                            </div>

                            {/* Stop Loss */}
                            <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100/50">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                                    {isWait ? 'Invalidation' : 'Stop Loss'}
                                </span>
                                <span className="text-lg font-bold text-rose-500 leading-tight block">
                                    {data.setup.stopLoss}
                                </span>
                            </div>

                            {/* Targets */}
                            <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100/50">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Targets</span>
                                <div className="flex flex-col gap-0.5">
                                    {data.setup.takeProfitTargets.slice(0, 3).map((tp, idx) => (
                                        <span key={idx} className="text-base font-bold text-emerald-600 leading-tight">
                                            {tp}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                    <Activity className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold uppercase text-slate-400">Recommended Options</div>
                                    <div className="text-sm font-semibold text-slate-700">{data.setup.optionsStrategy || "Standard Spot/Futures"}</div>
                                </div>
                            </div>
                            <div className="text-right hidden sm:block">
                                <div className="text-[10px] font-bold uppercase text-slate-400">Risk/Reward</div>
                                <div className="text-sm font-mono font-bold text-slate-800">{data.risk.riskToRewardRatio}</div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Validation Checklist */}
                <div className="md:col-span-4">
                    <Card title="Trade Validation" icon={<CheckCircle2 className="w-4 h-4" />} className="h-full bg-white/70">
                        <div className="space-y-3">
                            {data.validationChecklist?.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-white/50 shadow-sm">
                                    <span className="text-sm font-medium text-slate-600">{item.label}</span>
                                    {item.passed ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-slate-300" />
                                    )}
                                </div>
                            ))}
                            {!data.validationChecklist && <p className="text-sm text-slate-400 italic">No validation data available.</p>}
                        </div>

                        {/* Market Condition Tag */}
                        <div className="mt-6 pt-4 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase text-slate-400">Market Condition</span>
                                <span className={`text-xs font-bold px-2 py-1 rounded-md border ${data.marketCondition === 'TRENDING' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                    data.marketCondition === 'VOLATILE' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                        'bg-slate-50 text-slate-600 border-slate-100'
                                    }`}>
                                    {data.marketCondition || 'NEUTRAL'}
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* ROW 3: Quantitative Risk Engine */}
                <div className="md:col-span-12">
                    <Card title="Quantitative Risk Engine" icon={<BrainCircuit className="w-4 h-4" />} className="bg-gradient-to-r from-slate-50 to-white">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                            {/* Probabilistic Scenarios */}
                            <div className="md:col-span-7 space-y-5">
                                <h4 className="text-sm font-bold text-slate-800 flex items-center">
                                    <Layers className="w-4 h-4 mr-2 text-slate-400" />
                                    Probabilistic Scenarios (Monte Carlo)
                                </h4>

                                {data.scenarios?.map((scenario, i) => (
                                    <div key={i} className="group">
                                        <div className="flex justify-between items-end mb-1">
                                            <span className={`text-xs font-bold uppercase tracking-wider ${scenario.name === 'BULL_CASE' ? 'text-emerald-600' :
                                                scenario.name === 'BEAR_CASE' ? 'text-rose-600' : 'text-slate-500'
                                                }`}>
                                                {scenario.name.replace('_', ' ')}
                                            </span>
                                            <span className="text-xs font-mono font-bold text-slate-700">{scenario.probability}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ease-out ${scenario.name === 'BULL_CASE' ? 'bg-emerald-400' :
                                                    scenario.name === 'BEAR_CASE' ? 'bg-rose-400' : 'bg-slate-400'
                                                    }`}
                                                style={{ width: `${scenario.probability}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <p className="text-[10px] text-slate-500 leading-relaxed max-w-[80%]">{scenario.description}</p>
                                            <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{scenario.priceTarget}</span>
                                        </div>
                                    </div>
                                ))}
                                {!data.scenarios && <p className="text-sm text-slate-400 italic">No scenario data available.</p>}
                            </div>

                            {/* Kelly Calculator */}
                            <div className="md:col-span-5 border-l border-slate-100 pl-8">
                                <KellyCalculator rrRatioString={data.risk.riskToRewardRatio} />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* ROW 4: Analysis & Pattern Intelligence */}

                {/* Technical Deep Dive */}
                <div className="md:col-span-5">
                    <Card title="Technical Analysis" icon={<Zap className="w-4 h-4" />} className="h-full">
                        <div className="space-y-4">
                            <div className="group">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-semibold text-slate-700">MACD</span>
                                    <div className="h-px bg-slate-100 flex-grow mx-3"></div>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">{data.technicalAnalysis.macd}</p>
                            </div>

                            <div className="group">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-semibold text-slate-700">Williams Alligator</span>
                                    <div className="h-px bg-slate-100 flex-grow mx-3"></div>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">{data.technicalAnalysis.alligator}</p>
                            </div>

                            <div className="mt-4 p-3 bg-slate-50/50 rounded-xl border border-slate-100/50">
                                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Trend Structure</span>
                                <span className={`text-sm font-bold ${data.technicalAnalysis.trend === 'BULLISH' ? 'text-emerald-600' :
                                    data.technicalAnalysis.trend === 'BEARISH' ? 'text-rose-600' : 'text-slate-600'
                                    }`}>{data.technicalAnalysis.trend}</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Key Levels & Risk */}
                <div className="md:col-span-4">
                    <Card title="Market Levels" icon={<Layers className="w-4 h-4" />} className="h-full">
                        <div className="space-y-4">
                            <div>
                                <span className="text-[10px] font-bold text-rose-400 uppercase mb-2 block">Resistance</span>
                                <div className="flex flex-wrap gap-2">
                                    {data.keyLevels?.resistance.slice(0, 3).map((level, i) => (
                                        <span key={i} className="px-2.5 py-1 bg-rose-50/50 text-rose-600 rounded-lg text-xs font-bold border border-rose-100">{level}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="w-full h-px bg-slate-100/50"></div>
                            <div>
                                <span className="text-[10px] font-bold text-emerald-400 uppercase mb-2 block">Support</span>
                                <div className="flex flex-wrap gap-2">
                                    {data.keyLevels?.support.slice(0, 3).map((level, i) => (
                                        <span key={i} className="px-2.5 py-1 bg-emerald-50/50 text-emerald-600 rounded-lg text-xs font-bold border border-emerald-100">{level}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <span className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Risk Management</span>
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-slate-500">Position Size</span>
                                    <span className="text-xs font-bold text-slate-800">{data.risk.suggestedPositionSize}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-slate-500">Risk Profile</span>
                                    <span className="text-xs font-bold text-rose-500">{data.risk.activeRiskParameters}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Pattern Intelligence Card */}
                <div className="md:col-span-3">
                    <div className="h-full rounded-[2rem] p-6 bg-gradient-to-b from-slate-800 to-slate-900 text-white shadow-xl relative overflow-hidden flex flex-col justify-between group cursor-default">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-400/30 transition-colors duration-500"></div>

                        <div>
                            <div className="flex items-center mb-4 text-white/50">
                                <ScanEye className="w-4 h-4 mr-2" />
                                <h3 className="text-[11px] font-bold uppercase tracking-widest">Pattern Intelligence</h3>
                            </div>

                            <div className="mb-4">
                                <h2 className="text-2xl font-bold text-white tracking-tight leading-none mb-2">{data.pattern?.name || 'Pattern Detected'}</h2>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${data.pattern?.type === 'REVERSAL' ? 'bg-purple-500/20 text-purple-200 border-purple-500/30' :
                                        data.pattern?.type === 'CONTINUATION' ? 'bg-blue-500/20 text-blue-200 border-blue-500/30' :
                                            'bg-slate-700 text-slate-300 border-slate-600'
                                        }`}>
                                        {data.pattern?.type || 'Neutral'}
                                    </span>
                                    <div className="flex items-center text-[10px] text-white/60">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {data.tradeHorizon}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/10">
                            <span className="text-[10px] font-bold uppercase text-white/40 block mb-1">Analysis Logic</span>
                            <p className="text-[10px] text-white/60 line-clamp-4 leading-relaxed">
                                {data.reasoning}
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            <div className="mt-12 text-center">
                <div className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white/40 backdrop-blur-md border border-white/40 text-slate-400 text-[10px] max-w-2xl mx-auto shadow-sm">
                    <AlertCircle className="w-3 h-3 mr-2 flex-shrink-0" />
                    <p>
                        <strong>AI Analysis:</strong> Theoretical scenarios based on chart patterns. Not financial advice.
                    </p>
                </div>
            </div>
            {/* NEW: Trade Execution Timeline */}
            <div className="mt-8 animate-fade-in-up">
                <TradeTimeline
                    entryPrice={data.setup.entryZone}
                    stopLoss={data.setup.stopLoss}
                    targets={data.setup.takeProfitTargets}
                    currentPrice={data.currentPrice}
                />
            </div>

        </motion.div>
    );
};

export default AnalysisDashboard;
