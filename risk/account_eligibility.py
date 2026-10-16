"""
Authoritative Account Eligibility and Broker Specification Evaluator for XAUUSD.
Strictly separates deposit/onboarding threshold from live-trading risk eligibility.
Fails closed when broker specifications are stale, missing, or incompatible with the risk ceiling.
"""

from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field


class BrokerSymbolSpecs(BaseModel):
    symbol: str = "XAUUSD.m"
    contract_size: float = 100.0       # 100 oz for Standard; 1 oz for Cent/Micro
    point_size: float = 0.01           # 0.01 per point
    tick_size: float = 0.01
    tick_value: float = 1.0            # USD value of 1 tick on 1.00 lot
    min_volume: float = 0.01           # Minimum lot size
    max_volume: float = 100.0          # Maximum lot size
    volume_step: float = 0.01          # Lot step
    stops_level_points: float = 20.0   # Minimum distance in points for SL/TP from market
    freeze_level_points: float = 10.0
    leverage: float = 500.0            # Account / symbol effective leverage
    currency: str = "USD"              # Account base currency: "USD", "USC" (Cent), "EUR", etc.
    is_cent_account: bool = False
    quote_timestamp: Optional[datetime] = None
    estimated_spread_points: float = 25.0  # 25 points = $0.25 on XAUUSD
    commission_per_lot_usd: float = 6.00   # Broker roundturn commission per lot
    slippage_allowance_points: float = 2.0 # 2 points = $0.02 conservative buffer


class AccountEligibilityResult(BaseModel):
    account_id: str
    currency: str
    raw_equity: float
    converted_equity_usd: float
    raw_balance: float
    converted_balance_usd: float
    free_margin_usd: float
    is_cent_account: bool
    onboarding_deposit_passed: bool
    live_trading_eligible: bool
    tier: str
    reasons: List[str]
    max_allowed_risk_usd: float
    estimated_min_lot_risk_usd: float
    margin_required_usd: float


class AccountEligibilityEvaluator:
    """
    Single authoritative evaluator for account onboarding and live-trading eligibility.
    """

    DEFAULT_ONBOARDING_MIN_USD: float = 10.0
    PRO_RAW_ONBOARDING_MIN_USD: float = 200.0

    @classmethod
    def evaluate(
        cls,
        account_info: Dict[str, Any],
        symbol_specs: Optional[BrokerSymbolSpecs],
        spot_price: float = 4180.0,
        assumed_stop_distance_dollars: float = 2.50,
        risk_ceiling_pct: float = 5.0,
        account_type: str = "STANDARD"
    ) -> AccountEligibilityResult:
        reasons: List[str] = []
        account_id = str(account_info.get("login") or account_info.get("account_id") or "UNSPECIFIED")
        currency = str(account_info.get("currency") or "USD").upper()
        raw_balance = float(account_info.get("balance", 0.0))
        raw_equity = float(account_info.get("equity", raw_balance))
        raw_free_margin = float(account_info.get("margin_free", raw_equity))

        # 1. Currency & Cent Account Normalization
        is_cent = (
            currency in ("USC", "EUCH", "GBCH", "CENT")
            or "CENT" in str(account_type).upper()
            or bool(symbol_specs and symbol_specs.is_cent_account)
        )

        if is_cent:
            # 100 Cents = 1.00 USD
            converted_balance_usd = round(raw_balance / 100.0, 2)
            converted_equity_usd = round(raw_equity / 100.0, 2)
            converted_free_margin_usd = round(raw_free_margin / 100.0, 2)
        else:
            converted_balance_usd = round(raw_balance, 2)
            converted_equity_usd = round(raw_equity, 2)
            converted_free_margin_usd = round(raw_free_margin, 2)

        # 2. Deposit / Onboarding Gate Check
        # JustMarkets official deposit minimum: $10 for Standard & Standard Cent; $200 for Pro & Raw Spread
        onboarding_min = (
            cls.PRO_RAW_ONBOARDING_MIN_USD
            if any(t in str(account_type).upper() for t in ("PRO", "RAW", "RAW_SPREAD"))
            else cls.DEFAULT_ONBOARDING_MIN_USD
        )

        onboarding_passed = converted_balance_usd >= onboarding_min
        if not onboarding_passed:
            reasons.append(
                f"Deposit onboarding threshold not met. Balance of ${converted_balance_usd:.2f} USD is below "
                f"the JustMarkets minimum of ${onboarding_min:.2f} USD for {account_type} accounts."
            )

        # 3. Fail closed if broker symbol specifications are missing or stale
        if symbol_specs is None:
            reasons.append(
                "Broker symbol specifications for XAUUSD are unavailable. Fail-closed: live automation barred."
            )
            return AccountEligibilityResult(
                account_id=account_id,
                currency=currency,
                raw_equity=raw_equity,
                converted_equity_usd=converted_equity_usd,
                raw_balance=raw_balance,
                converted_balance_usd=converted_balance_usd,
                free_margin_usd=converted_free_margin_usd,
                is_cent_account=is_cent,
                onboarding_deposit_passed=onboarding_passed,
                live_trading_eligible=False,
                tier="INELIGIBLE",
                reasons=reasons,
                max_allowed_risk_usd=0.0,
                estimated_min_lot_risk_usd=0.0,
                margin_required_usd=0.0,
            )

        if symbol_specs.quote_timestamp is not None:
            now_utc = datetime.now(timezone.utc)
            quote_ts = symbol_specs.quote_timestamp
            if quote_ts.tzinfo is None:
                quote_ts = quote_ts.replace(tzinfo=timezone.utc)
            age_sec = (now_utc - quote_ts).total_seconds()
            if age_sec > 300.0:
                reasons.append(
                    f"Broker symbol quote is stale ({age_sec:.0f}s old > 300s max allowed age). Fail-closed: live automation barred."
                )
                return AccountEligibilityResult(
                    account_id=account_id,
                    currency=currency,
                    raw_equity=raw_equity,
                    converted_equity_usd=converted_equity_usd,
                    raw_balance=raw_balance,
                    converted_balance_usd=converted_balance_usd,
                    free_margin_usd=converted_free_margin_usd,
                    is_cent_account=is_cent,
                    onboarding_deposit_passed=onboarding_passed,
                    live_trading_eligible=False,
                    tier="INELIGIBLE",
                    reasons=reasons,
                    max_allowed_risk_usd=0.0,
                    estimated_min_lot_risk_usd=0.0,
                    margin_required_usd=0.0,
                )

        # 4. Check specification validity
        if symbol_specs.contract_size <= 0 or symbol_specs.min_volume <= 0:
            reasons.append("Invalid contract size or minimum volume in broker specifications.")
            return AccountEligibilityResult(
                account_id=account_id,
                currency=currency,
                raw_equity=raw_equity,
                converted_equity_usd=converted_equity_usd,
                raw_balance=raw_balance,
                converted_balance_usd=converted_balance_usd,
                free_margin_usd=converted_free_margin_usd,
                is_cent_account=is_cent,
                onboarding_deposit_passed=onboarding_passed,
                live_trading_eligible=False,
                tier="INELIGIBLE",
                reasons=reasons,
                max_allowed_risk_usd=0.0,
                estimated_min_lot_risk_usd=0.0,
                margin_required_usd=0.0,
            )

        # 5. Margin Requirement for Minimum Volume
        effective_leverage = max(symbol_specs.leverage, 1.0)
        # Margin in USD = (min_volume * contract_size * price) / leverage
        min_lot = symbol_specs.min_volume
        margin_required_usd = round(
            (min_lot * symbol_specs.contract_size * spot_price) / effective_leverage, 2
        )

        has_sufficient_margin = converted_free_margin_usd >= margin_required_usd
        if not has_sufficient_margin:
            reasons.append(
                f"Insufficient free margin. Minimum tradable volume ({min_lot} lots) requires "
                f"${margin_required_usd:.2f} USD margin at {effective_leverage:.0f}:1 leverage, but "
                f"free margin is only ${converted_free_margin_usd:.2f} USD."
            )

        # 6. Worst-Case Loss at Minimum Volume vs Risk Budget
        # Capital dollar risk budget based on conservative ceiling
        max_allowed_risk_usd = round(converted_equity_usd * (risk_ceiling_pct / 100.0), 2)

        # Estimate worst-case loss for min_lot with realistic stop, spread, commission & slippage
        # Price movement loss = assumed_stop_distance_dollars * contract_size * min_lot
        price_loss = assumed_stop_distance_dollars * symbol_specs.contract_size * min_lot
        spread_loss = (symbol_specs.estimated_spread_points * symbol_specs.point_size) * symbol_specs.contract_size * min_lot
        comm_loss = symbol_specs.commission_per_lot_usd * min_lot
        slip_loss = (symbol_specs.slippage_allowance_points * symbol_specs.point_size) * symbol_specs.contract_size * min_lot
        estimated_min_lot_risk_usd = round(price_loss + spread_loss + comm_loss + slip_loss, 2)

        risk_budget_compatible = estimated_min_lot_risk_usd <= max_allowed_risk_usd
        if not risk_budget_compatible:
            pct_of_account = (
                (estimated_min_lot_risk_usd / converted_equity_usd) * 100.0
                if converted_equity_usd > 0
                else 100.0
            )
            reasons.append(
                f"Minimum tradable volume ({min_lot} lots) with a ${assumed_stop_distance_dollars:.2f} protective stop "
                f"risks ${estimated_min_lot_risk_usd:.2f} USD ({pct_of_account:.1f}% of account), which severely exceeds "
                f"the conservative {risk_ceiling_pct:.1f}% risk ceiling (${max_allowed_risk_usd:.2f} USD). "
                f"Trading standard 100 oz contracts on this account size causes severe loss asymmetry. "
                f"A JustMarkets Standard Cent account (USC) or a larger balance is required to trade safely."
            )

        # 7. Overall live trading eligibility
        live_trading_eligible = bool(
            onboarding_passed
            and has_sufficient_margin
            and risk_budget_compatible
            and converted_equity_usd > 0
        )

        # Assign tier
        if not live_trading_eligible:
            tier = "INELIGIBLE"
        elif converted_equity_usd < 100.0:
            tier = "MICRO"
        elif converted_equity_usd < 500.0:
            tier = "GROWTH"
        elif converted_equity_usd < 1000.0:
            tier = "STANDARD"
        else:
            tier = "INSTITUTIONAL"

        return AccountEligibilityResult(
            account_id=account_id,
            currency=currency,
            raw_equity=raw_equity,
            converted_equity_usd=converted_equity_usd,
            raw_balance=raw_balance,
            converted_balance_usd=converted_balance_usd,
            free_margin_usd=converted_free_margin_usd,
            is_cent_account=is_cent,
            onboarding_deposit_passed=onboarding_passed,
            live_trading_eligible=live_trading_eligible,
            tier=tier,
            reasons=reasons,
            max_allowed_risk_usd=max_allowed_risk_usd,
            estimated_min_lot_risk_usd=estimated_min_lot_risk_usd,
            margin_required_usd=margin_required_usd,
        )
