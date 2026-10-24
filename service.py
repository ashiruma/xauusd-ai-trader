"""
Unified Trading Coordinator and Lifecycle Orchestrator for XAUUSD.
Connects Market Data -> Market State -> Strategy Engine -> AI Analyst ->
Signal Fusion -> Deterministic Risk Engine -> Execution -> Journaling.
"""

from datetime import datetime, timezone
import logging
from typing import Dict, List, Optional, Any
import uuid

from config.settings import settings, TradingMode, DataMode
from data.models import Tick, Candle, MarketState, CandidateSetup, FusedSignal, Order, OrderSide, OrderStatus, TradeRecord
from data.feed import MarketDataEngine, feed
from state.market_state import MarketStateEngine
from strategy.base import BaseStrategy
from strategy.ict_smc_confluence import IctSmcConfluenceStrategy
from strategy.trend_continuation_v2 import TrendContinuationV2Strategy
from strategy.trend_pullback import TrendPullbackStrategy
from strategy.session_breakout import SessionBreakoutStrategy
from strategy.mean_reversion import MeanReversionStrategy
from strategy.liquidity_sweep import LiquiditySweepStrategy
from ai.analyst import AIAnalyst
from fusion.signal_fusion import SignalFusionEngine
from risk.risk_engine import RiskEngine, risk_engine
from risk.multi_account_governor import multi_account_governor
from execution.base import BaseExecutionAdapter
from execution.paper_adapter import PaperExecutionAdapter
from execution.mt5_adapter import MT5ExecutionAdapter
from performance.metrics import PerformanceEngine
from news.news_engine import news_engine
from data.storage import db

logger = logging.getLogger(__name__)


class TradingCoordinator:
    def __init__(self):
        self.feed: MarketDataEngine = feed
        self.state_engine = MarketStateEngine(self.feed)
        
        self.strategies: List[BaseStrategy] = [
            IctSmcConfluenceStrategy(),
            TrendContinuationV2Strategy(),
            LiquiditySweepStrategy(),
            TrendPullbackStrategy(),
            SessionBreakoutStrategy(),
            MeanReversionStrategy()
        ]
        
        self.ai_analyst = AIAnalyst()
        self.fusion_engine = SignalFusionEngine()
        self.risk_engine: RiskEngine = risk_engine

        # Select execution adapter according to configured trading mode
        self.paper_adapter = PaperExecutionAdapter()
        self.mt5_adapter = MT5ExecutionAdapter()

        # Connect adapter
        if settings.trading_mode == TradingMode.LIVE:
            self.execution_adapter: BaseExecutionAdapter = self.mt5_adapter
            self.mt5_adapter.connect()
        else:
            self.execution_adapter: BaseExecutionAdapter = self.paper_adapter
            self.paper_adapter.connect()

        self.latest_market_state: Optional[MarketState] = None
        self.latest_candidate_setups: List[CandidateSetup] = []
        self.latest_fused_signal: Optional[FusedSignal] = None
        self.is_running: bool = False
        self._listeners: List[Any] = []

        # Prime market state and risk metrics from live broker / active adapter
        self.prime_initial_state()

    def prime_initial_state(self) -> None:
        """Prime latest_market_state with live broker quote and sync risk engine metrics."""
        try:
            adapter = self.get_active_adapter()
            if adapter and adapter.is_connected():
                acc_info = adapter.get_account_info()
                if acc_info and "equity" in acc_info and acc_info["equity"] > 0:
                    self.risk_engine.reset_drawdown_baseline(acc_info["equity"])

                quote = adapter.get_quote()
                bid = quote.get("bid", 0.0) if quote else 0.0
                ask = quote.get("ask", 0.0) if quote else 0.0
                if bid > 0 and ask > 0:
                    spread_pts = quote.get("spread_points", 25.0)
                    quote_time = quote.get("time")
                    tick_time = datetime.fromtimestamp(int(quote_time), tz=timezone.utc) if quote_time else datetime.now(timezone.utc)
                    tick = Tick(
                        symbol=settings.contract.symbol,
                        time=tick_time,
                        bid=bid,
                        ask=ask,
                        spread=spread_pts,
                        volume=1.0
                    )
                    self.feed.process_tick(tick)
                    self.latest_market_state = self.state_engine.build_current_state(
                        open_positions_count=len(adapter.get_open_positions()),
                        is_news_active=False
                    )
            if self.latest_market_state is None:
                self.latest_market_state = self.state_engine.build_current_state(
                    open_positions_count=0,
                    is_news_active=False
                )
        except Exception as e:
            logger.debug(f"State priming encountered exception: {e}")

    def refresh_market_quote(self) -> Optional[MarketState]:
        """Fetch real-time spot quote from active broker adapter and update latest_market_state."""
        try:
            adapter = self.get_active_adapter()
            if adapter and adapter.is_connected():
                quote = adapter.get_quote()
                bid = quote.get("bid", 0.0) if quote else 0.0
                ask = quote.get("ask", 0.0) if quote else 0.0
                if bid > 0 and ask > 0:
                    spread_pts = quote.get("spread_points", 25.0)
                    quote_time = quote.get("time")
                    tick_time = datetime.fromtimestamp(int(quote_time), tz=timezone.utc) if quote_time else datetime.now(timezone.utc)
                    tick = Tick(
                        symbol=settings.contract.symbol,
                        time=tick_time,
                        bid=bid,
                        ask=ask,
                        spread=spread_pts,
                        volume=1.0
                    )
                    self.feed.process_tick(tick)
                    self.latest_market_state = self.state_engine.build_current_state(
                        open_positions_count=len(adapter.get_open_positions()),
                        is_news_active=False
                    )
                    return self.latest_market_state
        except Exception as e:
            logger.debug(f"Refresh quote error: {e}")
        return self.latest_market_state

    def reset_risk_baseline(self, new_equity: Optional[float] = None) -> Dict[str, Any]:
        """Reset drawdown and risk metrics baseline to current active broker equity."""
        if new_equity is None or new_equity <= 0:
            adapter = self.get_active_adapter()
            if adapter and adapter.is_connected():
                acc = adapter.get_account_info()
                new_equity = acc.get("equity", 50.0)
            else:
                new_equity = 50.0
        self.risk_engine.reset_drawdown_baseline(new_equity)
        return {
            "success": True,
            "message": f"Risk engine baseline reset to ${new_equity:.2f}",
            "equity": new_equity,
            "peak_equity": self.risk_engine.peak_equity,
            "daily_starting_equity": self.risk_engine.daily_starting_equity,
            "consecutive_losses": self.risk_engine.consecutive_losses,
            "emergency_stop": self.risk_engine._emergency_stop
        }

    def register_broadcast_listener(self, listener: Any) -> None:
        if listener not in self._listeners:
            self._listeners.append(listener)

    def unregister_broadcast_listener(self, listener: Any) -> None:
        if listener in self._listeners:
            self._listeners.remove(listener)

    def broadcast(self, data: Dict[str, Any]) -> None:
        for listener in list(self._listeners):
            try:
                listener(data)
            except Exception as e:
                logger.debug(f"Broadcast listener exception: {e}")

    def close_position(self, ticket: int, reason: str = "MANUAL_UI") -> Optional[TradeRecord]:
        adapter = self.get_active_adapter()
        record = adapter.close_position(ticket, reason=reason)
        if record:
            self.broadcast({
                "type": "POSITION_CLOSED",
                "trade": record.model_dump(),
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
        return record

    def get_active_adapter(self) -> BaseExecutionAdapter:
        if settings.trading_mode == TradingMode.LIVE:
            return self.mt5_adapter
        return self.paper_adapter

    def manage_open_positions(self, current_bid: float, current_ask: float) -> List[Dict[str, Any]]:
        """
        Active Profit Protection & Maximization Mechanism:
        - Break-Even Lock: Moves Stop Loss to Entry + Lock Points when profit reaches trigger.
        - Trailing Stop Ratchet: Dynamically trails Stop Loss behind market to ride extensions.
        """
        if current_bid <= 0 or current_ask <= 0:
            return []

        adapter = self.get_active_adapter()
        positions = adapter.get_open_positions()
        if not positions:
            return []

        modifications = []
        point_size = settings.contract.point_size  # 0.01

        # Baseline profit collection settings
        be_trigger = settings.risk.break_even_trigger_points
        be_lock = settings.risk.break_even_lock_points
        trailing_trigger = settings.risk.trailing_trigger_points
        trailing_dist = settings.risk.trailing_distance_points
        tier_label = "STANDARD"

        if getattr(settings.risk, "enable_adaptive_tiers", False):
            active_equity = 1000.0
            try:
                acc_info = adapter.get_account_info()
                active_equity = float(acc_info.get("equity", 1000.0))
            except Exception:
                pass
            tier_params = settings.risk.get_tier_parameters(active_equity)
            be_trigger = tier_params.get("be_trigger_points", be_trigger)
            be_lock = tier_params.get("be_lock_points", be_lock)
            trailing_trigger = tier_params.get("trailing_trigger_points", trailing_trigger)
            trailing_dist = tier_params.get("trailing_distance_points", trailing_dist)
            tier_label = tier_params.get("tier", "STANDARD")

        for pos in positions:
            if pos.side == OrderSide.BUY:
                profit_points = (current_bid - pos.entry_price) / point_size
                new_sl = pos.stop_loss

                # 1. Break-Even check
                if settings.risk.enable_break_even and profit_points >= be_trigger:
                    target_be = round(pos.entry_price + (be_lock * point_size), 2)
                    if pos.stop_loss < target_be:
                        new_sl = target_be

                # 2. Trailing Stop check
                if settings.risk.enable_trailing_stop and profit_points >= trailing_trigger:
                    target_trail = round(current_bid - (trailing_dist * point_size), 2)
                    if target_trail > new_sl:
                        new_sl = target_trail

                # Modify if SL has improved
                if new_sl > pos.stop_loss:
                    success = adapter.modify_position(pos.ticket, stop_loss=new_sl, take_profit=pos.take_profit)
                    if success:
                        pos.stop_loss = new_sl
                        trigger_type = "TRAILING_STOP" if new_sl > (pos.entry_price + (be_lock * point_size)) else "BREAK_EVEN"
                        mod_info = {
                            "ticket": pos.ticket,
                            "side": "BUY",
                            "new_sl": new_sl,
                            "profit_points": round(profit_points, 1),
                            "trigger": trigger_type,
                            "tier": tier_label
                        }
                        modifications.append(mod_info)
                        logger.info(f"BUY Position #{pos.ticket} SL adjusted to {new_sl} ({trigger_type} - {tier_label})")
                        self.broadcast({
                            "type": "POSITION_MODIFIED",
                            "data": mod_info,
                            "timestamp": datetime.now(timezone.utc).isoformat()
                        })

            elif pos.side == OrderSide.SELL:
                profit_points = (pos.entry_price - current_ask) / point_size
                new_sl = pos.stop_loss

                # 1. Break-Even check
                if settings.risk.enable_break_even and profit_points >= be_trigger:
                    target_be = round(pos.entry_price - (be_lock * point_size), 2)
                    if pos.stop_loss == 0.0 or pos.stop_loss > target_be:
                        new_sl = target_be

                # 2. Trailing Stop check
                if settings.risk.enable_trailing_stop and profit_points >= trailing_trigger:
                    target_trail = round(current_ask + (trailing_dist * point_size), 2)
                    if pos.stop_loss == 0.0 or target_trail < new_sl:
                        new_sl = target_trail

                # Modify if SL has improved (for SELL, lower SL is better)
                if (pos.stop_loss == 0.0 and new_sl > 0) or (new_sl < pos.stop_loss):
                    success = adapter.modify_position(pos.ticket, stop_loss=new_sl, take_profit=pos.take_profit)
                    if success:
                        pos.stop_loss = new_sl
                        trigger_type = "TRAILING_STOP" if new_sl < (pos.entry_price - (be_lock * point_size)) else "BREAK_EVEN"
                        mod_info = {
                            "ticket": pos.ticket,
                            "side": "SELL",
                            "new_sl": new_sl,
                            "profit_points": round(profit_points, 1),
                            "trigger": trigger_type,
                            "tier": tier_label
                        }
                        modifications.append(mod_info)
                        logger.info(f"SELL Position #{pos.ticket} SL adjusted to {new_sl} ({trigger_type})")
                        self.broadcast({
                            "type": "POSITION_MODIFIED",
                            "data": mod_info,
                            "timestamp": datetime.now(timezone.utc).isoformat()
                        })

        return modifications

    def step(self, tick: Optional[Tick] = None) -> Dict[str, Any]:
        """
        Single processing step triggered by incoming tick, candle, or timer cycle.
        """
        adapter = self.get_active_adapter()

        # Ingest tick if provided
        if tick:
            self.feed.process_tick(tick)
            if isinstance(adapter, PaperExecutionAdapter):
                adapter.update_market_quote(tick.bid, tick.ask)
            if tick.bid > 0 and tick.ask > 0:
                self.manage_open_positions(tick.bid, tick.ask)

        # 1. Update Market State
        open_positions = adapter.get_open_positions()
        news_status, _, _ = news_engine.check_news_status(datetime.now(timezone.utc))
        is_news_active = (news_status.value == "NEWS_LOCKOUT")
        
        self.latest_market_state = self.state_engine.build_current_state(
            open_positions_count=len(open_positions),
            is_news_active=is_news_active
        )
        
        # Persist market state snapshot
        state_id = f"ST_{uuid.uuid4().hex[:10]}"
        db.record_market_state(state_id, self.latest_market_state)

        # 2. Strategy Engine Evaluation
        self.latest_candidate_setups = []
        for strat in self.strategies:
            setup = strat.evaluate(self.latest_market_state)
            if setup:
                self.latest_candidate_setups.append(setup)
                setup_id = f"SET_{uuid.uuid4().hex[:10]}"
                db.record_candidate_setup(setup_id, setup)

        # 3. AI Analysis (if candidate setup found)
        ai_decision = None
        if self.latest_candidate_setups:
            # Pick primary candidate setup matching highest strategy weight in fusion engine
            primary_candidate = max(
                self.latest_candidate_setups,
                key=lambda s: self.fusion_engine.strategy_weights.get(s.strategy_id, 1.0)
            )
            ai_decision = self.ai_analyst.analyze_setup(
                market_state=self.latest_market_state,
                candidate_setup=primary_candidate,
                news_status=news_status.value
            )

        # 4. Signal Fusion
        self.latest_fused_signal = self.fusion_engine.fuse(
            market_state=self.latest_market_state,
            candidate_setups=self.latest_candidate_setups,
            ai_decision=ai_decision
        )

        # 5. Deterministic Risk Evaluation & Multi-Account Execution for Active Traders
        order_result = None
        multi_account_orders = []

        if self.latest_fused_signal.is_valid and self.latest_fused_signal.side in (OrderSide.BUY, OrderSide.SELL):
            acc_info = adapter.get_account_info()
            primary_acc_id = str(acc_info.get("login") or "1200533810").strip()
            equity = acc_info.get("equity") or 50.0

            # 5a. Primary connection execution
            can_trade_primary, primary_reason = multi_account_governor.can_account_trade(primary_acc_id, equity)
            if can_trade_primary:
                risk_decision = self.risk_engine.evaluate(
                    signal=self.latest_fused_signal,
                    market_state=self.latest_market_state,
                    account_equity=equity,
                    open_positions_count=len(open_positions),
                    is_broker_connected=adapter.is_connected(),
                    account_id=primary_acc_id
                )

                if risk_decision.approved and risk_decision.lot_size > 0:
                    order = Order(
                        order_id=f"ORD_{uuid.uuid4().hex[:12]}",
                        signal_id=self.latest_fused_signal.signal_id,
                        strategy_id=self.latest_fused_signal.strategy_id,
                        magic_number=settings.mt5.magic_number,
                        symbol=self.latest_market_state.symbol,
                        side=self.latest_fused_signal.side,
                        lot_size=risk_decision.lot_size,
                        requested_price=self.latest_fused_signal.entry,
                        stop_loss=self.latest_fused_signal.stop_loss,
                        take_profit=self.latest_fused_signal.take_profit,
                        created_at=datetime.now(timezone.utc)
                    )
                    order_result = adapter.submit_order(order)
            else:
                logger.info(f"Primary account #{primary_acc_id} trading paused: {primary_reason}")

            # 5b. Multi-Account Dispatch for All Active Verified Traders
            try:
                active_traders = db.get_active_traders()
                for trader in active_traders:
                    t_acc_id = str(trader.get("justmarkets_account_id") or "").strip()
                    if not t_acc_id or t_acc_id == primary_acc_id:
                        continue
                    t_equity = float(trader.get("equity") or 100.0)

                    can_t_trade, t_reason = multi_account_governor.can_account_trade(t_acc_id, t_equity)
                    if can_t_trade:
                        t_decision = self.risk_engine.evaluate(
                            signal=self.latest_fused_signal,
                            market_state=self.latest_market_state,
                            account_equity=t_equity,
                            open_positions_count=0,
                            is_broker_connected=True,
                            account_id=t_acc_id
                        )
                        if t_decision.approved and t_decision.lot_size > 0:
                            t_order = Order(
                                order_id=f"ORD_{uuid.uuid4().hex[:12]}",
                                signal_id=self.latest_fused_signal.signal_id,
                                strategy_id=self.latest_fused_signal.strategy_id,
                                magic_number=settings.mt5.magic_number,
                                symbol=self.latest_market_state.symbol,
                                side=self.latest_fused_signal.side,
                                lot_size=t_decision.lot_size,
                                requested_price=self.latest_fused_signal.entry,
                                stop_loss=self.latest_fused_signal.stop_loss,
                                take_profit=self.latest_fused_signal.take_profit,
                                created_at=datetime.now(timezone.utc)
                            )
                            db.record_order(t_order)
                            multi_account_orders.append({
                                "account_id": t_acc_id,
                                "order_id": t_order.order_id,
                                "side": t_order.side.value,
                                "lot_size": t_order.lot_size,
                            })
            except Exception as e:
                logger.debug(f"Multi-account execution note: {e}")

        result = {
            "type": "TICK_STEP",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "market_state": self.latest_market_state.model_dump() if self.latest_market_state else None,
            "candidate_setups": [s.model_dump() for s in self.latest_candidate_setups],
            "fused_signal": self.latest_fused_signal.model_dump() if self.latest_fused_signal else None,
            "open_positions": [p.model_dump() for p in adapter.get_open_positions()],
            "order_result": order_result.model_dump() if order_result else None
        }
        self.broadcast(result)
        return result

    def get_system_status(self) -> Dict[str, Any]:
        adapter = self.get_active_adapter()
        acc = adapter.get_account_info()
        trades = db.get_all_trades(limit=100)
        from data.models import TradeRecord
        typed_trades = [TradeRecord.model_validate(t) for t in trades]
        perf = PerformanceEngine.compute_metrics(typed_trades, initial_capital=100000.0)
        emergency_active, emergency_reason = self.risk_engine.is_emergency_stop_active()

        mt5_trade_allowed = False
        if hasattr(self.mt5_adapter, "is_trade_allowed"):
            mt5_trade_allowed = self.mt5_adapter.is_trade_allowed()

        return {
            "app_name": settings.app_name,
            "version": settings.app_version,
            "trading_mode": settings.trading_mode.value,
            "data_mode": settings.data_mode.value,
            "emergency_stop": emergency_active,
            "emergency_stop_reason": emergency_reason,
            "broker_connected": adapter.is_connected(),
            "mt5_algo_trading_allowed": mt5_trade_allowed,
            "account": acc,
            "open_positions": [p.model_dump(mode="json") for p in adapter.get_open_positions()],
            "performance": perf,
            "ai_provider": type(self.ai_analyst.provider).__name__,
            "last_heartbeat": datetime.now(timezone.utc).isoformat()
        }


# Global trading coordinator instance
coordinator = TradingCoordinator()
