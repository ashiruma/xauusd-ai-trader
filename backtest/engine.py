"""
Event-Driven Backtesting Engine for XAUUSD.
Strict bar-by-bar evaluation with zero look-ahead bias, realistic spread,
slippage modeling, commission accounting, session filters, and dynamic risk enforcement.
"""

from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import uuid

from config.settings import settings
from data.models import Candle, OrderSide, TimeFrame, TradeRecord, Order, OrderStatus
from data.feed import MarketDataEngine
from state.market_state import MarketStateEngine
from strategy.base import BaseStrategy
from strategy.trend_pullback import TrendPullbackStrategy
from strategy.session_breakout import SessionBreakoutStrategy
from strategy.mean_reversion import MeanReversionStrategy
from strategy.liquidity_sweep import LiquiditySweepStrategy
from ai.analyst import AIAnalyst
from fusion.signal_fusion import SignalFusionEngine
from risk.risk_engine import RiskEngine
from execution.order_validator import OrderValidator
from data.storage import db


class BacktestEngine:
    def __init__(
        self,
        initial_balance: float = 100000.0,
        commission_per_lot: float = 6.0,
        spread_points: float = 25.0,
        slippage_points: float = 2.0
    ):
        self.initial_balance = initial_balance
        self.balance = initial_balance
        self.equity = initial_balance
        self.commission_per_lot = commission_per_lot
        self.spread_points = spread_points
        self.slippage_points = slippage_points
        
        # Core engines
        self.strategies: List[BaseStrategy] = [
            TrendPullbackStrategy(),
            LiquiditySweepStrategy(),
            SessionBreakoutStrategy(),
            MeanReversionStrategy()
        ]
        self.ai_analyst = AIAnalyst()
        self.fusion_engine = SignalFusionEngine()
        self.risk_engine = RiskEngine()
        self.risk_engine.initial_equity = initial_balance
        self.risk_engine.peak_equity = initial_balance

        # Active trade
        self.active_position: Optional[Dict[str, Any]] = None
        self.trades: List[TradeRecord] = []
        self.equity_curve: List[Dict[str, Any]] = []

    def run(self, historical_candles: List[Candle]) -> Dict[str, Any]:
        """
        Step sequentially through historical candles.
        Prevents lookahead bias by feeding bars one by one into the market data engine.
        """
        sim_data_engine = MarketDataEngine(symbol="XAUUSD", max_history_bars=1000)
        state_engine = MarketStateEngine(sim_data_engine)

        spread_dollars = self.spread_points * settings.contract.point_size
        slippage_dollars = self.slippage_points * settings.contract.point_size

        if historical_candles:
            self.risk_engine.current_day = historical_candles[0].timestamp.date()
            self.risk_engine._recent_signals.clear()

        db_prev = db.enabled
        db.enabled = False
        for i, candle in enumerate(historical_candles):
            # Feed current bar to data engine
            sim_data_engine.add_candle(candle)
            
            # Need at least 60 bars to compute technical indicators and structure
            if i < 60:
                continue

            current_time = candle.timestamp
            bar_open = candle.open
            bar_high = candle.high
            bar_low = candle.low
            bar_close = candle.close

            # 1. Manage Active Position (Check for SL / TP hits inside current candle)
            if self.active_position is not None:
                pos = self.active_position
                closed = False
                exit_price = 0.0
                exit_reason = ""

                if pos["side"] == OrderSide.BUY:
                    # Check SL
                    if bar_low <= pos["stop_loss"]:
                        exit_price = pos["stop_loss"]
                        exit_reason = "BE" if pos["stop_loss"] >= pos["entry_price"] else "SL"
                        closed = True
                    # Check TP
                    elif bar_high >= pos["take_profit"]:
                        exit_price = pos["take_profit"]
                        exit_reason = "TP"
                        closed = True
                    elif settings.risk.enable_break_even or settings.risk.enable_trailing_stop:
                        profit_pts = (bar_high - pos["entry_price"]) / settings.contract.point_size
                        if settings.risk.enable_break_even and profit_pts >= settings.risk.break_even_trigger_points:
                            pos["stop_loss"] = max(pos["stop_loss"], round(pos["entry_price"] + (settings.risk.break_even_lock_points * settings.contract.point_size), 2))
                        if settings.risk.enable_trailing_stop and profit_pts >= settings.risk.trailing_trigger_points:
                            pos["stop_loss"] = max(pos["stop_loss"], round(bar_high - (settings.risk.trailing_distance_points * settings.contract.point_size), 2))

                elif pos["side"] == OrderSide.SELL:
                    # Check SL
                    if bar_high >= pos["stop_loss"]:
                        exit_price = pos["stop_loss"]
                        exit_reason = "BE" if pos["stop_loss"] <= pos["entry_price"] else "SL"
                        closed = True
                    # Check TP
                    elif bar_low <= pos["take_profit"]:
                        exit_price = pos["take_profit"]
                        exit_reason = "TP"
                        closed = True
                    elif settings.risk.enable_break_even or settings.risk.enable_trailing_stop:
                        profit_pts = (pos["entry_price"] - bar_low) / settings.contract.point_size
                        if settings.risk.enable_break_even and profit_pts >= settings.risk.break_even_trigger_points:
                            pos["stop_loss"] = min(pos["stop_loss"], round(pos["entry_price"] - (settings.risk.break_even_lock_points * settings.contract.point_size), 2))
                        if settings.risk.enable_trailing_stop and profit_pts >= settings.risk.trailing_trigger_points:
                            pos["stop_loss"] = min(pos["stop_loss"], round(bar_low + (settings.risk.trailing_distance_points * settings.contract.point_size), 2))

                if closed:
                    # Calculate PnL
                    lots = pos["lots"]
                    if pos["side"] == OrderSide.BUY:
                        pnl = (exit_price - pos["entry_price"]) * lots * settings.contract.contract_size
                    else:
                        pnl = (pos["entry_price"] - exit_price) * lots * settings.contract.contract_size

                    comm = lots * self.commission_per_lot
                    net_pnl = round(pnl - comm, 2)
                    self.balance = round(self.balance + net_pnl, 2)
                    self.equity = self.balance

                    # Update risk engine metrics
                    self.risk_engine.update_account_metrics(self.equity, trade_pnl=net_pnl, current_time=current_time)

                    trade = TradeRecord(
                        trade_id=f"BKT_{uuid.uuid4().hex[:10]}",
                        ticket=pos["ticket"],
                        signal_id=pos["signal_id"],
                        strategy_id=pos["strategy_id"],
                        symbol="XAUUSD",
                        side=pos["side"],
                        lots=lots,
                        entry_price=pos["entry_price"],
                        exit_price=exit_price,
                        pnl=net_pnl,
                        return_pct=round((net_pnl / self.balance) * 100.0, 3),
                        commission=comm,
                        swap=0.0,
                        entry_time=pos["entry_time"],
                        exit_time=current_time,
                        exit_reason=exit_reason,
                        holding_seconds=(current_time - pos["entry_time"]).total_seconds(),
                        market_regime=pos.get("market_regime"),
                        session=pos.get("session")
                    )
                    self.trades.append(trade)
                    db.record_trade(trade)
                    self.active_position = None

            # 2. If no position is open, evaluate market state and strategies
            if self.active_position is None:
                market_state = state_engine.build_current_state(open_positions_count=0)

                # Evaluate strategies
                candidate_setups = []
                for strat in self.strategies:
                    setup = strat.evaluate(market_state)
                    if setup:
                        candidate_setups.append(setup)

                if candidate_setups:
                    # Run AI analyst on candidate
                    ai_decision = self.ai_analyst.analyze_setup(market_state, candidate_setups[0])
                    
                    # Signal fusion
                    fused_signal = self.fusion_engine.fuse(market_state, candidate_setups, ai_decision)

                    if fused_signal.is_valid and fused_signal.side in (OrderSide.BUY, OrderSide.SELL):
                        # Pass through deterministic risk engine
                        risk_decision = self.risk_engine.evaluate(
                            signal=fused_signal,
                            market_state=market_state,
                            account_equity=self.equity,
                            open_positions_count=0,
                            is_broker_connected=True
                        )

                        if risk_decision.approved and risk_decision.lot_size > 0:
                            # Model realistic fill with spread & slippage
                            if fused_signal.side == OrderSide.BUY:
                                fill_price = round(bar_close + (spread_dollars / 2.0) + slippage_dollars, 2)
                            else:
                                fill_price = round(bar_close - (spread_dollars / 2.0) - slippage_dollars, 2)

                            self.active_position = {
                                "ticket": 800000 + len(self.trades) + 1,
                                "signal_id": fused_signal.signal_id,
                                "strategy_id": fused_signal.strategy_id,
                                "side": fused_signal.side,
                                "lots": risk_decision.lot_size,
                                "entry_price": fill_price,
                                "stop_loss": fused_signal.stop_loss,
                                "take_profit": fused_signal.take_profit,
                                "entry_time": current_time,
                                "market_regime": market_state.regime,
                                "session": market_state.session
                            }

            # Record periodic equity curve
            self.equity_curve.append({
                "time": current_time.isoformat(),
                "equity": self.equity,
                "balance": self.balance,
                "open_trades": 1 if self.active_position else 0
            })

        db.enabled = db_prev

        return {
            "initial_balance": self.initial_balance,
            "final_balance": self.balance,
            "net_profit": round(self.balance - self.initial_balance, 2),
            "total_trades": len(self.trades),
            "trades": self.trades,
            "equity_curve": self.equity_curve
        }
