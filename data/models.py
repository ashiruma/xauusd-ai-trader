"""
Data Models and Schemas for XAUUSD Quantitative Trading System.
"""

from datetime import datetime, timezone
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator


class TimeFrame(str, Enum):
    M1 = "M1"
    M5 = "M5"
    M15 = "M15"
    H1 = "H1"
    H4 = "H4"
    D1 = "D1"


class OrderSide(str, Enum):
    BUY = "BUY"
    SELL = "SELL"
    NO_TRADE = "NO_TRADE"
    NO_SETUP = "NO_SETUP"


class SessionName(str, Enum):
    ASIAN = "ASIAN"
    LONDON = "LONDON"
    NEW_YORK = "NEW_YORK"
    LONDON_NY_OVERLAP = "LONDON_NY_OVERLAP"
    ROLLOVER_CAUTION = "ROLLOVER_CAUTION"
    OFF_HOURS = "OFF_HOURS"


class MarketRegimeType(str, Enum):
    TREND_UP = "TREND_UP"
    TREND_DOWN = "TREND_DOWN"
    RANGE = "RANGE"
    HIGH_VOLATILITY = "HIGH_VOLATILITY"
    LOW_VOLATILITY = "LOW_VOLATILITY"
    NEWS_EVENT = "NEWS_EVENT"
    UNCERTAIN = "UNCERTAIN"


class Tick(BaseModel):
    symbol: str = "XAUUSD"
    time: datetime
    bid: float
    ask: float
    spread: float
    volume: float = 0.0

    @field_validator("spread", mode="before")
    def compute_spread(cls, v, info):
        # Allow automatic computation if spread is not provided
        if v is None and "ask" in info.data and "bid" in info.data:
            return round(info.data["ask"] - info.data["bid"], 3)
        return v


class Candle(BaseModel):
    symbol: str = "XAUUSD"
    timeframe: TimeFrame = TimeFrame.M15
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float = 0.0

    @property
    def range(self) -> float:
        return self.high - self.low

    @property
    def body(self) -> float:
        return abs(self.close - self.open)

    @property
    def is_bullish(self) -> bool:
        return self.close > self.open


class SwingPoint(BaseModel):
    timestamp: datetime
    price: float
    type: str  # "HIGH" or "LOW"


class MarketState(BaseModel):
    timestamp: datetime
    symbol: str = "XAUUSD"
    current_price: float
    bid: float
    ask: float
    spread_points: float
    
    # Volatility & Momentum
    atr_14: float
    rsi_14: float
    ema_9: float
    ema_21: float
    ema_50: float
    ema_200: float
    
    # Market Structure
    recent_swing_high: Optional[float] = None
    recent_swing_low: Optional[float] = None
    previous_day_high: Optional[float] = None
    previous_day_low: Optional[float] = None
    previous_week_high: Optional[float] = None
    previous_week_low: Optional[float] = None
    asian_range_high: Optional[float] = None
    asian_range_low: Optional[float] = None
    
    # Session & Regime
    session: SessionName
    regime: MarketRegimeType
    trend_description: str
    
    # Open positions state
    open_positions_count: int = 0


class CandidateSetup(BaseModel):
    strategy_id: str
    symbol: str = "XAUUSD"
    side: OrderSide
    entry: float
    stop_loss: float
    take_profit: float
    risk_reward: float
    reason: str
    timestamp: datetime
    expiry: datetime
    timeframe: TimeFrame = TimeFrame.M15


class AISignalDecision(BaseModel):
    decision: OrderSide
    confidence: float = Field(ge=0.0, le=1.0)
    setup_valid: bool
    entry: float
    stop_loss: float
    take_profit: float
    risk_reward: float
    market_regime: MarketRegimeType
    strategy_id: str
    reasons: List[str] = Field(default_factory=list)
    invalidation: str = ""
    signal_expiry: str = ""


class FusedSignal(BaseModel):
    signal_id: str
    timestamp: datetime
    symbol: str = "XAUUSD"
    side: OrderSide
    entry: float
    stop_loss: float
    take_profit: float
    risk_reward: float
    confidence: float
    strategy_id: str
    market_regime: MarketRegimeType
    reasons: List[str]
    expiry: datetime
    is_valid: bool = True


class RiskDecision(BaseModel):
    signal_id: str
    timestamp: datetime
    approved: bool
    rejection_code: Optional[str] = None
    reason: str
    lot_size: float = 0.0
    risk_amount_usd: float = 0.0
    stop_distance_points: float = 0.0
    account_equity: float = 0.0


class OrderStatus(str, Enum):
    PENDING = "PENDING"
    FILLED = "FILLED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"
    CLOSED = "CLOSED"


class Order(BaseModel):
    order_id: str
    signal_id: str
    strategy_id: str
    magic_number: int
    symbol: str = "XAUUSD"
    side: OrderSide
    lot_size: float
    requested_price: float
    filled_price: Optional[float] = None
    slippage_points: float = 0.0
    stop_loss: float
    take_profit: float
    status: OrderStatus = OrderStatus.PENDING
    created_at: datetime
    executed_at: Optional[datetime] = None
    ticket: Optional[int] = None
    error_message: Optional[str] = None


class Position(BaseModel):
    ticket: int
    symbol: str = "XAUUSD"
    side: OrderSide
    lots: float
    entry_price: float
    current_price: float
    stop_loss: float
    take_profit: float
    floating_pnl: float
    magic_number: int
    open_time: datetime
    signal_id: Optional[str] = None
    strategy_id: Optional[str] = None
    entry_rationale: Optional[str] = None


class TradeRecord(BaseModel):
    trade_id: str
    ticket: int
    signal_id: Optional[str] = None
    strategy_id: Optional[str] = None
    symbol: str = "XAUUSD"
    side: OrderSide
    lots: float
    entry_price: float
    exit_price: float
    pnl: float
    return_pct: float = 0.0
    commission: float = 0.0
    swap: float = 0.0
    entry_time: datetime
    exit_time: datetime
    exit_reason: str  # "TP", "SL", "EMERGENCY_STOP", "MANUAL", "EXPIRY"
    holding_seconds: float = 0.0
    max_favorable_excursion: float = 0.0  # MFE in price points
    max_adverse_excursion: float = 0.0   # MAE in price points
    market_regime: Optional[MarketRegimeType] = None
    session: Optional[SessionName] = None
