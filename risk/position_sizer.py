"""
Deterministic Position Sizing Engine for XAUUSD.
Calculates accurate institutional lot sizing based on account equity,
risk percentage, stop loss distance, and standard gold contract specifications.
"""

import math
from typing import Tuple
from config.settings import settings


class PositionSizer:
    @staticmethod
    def calculate_lot_size(
        account_equity: float,
        entry_price: float,
        stop_loss: float,
        risk_pct: float = 10.0,
        contract_size: float = 100.0,
        min_lot: float = 0.01,
        max_lot: float = 100.0,
        lot_step: float = 0.01,
        allow_min_lot_override: bool = True
    ) -> Tuple[float, float, float]:
        """
        Calculates position size in lots for XAUUSD.
        Returns:
            (lot_size, risk_amount_usd, stop_distance_points)
        """
        if account_equity <= 0:
            return 0.0, 0.0, 0.0

        stop_distance_dollars = abs(entry_price - stop_loss)
        if stop_distance_dollars <= 0.0001:
            return 0.0, 0.0, 0.0

        # Stop distance in points ($0.01 = 1 point on XAUUSD)
        stop_distance_points = round(stop_distance_dollars / settings.contract.point_size, 1)

        # Total capital dollar risk
        risk_amount_usd = account_equity * (risk_pct / 100.0)

        # Dollar risk per 1.00 standard lot for XAUUSD = stop_distance_dollars * 100
        dollar_risk_per_standard_lot = stop_distance_dollars * contract_size

        if dollar_risk_per_standard_lot <= 0:
            return 0.0, 0.0, 0.0

        raw_lot_size = risk_amount_usd / dollar_risk_per_standard_lot

        # Institutional safety: Round DOWN to nearest lot_step to never exceed risk budget
        step_factor = 1.0 / lot_step
        rounded_lot = math.floor(raw_lot_size * step_factor) / step_factor
        rounded_lot = round(rounded_lot, 2)

        # Bounds check
        if rounded_lot < min_lot:
            min_lot_risk = min_lot * dollar_risk_per_standard_lot
            if allow_min_lot_override and account_equity >= 20.0:
                # Micro/small account override: permit 0.01 lot only if dollar risk is safe
                # Disallow catastrophic stop loss distances (> $6.00 / 600 points) on micro accounts
                max_tolerated_risk = max(risk_amount_usd * 1.5, 6.00)
                if min_lot_risk > max_tolerated_risk:
                    return 0.0, round(risk_amount_usd, 2), stop_distance_points
                rounded_lot = min_lot
            else:
                # If minimum lot would exceed the risk budget significantly, return 0.0
                if min_lot_risk > (risk_amount_usd * 1.25):
                    return 0.0, round(risk_amount_usd, 2), stop_distance_points
                rounded_lot = min_lot

        clamped_lot = min(max_lot, max(min_lot, rounded_lot))
        actual_risk_usd = round(clamped_lot * dollar_risk_per_standard_lot, 2)

        return round(clamped_lot, 2), actual_risk_usd, stop_distance_points
