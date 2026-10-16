"""
Configuration and Environment Settings for XAUUSD Trading System.
"""

import os
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class TradingMode(str, Enum):
    BACKTEST = "BACKTEST"
    PAPER = "PAPER"
    LIVE = "LIVE"


class DataMode(str, Enum):
    LIVE_MT5 = "LIVE_MT5"
    PAPER_FEED = "PAPER_FEED"
    SIMULATED = "SIMULATED"
    MOCK = "MOCK"


class MarketRegimeType(str, Enum):
    TREND_UP = "TREND_UP"
    TREND_DOWN = "TREND_DOWN"
    RANGE = "RANGE"
    HIGH_VOLATILITY = "HIGH_VOLATILITY"
    LOW_VOLATILITY = "LOW_VOLATILITY"
    NEWS_EVENT = "NEWS_EVENT"
    UNCERTAIN = "UNCERTAIN"


class SessionName(str, Enum):
    ASIAN = "ASIAN"
    LONDON = "LONDON"
    NEW_YORK = "NEW_YORK"
    LONDON_NY_OVERLAP = "LONDON_NY_OVERLAP"
    ROLLOVER_CAUTION = "ROLLOVER_CAUTION"
    OFF_HOURS = "OFF_HOURS"


class OrderSide(str, Enum):
    BUY = "BUY"
    SELL = "SELL"
    NO_TRADE = "NO_TRADE"


class RiskConfig(BaseModel):
    max_risk_per_trade_pct: float = Field(default=2.0, description="Max risk percentage per trade for standard accounts (2.0%)")
    max_micro_risk_pct: float = Field(default=5.0, description="Absolute conservative risk ceiling for micro accounts (5.0%)")
    max_daily_loss_pct: float = Field(default=3.0, description="Max daily account loss before trading halts (3.0%)")
    daily_profit_target_pct: float = Field(default=5.0, description="Optional daily profit lock percentage (5.0%)")
    daily_profit_target_usd: Optional[float] = Field(default=20.0, description="Optional fixed daily profit target in USD")
    max_drawdown_pct: float = Field(default=8.0, description="Max total drawdown before trading halts (8.0%)")
    max_consecutive_losses: int = Field(default=2, description="Consecutive losses trigger cooldown (2 losses)")
    max_open_positions: int = Field(default=1, description="Max concurrent open positions")
    max_spread_points: float = Field(default=35.0, description="Max spread in points (35 points = $0.35 on XAUUSD)")
    max_slippage_points: float = Field(default=20.0, description="Max acceptable slippage in points")
    min_risk_reward_ratio: float = Field(default=1.8, description="Minimum acceptable risk/reward ratio (1.8:1)")
    min_stop_distance_points: float = Field(default=15.0, description="Minimum stop loss distance ($0.15 on XAUUSD)")
    max_stop_distance_points: float = Field(default=3000.0, description="Maximum stop loss distance ($30.00 on XAUUSD)")
    session_restrictions_enabled: bool = Field(default=True, description="Restrict trading to high-liquidity sessions")
    news_restrictions_enabled: bool = Field(default=True, description="Halt trading during high-impact news")
    news_pre_window_minutes: int = Field(default=15, description="Minutes before news to stop trading")
    news_post_window_minutes: int = Field(default=15, description="Minutes after news before resuming")
    duplicate_signal_window_seconds: int = Field(default=300, description="Window to prevent duplicate entries")
    signal_expiry_seconds: int = Field(default=180, description="Signal validity lifespan")
    allow_min_lot_override: bool = Field(default=True, description="Permit 0.01 lot only if worst-case loss does not exceed risk ceiling")
    
    # Active Profit Protection & Trailing Ratchet
    enable_break_even: bool = Field(default=True, description="Move SL to Break-Even after trade reaches verified profit threshold")
    break_even_trigger_points: float = Field(default=80.0, description="Baseline points in profit before moving SL to BE ($0.80)")
    break_even_lock_points: float = Field(default=25.0, description="Baseline points above entry to lock in when moving to BE ($0.25)")
    enable_trailing_stop: bool = Field(default=True, description="Enable dynamic trailing stop")
    trailing_trigger_points: float = Field(default=150.0, description="Baseline points in profit before activating trailing stop ($1.50)")
    trailing_distance_points: float = Field(default=80.0, description="Baseline distance behind current price to maintain trailing SL ($0.80)")

    # Broker Onboarding & Account Policy
    min_deposit_onboarding_usd: float = Field(default=10.0, description="JustMarkets broker deposit threshold where supported ($10 on Standard and Standard Cent)")
    min_guest_deposit_usd: float = Field(default=100.0, description="Legacy guest account minimum deposit threshold ($100)")

    @staticmethod
    def get_tier_parameters(equity: float) -> dict:
        """
        Dynamically adjusts risk parameters, position sizing constraints,
        and stop management based on account equity tier.
        No profit promises or fabricated return expectations.
        """
        if equity < 100.0:
            return {
                "tier": "MICRO",
                "label": "Micro Capital Preservation Tier ($10 - $100)",
                "min_rr": 1.5,
                "target_rr_range": "1.8:1 to 2.5:1",
                "target_pips": "20 - 50 pips ($2.00 - $5.00)",
                "max_risk_pct": 2.0,
                "hard_risk_cap_pct": 15.0,
                "be_trigger_points": 80.0,
                "be_lock_points": 25.0,
                "trailing_trigger_points": 150.0,
                "trailing_distance_points": 80.0,
                "runner_enabled": False,
                "expected_pnl_range": "Target 1.8:1 to 2.5:1 R:R (capital preservation, no profit guarantee)"
            }
        elif equity < 500.0:
            return {
                "tier": "GROWTH",
                "label": "Growth Tier ($100 - $500)",
                "min_rr": 1.8,
                "target_rr_range": "2.0:1 to 2.8:1",
                "target_pips": "50 - 100 pips ($5.00 - $10.00)",
                "max_risk_pct": 2.0,
                "hard_risk_cap_pct": 3.0,
                "be_trigger_points": 140.0,
                "be_lock_points": 30.0,
                "trailing_trigger_points": 200.0,
                "trailing_distance_points": 90.0,
                "runner_enabled": False,
                "expected_pnl_range": "Target 2.0:1 to 2.8:1 R:R (no profit guarantee)"
            }
        elif equity < 1000.0:
            return {
                "tier": "STANDARD",
                "label": "Standard Swing Tier ($500 - $1,000)",
                "min_rr": 2.0,
                "target_rr_range": "2.0:1 to 3.0:1",
                "target_pips": "80 - 150 pips ($8.00 - $15.00)",
                "max_risk_pct": 2.0,
                "hard_risk_cap_pct": 2.5,
                "be_trigger_points": 160.0,
                "be_lock_points": 40.0,
                "trailing_trigger_points": 250.0,
                "trailing_distance_points": 110.0,
                "runner_enabled": True,
                "expected_pnl_range": "Target 2.0:1 to 3.0:1 R:R (no profit guarantee)"
            }
        else:
            return {
                "tier": "INSTITUTIONAL",
                "label": "Institutional Tier ($1,000+)",
                "min_rr": 2.5,
                "target_rr_range": "2.5:1 to 4.0:1",
                "target_pips": "150 - 200+ pips ($15.00 - $20.00+ expansion)",
                "max_risk_pct": 1.5,
                "hard_risk_cap_pct": 2.0,
                "be_trigger_points": 200.0,
                "be_lock_points": 50.0,
                "trailing_trigger_points": 350.0,
                "trailing_distance_points": 150.0,
                "runner_enabled": True,
                "expected_pnl_range": "Target 2.5:1 to 4.0:1 R:R (no profit guarantee)"
            }


class XAUUSDContractSpecs(BaseModel):
    symbol: str = "XAUUSD"
    alternate_symbols: list[str] = ["XAUUSD.m", "GOLD", "XAUUSDm", "XAUUSD.a"]
    contract_size: float = 100.0  # 100 troy oz per 1 standard lot
    point_size: float = 0.01      # 1 point = $0.01 per ounce
    min_lot: float = 0.01
    max_lot: float = 100.0
    lot_step: float = 0.01


class MT5Config(BaseModel):
    login: Optional[int] = None
    password: Optional[str] = None
    server: Optional[str] = None
    path: Optional[str] = None
    magic_number: int = 108824
    timeout_ms: int = 60000
    symbol: str = "XAUUSD.m"


class AIConfig(BaseModel):
    provider: str = Field(default="mock", description="mock | openai | anthropic | gemini | openrouter")
    model: str = Field(default="gpt-4o", description="Model name or identifier")
    api_key: Optional[str] = None
    temperature: float = 0.1
    max_tokens: int = 1000
    timeout_seconds: int = 15


class Settings(BaseSettings):
    app_name: str = "XAUUSD Quantitative Trading System"
    app_version: str = "1.0.0"
    environment: str = "development"
    
    # Trading operation mode
    trading_mode: TradingMode = TradingMode.PAPER
    data_mode: DataMode = DataMode.PAPER_FEED
    
    # Emergency switch
    emergency_stop: bool = False
    emergency_stop_reason: Optional[str] = None
    
    # Sub-configurations
    risk: RiskConfig = Field(default_factory=RiskConfig)
    contract: XAUUSDContractSpecs = Field(default_factory=XAUUSDContractSpecs)
    mt5: MT5Config = Field(default_factory=MT5Config)
    ai: AIConfig = Field(default_factory=AIConfig)
    
    # Storage
    db_path: str = "data/xauusd_trader.db"
    
    # API & Dashboard Server
    api_host: str = "0.0.0.0"
    api_port: int = 8000

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_nested_delimiter="__",
        extra="ignore"
    )


settings = Settings()
