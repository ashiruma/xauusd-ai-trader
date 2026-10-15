"""
Auditable Trade Journal for XAUUSD Trading System.
Provides transparent tracing of every historical trade through the exact lineage:
TRADE -> ORDER -> RISK DECISION -> SIGNAL -> STRATEGY -> AI ANALYSIS -> MARKET STATE.
"""

from typing import Dict, List, Any, Optional
from data.storage import db


class TradeJournal:
    @staticmethod
    def get_trade_audit(trade_id: str) -> Dict[str, Any]:
        """Fetch complete decision lineage from SQLite database."""
        return db.get_trade_audit_lineage(trade_id)

    @staticmethod
    def list_recent_journal_entries(limit: int = 50) -> List[Dict[str, Any]]:
        """List recent completed trades with core summary attributes."""
        trades = db.get_all_trades(limit=limit)
        return trades

    @staticmethod
    def format_audit_report(trade_id: str) -> str:
        """Format an audit report string for compliance and research review."""
        lineage = db.get_trade_audit_lineage(trade_id)
        if "error" in lineage:
            return lineage["error"]

        trade = lineage.get("trade", {})
        order = lineage.get("order", {})
        risk = lineage.get("risk_decision", {})
        signal = lineage.get("signal", {})
        ai = lineage.get("ai_decision", {})

        report = [
            f"==================================================",
            f"TRADE AUDIT RECORD: {trade.get('trade_id')}",
            f"==================================================",
            f"Ticket:           {trade.get('ticket')}",
            f"Symbol / Side:    {trade.get('symbol')} {trade.get('side')}",
            f"Lots:             {trade.get('lots')}",
            f"Entry Price:      ${trade.get('entry_price', 0):.2f} at {trade.get('entry_time')}",
            f"Exit Price:       ${trade.get('exit_price', 0):.2f} at {trade.get('exit_time')}",
            f"Net P/L:          ${trade.get('pnl', 0):.2f} (Return: {trade.get('return_pct', 0):.2f}%)",
            f"Exit Reason:      {trade.get('exit_reason')}",
            f"--------------------------------------------------",
            f"ORDER EXECUTION DETAILS:",
            f"Order ID:         {order.get('order_id', 'N/A')}",
            f"Slippage:         {order.get('slippage_points', 0)} points",
            f"Status:           {order.get('status', 'N/A')}",
            f"--------------------------------------------------",
            f"RISK ENGINE GATEWAY:",
            f"Approved:         {risk.get('approved', 'N/A')}",
            f"Risk USD:         ${risk.get('risk_amount_usd', 0):.2f}",
            f"Stop Distance:    {risk.get('stop_distance_points', 0)} points",
            f"Approval Reason:  {risk.get('reason', 'N/A')}",
            f"--------------------------------------------------",
            f"FUSED SIGNAL & STRATEGY:",
            f"Signal ID:        {signal.get('signal_id', 'N/A')}",
            f"Strategy ID:      {signal.get('strategy_id', 'N/A')}",
            f"Confidence:       {signal.get('confidence', 'N/A')}",
            f"Market Regime:    {signal.get('market_regime', 'N/A')}",
            f"--------------------------------------------------",
            f"AI ANALYST DECISION:",
            f"AI Decision ID:   {ai.get('ai_decision_id', 'N/A')}",
            f"AI Recommendation:{ai.get('decision', 'N/A')} (Confidence: {ai.get('confidence', 'N/A')})",
            f"Setup Valid:      {bool(ai.get('setup_valid', 0))}",
            f"AI Provider:      {ai.get('provider', 'N/A')}",
            f"=================================================="
        ]
        return "\n".join(report)
