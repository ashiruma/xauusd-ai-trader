"""
Abstract Base Execution Adapter Interface.
Decouples trading logic from specific broker implementation (MT5 vs Paper/Simulated).
"""

from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any
from data.models import Order, Position, TradeRecord


class BaseExecutionAdapter(ABC):
    @abstractmethod
    def connect(self) -> bool:
        """Initialize connection to execution venue."""
        pass

    @abstractmethod
    def disconnect(self) -> None:
        """Safely disconnect."""
        pass

    @abstractmethod
    def is_connected(self) -> bool:
        """Check venue connection health."""
        pass

    @abstractmethod
    def get_account_info(self) -> Dict[str, float]:
        """Returns {'balance': float, 'equity': float, 'margin_free': float}."""
        pass

    @abstractmethod
    def get_quote(self, symbol: str = "XAUUSD") -> Dict[str, float]:
        """Returns {'bid': float, 'ask': float, 'spread_points': float}."""
        pass

    @abstractmethod
    def submit_order(self, order: Order) -> Order:
        """Execute a validated order."""
        pass

    @abstractmethod
    def get_open_positions(self) -> List[Position]:
        """Retrieve current open positions."""
        pass

    @abstractmethod
    def close_position(self, ticket: int, reason: str = "MANUAL") -> Optional[TradeRecord]:
        """Close an active position by ticket."""
        pass

    @abstractmethod
    def modify_position(self, ticket: int, stop_loss: float, take_profit: float) -> bool:
        """Update SL and TP on an active position."""
        pass
