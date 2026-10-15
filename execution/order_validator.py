"""
Deterministic Pre-Submission Order Validator.
Ensures geometric and semantic order integrity before broker submission.
"""

from typing import Tuple
from config.settings import settings
from data.models import Order, OrderSide


class OrderValidator:
    @staticmethod
    def validate(order: Order) -> Tuple[bool, str]:
        # 1. Lot size check
        if order.lot_size < settings.contract.min_lot:
            return False, f"Lot size {order.lot_size} is below min_lot {settings.contract.min_lot}"
        if order.lot_size > settings.contract.max_lot:
            return False, f"Lot size {order.lot_size} exceeds max_lot {settings.contract.max_lot}"

        # 2. Price validity
        if order.requested_price <= 0:
            return False, f"Invalid requested price: {order.requested_price}"

        # 3. Geometric SL / TP validity
        if order.side == OrderSide.BUY:
            if order.stop_loss >= order.requested_price:
                return False, f"Invalid BUY geometry: SL ({order.stop_loss}) must be strictly below entry ({order.requested_price})"
            if order.take_profit <= order.requested_price:
                return False, f"Invalid BUY geometry: TP ({order.take_profit}) must be strictly above entry ({order.requested_price})"
        elif order.side == OrderSide.SELL:
            if order.stop_loss <= order.requested_price:
                return False, f"Invalid SELL geometry: SL ({order.stop_loss}) must be strictly above entry ({order.requested_price})"
            if order.take_profit >= order.requested_price:
                return False, f"Invalid SELL geometry: TP ({order.take_profit}) must be strictly below entry ({order.requested_price})"
        else:
            return False, f"Unsupported order side: {order.side}"

        # 4. Traceability identifiers
        if not order.signal_id or not order.strategy_id:
            return False, "Order missing mandatory audit traceability metadata (signal_id / strategy_id)"

        return True, "Order validated successfully"
