"""
Base Strategy Interface for XAUUSD Trading System.
All strategies output CandidateSetup objects (or None for NO_SETUP).
Strategies do NOT execute trades directly.
"""

from abc import ABC, abstractmethod
from typing import Optional
from data.models import MarketState, CandidateSetup


class BaseStrategy(ABC):
    def __init__(self, strategy_id: str, name: str):
        self.strategy_id = strategy_id
        self.name = name

    @abstractmethod
    def evaluate(self, state: MarketState) -> Optional[CandidateSetup]:
        """
        Evaluate current deterministic market state.
        Returns a CandidateSetup if an edge is detected, or None for NO_SETUP.
        """
        pass
