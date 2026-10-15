"""
MetaTrader 5 Execution Adapter for XAUUSD.
Direct integration with MT5 terminal via MetaTrader5 python library.
Provides order submission, account monitoring, symbol normalization,
and traceable order comments.
"""

from datetime import datetime, timezone
import logging
from typing import Dict, List, Optional, Any
import uuid

from config.settings import settings
from data.models import Order, Position, TradeRecord, OrderSide, OrderStatus
from execution.base import BaseExecutionAdapter
from execution.order_validator import OrderValidator
from data.storage import db

logger = logging.getLogger(__name__)

try:
    import MetaTrader5 as mt5
    MT5_AVAILABLE = True
except ImportError:
    mt5 = None
    MT5_AVAILABLE = False


class MT5ExecutionAdapter(BaseExecutionAdapter):
    def __init__(self):
        self._connected: bool = False
        self._symbol: str = settings.mt5.symbol
        self._magic_number: int = settings.mt5.magic_number
        self._last_error: Optional[str] = None

    def connect(self) -> bool:
        """Initialize connection to local MetaTrader 5 terminal."""
        if not MT5_AVAILABLE:
            self._last_error = "MetaTrader5 Python library is not installed"
            logger.error(self._last_error)
            self._connected = False
            return False

        init_kwargs = {}
        if settings.mt5.path:
            init_kwargs["path"] = settings.mt5.path
        if settings.mt5.login:
            init_kwargs["login"] = settings.mt5.login
        if settings.mt5.password:
            init_kwargs["password"] = settings.mt5.password
        if settings.mt5.server:
            init_kwargs["server"] = settings.mt5.server

        try:
            if not mt5.initialize(**init_kwargs):
                code, desc = mt5.last_error()
                self._last_error = f"MT5 initialization failed: ({code}) {desc}"
                logger.warning(self._last_error)
                self._connected = False
                return False

            self._detect_and_select_symbol()
            self._connected = True
            self._last_error = None
            logger.info(f"MT5 connected successfully. Active symbol: {self._symbol}")
            return True

        except Exception as exc:
            self._last_error = f"MT5 connection exception: {exc}"
            logger.error(self._last_error)
            self._connected = False
            return False

    def _detect_and_select_symbol(self) -> str:
        """Detect and select the correct broker Gold symbol."""
        if not MT5_AVAILABLE:
            return self._symbol
        symbols = [self._symbol] + settings.contract.alternate_symbols + ["XAUUSD.m", "XAUUSDm", "XAUUSD_raw"]
        found_symbol = None
        for s in symbols:
            info = mt5.symbol_info(s)
            if info is not None:
                found_symbol = s
                if not info.visible:
                    mt5.symbol_select(s, True)
                break

        if not found_symbol:
            all_syms = mt5.symbols_get()
            if all_syms:
                for sym in all_syms:
                    name_u = sym.name.upper()
                    if "XAUUSD" in name_u or "GOLD" in name_u:
                        found_symbol = sym.name
                        mt5.symbol_select(sym.name, True)
                        break

        if found_symbol:
            self._symbol = found_symbol
        return self._symbol

    def connect_account(self, login: int, password: str, server: str, min_deposit_usd: float = 100.0) -> Dict[str, Any]:
        """
        Authenticate and switch to a client JustMarkets account.
        Validates minimum deposit requirement ($100.00).
        """
        if not MT5_AVAILABLE:
            return {"success": False, "message": "MetaTrader5 library not installed."}

        # Attempt login
        success = mt5.login(login=int(login), password=str(password), server=str(server))
        if not success:
            init_kwargs = {"login": int(login), "password": str(password), "server": str(server)}
            if settings.mt5.path:
                init_kwargs["path"] = settings.mt5.path
            success = mt5.initialize(**init_kwargs)

        if not success:
            code, desc = mt5.last_error()
            return {
                "success": False,
                "message": f"JustMarkets authentication failed: ({code}) {desc}. Please verify your Account ID, Password, and Server."
            }

        acc = mt5.account_info()
        if acc is None:
            return {
                "success": False,
                "message": "Failed to retrieve account details after authentication."
            }

        balance = float(acc.balance)
        equity = float(acc.equity)

        # Deposit validation ($100+ requirement)
        if balance < min_deposit_usd and equity < min_deposit_usd:
            return {
                "success": False,
                "message": f"Minimum deposit requirement not met: Current account equity is ${equity:.2f} (Balance: ${balance:.2f}). A minimum deposit of ${min_deposit_usd:.2f} is required to activate automated trading for this account.",
                "deposit_required": min_deposit_usd,
                "current_equity": equity,
                "current_balance": balance,
                "login": login
            }

        # Update active settings
        settings.mt5.login = int(login)
        settings.mt5.server = str(server)
        self._connected = True

        self._detect_and_select_symbol()

        return {
            "success": True,
            "message": f"Account #{login} successfully connected! Verified Equity: ${equity:.2f}. Minimum deposit requirement validated.",
            "login": login,
            "server": server,
            "equity": equity,
            "balance": balance,
            "leverage": acc.leverage,
            "currency": acc.currency
        }

    def disconnect(self) -> None:
        if MT5_AVAILABLE and self._connected:
            mt5.shutdown()
        self._connected = False

    def is_connected(self) -> bool:
        if not MT5_AVAILABLE:
            return False
        # Heartbeat check
        try:
            terminal_info = mt5.terminal_info()
            self._connected = terminal_info is not None and terminal_info.connected
            return self._connected
        except Exception:
            self._connected = False
            return False

    def get_account_info(self) -> Dict[str, Any]:
        if not self.is_connected():
            return {"balance": 0.0, "equity": 0.0, "margin_free": 0.0}

        acc = mt5.account_info()
        if acc is None:
            return {"balance": 0.0, "equity": 0.0, "margin_free": 0.0}
        return {
            "balance": round(getattr(acc, "balance", 0.0), 2),
            "equity": round(getattr(acc, "equity", 0.0), 2),
            "margin_free": round(getattr(acc, "margin_free", 0.0), 2),
            "login": getattr(acc, "login", settings.mt5.login),
            "server": getattr(acc, "server", settings.mt5.server),
            "company": getattr(acc, "company", "Just Global Markets Ltd."),
            "leverage": getattr(acc, "leverage", 3000),
            "currency": getattr(acc, "currency", "USD")
        }

    def get_quote(self, symbol: Optional[str] = None) -> Dict[str, Any]:
        sym = symbol or self._symbol
        if not self.is_connected():
            return {"bid": 0.0, "ask": 0.0, "spread_points": 0.0, "time": None}

        tick = mt5.symbol_info_tick(sym)
        if tick is None:
            return {"bid": 0.0, "ask": 0.0, "spread_points": 0.0, "time": None}

        spread_points = round((tick.ask - tick.bid) / settings.contract.point_size, 1)
        return {
            "bid": tick.bid,
            "ask": tick.ask,
            "spread_points": spread_points,
            "time": int(tick.time)
        }

    def is_trade_allowed(self) -> bool:
        """Check if algorithmic/automated trading is enabled in MT5 terminal."""
        if not self.is_connected():
            return False
        try:
            terminal_info = mt5.terminal_info()
            return bool(terminal_info and terminal_info.trade_allowed)
        except Exception:
            return False

    def _get_filling_type(self) -> int:
        """Dynamically detect broker-supported execution filling mode for symbol (FOK vs IOC)."""
        if not MT5_AVAILABLE:
            return 0
        try:
            info = mt5.symbol_info(self._symbol)
            if info:
                # filling_mode flags: 1 = FOK, 2 = IOC, 3 = FOK+IOC
                # Prioritize ORDER_FILLING_FOK for broker compliance
                if info.filling_mode & 1:
                    return mt5.ORDER_FILLING_FOK
                elif info.filling_mode & 2:
                    return mt5.ORDER_FILLING_IOC
                elif hasattr(mt5, "ORDER_FILLING_RETURN"):
                    return mt5.ORDER_FILLING_RETURN
        except Exception as e:
            logger.debug(f"Error querying filling mode: {e}")
        return getattr(mt5, "ORDER_FILLING_FOK", getattr(mt5, "ORDER_FILLING_IOC", 0))

    def submit_order(self, order: Order) -> Order:
        if not self.is_connected():
            order.status = OrderStatus.REJECTED
            order.error_message = f"MT5 terminal disconnected: {self._last_error}"
            db.record_order(order)
            return order

        if not self.is_trade_allowed():
            order.status = OrderStatus.REJECTED
            order.error_message = "Automated trading is disabled in MT5 terminal. Please toggle 'Algo Trading' (Ctrl+E) in MT5 toolbar."
            logger.warning(f"MT5 order rejected: {order.error_message}")
            db.record_order(order)
            return order

        valid, msg = OrderValidator.validate(order)
        if not valid:
            order.status = OrderStatus.REJECTED
            order.error_message = msg
            db.record_order(order)
            return order

        order_type = mt5.ORDER_TYPE_BUY if order.side == OrderSide.BUY else mt5.ORDER_TYPE_SELL
        price = mt5.symbol_info_tick(self._symbol).ask if order.side == OrderSide.BUY else mt5.symbol_info_tick(self._symbol).bid

        # Form traceable comment: truncate to 31 chars as required by MT5 protocol
        trace_comment = f"{order.strategy_id[:10]}|{order.signal_id[:12]}"

        request = {
            "action": mt5.TRADE_ACTION_DEAL,
            "symbol": self._symbol,
            "volume": float(order.lot_size),
            "type": order_type,
            "price": float(price),
            "sl": float(order.stop_loss),
            "tp": float(order.take_profit),
            "deviation": int(settings.risk.max_slippage_points),
            "magic": int(order.magic_number),
            "comment": trace_comment,
            "type_time": mt5.ORDER_TIME_GTC,
            "type_filling": self._get_filling_type(),
        }

        result = mt5.order_send(request)
        if result is None or result.retcode != mt5.TRADE_RETCODE_DONE:
            error_code = result.retcode if result else mt5.last_error()[0]
            order.status = OrderStatus.REJECTED
            order.error_message = f"MT5 order_send rejected: retcode {error_code}"
            logger.error(f"MT5 order execution failed: {order.error_message}")
        else:
            order.status = OrderStatus.FILLED
            order.ticket = result.order
            order.filled_price = result.price
            order.slippage_points = round(abs(result.price - price) / settings.contract.point_size, 1)
            order.executed_at = datetime.now(timezone.utc)
            logger.info(f"MT5 order filled! Ticket={result.order}, FillPrice={result.price}")

        db.record_order(order)
        return order

    def get_open_positions(self) -> List[Position]:
        if not self.is_connected():
            return []

        raw_positions = mt5.positions_get(symbol=self._symbol)
        if raw_positions is None:
            return []

        positions: List[Position] = []
        for p in raw_positions:
            side = OrderSide.BUY if p.type == mt5.ORDER_TYPE_BUY else OrderSide.SELL
            positions.append(Position(
                ticket=p.ticket,
                symbol=p.symbol,
                side=side,
                lots=p.volume,
                entry_price=p.price_open,
                current_price=p.price_current,
                stop_loss=p.sl,
                take_profit=p.tp,
                floating_pnl=round(p.profit, 2),
                magic_number=p.magic,
                open_time=datetime.fromtimestamp(p.time, tz=timezone.utc),
                signal_id=None,
                strategy_id=p.comment.split("|")[0] if "|" in p.comment else None
            ))
        return positions

    def close_position(self, ticket: int, reason: str = "MANUAL") -> Optional[TradeRecord]:
        if not self.is_connected():
            return None

        positions = mt5.positions_get(ticket=ticket)
        if not positions:
            return None
        p = positions[0]

        close_type = mt5.ORDER_TYPE_SELL if p.type == mt5.ORDER_TYPE_BUY else mt5.ORDER_TYPE_BUY
        price = mt5.symbol_info_tick(p.symbol).bid if p.type == mt5.ORDER_TYPE_BUY else mt5.symbol_info_tick(p.symbol).ask

        request = {
            "action": mt5.TRADE_ACTION_DEAL,
            "position": ticket,
            "symbol": p.symbol,
            "volume": p.volume,
            "type": close_type,
            "price": price,
            "deviation": int(settings.risk.max_slippage_points),
            "magic": p.magic,
            "comment": f"Close {reason}",
            "type_time": mt5.ORDER_TIME_GTC,
            "type_filling": self._get_filling_type(),
        }

        result = mt5.order_send(request)
        if result is None or result.retcode != mt5.TRADE_RETCODE_DONE:
            logger.error(f"Failed to close MT5 position {ticket}: {result.retcode if result else 'None'}")
            return None

        now = datetime.now(timezone.utc)
        trade = TradeRecord(
            trade_id=f"TRD_{uuid.uuid4().hex[:12]}",
            ticket=ticket,
            symbol=p.symbol,
            side=OrderSide.BUY if p.type == mt5.ORDER_TYPE_BUY else OrderSide.SELL,
            lots=p.volume,
            entry_price=p.price_open,
            exit_price=result.price,
            pnl=round(result.profit, 2),
            entry_time=datetime.fromtimestamp(p.time, tz=timezone.utc),
            exit_time=now,
            exit_reason=reason
        )
        db.record_trade(trade)
        return trade

    def modify_position(self, ticket: int, stop_loss: float, take_profit: float) -> bool:
        if not self.is_connected():
            return False

        positions = mt5.positions_get(ticket=ticket)
        if not positions:
            return False
        p = positions[0]

        request = {
            "action": mt5.TRADE_ACTION_SLTP,
            "position": ticket,
            "symbol": p.symbol,
            "sl": float(stop_loss),
            "tp": float(take_profit),
        }
        result = mt5.order_send(request)
        return result is not None and result.retcode == mt5.TRADE_RETCODE_DONE
