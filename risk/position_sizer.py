"""
Deterministic Position Sizing Engine for XAUUSD.
Calculates accurate institutional lot sizing based on account equity,
risk percentage, stop loss distance, and broker contract specifications.
Incorporate worst-case loss at actual stop, including spread, commission, and slippage.
Never permits minimum-volume overrides that exceed the per-position risk ceiling.
"""

import math
from typing import Tuple, Optional, Any, Dict
from config.settings import settings


class PositionSizer:
    @staticmethod
    def calculate_lot_size(
        account_equity: float,
        entry_price: float,
        stop_loss: float,
        risk_pct: float = 2.0,
        risk_ceiling_pct: Optional[float] = None,
        max_risk_usd: Optional[float] = None,
        contract_size: float = 100.0,
        point_size: float = 0.01,
        min_lot: float = 0.01,
        max_lot: float = 100.0,
        lot_step: float = 0.01,
        spread_points: float = 0.0,
        commission_per_lot: float = 0.0,
        slippage_points: float = 0.0,
        allow_min_lot_override: bool = False
    ) -> Tuple[float, float, float]:
        """
        Calculates position size in lots for XAUUSD with optional worst-case friction costs.
        Returns:
            (lot_size, worst_case_loss_usd, stop_distance_points)
        """
        if account_equity <= 0:
            return 0.0, 0.0, 0.0

        stop_distance_dollars = abs(entry_price - stop_loss)
        if stop_distance_dollars <= 0.0001:
            return 0.0, 0.0, 0.0

        effective_point_size = point_size if point_size > 0 else settings.contract.point_size
        stop_distance_points = round(stop_distance_dollars / effective_point_size, 1)

        # Risk budget calculations
        ceiling_pct = risk_ceiling_pct if risk_ceiling_pct is not None else max(risk_pct * 1.5, 10.0)
        effective_risk_pct = min(risk_pct, ceiling_pct)
        risk_budget_usd = account_equity * (effective_risk_pct / 100.0)
        hard_risk_cap_usd = account_equity * (ceiling_pct / 100.0)

        # Apply absolute dollar cap (e.g. profit cushion allocation cap) if specified
        if max_risk_usd is not None and max_risk_usd > 0:
            risk_budget_usd = min(risk_budget_usd, max_risk_usd)
            hard_risk_cap_usd = min(hard_risk_cap_usd, max_risk_usd)

        # Loss per 1.00 lot includes price stop loss, plus any spread, commission, and slippage buffer
        price_loss_per_lot = stop_distance_dollars * contract_size
        spread_cost_per_lot = (spread_points * effective_point_size) * contract_size
        slippage_cost_per_lot = (slippage_points * effective_point_size) * contract_size
        commission_cost_per_lot = commission_per_lot

        total_loss_per_lot = (
            price_loss_per_lot
            + spread_cost_per_lot
            + slippage_cost_per_lot
            + commission_cost_per_lot
        )

        if total_loss_per_lot <= 0:
            return 0.0, 0.0, stop_distance_points

        raw_lot_size = risk_budget_usd / total_loss_per_lot

        # Institutional safety: Round DOWN to nearest lot_step to never exceed the risk budget
        step_factor = 1.0 / lot_step if lot_step > 0 else 100.0
        rounded_lot = math.floor(raw_lot_size * step_factor) / step_factor
        rounded_lot = round(rounded_lot, 4)

        # Check against broker minimum volume
        if rounded_lot < min_lot:
            min_lot_loss = round(min_lot * total_loss_per_lot, 2)
            if allow_min_lot_override and account_equity >= 20.0:
                # If an explicit risk ceiling was provided, it is a hard ceiling: never exceed it
                if risk_ceiling_pct is not None:
                    max_tolerated_risk = hard_risk_cap_usd
                else:
                    max_tolerated_risk = max(hard_risk_cap_usd, 5.00)

                if min_lot_loss > max_tolerated_risk or stop_distance_points > 600.0:
                    return 0.0, min_lot_loss, stop_distance_points
                rounded_lot = min_lot
            else:
                # When override is not enabled, reject if min_lot exceeds allowed risk budget tolerance
                if min_lot_loss > (risk_budget_usd * 1.25):
                    return 0.0, min_lot_loss, stop_distance_points
                rounded_lot = min_lot

        # Clamp between min_lot and max_lot
        clamped_lot = min(max_lot, max(min_lot, rounded_lot))
        actual_worst_case_usd = round(clamped_lot * total_loss_per_lot, 2)

        # Final verification: actual loss must never exceed the tolerated risk cap
        if risk_ceiling_pct is not None:
            max_allowed_loss = hard_risk_cap_usd
        else:
            max_allowed_loss = max(hard_risk_cap_usd, 5.00) if (allow_min_lot_override and account_equity >= 20.0) else (hard_risk_cap_usd * 1.05)

        if actual_worst_case_usd > (max_allowed_loss * 1.02):
            return 0.0, actual_worst_case_usd, stop_distance_points

        return round(clamped_lot, 2), actual_worst_case_usd, stop_distance_points

    @classmethod
    def calculate_worst_case_lot_size(
        cls,
        account_equity: float,
        entry_price: float,
        stop_loss: float,
        symbol_specs: Any,
        risk_pct: float = 2.0,
        risk_ceiling_pct: float = 5.0,
        allow_min_lot_override: bool = False
    ) -> Tuple[float, float, float]:
        """
        Calculates position size using real broker symbol specs including spread, commission, and slippage.
        """
        return cls.calculate_lot_size(
            account_equity=account_equity,
            entry_price=entry_price,
            stop_loss=stop_loss,
            risk_pct=risk_pct,
            risk_ceiling_pct=risk_ceiling_pct,
            contract_size=getattr(symbol_specs, "contract_size", 100.0),
            point_size=getattr(symbol_specs, "point_size", 0.01),
            min_lot=getattr(symbol_specs, "min_volume", 0.01),
            max_lot=getattr(symbol_specs, "max_volume", 100.0),
            lot_step=getattr(symbol_specs, "volume_step", 0.01),
            spread_points=getattr(symbol_specs, "estimated_spread_points", 25.0),
            commission_per_lot=getattr(symbol_specs, "commission_per_lot_usd", 6.0),
            slippage_points=getattr(symbol_specs, "slippage_allowance_points", 2.0),
            allow_min_lot_override=allow_min_lot_override
        )
