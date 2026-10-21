// UI display types only; not an execution authorization.
export interface WhyThisTrade {
  strategyVersion: string;
  signalTimestamp: string;
  observedMarketData: string;
  modelInterpretation: string;
  exitConditions: {
    stopLossRule: string;
    takeProfitRule: string;
    isValid: boolean;
  };
  uncertaintyLevel: 'Low' | 'Moderate' | 'High';
  dataDelay: string;
  entryRationale: string;
  isRecorded: boolean;
}

export interface LivePosition {
  id: string;
  ticket: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  lots: number;
  entryPrice: number;
  currentPrice: number;
  stopLoss: number;
  takeProfit: number;
  pnl: number;
  pips: number;
  riskExposureUsd: number;
  riskExposurePct: number;
  openTime: string;
  strategy: string;
  lessonReference: string;
  whyThisTrade: WhyThisTrade | null;
  status: 'OPEN';
}

export interface ExecutedTrade {
  id: string;
  ticket: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  lots: number;
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  pips: number;
  openTime: string;
  closeTime: string;
  strategy: string;
  lessonReference: string;
  exitReason: string;
}
