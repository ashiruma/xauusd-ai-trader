import json

with open("dashboard/static/forex_curriculum.js", "r", encoding="utf-8") as f:
    text = f.read()

start = text.find("window.FOREX_CURRICULUM = ") + len("window.FOREX_CURRICULUM = ")
end = text.find(";\nwindow.FOREX_GLOSSARY")
curriculum = json.loads(text[start:end])

# Specific pedagogical wrongHints mapped to each lesson
hints_map = {
    "b1": [
        "London is the largest financial hub, but Forex has no physical central exchange—it is decentralized and over-the-counter (OTC).",
        "",
        "Retail algorithms account for only a tiny fraction of volume; interbank clearing hours across global time zones drive the 24-hour cycle.",
        "There is no international law mandating 24-hour trading; equity markets close daily. The 24-hour FX cycle is natural across world time zones."
    ],
    "b2": [
        "Exchange rates are floating and market-determined, not set arbitrarily by commercial banks for tourists.",
        "",
        "Commercial banks do not guarantee retail trader profits; they manage their own institutional liquidity and risk.",
        "Sovereign central banks and treasuries issue national fiat currency, not commercial banks."
    ],
    "b3": [
        "In GBP/USD, GBP is the Base Currency (1 unit). The quote tells you the price in USD.",
        "",
        "The exchange quote reflects the current price ratio, not the daily percentage gain or loss.",
        "The quote is an exchange rate, not a minimum account deposit."
    ],
    "b4": [
        "The Bid price is what you receive when SELLING to the market, not buying.",
        "",
        "Market orders execute at either Bid or Ask, never the synthetic midpoint.",
        "Candlestick close prices represent past history, not current live execution quotes."
    ],
    "b5": [
        "Spreads never drop to zero during news; in fact, liquidity providers pull quotes, causing spreads to widen.",
        "",
        "Spreads are market-driven by liquidity and broker pricing, not fixed by central banks.",
        "Spread widening occurs across the entire interbank network, affecting institutional and retail orders alike."
    ],
    "b6": [
        "0.0025 on a standard 4-decimal currency pair represents 25 pips (since 1 pip = 0.0001), not 2.5.",
        "",
        "250 pips would be an exchange rate change of 0.0250.",
        "0.25 pips would be an exchange rate change of 0.000025."
    ],
    "b7": [
        "$10.00 per pip corresponds to a 1.00 Standard Lot (100,000 units), not a micro-lot.",
        "$1.00 per pip corresponds to a 0.10 Mini Lot (10,000 units).",
        "",
        "A micro-lot (0.01) controls 1,000 units: 1,000 * 0.0001 = $0.10 USD (10 cents), not 1 cent."
    ],
    "b8": [
        "Brokers do not deposit funds into your account during losing trades.",
        "",
        "Account leverage is fixed and does not automatically increase when you are in drawdown.",
        "Brokers will not allow trades to stay open into negative balance; automated stop-out systems close them."
    ],
    "b9": [
        "A Sell Stop is placed below current market price anticipating continued downward breakout.",
        "A Buy Stop is placed above current market price anticipating upward breakout momentum.",
        "",
        "A Sell Limit is placed above current market price expecting downward reversal."
    ],
    "b10": [
        "Ctrl + Z is the universal undo command, not the order ticket.",
        "",
        "Alt + F4 closes the program window.",
        "Ctrl + T toggles the Toolbox/Terminal window at the bottom."
    ],
    "b11": [
        "MetaTrader does not charge commissions for modifying existing stop levels.",
        "",
        "Brokers permit modifying stop orders; the danger is purely mathematical and psychological ruin.",
        "Exchange rates fluctuate in both directions continuously."
    ],
    "b12": [
        "Demo accounts use virtual currency; profits cannot be converted to real cash.",
        "",
        "Demo accounts do not replace legal KYC/identity verification for live broker accounts.",
        "Trading reckless maximum lot sizes on demo builds destructive habits that destroy live accounts."
    ],
    "i1": [
        "A lower wick indicates sellers were rejected; sellers dominated only if the candle closed at its absolute low.",
        "",
        "Wicks are natural market fluctuations, not broker chart feed errors.",
        "A wick requires active trading volume to form."
    ],
    "i2": [
        "Broken support zones do not disappear; they retain institutional memory as future supply barriers.",
        "",
        "Order execution continues smoothly through broken support levels.",
        "Exchange rates never freeze when support breaks."
    ],
    "i3": [
        "Lower Highs and Lower Lows define a Downtrend (bearish market state).",
        "",
        "Horizontal price action without higher highs or lower lows defines Consolidation/Range.",
        "Vertical parabolic movement without pullbacks is unsustainable and precedes sharp reversals."
    ],
    "i4": [
        "Timeframe selection has zero impact on internet latency or ping.",
        "",
        "MetaTrader supports order execution across all timeframes.",
        "Bid-ask spreads are determined by interbank market depth, not your chart timeframe."
    ],
    "i5": [
        "No technical indicator can predict the exact future minute or hour of a price reversal.",
        "",
        "Indicators do not guarantee that take-profit targets will be reached.",
        "Brokers do not use ATR to calculate commission."
    ],
    "i6": [
        "",
        "A rate hike typically strengthens a currency, not causes a 50% crash.",
        "Central bank rate changes are standard monetary policy and do not lead to delisting.",
        "Interest rate adjustments are legally mandated central bank policy."
    ],
    "i7": [
        "Trading servers operate normally during economic news releases.",
        "",
        "Broker commissions are fixed per traded lot and do not double during news.",
        "Exchange rates fluctuate continuously every millisecond."
    ],
    "i8": [
        "The Sunday evening market open has the thinnest liquidity and widest spreads of the week.",
        "",
        "The rollover hour (21:00-23:00 UTC) has thin liquidity and wide spreads.",
        "The Tokyo session has significantly lower volume than the European and US sessions."
    ],
    "i9": [
        "A 66.7% win rate at 1:2 R:R would yield massive profits, far exceeding break-even.",
        "A 50.0% win rate at 1:2 R:R yields a large net profit (Win $20, Loss $10).",
        "",
        "At a 10% win rate, you lose 9 trades (-$90) for every 1 win (+$20), producing net loss."
    ],
    "i10": [
        "Brokers never refund trading losses.",
        "",
        "Journals do not automate execution; they are diagnostic self-improvement logs.",
        "Tax reporting rules do not mandate detailed trade journaling."
    ],
    "a1": [
        "A 0.10 mini-lot on 20 pips risks $20.00 (10% of a $200 account), violating your 1% rule.",
        "",
        "A 1.00 standard lot on 20 pips risks $200.00, which is 100% of the entire account.",
        "A 0.05 lot risks $10.00 (5% of the account)."
    ],
    "a2": [
        "",
        "MT5 allows multiple positions across European pairs without error.",
        "The British Pound floats independently and is not pegged to the Euro.",
        "Required margin per lot is unchanged, but total risk exposure is doubled."
    ],
    "a3": [
        "A 50% gain on remaining $50 yields only $75, leaving you still down $25.",
        "A 75% gain on remaining $50 yields only $87.50, still short of break-even.",
        "",
        "A 25% gain on $50 yields only $62.50."
    ],
    "a4": [
        "Loss aversion affects live funded risk, not demo account creation.",
        "",
        "Loss aversion is an internal psychological bias, not a broker technical issue.",
        "Loss aversion causes traders to avoid taking small losses, resulting in catastrophic blowouts."
    ],
    "a5": [
        "MT5 can run backtests with or without custom spread modeling.",
        "",
        "Deducting transaction friction does not impact CPU processing speed.",
        "Historical tick data is real broker price history."
    ],
    "a6": [
        "FVGs are chart technical formations, not bank exchange holidays.",
        "",
        "Spread fees are transaction costs, not Fair Value Gaps.",
        "FVGs are legitimate market inefficiencies, not MT5 software bugs."
    ],
    "a7": [
        "$50.00 profit would require a 0.10 mini-lot.",
        "",
        "$0.50 profit would be a $0.50 price move.",
        "$500.00 profit would require a 1.00 standard lot."
    ],
    "a8": [
        "0.41 is the inverse (losses divided by profits).",
        "",
        "3.50 would require $8,750 in gross profits.",
        "1.00 is exactly break-even ($2,500 profit / $2,500 loss)."
    ]
}

# Attach wrongHints to each quiz
for l in curriculum:
    lid = l["id"]
    if lid in hints_map:
        l["quiz"]["wrongHints"] = hints_map[lid]

# Save updated curriculum
with open("dashboard/static/forex_curriculum.js", "r", encoding="utf-8") as f:
    orig = f.read()

glossary_start = orig.find("window.FOREX_GLOSSARY = ")
glossary_str = orig[glossary_start:]

new_curriculum_js = f"""// Velarion Markets Forex Training Curriculum (30 Lessons + Glossary)
// Strict pedagogical progression with targeted misconception feedback. Zero emojis.
window.FOREX_CURRICULUM = {json.dumps(curriculum, indent=2)};
{glossary_str}"""

with open("dashboard/static/forex_curriculum.js", "w", encoding="utf-8") as f:
    f.write(new_curriculum_js)

print("Updated forex_curriculum.js with targeted wrongHints for all 30 lessons.")
