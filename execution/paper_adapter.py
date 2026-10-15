"""
Paper Trading Execution Adapter.
Simulates high-fidelity execution, fill dynamics, realistic slippage, and position tracking.
Runs with the exact same risk, signal, and market logic as live trading.
"""

from datetime import datetime, timezone
import random
import uuid
from typing import Dict, List, Optional
from config.settings import settings
from data.models import Order, Position, TradeRecord, OrderSide, OrderStatus
from execution.base import BaseExecutionAdapter
from execution.order_validator import OrderValidator
from data.storage import db


class PaperExecutionAdapter(BaseExecutionAdapter):
    def __init__(self, initial_balance: float = 100000.0):
        self.balance: float = initial_balance
        self.equity: float = initial_balance
        self._connected: bool = True
        self._positions: Dict[int, Position] = {}
        self._next_ticket: int = 7000001
        self._latest_bid: float = 4143.93
        self._latest_ask: float = 4144.19

    def connect(self) -> bool:
        self._connected = True
        return True

    def disconnect(self) -> None:
        self._connected = False

    def is_connected(self) -> bool:
        return self._connected

    def update_market_quote(self, bid: float, ask: float) -> None:
        """Update current quotes and recompute floating PnL and SL/TP checks."""
        self._latest_bid = bid
        self._latest_ask = ask
        
        floating_total = 0.0
        closed_tickets = []

        for ticket, pos in list(self._positions.items()):
            current_price = bid if pos.side == OrderSide.BUY else ask
            pos.current_price = current_price
            
            # Dollar PnL on Gold: (PriceDiff) * Lots * 100
            if pos.side == OrderSide.BUY:
                pnl = (current_price - pos.entry_price) * pos.lots * settings.contract.contract_size
                # Check TP hit
                if current_price >= pos.take_profit:
                    self.close_position(ticket, reason="TP")
                    continue
                # Check SL hit
                if current_price <= pos.stop_loss:
                    self.close_position(ticket, reason="SL")
                    continue
            else:
                pnl = (pos.entry_price - current_price) * pos.lots * settings.contract.contract_size
                if current_price <= pos.take_profit:
                    self.close_position(ticket, reason="TP")
                    continue
                if current_price >= pos.stop_loss:
                    self.close_position(ticket, reason="SL")
                    continue

            pos.floating_pnl = round(pnl, 2)
            floating_total += pnl

        self.equity = round(self.balance + floating_total, 2)

    def get_account_info(self) -> Dict[str, float]:
        return {
            "balance": round(self.balance, 2),
            "equity": round(self.equity, 2),
            "margin_free": round(self.equity * 0.9, 2)
        }

    def get_quote(self, symbol: str = "XAUUSD") -> Dict[str, float]:
        spread_pts = round((self._latest_ask - self._latest_bid) / settings.contract.point_size, 1)
        return {
            "bid": self._latest_bid,
            "ask": self._latest_ask,
            "spread_points": spread_pts
        }

    def submit_order(self, order: Order) -> Order:
        if not self._connected:
            order.status = OrderStatus.REJECTED
            order.error_message = "Paper engine disconnected"
            db.record_order(order)
            return order

        valid, msg = OrderValidator.validate(order)
        if not valid:
            order.status = OrderStatus.REJECTED
            order.error_message = msg
            db.record_order(order)
            return order

        # Simulate fill with minor realistic slippage (0.0 to 3 points)
        slippage_dollars = round(random.uniform(0.0, 0.03), 2)
        if order.side == OrderSide.BUY:
            fill_price = round(self._latest_ask + slippage_dollars, 2)
        else:
            fill_price = round(self._latest_bid - slippage_dollars, 2)

        order.ticket = self._next_ticket
        self._next_ticket += 1
        order.filled_price = fill_price
        order.slippage_points = round(abs(fill_price - order.requested_price) / settings.contract.point_size, 1)
        order.status = OrderStatus.FILLED
        order.executed_at = datetime.now(timezone.utc)

        # Create active Position
        entry_rationale = db.get_recorded_entry_rationale(order.signal_id) if order.signal_id else None
        if not entry_rationale:
            entry_rationale = "Entry rationale unavailable"
        pos = Position(
            ticket=order.ticket,
            symbol=order.symbol,
            side=order.side,
            lots=order.lot_size,
            entry_price=fill_price,
            current_price=fill_price,
            stop_loss=order.stop_loss,
            take_profit=order.take_profit,
            floating_pnl=0.0,
            magic_number=order.magic_number,
            open_time=order.executed_at,
            signal_id=order.signal_id,
            strategy_id=order.strategy_id,
            entry_rationale=entry_rationale
        )
        self._positions[order.ticket] = pos
        db.record_order(order)
        return order

    def get_open_positions(self) -> List[Position]:
        return list(self._positions.values())

    def close_position(self, ticket: int, reason: str = "MANUAL") -> Optional[TradeRecord]:
        if ticket not in self._positions:
            return None

        pos = self._positions.pop(ticket)
        exit_price = self._latest_bid if pos.side == OrderSide.BUY else self._latest_ask
        now = datetime.now(timezone.utc)

        if pos.side == OrderSide.BUY:
            pnl = (exit_price - pos.entry_price) * pos.lots * settings.contract.contract_size
        else:
            pnl = (pos.entry_price - exit_price) * pos.lots * settings.contract.contract_size

        pnl = round(pnl, 2)
        self.balance = round(self.balance + pnl, 2)
        self.equity = round(self.balance, 2)

        trade = TradeRecord(
            trade_id=f"TRD_{uuid.uuid4().hex[:12]}",
            ticket=pos.ticket,
            signal_id=pos.signal_id,
            strategy_id=pos.strategy_id,
            symbol=pos.symbol,
            side=pos.side,
            lots=pos.lots,
            entry_price=pos.entry_price,
            exit_price=exit_price,
            pnl=pnl,
            return_pct=round((pnl / self.balance) * 100.0, 3) if self.balance > 0 else 0.0,
            commission=round(pos.lots * 6.0, 2),  # standard $6/lot commission
            swap=0.0,
            entry_time=pos.open_time,
            exit_time=now,
            exit_reason=reason,
            holding_seconds=(now - pos.open_time).total_seconds(),
            max_favorable_excursion=round(abs(exit_price - pos.entry_price), 2),
            max_adverse_excursion=0.0
        )
        db.record_trade(trade)
        return trade

    def modify_position(self, ticket: int, stop_loss: float, take_profit: float) -> bool:
        if ticket not in self._positions:
            return False
        pos = self._positions[ticket]
        pos.stop_loss = stop_loss
        pos.take_profit = take_profit
        return True
