"""
Deterministic Signal Fusion Engine for XAUUSD.
Synthesizes candidate setups, multi-agent scores, and AI recommendations
into a single deterministic FusedSignal.
"""

from datetime import datetime, timezone, timedelta
import logging
import uuid
from typing import List, Optional, Dict, Any
from config.settings import settings
from data.models import (
    CandidateSetup, AISignalDecision, FusedSignal, OrderSide, MarketRegimeType, MarketState
)
from ai.agents.specialized_agents import (
    TrendStructureAnalyst, VolatilityMomentumAnalyst, TradeReviewer
)
from data.storage import db

logger = logging.getLogger(__name__)


class SignalFusionEngine:
    def __init__(self):
        self.trend_agent = TrendStructureAnalyst()
        self.vol_agent = VolatilityMomentumAnalyst()
        self.reviewer = TradeReviewer()
        
        # Strategy reliability weights (calibrated deterministically)
        self.strategy_weights = {
            "XAU_LIQUIDITY_SWEEP": 1.35,
            "XAU_TREND_PULLBACK": 1.10,
            "XAU_MEAN_REVERSION": 1.05,
            "XAU_SESSION_BREAKOUT": 1.00
        }

    def fuse(
        self,
        market_state: MarketState,
        candidate_setups: List[CandidateSetup],
        ai_decision: Optional[AISignalDecision]
    ) -> FusedSignal:
        signal_id = f"SIG_{uuid.uuid4().hex[:12]}"
        now = market_state.timestamp if (market_state and market_state.timestamp) else datetime.now(timezone.utc)

        # 1. Check if candidate setups exist
        if not candidate_setups:
            sig = FusedSignal(
                signal_id=signal_id,
                timestamp=now,
                symbol=market_state.symbol,
                side=OrderSide.NO_TRADE,
                entry=market_state.current_price,
                stop_loss=0.0,
                take_profit=0.0,
                risk_reward=0.0,
                confidence=0.0,
                strategy_id="NONE",
                market_regime=market_state.regime,
                reasons=["No candidate strategy setups generated for current bar"],
                expiry=now,
                is_valid=False
            )
            db.record_signal(sig)
            return sig

        # 2. Check for conflicting candidate setups (BUY and SELL simultaneous signals)
        buy_setups = [s for s in candidate_setups if s.side == OrderSide.BUY]
        sell_setups = [s for s in candidate_setups if s.side == OrderSide.SELL]

        if buy_setups and sell_setups:
            sig = FusedSignal(
                signal_id=signal_id,
                timestamp=now,
                symbol=market_state.symbol,
                side=OrderSide.NO_TRADE,
                entry=market_state.current_price,
                stop_loss=0.0,
                take_profit=0.0,
                risk_reward=0.0,
                confidence=0.0,
                strategy_id="CONFLICT",
                market_regime=market_state.regime,
                reasons=["Signal conflict: Simultaneous contradictory BUY and SELL setups detected"],
                expiry=now,
                is_valid=False
            )
            db.record_signal(sig)
            return sig

        active_setups = buy_setups if buy_setups else sell_setups
        # Pick the setup with highest strategy weight
        primary_setup = max(
            active_setups,
            key=lambda s: self.strategy_weights.get(s.strategy_id, 1.0)
        )

        # 3. Multi-agent deterministic scoring
        trend_res = self.trend_agent.analyze(market_state, primary_setup)
        vol_res = self.vol_agent.analyze(market_state, primary_setup)
        review_res = self.reviewer.review(primary_setup)

        all_reasons = []
        all_reasons.extend(trend_res["reasons"])
        all_reasons.extend(vol_res["reasons"])
        all_reasons.extend(review_res["reasons"])

        if not review_res["viable"]:
            sig = FusedSignal(
                signal_id=signal_id,
                timestamp=now,
                symbol=market_state.symbol,
                side=OrderSide.NO_TRADE,
                entry=primary_setup.entry,
                stop_loss=primary_setup.stop_loss,
                take_profit=primary_setup.take_profit,
                risk_reward=primary_setup.risk_reward,
                confidence=0.2,
                strategy_id=primary_setup.strategy_id,
                market_regime=market_state.regime,
                reasons=all_reasons + ["TradeReviewer flagged invalid setup parameters"],
                expiry=now,
                is_valid=False
            )
            db.record_signal(sig)
            return sig

        # 4. Integrate AI decision support (if present)
        ai_weight = 0.25
        agent_score = (trend_res["score"] * 0.45) + (vol_res["score"] * 0.35) + (review_res["score"] * 0.20)
        
        if ai_decision:
            if not ai_decision.setup_valid or ai_decision.decision == OrderSide.NO_TRADE:
                # Check if this was an AI transport/offline/schema infrastructure failure
                is_infra_error = any("failed schema validation" in r.lower() or "offline" in r.lower() or "unreachable" in r.lower() or "fallback" in r.lower() for r in ai_decision.reasons)
                if is_infra_error:
                    logger.info("AI Decision unavailable or infrastructure failed; gracefully falling back to deterministic agent score")
                    composite_confidence = agent_score
                    all_reasons.append("AI offline/unreachable: deterministic quantitative fallback engaged")
                else:
                    sig = FusedSignal(
                        signal_id=signal_id,
                        timestamp=now,
                        symbol=market_state.symbol,
                        side=OrderSide.NO_TRADE,
                        entry=primary_setup.entry,
                        stop_loss=primary_setup.stop_loss,
                        take_profit=primary_setup.take_profit,
                        risk_reward=primary_setup.risk_reward,
                        confidence=0.25,
                        strategy_id=primary_setup.strategy_id,
                        market_regime=market_state.regime,
                        reasons=all_reasons + [f"AI Analyst rejected setup: {', '.join(ai_decision.reasons)}"],
                        expiry=now,
                        is_valid=False
                    )
                    db.record_signal(sig)
                    return sig
            elif ai_decision.decision == primary_setup.side:
                composite_confidence = (agent_score * (1.0 - ai_weight)) + (ai_decision.confidence * ai_weight)
                all_reasons.extend(ai_decision.reasons)
            else:
                # Contradiction between strategy side and AI side
                sig = FusedSignal(
                    signal_id=signal_id,
                    timestamp=now,
                    symbol=market_state.symbol,
                    side=OrderSide.NO_TRADE,
                    entry=primary_setup.entry,
                    stop_loss=primary_setup.stop_loss,
                    take_profit=primary_setup.take_profit,
                    risk_reward=primary_setup.risk_reward,
                    confidence=0.3,
                    strategy_id=primary_setup.strategy_id,
                    market_regime=market_state.regime,
                    reasons=all_reasons + [f"Directional divergence: Strategy={primary_setup.side.value} vs AI={ai_decision.decision.value}"],
                    expiry=now,
                    is_valid=False
                )
                db.record_signal(sig)
                return sig
        else:
            composite_confidence = agent_score

        # Minimum required confidence threshold (0.52 for viable institutional setups)
        if composite_confidence < 0.52:
            sig = FusedSignal(
                signal_id=signal_id,
                timestamp=now,
                symbol=market_state.symbol,
                side=OrderSide.NO_TRADE,
                entry=primary_setup.entry,
                stop_loss=primary_setup.stop_loss,
                take_profit=primary_setup.take_profit,
                risk_reward=primary_setup.risk_reward,
                confidence=round(composite_confidence, 2),
                strategy_id=primary_setup.strategy_id,
                market_regime=market_state.regime,
                reasons=all_reasons + [f"Composite confidence {composite_confidence:.2f} below threshold 0.52"],
                expiry=now,
                is_valid=False
            )
            db.record_signal(sig)
            return sig

        fused = FusedSignal(
            signal_id=signal_id,
            timestamp=now,
            symbol=market_state.symbol,
            side=primary_setup.side,
            entry=primary_setup.entry,
            stop_loss=primary_setup.stop_loss,
            take_profit=primary_setup.take_profit,
            risk_reward=primary_setup.risk_reward,
            confidence=round(composite_confidence, 2),
            strategy_id=primary_setup.strategy_id,
            market_regime=market_state.regime,
            reasons=all_reasons,
            expiry=primary_setup.expiry,
            is_valid=True
        )
        db.record_signal(fused)
        return fused
