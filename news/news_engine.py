"""
Economic News and Event Calendar Engine for XAUUSD.
Monitors high-impact gold catalysts (US CPI, PCE, FOMC, NFP, Fed Rate decisions).
Produces market condition status: NORMAL, CAUTION, or NEWS_LOCKOUT.
"""

from datetime import datetime, timezone, timedelta
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel
from config.settings import settings


class NewsImpactStatus(str, Enum):
    NORMAL = "NORMAL"
    CAUTION = "CAUTION"
    NEWS_LOCKOUT = "NEWS_LOCKOUT"


class EconomicEvent(BaseModel):
    event_id: str
    name: str
    currency: str = "USD"
    importance: str = "HIGH"  # HIGH | MEDIUM | LOW
    scheduled_time: datetime
    actual: Optional[str] = None
    forecast: Optional[str] = None
    previous: Optional[str] = None


class NewsEngine:
    def __init__(self):
        self._events: List[EconomicEvent] = []

    def add_event(self, event: EconomicEvent) -> None:
        self._events.append(event)

    def load_preset_events_calendar(self, start_date: datetime, days: int = 30) -> None:
        """
        Loads standard scheduled recurring high-impact US macro events
        for backtesting, simulation, and live calendar tracking.
        """
        # Add typical recurring FOMC and CPI / NFP windows
        events = [
            EconomicEvent(
                event_id="CPI_US",
                name="US Consumer Price Index (CPI)",
                scheduled_time=start_date + timedelta(days=5, hours=12, minutes=30)
            ),
            EconomicEvent(
                event_id="NFP_US",
                name="US Non-Farm Payrolls & Unemployment",
                scheduled_time=start_date + timedelta(days=12, hours=12, minutes=30)
            ),
            EconomicEvent(
                event_id="FOMC_RATE",
                name="Federal Reserve FOMC Rate Decision & Statement",
                scheduled_time=start_date + timedelta(days=18, hours=18, minutes=0)
            ),
            EconomicEvent(
                event_id="CORE_PCE",
                name="US Core PCE Price Index",
                scheduled_time=start_date + timedelta(days=25, hours=12, minutes=30)
            )
        ]
        self._events.extend(events)

    def check_news_status(self, current_time: datetime) -> tuple[NewsImpactStatus, Optional[EconomicEvent], str]:
        """
        Evaluates active events against pre-window and post-window configurations.
        Returns: (NewsImpactStatus, relevant_event, reason)
        """
        if not settings.risk.news_restrictions_enabled:
            return NewsImpactStatus.NORMAL, None, "News restrictions disabled in settings"

        pre_window = timedelta(minutes=settings.risk.news_pre_window_minutes)
        post_window = timedelta(minutes=settings.risk.news_post_window_minutes)
        caution_window = timedelta(minutes=settings.risk.news_pre_window_minutes * 2)

        for event in self._events:
            event_time = event.scheduled_time
            time_diff = event_time - current_time

            # Inside lockout window: -post_window <= time_diff <= pre_window
            if -post_window <= time_diff <= pre_window:
                return (
                    NewsImpactStatus.NEWS_LOCKOUT,
                    event,
                    f"Trading halted: Within high-impact lockout window for {event.name} at {event_time.isoformat()}"
                )

            # Caution window
            if -caution_window <= time_diff <= caution_window:
                return (
                    NewsImpactStatus.CAUTION,
                    event,
                    f"Caution: Approaching or recovering from high-impact {event.name} ({time_diff.total_seconds() / 60:.0f}m)"
                )

        return NewsImpactStatus.NORMAL, None, "No active high-impact events"


# Global default news engine
news_engine = NewsEngine()
