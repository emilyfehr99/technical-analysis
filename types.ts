
export enum TradeAction {
  BUY = 'BUY',
  SELL = 'SELL',
  WAIT = 'WAIT',
  HOLD = 'HOLD'
}

export interface TechnicalIndicatorAnalysis {
  macd: string;
  alligator: string;
  volume?: string;
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

export interface KeyLevels {
  support: string[];
  resistance: string[];
  pivotPoint?: string;
}

export interface TradeSetup {
  entryZone: string; // If WAIT, this is the "Trigger Price"
  stopLoss: string;
  takeProfitTargets: string[];
  optionsStrategy?: string;
}

export interface RiskManagement {
  riskToRewardRatio: string;
  suggestedPositionSize: string; // e.g., "2% of capital"
  activeRiskParameters: string; // e.g., "High volatility expected"
}

export interface ValidationItem {
  label: string;
  passed: boolean;
}

export interface PatternAnalysis {
    name: string; // e.g. "Bull Flag", "Double Bottom"
    type: 'CONTINUATION' | 'REVERSAL' | 'INDECISION';
    confidence: number;
}

export interface Scenario {
    name: 'BULL_CASE' | 'BEAR_CASE' | 'BASE_CASE';
    probability: number; // 0-100
    priceTarget: string;
    description: string;
}

export interface TradeOrder {
    style: 'SCALP' | 'DAY_TRADE' | 'SWING';
    side: 'LONG' | 'SHORT';
    entryPrice: string;
    stopLoss: string;
    targetPrice: string;
    leverageRecommendation?: string;
    reasoning: string;
}

export interface AnalysisResult {
  action: TradeAction;
  confidenceScore: number; // 0-100
  asset: string; // e.g. "BTC/USD" or "Apple Inc."
  currentPrice?: string; // e.g. "64,300.50"
  timeframe: string; // e.g. "15m" or "4h"
  headline: string;
  reasoning: string;
  technicalAnalysis: TechnicalIndicatorAnalysis;
  keyLevels: KeyLevels;
  setup: TradeSetup;
  risk: RiskManagement;
  pattern: PatternAnalysis;
  tradeHorizon: string; // e.g. "Intraday (2-4 hours)"
  validationChecklist: ValidationItem[];
  marketCondition: 'TRENDING' | 'RANGING' | 'VOLATILE' | 'CHOPPY';
  scenarios: Scenario[];
  tradeRadar: TradeOrder[];
}

export interface AnalysisState {
  status: 'idle' | 'analyzing' | 'success' | 'error';
  result: AnalysisResult | null;
  error: string | null;
  imageUrl: string | null;
}
