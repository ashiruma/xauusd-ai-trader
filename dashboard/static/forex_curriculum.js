// Velarion Markets Forex Training Curriculum (30 Lessons + Glossary)
// Strict pedagogical progression with targeted misconception feedback. Zero emojis.
window.FOREX_CURRICULUM = [
  {
    "id": "b1",
    "level": "beginner",
    "levelTitle": "Beginner: Forex Foundations",
    "lessonNum": 1,
    "globalNum": 1,
    "title": "What Is Forex Trading?",
    "summary": "Discover the global foreign exchange marketplace, how currencies are exchanged, and why it operates 24 hours a day.",
    "objectives": [
      "Define foreign exchange (Forex/FX) and understand its global economic purpose.",
      "Compare Forex to stock markets in terms of market size, liquidity, and decentralization.",
      "Understand the 24-hour trading cycle across global time zones."
    ],
    "content": "\n<p>The foreign exchange market (commonly known as <strong>Forex</strong> or <strong>FX</strong>) is the decentralized global marketplace where the world's national currencies are bought and sold. It is the largest financial market in the world, with over <strong>$7.5 trillion</strong> traded every single day\u2014dwarfing all global stock markets combined.</p>\n\n<h3>Why Does the Forex Market Exist?</h3>\n<p>At its core, the foreign exchange market exists to facilitate international trade and investment. When a multinational corporation in the United States buys machinery from Germany, it must pay in Euros (EUR). The corporation exchanges US Dollars (USD) for Euros on the FX market. Central banks, commercial banks, investment funds, multinational corporations, and retail traders all participate in this ongoing liquidity pool.</p>\n\n<h3>A Decentralized, 24-Hour Marketplace</h3>\n<p>Unlike equities that trade on centralized exchanges like the New York Stock Exchange (NYSE), the Forex market has no physical central headquarters. It is an <strong>Over-the-Counter (OTC)</strong> market, operating electronically through a global network of banks, financial institutions, and retail brokers.</p>\n<p>Trading begins each week in Sydney (Sunday evening US time) and follows the sun across Tokyo, London, and New York, before closing in New York on Friday evening. This allows continuous 24-hour liquidity during weekdays.</p>\n",
    "example": "\n<strong>International Travel & Commercial Conversion:</strong><br>\nImagine you travel from London to New York. At the airport exchange counter, you exchange 1,000 British Pounds (GBP) for US Dollars (USD) at an exchange rate of 1.3000. You receive $1,300 USD.<br><br>\nDuring your two-week stay, you don't spend any money. When you return to the counter, the exchange rate has moved to 1.2500 (meaning the US Dollar strengthened). You convert your $1,300 USD back into GBP at 1.2500, receiving 1,040 GBP (1,300 / 1.25). You now have 40 GBP more than you started with. That is the essence of currency value fluctuation.\n",
    "diagram": "\n<svg viewBox=\"0 0 600 120\" style=\"width:100%; height:auto; max-height:120px;\">\n  <rect x=\"10\" y=\"20\" width=\"120\" height=\"80\" rx=\"6\" fill=\"#151E2E\" stroke=\"#334155\" stroke-width=\"1.5\"/>\n  <text x=\"70\" y=\"55\" fill=\"#F1F5F9\" font-size=\"12\" font-weight=\"700\" text-anchor=\"middle\">Sydney</text>\n  <text x=\"70\" y=\"75\" fill=\"#94A3B8\" font-size=\"10\" text-anchor=\"middle\">21:00 - 06:00 UTC</text>\n  \n  <line x1=\"130\" y1=\"60\" x2=\"160\" y2=\"60\" stroke=\"#D6AD52\" stroke-width=\"2\" marker-end=\"url(#arrow)\"/>\n  \n  <rect x=\"160\" y=\"20\" width=\"120\" height=\"80\" rx=\"6\" fill=\"#151E2E\" stroke=\"#334155\" stroke-width=\"1.5\"/>\n  <text x=\"220\" y=\"55\" fill=\"#F1F5F9\" font-size=\"12\" font-weight=\"700\" text-anchor=\"middle\">Tokyo</text>\n  <text x=\"220\" y=\"75\" fill=\"#94A3B8\" font-size=\"10\" text-anchor=\"middle\">00:00 - 09:00 UTC</text>\n\n  <line x1=\"280\" y1=\"60\" x2=\"310\" y2=\"60\" stroke=\"#D6AD52\" stroke-width=\"2\"/>\n\n  <rect x=\"310\" y=\"20\" width=\"120\" height=\"80\" rx=\"6\" fill=\"#151E2E\" stroke=\"#D6AD52\" stroke-width=\"1.5\"/>\n  <text x=\"370\" y=\"55\" fill=\"#D6AD52\" font-size=\"12\" font-weight=\"700\" text-anchor=\"middle\">London</text>\n  <text x=\"370\" y=\"75\" fill=\"#94A3B8\" font-size=\"10\" text-anchor=\"middle\">07:00 - 16:00 UTC</text>\n\n  <line x1=\"430\" y1=\"60\" x2=\"460\" y2=\"60\" stroke=\"#D6AD52\" stroke-width=\"2\"/>\n\n  <rect x=\"460\" y=\"20\" width=\"120\" height=\"80\" rx=\"6\" fill=\"#151E2E\" stroke=\"#334155\" stroke-width=\"1.5\"/>\n  <text x=\"520\" y=\"55\" fill=\"#F1F5F9\" font-size=\"12\" font-weight=\"700\" text-anchor=\"middle\">New York</text>\n  <text x=\"520\" y=\"75\" fill=\"#94A3B8\" font-size=\"10\" text-anchor=\"middle\">12:00 - 21:00 UTC</text>\n</svg>\n",
    "quiz": {
      "question": "Why does the Forex market operate continuously 24 hours a day during the business week?",
      "options": [
        "Because trading takes place on one centralized exchange located in London that never closes.",
        "Because as one major financial hub closes, another opens across global time zones (Sydney, Tokyo, London, New York).",
        "Because automated retail algorithms never sleep, eliminating the need for banking hours.",
        "Because government regulations mandate 24-hour trading across all asset classes."
      ],
      "correct": 1,
      "explanation": "The Forex market is decentralized (Over-the-Counter) and operates across consecutive global time zones. As Asian markets wind down, European markets open, followed by North American markets.",
      "wrongHints": [
        "London is the largest financial hub, but Forex has no physical central exchange\u2014it is decentralized and over-the-counter (OTC).",
        "",
        "Retail algorithms account for only a tiny fraction of volume; interbank clearing hours across global time zones drive the 24-hour cycle.",
        "There is no international law mandating 24-hour trading; equity markets close daily. The 24-hour FX cycle is natural across world time zones."
      ]
    }
  },
  {
    "id": "b2",
    "level": "beginner",
    "levelTitle": "Beginner: Forex Foundations",
    "lessonNum": 2,
    "globalNum": 2,
    "title": "How the Forex Market Works",
    "summary": "Explore market participants, the interbank tier, retail broker models, and how liquidity flows through the ecosystem.",
    "objectives": [
      "Identify the key market participants: central banks, commercial banks, institutional funds, and retail traders.",
      "Understand the interbank market and Tier-1 liquidity providers.",
      "Differentiate between STP/ECN broker execution and market-maker (dealing desk) models."
    ],
    "content": "\n<p>To navigate the Forex market successfully, you must understand who the participants are and how liquidity moves from interbank trading desks down to your retail trading screen.</p>\n\n<h3>The Hierarchy of Forex Participants</h3>\n<ul>\n  <li><strong>Central Banks:</strong> Institutions such as the Federal Reserve (Fed), European Central Bank (ECB), and Bank of Japan (BOJ). They influence currency values through interest rate policies, open market operations, and quantitative easing.</li>\n  <li><strong>Tier-1 Commercial Banks:</strong> Institutions like JPMorgan, Citibank, Barclays, and Deutsche Bank trade billions in currency daily. This Tier-1 network is known as the <em>Interbank Market</em>.</li>\n  <li><strong>Institutional Investors & Corporations:</strong> Hedge funds, sovereign wealth funds, and international firms hedging foreign revenue risk.</li>\n  <li><strong>Retail Traders:</strong> Individual traders who access the market via online brokers like JustMarkets, accounting for roughly 5-6% of daily global volume.</li>\n</ul>\n\n<h3>How Retail Orders Reach the Market</h3>\n<p>Retail brokers provide liquidity by connecting their clients to Tier-1 pricing pools. In a <strong>Straight Through Processing (STP)</strong> or <strong>Electronic Communication Network (ECN)</strong> bridge, client orders are routed directly to institutional liquidity providers without broker price manipulation.</p>\n",
    "example": "\n<strong>Order Routing Path:</strong><br>\nWhen you click 'BUY' on EUR/USD on MetaTrader 5, your broker immediately sends that order over an electronic bridge (FIX Protocol) to an institutional liquidity provider (such as Barclays or UBS). The provider fills the order at the current market ask price in milliseconds, and the trade confirmation appears in your terminal.\n",
    "diagram": "\n<svg viewBox=\"0 0 600 130\" style=\"width:100%; height:auto; max-height:130px;\">\n  <rect x=\"180\" y=\"10\" width=\"240\" height=\"30\" rx=\"4\" fill=\"#151E2E\" stroke=\"#D6AD52\" stroke-width=\"1.5\"/>\n  <text x=\"300\" y=\"30\" fill=\"#D6AD52\" font-size=\"11\" font-weight=\"700\" text-anchor=\"middle\">Central Banks & Interbank Network</text>\n\n  <line x1=\"300\" y1=\"40\" x2=\"300\" y2=\"55\" stroke=\"#94A3B8\" stroke-width=\"1.5\"/>\n\n  <rect x=\"200\" y=\"55\" width=\"200\" height=\"30\" rx=\"4\" fill=\"#151E2E\" stroke=\"#334155\" stroke-width=\"1.5\"/>\n  <text x=\"300\" y=\"75\" fill=\"#F1F5F9\" font-size=\"11\" font-weight=\"600\" text-anchor=\"middle\">Liquidity Providers (Tier-1)</text>\n\n  <line x1=\"300\" y1=\"85\" x2=\"300\" y2=\"100\" stroke=\"#94A3B8\" stroke-width=\"1.5\"/>\n\n  <rect x=\"220\" y=\"100\" width=\"160\" height=\"25\" rx=\"4\" fill=\"#151E2E\" stroke=\"#22C55E\" stroke-width=\"1.5\"/>\n  <text x=\"300\" y=\"117\" fill=\"#22C55E\" font-size=\"10\" font-weight=\"700\" text-anchor=\"middle\">Retail Traders (You)</text>\n</svg>\n",
    "quiz": {
      "question": "What is the primary role of Tier-1 commercial banks in the foreign exchange ecosystem?",
      "options": [
        "They set fixed exchange rates for retail tourists.",
        "They act as primary liquidity providers, quoting continuous bid and ask prices to the interbank market.",
        "They guarantee that retail traders will never experience losses.",
        "They print physical fiat currency for sovereign nations."
      ],
      "correct": 1,
      "explanation": "Tier-1 commercial banks form the interbank network, providing massive pools of liquidity and quoting competitive bid/ask prices to institutional and broker participants.",
      "wrongHints": [
        "Exchange rates are floating and market-determined, not set arbitrarily by commercial banks for tourists.",
        "",
        "Commercial banks do not guarantee retail trader profits; they manage their own institutional liquidity and risk.",
        "Sovereign central banks and treasuries issue national fiat currency, not commercial banks."
      ]
    }
  },
  {
    "id": "b3",
    "level": "beginner",
    "levelTitle": "Beginner: Forex Foundations",
    "lessonNum": 3,
    "globalNum": 3,
    "title": "Understanding Currency Pairs",
    "summary": "Master the structure of currency pairs: Base versus Quote currency, Major pairs, Minor pairs, and Exotics.",
    "objectives": [
      "Distinguish between the Base Currency and the Quote (Counter) Currency.",
      "Identify the 7 Major Currency Pairs and understand why they are the most liquid.",
      "Understand Minor (Cross) pairs and Exotic currency pairs."
    ],
    "content": "\n<p>In the Forex market, currencies are always traded in <strong>pairs</strong>. You cannot buy a currency in isolation; you are always buying one currency while simultaneously selling another.</p>\n\n<h3>The Anatomy of a Pair: Base vs Quote</h3>\n<p>Every currency pair is written as two three-letter codes (standard ISO 4217 format), such as <strong>EUR/USD</strong> or <strong>GBP/JPY</strong>.</p>\n<ul>\n  <li><strong>Base Currency (First currency):</strong> Represents 1 unit of that currency.</li>\n  <li><strong>Quote Currency (Second currency):</strong> Represents how much of the quote currency is needed to purchase 1 unit of the base currency.</li>\n</ul>\n\n<h3>The Three Categories of Currency Pairs</h3>\n<ol>\n  <li><strong>Major Pairs:</strong> Always involve the US Dollar (USD) paired with another leading economic currency (EUR/USD, GBP/USD, USD/JPY, USD/CHF, AUD/USD, USD/CAD, NZD/USD). They account for over 75% of daily FX volume and feature the tightest spreads.</li>\n  <li><strong>Minor Pairs (Crosses):</strong> Major currencies paired against each other without the USD (e.g., EUR/GBP, EUR/JPY, GBP/JPY). Highly liquid, but spreads are slightly wider than majors.</li>\n  <li><strong>Exotic Pairs:</strong> A major currency paired with a developing or emerging economy currency (e.g., USD/ZAR, USD/TRY, USD/MXN). They have lower liquidity, higher volatility, and significantly wider spreads.</li>\n</ol>\n",
    "example": "\n<strong>Reading EUR/USD:</strong><br>\nIf EUR/USD is quoted at <strong>1.0850</strong>:<br>\n- <strong>EUR</strong> is the Base Currency.<br>\n- <strong>USD</strong> is the Quote Currency.<br>\n- This quote means: <strong>1 Euro costs 1.0850 US Dollars</strong>.<br>\nIf you expect the Euro to strengthen against the Dollar, you BUY EUR/USD. If you expect the Euro to weaken, you SELL EUR/USD.\n",
    "diagram": "\n<svg viewBox=\"0 0 600 100\" style=\"width:100%; height:auto; max-height:100px;\">\n  <rect x=\"150\" y=\"20\" width=\"140\" height=\"60\" rx=\"6\" fill=\"#151E2E\" stroke=\"#D6AD52\" stroke-width=\"2\"/>\n  <text x=\"220\" y=\"48\" fill=\"#D6AD52\" font-size=\"16\" font-weight=\"800\" text-anchor=\"middle\">EUR</text>\n  <text x=\"220\" y=\"68\" fill=\"#94A3B8\" font-size=\"10\" text-anchor=\"middle\">BASE CURRENCY (1 Unit)</text>\n\n  <text x=\"300\" y=\"55\" fill=\"#F1F5F9\" font-size=\"20\" font-weight=\"700\" text-anchor=\"middle\">/</text>\n\n  <rect x=\"310\" y=\"20\" width=\"140\" height=\"60\" rx=\"6\" fill=\"#151E2E\" stroke=\"#334155\" stroke-width=\"2\"/>\n  <text x=\"380\" y=\"48\" fill=\"#F1F5F9\" font-size=\"16\" font-weight=\"800\" text-anchor=\"middle\">USD</text>\n  <text x=\"380\" y=\"68\" fill=\"#94A3B8\" font-size=\"10\" text-anchor=\"middle\">QUOTE CURRENCY ($1.0850)</text>\n</svg>\n",
    "quiz": {
      "question": "In the currency pair GBP/USD quoted at 1.2800, what does this exchange rate mean?",
      "options": [
        "1 US Dollar equals 1.28 British Pounds.",
        "1 British Pound costs 1.28 US Dollars.",
        "The British Pound has decreased in value by 1.28% today.",
        "You must deposit 1,280 GBP to trade the pair."
      ],
      "correct": 1,
      "explanation": "The first currency (GBP) is the Base Currency. The price tells you how much of the second currency (USD) is required to purchase 1 unit of the base currency: 1 GBP = $1.28 USD.",
      "wrongHints": [
        "In GBP/USD, GBP is the Base Currency (1 unit). The quote tells you the price in USD.",
        "",
        "The exchange quote reflects the current price ratio, not the daily percentage gain or loss.",
        "The quote is an exchange rate, not a minimum account deposit."
      ]
    }
  },
  {
    "id": "b4",
    "level": "beginner",
    "levelTitle": "Beginner: Forex Foundations",
    "lessonNum": 4,
    "globalNum": 4,
    "title": "How to Read Forex Quotes",
    "summary": "Interpret price feeds on your terminal, understand decimal precision, and identify price trends.",
    "objectives": [
      "Read and interpret real-time two-way currency quotes.",
      "Understand why most currency pairs are quoted to 4 or 5 decimal places.",
      "Identify how Japanese Yen (JPY) quotes differ in decimal precision."
    ],
    "content": "\n<p>When you look at your trading terminal or Market Watch window, prices are displayed in pairs of numbers reflecting live two-way market conditions.</p>\n\n<h3>Two-Way Pricing</h3>\n<p>Every quote shows two distinct prices:</p>\n<ul>\n  <li><strong>Bid Price:</strong> The price at which the market will <em>buy</em> the base currency from you (the price you get when opening a SELL position).</li>\n  <li><strong>Ask Price (or Offer):</strong> The price at which the market will <em>sell</em> the base currency to you (the price you pay when opening a BUY position).</li>\n</ul>\n\n<h3>Decimal Precision</h3>\n<p>Most currency pairs are quoted to <strong>four decimal places</strong> (e.g., 1.0852), with the fourth digit representing 1 pip. Modern ECN brokers quote to a fifth decimal place (e.g., 1.08524), known as a <em>fractional pip</em> or <em>pipette</em>.</p>\n<p><strong>The JPY Exception:</strong> Pairs involving the Japanese Yen (such as USD/JPY or EUR/JPY) are quoted to <strong>two decimal places</strong> (e.g., 154.25), or three decimal places for fractional pips (e.g., 154.258).</p>\n",
    "example": "\n<strong>Reading a Live Ticket:</strong><br>\nEUR/USD: <strong>1.08254 / 1.08266</strong><br>\n- If you click SELL, your trade executes at the Bid: <strong>1.08254</strong>.<br>\n- If you click BUY, your trade executes at the Ask: <strong>1.08266</strong>.<br>\nThe difference between them (1.08266 - 1.08254 = 0.00012, or 1.2 pips) is the broker's spread.\n",
    "diagram": "\n<svg viewBox=\"0 0 600 90\" style=\"width:100%; height:auto; max-height:90px;\">\n  <rect x=\"120\" y=\"15\" width=\"160\" height=\"60\" rx=\"4\" fill=\"#151E2E\" stroke=\"#EF4444\" stroke-width=\"1.5\"/>\n  <text x=\"200\" y=\"38\" fill=\"#EF4444\" font-size=\"11\" font-weight=\"700\" text-anchor=\"middle\">BID (SELL HERE)</text>\n  <text x=\"200\" y=\"60\" fill=\"#F1F5F9\" font-size=\"16\" font-weight=\"800\" text-anchor=\"middle\">1.0825<tspan fill=\"#94A3B8\" font-size=\"11\">4</tspan></text>\n\n  <rect x=\"320\" y=\"15\" width=\"160\" height=\"60\" rx=\"4\" fill=\"#151E2E\" stroke=\"#22C55E\" stroke-width=\"1.5\"/>\n  <text x=\"400\" y=\"38\" fill=\"#22C55E\" font-size=\"11\" font-weight=\"700\" text-anchor=\"middle\">ASK (BUY HERE)</text>\n  <text x=\"400\" y=\"60\" fill=\"#F1F5F9\" font-size=\"16\" font-weight=\"800\" text-anchor=\"middle\">1.0826<tspan fill=\"#94A3B8\" font-size=\"11\">6</tspan></text>\n</svg>\n",
    "quiz": {
      "question": "If you wish to open an immediate BUY position on EUR/USD, which price will your order execute at?",
      "options": [
        "The Bid Price",
        "The Ask Price",
        "The Midpoint between Bid and Ask",
        "The closing price of the previous 1-hour candle"
      ],
      "correct": 1,
      "explanation": "Buyers always pay the Ask price, while sellers receive the Bid price. The difference between the two is the spread.",
      "wrongHints": [
        "The Bid price is what you receive when SELLING to the market, not buying.",
        "",
        "Market orders execute at either Bid or Ask, never the synthetic midpoint.",
        "Candlestick close prices represent past history, not current live execution quotes."
      ]
    }
  },
  {
    "id": "b5",
    "level": "beginner",
    "levelTitle": "Beginner: Forex Foundations",
    "lessonNum": 5,
    "globalNum": 5,
    "title": "Understanding Bid, Ask and Spread",
    "summary": "Learn how the bid-ask spread works, how it represents transaction cost, and why spreads fluctuate with market volatility.",
    "objectives": [
      "Define the Bid-Ask spread and calculate it accurately in pips.",
      "Understand the spread as the primary transaction cost of trading.",
      "Recognize market conditions that cause spreads to widen (news releases, session rollover)."
    ],
    "content": "\n<p>The <strong>spread</strong> is the gap between the price at which you can buy an asset and the price at which you can sell it. It is the primary cost of execution in foreign exchange trading.</p>\n\n<h3>Formula for Calculating Spread</h3>\n<p style=\"font-family:monospace; background:#0B1120; padding:8px; border-radius:4px; color:#D6AD52;\">Spread = Ask Price - Bid Price</p>\n<p>Because the Ask is always higher than the Bid, every trade opens with a small immediate negative balance equal to the spread. To break even and become profitable, the market must move in your favor by at least the spread distance.</p>\n\n<h3>Why Spreads Fluctuate</h3>\n<p>In floating-spread (STP/ECN) accounts, spreads are not fixed. They tighten when liquidity is abundant and widen when liquidity dries up:</p>\n<ul>\n  <li><strong>Tight Spreads (0.2 - 1.2 pips):</strong> Active London and New York sessions with high interbank trading volume.</li>\n  <li><strong>Wide Spreads (3 - 10+ pips):</strong> Major economic news releases (CPI, Non-Farm Payrolls) and the daily rollover hour (21:00 - 23:00 UTC) when interbank liquidity desks rebalance.</li>\n</ul>\n",
    "example": "\n<strong>Calculating Transaction Cost on EUR/USD:</strong><br>\nBid: 1.08500 | Ask: 1.08512<br>\nSpread = 1.08512 - 1.08500 = 0.00012 = <strong>1.2 pips</strong>.<br><br>\nIf you enter a 1.00 Standard Lot trade (where 1 pip = $10), your transaction cost is:<br>\n1.2 pips &times; $10 = <strong>$12.00 USD</strong>.\n",
    "diagram": "\n<svg viewBox=\"0 0 600 80\" style=\"width:100%; height:auto; max-height:80px;\">\n  <line x1=\"100\" y1=\"40\" x2=\"500\" y2=\"40\" stroke=\"#334155\" stroke-width=\"2\"/>\n  <circle cx=\"220\" cy=\"40\" r=\"8\" fill=\"#EF4444\"/>\n  <text x=\"220\" y=\"65\" fill=\"#EF4444\" font-size=\"11\" font-weight=\"700\" text-anchor=\"middle\">Bid: 1.08500</text>\n  \n  <circle cx=\"380\" cy=\"40\" r=\"8\" fill=\"#22C55E\"/>\n  <text x=\"380\" y=\"65\" fill=\"#22C55E\" font-size=\"11\" font-weight=\"700\" text-anchor=\"middle\">Ask: 1.08512</text>\n\n  <line x1=\"220\" y1=\"25\" x2=\"380\" y2=\"25\" stroke=\"#D6AD52\" stroke-width=\"2\"/>\n  <text x=\"300\" y=\"18\" fill=\"#D6AD52\" font-size=\"11\" font-weight=\"700\" text-anchor=\"middle\">SPREAD: 1.2 Pips ($12 on 1.00 lot)</text>\n</svg>\n",
    "quiz": {
      "question": "What happens to the bid-ask spread during high-impact news releases or the daily session rollover?",
      "options": [
        "It drops to exactly zero.",
        "It typically widens due to temporary drops in interbank liquidity and higher risk pricing by banks.",
        "It is locked by central bank regulators.",
        "It only changes for retail traders, not banks."
      ],
      "correct": 1,
      "explanation": "During periods of high uncertainty or low liquidity (such as rollover hours or major news), liquidity providers widen their quotes to compensate for inventory risk.",
      "wrongHints": [
        "Spreads never drop to zero during news; in fact, liquidity providers pull quotes, causing spreads to widen.",
        "",
        "Spreads are market-driven by liquidity and broker pricing, not fixed by central banks.",
        "Spread widening occurs across the entire interbank network, affecting institutional and retail orders alike."
      ]
    }
  },
  {
    "id": "b6",
    "level": "beginner",
    "levelTitle": "Beginner: Forex Foundations",
    "lessonNum": 6,
    "globalNum": 6,
    "title": "What Is a Pip?",
    "summary": "Master the unit of measurement for price movement in Forex, pip values, and how price changes translate to dollar profit and loss.",
    "objectives": [
      "Define a Pip (Percentage in Point) and identify its decimal position.",
      "Understand fractional pips (pipettes).",
      "Calculate profit or loss based on pip movement and position size."
    ],
    "content": "\n<p>A <strong>Pip</strong> stands for <em>Percentage in Point</em> (or <em>Price Interest Point</em>). It is the standardized unit of measurement used to quantify the change in value between two currencies.</p>\n\n<h3>Identifying the Pip Position</h3>\n<p>For almost all currency pairs, 1 pip is equal to <strong>0.0001</strong> (the 4th decimal place):</p>\n<ul>\n  <li>If EUR/USD moves from 1.0850 to 1.0855, it has gained <strong>5 pips</strong>.</li>\n  <li>If GBP/USD moves from 1.3000 down to 1.2950, it has declined by <strong>50 pips</strong>.</li>\n</ul>\n\n<h3>The JPY Exception</h3>\n<p>Because 1 Japanese Yen is worth roughly 1 US cent, pairs involving the Yen are quoted differently. For JPY pairs, 1 pip is located at the <strong>second decimal place (0.01)</strong>:</p>\n<ul>\n  <li>If USD/JPY rises from 154.20 to 154.80, it has gained <strong>60 pips</strong>.</li>\n</ul>\n\n<h3>Pipettes (Fractional Pips)</h3>\n<p>Modern platforms display a 5th decimal place (or 3rd decimal place for JPY pairs). This is a <strong>pipette</strong>, equal to 1/10th of a pip (0.1 pips).</p>\n",
    "example": "\n<strong>Calculating Pip Gain on a Trade:</strong><br>\nYou buy 0.10 lots of EUR/USD at 1.0820.<br>\nYou close the position at 1.0870.<br><br>\nPrice move = 1.0870 - 1.0820 = +0.0050 = <strong>+50 pips</strong>.<br>\nOn a 0.10 lot position (where 1 pip = $1.00 USD):<br>\nProfit = 50 pips &times; $1.00 = <strong>+$50.00 USD</strong>.\n",
    "diagram": "\n<svg viewBox=\"0 0 600 80\" style=\"width:100%; height:auto; max-height:80px;\">\n  <text x=\"300\" y=\"45\" fill=\"#F1F5F9\" font-size=\"28\" font-family=\"monospace\" font-weight=\"700\" text-anchor=\"middle\">\n    1 . 0 8 5 <tspan fill=\"#D6AD52\" font-size=\"34\" font-weight=\"800\">4</tspan> <tspan fill=\"#94A3B8\" font-size=\"20\">2</tspan>\n  </text>\n  <text x=\"312\" y=\"72\" fill=\"#D6AD52\" font-size=\"11\" font-weight=\"700\" text-anchor=\"middle\">&#8593; 1 PIP (4th decimal)</text>\n  <text x=\"368\" y=\"72\" fill=\"#94A3B8\" font-size=\"10\" text-anchor=\"middle\">&#8593; 0.1 Pipette (5th)</text>\n</svg>\n",
    "quiz": {
      "question": "If EUR/USD moves from 1.0810 to 1.0835, how many pips has the exchange rate changed?",
      "options": [
        "2.5 pips",
        "25 pips",
        "250 pips",
        "0.25 pips"
      ],
      "correct": 1,
      "explanation": "1.0835 - 1.0810 = 0.0025, which corresponds to 25 pips (since 1 pip = 0.0001).",
      "wrongHints": [
        "0.0025 on a standard 4-decimal currency pair represents 25 pips (since 1 pip = 0.0001), not 2.5.",
        "",
        "250 pips would be an exchange rate change of 0.0250.",
        "0.25 pips would be an exchange rate change of 0.000025."
      ]
    }
  },
  {
    "id": "b7",
    "level": "beginner",
    "levelTitle": "Beginner: Forex Foundations",
    "lessonNum": 7,
    "globalNum": 7,
    "title": "Understanding Lot Sizes",
    "summary": "Learn standard, mini, micro, and nano lot sizing conventions and how volume dictates pip values.",
    "objectives": [
      "Define the standard units of currency trading (Standard, Mini, and Micro lots).",
      "Calculate the dollar value of 1 pip for different lot sizes.",
      "Understand why micro-lot execution (0.01) is essential for small starting balances ($100)."
    ],
    "content": "\n<p>In financial trading, volume is measured in <strong>lots</strong>. A lot represents a standardized number of units of the base currency being bought or sold.</p>\n\n<h3>The Three Standard Lot Sizes</h3>\n<ul>\n  <li><strong>Standard Lot (1.00 Lot):</strong> 100,000 units of the base currency. Pip value is approximately <strong>$10.00 USD</strong> per pip on USD-quoted pairs.</li>\n  <li><strong>Mini Lot (0.10 Lot):</strong> 10,000 units of the base currency. Pip value is approximately <strong>$1.00 USD</strong> per pip.</li>\n  <li><strong>Micro Lot (0.01 Lot):</strong> 1,000 units of the base currency. Pip value is approximately <strong>$0.10 USD</strong> (10 cents) per pip.</li>\n</ul>\n\n<h3>Why Micro-Lots Are Essential for Beginners</h3>\n<p>If you start with a $100 broker balance, trading a 1.00 standard lot means a routine 10-pip fluctuation would gain or lose $100\u2014wiping out your account in seconds. By trading <strong>0.01 micro-lots</strong>, that same 10-pip move is worth only $1.00 (1% of your account), allowing you to survive normal market noise and practice disciplined risk management.</p>\n",
    "example": "\n<strong>Comparing Lot Sizes on a 30-Pip Move:</strong><br>\nSuppose EUR/USD moves 30 pips in your favor:<br>\n- <strong>1.00 Lot:</strong> 30 pips &times; $10.00 = <strong>+$300.00</strong><br>\n- <strong>0.10 Lot:</strong> 30 pips &times; $1.00 = <strong>+$30.00</strong><br>\n- <strong>0.01 Lot:</strong> 30 pips &times; $0.10 = <strong>+$3.00</strong><br><br>\nThe exact same price move yields vastly different monetary outcomes depending on your chosen lot size.\n",
    "diagram": "\n<svg viewBox=\"0 0 600 90\" style=\"width:100%; height:auto; max-height:90px;\">\n  <rect x=\"30\" y=\"15\" width=\"160\" height=\"60\" rx=\"4\" fill=\"#151E2E\" stroke=\"#22C55E\" stroke-width=\"1.5\"/>\n  <text x=\"110\" y=\"38\" fill=\"#22C55E\" font-size=\"12\" font-weight=\"700\" text-anchor=\"middle\">MICRO LOT (0.01)</text>\n  <text x=\"110\" y=\"55\" fill=\"#F1F5F9\" font-size=\"11\" text-anchor=\"middle\">1,000 Units &bull; $0.10/pip</text>\n\n  <rect x=\"220\" y=\"15\" width=\"160\" height=\"60\" rx=\"4\" fill=\"#151E2E\" stroke=\"#D6AD52\" stroke-width=\"1.5\"/>\n  <text x=\"300\" y=\"38\" fill=\"#D6AD52\" font-size=\"12\" font-weight=\"700\" text-anchor=\"middle\">MINI LOT (0.10)</text>\n  <text x=\"300\" y=\"55\" fill=\"#F1F5F9\" font-size=\"11\" text-anchor=\"middle\">10,000 Units &bull; $1.00/pip</text>\n\n  <rect x=\"410\" y=\"15\" width=\"160\" height=\"60\" rx=\"4\" fill=\"#151E2E\" stroke=\"#334155\" stroke-width=\"1.5\"/>\n  <text x=\"490\" y=\"38\" fill=\"#F1F5F9\" font-size=\"12\" font-weight=\"700\" text-anchor=\"middle\">STANDARD LOT (1.00)</text>\n  <text x=\"490\" y=\"55\" fill=\"#94A3B8\" font-size=\"11\" text-anchor=\"middle\">100,000 Units &bull; $10.00/pip</text>\n</svg>\n",
    "quiz": {
      "question": "On a USD-quoted pair like EUR/USD, what is the approximate value of 1 pip when trading a 0.01 micro-lot?",
      "options": [
        "$10.00",
        "$1.00",
        "$0.10 (10 cents)",
        "$0.01 (1 cent)"
      ],
      "correct": 2,
      "explanation": "A micro-lot (0.01) represents 1,000 units. 1,000 * 0.0001 = $0.10 USD per pip.",
      "wrongHints": [
        "$10.00 per pip corresponds to a 1.00 Standard Lot (100,000 units), not a micro-lot.",
        "$1.00 per pip corresponds to a 0.10 Mini Lot (10,000 units).",
        "",
        "A micro-lot (0.01) controls 1,000 units: 1,000 * 0.0001 = $0.10 USD (10 cents), not 1 cent."
      ]
    }
  },
  {
    "id": "b8",
    "level": "beginner",
    "levelTitle": "Beginner: Forex Foundations",
    "lessonNum": 8,
    "globalNum": 8,
    "title": "Leverage and Margin Explained",
    "summary": "Understand how leverage multiplies purchasing power, how margin collateral works, and the danger of over-leveraging.",
    "objectives": [
      "Define leverage and margin in plain terms.",
      "Calculate required margin for an open position.",
      "Understand margin calls, free margin, and stop-out levels."
    ],
    "content": "\n<p><strong>Leverage</strong> allows you to control a large position in the market using a relatively small amount of your own capital. <strong>Margin</strong> is the collateral your broker requires you to set aside to keep that leveraged position open.</p>\n\n<h3>How Leverage Works</h3>\n<p>Leverage is expressed as a ratio, such as <strong>1:100</strong>, <strong>1:200</strong>, or <strong>1:500</strong>:</p>\n<ul>\n  <li>With <strong>1:100 leverage</strong>, every $1.00 of margin allows you to control $100.00 of currency.</li>\n  <li>To control a 0.01 micro-lot ($1,000 of currency) at 1:100 leverage, your required margin is just <strong>$10.00 USD</strong>.</li>\n</ul>\n\n<h3>Margin Level, Margin Calls & Stop-Outs</h3>\n<p>Your trading terminal displays your financial health in real time:</p>\n<ul>\n  <li><strong>Balance:</strong> Cash in your account excluding open trades.</li>\n  <li><strong>Equity:</strong> Balance + floating profit/loss.</li>\n  <li><strong>Used Margin:</strong> Total collateral locked to support active positions.</li>\n  <li><strong>Free Margin:</strong> Equity minus Used Margin (available for new trades or buffering losses).</li>\n  <li><strong>Margin Level (%):</strong> (Equity / Used Margin) &times; 100. If this drops below your broker's threshold (typically 50%), the broker automatically closes trades (Stop-Out) to prevent a negative balance.</li>\n</ul>\n<p style=\"color:#EF4444; font-weight:600;\">Warning: Leverage is a double-edged sword. While it magnifies potential gains, it magnifies losses by the exact same multiple.</p>\n",
    "example": "\n<strong>Calculating Required Margin:</strong><br>\nAccount Balance: $100.00 USD | Broker Leverage: 1:100<br>\nPosition: 0.01 lot EUR/USD ($1,000 base currency)<br><br>\nRequired Margin = Trade Value / Leverage = $1,000 / 100 = <strong>$10.00 USD</strong>.<br>\nRemaining Free Margin = $100.00 - $10.00 = <strong>$90.00 USD</strong> available to absorb price fluctuations.\n",
    "diagram": "\n<svg viewBox=\"0 0 600 80\" style=\"width:100%; height:auto; max-height:80px;\">\n  <rect x=\"50\" y=\"20\" width=\"100\" height=\"40\" rx=\"4\" fill=\"#151E2E\" stroke=\"#D6AD52\" stroke-width=\"1.5\"/>\n  <text x=\"100\" y=\"45\" fill=\"#D6AD52\" font-size=\"12\" font-weight=\"700\" text-anchor=\"middle\">$10 Margin</text>\n\n  <text x=\"180\" y=\"45\" fill=\"#94A3B8\" font-size=\"16\" font-weight=\"700\" text-anchor=\"middle\">&times; 100 =</text>\n\n  <rect x=\"230\" y=\"20\" width=\"320\" height=\"40\" rx=\"4\" fill=\"#151E2E\" stroke=\"#22C55E\" stroke-width=\"1.5\"/>\n  <text x=\"390\" y=\"45\" fill=\"#22C55E\" font-size=\"12\" font-weight=\"700\" text-anchor=\"middle\">$1,000 Market Purchasing Power (0.01 Lot)</text>\n</svg>\n",
    "quiz": {
      "question": "What happens if your account Equity falls below your broker's Stop-Out margin level?",
      "options": [
        "The broker deposits additional emergency funds into your account.",
        "Your open positions are automatically closed by the broker to prevent negative balance.",
        "Your account leverage automatically increases to 1:1000.",
        "Nothing happens until you manually click close."
      ],
      "correct": 1,
      "explanation": "A Stop-Out is an automated risk safety measure where the broker closes active positions at current market prices when equity cannot support required margin.",
      "wrongHints": [
        "Brokers do not deposit funds into your account during losing trades.",
        "",
        "Account leverage is fixed and does not automatically increase when you are in drawdown.",
        "Brokers will not allow trades to stay open into negative balance; automated stop-out systems close them."
      ]
    }
  },
  {
    "id": "b9",
    "level": "beginner",
    "levelTitle": "Beginner: Forex Foundations",
    "lessonNum": 9,
    "globalNum": 9,
    "title": "Understanding Buy and Sell Orders",
    "summary": "Learn how traders profit in both rising and falling markets, and master Market versus Pending orders.",
    "objectives": [
      "Understand going 'Long' (Buying) versus going 'Short' (Selling).",
      "Differentiate between Market Execution and Pending Orders.",
      "Identify the 4 primary pending order types: Buy Limit, Sell Limit, Buy Stop, and Sell Stop."
    ],
    "content": "\n<p>One of the greatest advantages of the Forex market is its two-directional nature: you can profit whether an exchange rate is rising or falling.</p>\n\n<h3>Long vs Short</h3>\n<ul>\n  <li><strong>Going Long (BUY):</strong> You buy the base currency expecting its price to rise relative to the quote currency. You profit if you sell it back at a higher price.</li>\n  <li><strong>Going Short (SELL):</strong> You sell the base currency expecting its price to fall. You profit if you buy it back at a lower price.</li>\n</ul>\n\n<h3>Execution Types</h3>\n<ol>\n  <li><strong>Market Execution:</strong> An order executed immediately at the best available current market price.</li>\n  <li><strong>Pending Orders:</strong> An instruction to enter the market only when price reaches a specified future level:\n    <ul>\n      <li><strong>Buy Limit:</strong> Placed <em>below</em> current market price, expecting price to bounce upward.</li>\n      <li><strong>Sell Limit:</strong> Placed <em>above</em> current market price, expecting price to turn downward.</li>\n      <li><strong>Buy Stop:</strong> Placed <em>above</em> current price, expecting momentum to break out upward.</li>\n      <li><strong>Sell Stop:</strong> Placed <em>below</em> current price, expecting momentum to break out downward.</li>\n    </ul>\n  </li>\n</ol>\n",
    "example": "\n<strong>Executing a Limit Order:</strong><br>\nEUR/USD is currently trading at 1.0850. You believe price will drop to test support at 1.0800 before resuming its upward trend.<br>\nInstead of watching the screen all day, you place a <strong>Buy Limit at 1.0800</strong>.<br>\nWhen price touches 1.0800, your order automatically executes at that exact level.\n",
    "diagram": "\n<svg viewBox=\"0 0 600 110\" style=\"width:100%; height:auto; max-height:110px;\">\n  <line x1=\"50\" y1=\"55\" x2=\"550\" y2=\"55\" stroke=\"#94A3B8\" stroke-dasharray=\"4\" stroke-width=\"1.5\"/>\n  <text x=\"80\" y=\"50\" fill=\"#94A3B8\" font-size=\"10\" font-weight=\"700\">CURRENT PRICE</text>\n\n  <rect x=\"180\" y=\"15\" width=\"110\" height=\"26\" rx=\"4\" fill=\"#151E2E\" stroke=\"#22C55E\"/>\n  <text x=\"235\" y=\"32\" fill=\"#22C55E\" font-size=\"10\" font-weight=\"700\" text-anchor=\"middle\">Buy Stop (Breakout)</text>\n\n  <rect x=\"330\" y=\"15\" width=\"110\" height=\"26\" rx=\"4\" fill=\"#151E2E\" stroke=\"#EF4444\"/>\n  <text x=\"385\" y=\"32\" fill=\"#EF4444\" font-size=\"10\" font-weight=\"700\" text-anchor=\"middle\">Sell Limit (Reversal)</text>\n\n  <rect x=\"180\" y=\"70\" width=\"110\" height=\"26\" rx=\"4\" fill=\"#151E2E\" stroke=\"#22C55E\"/>\n  <text x=\"235\" y=\"87\" fill=\"#22C55E\" font-size=\"10\" font-weight=\"700\" text-anchor=\"middle\">Buy Limit (Reversal)</text>\n\n  <rect x=\"330\" y=\"70\" width=\"110\" height=\"26\" rx=\"4\" fill=\"#151E2E\" stroke=\"#EF4444\"/>\n  <text x=\"385\" y=\"87\" fill=\"#EF4444\" font-size=\"10\" font-weight=\"700\" text-anchor=\"middle\">Sell Stop (Breakout)</text>\n</svg>\n",
    "quiz": {
      "question": "If you anticipate that gold will bounce upward after dropping to test a support level below current price, which pending order should you place?",
      "options": [
        "Sell Stop",
        "Buy Stop",
        "Buy Limit",
        "Sell Limit"
      ],
      "correct": 2,
      "explanation": "A Buy Limit is placed below the current market price when you expect price to drop to a discount level and then reverse upward.",
      "wrongHints": [
        "A Sell Stop is placed below current market price anticipating continued downward breakout.",
        "A Buy Stop is placed above current market price anticipating upward breakout momentum.",
        "",
        "A Sell Limit is placed above current market price expecting downward reversal."
      ]
    }
  },
  {
    "id": "b10",
    "level": "beginner",
    "levelTitle": "Beginner: Forex Foundations",
    "lessonNum": 10,
    "globalNum": 10,
    "title": "Introduction to MetaTrader 5",
    "summary": "Navigate the MT5 terminal interface, charts, Market Watch, Navigator, and Toolbox windows.",
    "objectives": [
      "Understand the core layout of MetaTrader 5 (MT5).",
      "Learn how to add symbols, open charts, and inspect spread in Market Watch.",
      "Use the Toolbox window to monitor active trades, account balance, and trade history."
    ],
    "content": "\n<p><strong>MetaTrader 5 (MT5)</strong> is the industry-standard multi-asset trading platform used by institutional brokers and retail traders worldwide. It connects directly to your broker's execution bridge.</p>\n\n<h3>Core Windows of MT5</h3>\n<ul>\n  <li><strong>Market Watch (Ctrl+M):</strong> Displays live real-time bid and ask quotes for your traded instruments. You can right-click to view the live spread column.</li>\n  <li><strong>Chart Window:</strong> The main workspace where price candles, timeframes, and technical overlays are displayed.</li>\n  <li><strong>Navigator (Ctrl+N):</strong> Displays your connected trading accounts, indicators, Expert Advisors (algorithmic bots), and scripts.</li>\n  <li><strong>Toolbox / Terminal (Ctrl+T):</strong> Displays your live Trade tab (active positions, balance, equity, margin), History tab (closed past trades), and Journal (technical execution logs).</li>\n</ul>\n\n<h3>Opening an Order Ticket (F9)</h3>\n<p>Pressing <strong>F9</strong> opens the Order dialog, allowing you to select your lot volume, set exact Stop Loss and Take Profit levels, and execute your trade.</p>\n",
    "example": "\n<strong>Setting Up Your MT5 Workspace:</strong><br>\n1. Press <strong>Ctrl+M</strong> to open Market Watch.<br>\n2. Right-click inside Market Watch and select 'Spread' to ensure transaction costs are visible.<br>\n3. Right-click 'XAUUSD.m' (Gold) and select 'Chart Window' to view real-time candlesticks.<br>\n4. Press <strong>F9</strong> to inspect the order ticket with volume defaulted to 0.01 micro-lots.\n",
    "diagram": "\n<svg viewBox=\"0 0 600 120\" style=\"width:100%; height:auto; max-height:120px;\">\n  <rect x=\"20\" y=\"10\" width=\"140\" height=\"100\" rx=\"4\" fill=\"#151E2E\" stroke=\"#334155\"/>\n  <text x=\"90\" y=\"30\" fill=\"#D6AD52\" font-size=\"10\" font-weight=\"700\" text-anchor=\"middle\">Market Watch (Quotes)</text>\n  <text x=\"90\" y=\"60\" fill=\"#94A3B8\" font-size=\"9\" text-anchor=\"middle\">EURUSD 1.0850</text>\n  <text x=\"90\" y=\"80\" fill=\"#94A3B8\" font-size=\"9\" text-anchor=\"middle\">XAUUSD 2650.20</text>\n\n  <rect x=\"170\" y=\"10\" width=\"410\" height=\"70\" rx=\"4\" fill=\"#0B1120\" stroke=\"#334155\"/>\n  <text x=\"375\" y=\"45\" fill=\"#F1F5F9\" font-size=\"11\" font-weight=\"600\" text-anchor=\"middle\">Active Candlestick Chart Window (M15 / H1)</text>\n\n  <rect x=\"170\" y=\"85\" width=\"410\" height=\"25\" rx=\"4\" fill=\"#151E2E\" stroke=\"#22C55E\"/>\n  <text x=\"375\" y=\"102\" fill=\"#22C55E\" font-size=\"9\" font-weight=\"700\" text-anchor=\"middle\">Toolbox: Balance $100.00 &bull; Equity $100.00 &bull; Free Margin $100.00</text>\n</svg>\n",
    "quiz": {
      "question": "Which keyboard shortcut opens the Order Ticket dialog in MetaTrader 5?",
      "options": [
        "Ctrl + Z",
        "F9",
        "Alt + F4",
        "Ctrl + T"
      ],
      "correct": 1,
      "explanation": "Pressing F9 in MT5 opens the New Order ticket dialog directly.",
      "wrongHints": [
        "Ctrl + Z is the universal undo command, not the order ticket.",
        "",
        "Alt + F4 closes the program window.",
        "Ctrl + T toggles the Toolbox/Terminal window at the bottom."
      ]
    }
  },
  {
    "id": "b11",
    "level": "beginner",
    "levelTitle": "Beginner: Forex Foundations",
    "lessonNum": 11,
    "globalNum": 11,
    "title": "Stop-Loss and Take-Profit",
    "summary": "Master the twin pillars of trade risk management: defining your invalidation point and locking in profit targets.",
    "objectives": [
      "Understand why a Stop-Loss (SL) is non-negotiable on every single trade.",
      "Learn how to set a Take-Profit (TP) based on market structure.",
      "Avoid common beginner mistakes like moving your stop-loss during a losing trade."
    ],
    "content": "\n<p>Professional trading is not about predicting the future with 100% accuracy; it is about managing risk so that losing trades are small and winning trades are substantial. <strong>Stop-Loss (SL)</strong> and <strong>Take-Profit (TP)</strong> are automated risk exit orders.</p>\n\n<h3>Stop-Loss: Your Capital Firewall</h3>\n<p>A Stop-Loss is an automated order that closes your trade at a predetermined price if the market moves against you. It answers the fundamental question: <em>'At what exact price level is my trade thesis proven wrong?'</em></p>\n<p><strong>The Golden Rule:</strong> Never place a trade without an active Stop-Loss. Never widen or move your stop-loss further away once a trade is active. Doing so converts disciplined risk into emotional gambling.</p>\n\n<h3>Take-Profit: Locking in Targeted Gains</h3>\n<p>A Take-Profit automatically closes your position when price reaches your targeted profit zone. It prevents profits from evaporating if the market reverses after reaching a major resistance or support zone.</p>\n",
    "example": "\n<strong>Setting SL and TP on Gold (XAUUSD):</strong><br>\nCurrent Spot Price: $2,650.00<br>\nThesis: Buying off support, targeting previous swing high.<br><br>\n- <strong>Entry (BUY):</strong> $2,650.00<br>\n- <strong>Stop-Loss:</strong> $2,646.00 (Risk: $4.00 / 40 pips)<br>\n- <strong>Take-Profit:</strong> $2,658.00 (Reward: $8.00 / 80 pips)<br><br>\nThis creates a healthy <strong>1:2 Risk-to-Reward ratio</strong> ($4 risk vs $8 reward).\n",
    "diagram": "\n<svg viewBox=\"0 0 600 100\" style=\"width:100%; height:auto; max-height:100px;\">\n  <line x1=\"80\" y1=\"20\" x2=\"520\" y2=\"20\" stroke=\"#22C55E\" stroke-width=\"2\"/>\n  <text x=\"530\" y=\"24\" fill=\"#22C55E\" font-size=\"11\" font-weight=\"700\">TAKE PROFIT (+$80)</text>\n\n  <line x1=\"80\" y1=\"55\" x2=\"520\" y2=\"55\" stroke=\"#D6AD52\" stroke-width=\"2\"/>\n  <text x=\"530\" y=\"59\" fill=\"#D6AD52\" font-size=\"11\" font-weight=\"700\">ENTRY (BUY)</text>\n\n  <line x1=\"80\" y1=\"85\" x2=\"520\" y2=\"85\" stroke=\"#EF4444\" stroke-width=\"2\"/>\n  <text x=\"530\" y=\"89\" fill=\"#EF4444\" font-size=\"11\" font-weight=\"700\">STOP LOSS (-$40)</text>\n</svg>\n",
    "quiz": {
      "question": "Why should a trader never move or widen their Stop-Loss further away when a trade is in negative territory?",
      "options": [
        "Because MT5 charges extra commission for moving orders.",
        "Because moving the stop-loss breaks risk parameters, invites uncontrolled drawdown, and turns disciplined trading into emotional hope.",
        "Because the broker will instantly cancel the entire account.",
        "Because exchange rates only move in one direction."
      ],
      "correct": 1,
      "explanation": "Moving your stop-loss during a losing trade violates your initial risk plan and exposes your account to catastrophic loss.",
      "wrongHints": [
        "MetaTrader does not charge commissions for modifying existing stop levels.",
        "",
        "Brokers permit modifying stop orders; the danger is purely mathematical and psychological ruin.",
        "Exchange rates fluctuate in both directions continuously."
      ]
    }
  },
  {
    "id": "b12",
    "level": "beginner",
    "levelTitle": "Beginner: Forex Foundations",
    "lessonNum": 12,
    "globalNum": 12,
    "title": "Your First Demo Trade",
    "summary": "Walk through executing, monitoring, and closing your first practice trade with zero financial risk.",
    "objectives": [
      "Open and configure a free Demo Account on MetaTrader 5.",
      "Execute a complete 0.01 micro-lot trade with predefined SL and TP.",
      "Review trade execution in the History ledger and verify lessons learned."
    ],
    "content": "\n<p>Before risking a single dollar of real capital, every trader must practice on a <strong>Demo Account</strong>. A demo account provides simulated capital in identical live-market conditions, allowing you to build muscle memory without fear.</p>\n\n<h3>Step-by-Step Execution Protocol</h3>\n<ol>\n  <li><strong>Check Your Account Balance:</strong> Start your demo account with a realistic balance (such as $100 or $500), mirroring what you plan to deposit on a live JustMarkets account.</li>\n  <li><strong>Select Your Pair:</strong> Choose EUR/USD or XAUUSD. Inspect the spread in Market Watch.</li>\n  <li><strong>Calculate Lot Size:</strong> Select <strong>0.01</strong> micro-lot.</li>\n  <li><strong>Set Risk Parameters:</strong> Determine your Stop-Loss (e.g., 20 pips away) and Take-Profit (e.g., 40 pips away) before pressing BUY or SELL.</li>\n  <li><strong>Review Active Trade:</strong> Look at the Trade tab in Toolbox. Observe the floating PnL and how price interacts with your SL and TP lines on the chart.</li>\n  <li><strong>Log the Trade:</strong> Note the entry price, exit price, reason for entry, and outcome in your journal.</li>\n</ol>\n",
    "example": "\n<strong>First Demo Order Walkthrough:</strong><br>\nInstrument: EUR/USD | Type: Market BUY | Volume: 0.01<br>\nPrice at Click: 1.08300<br>\nSL: 1.08100 (-20 pips / -$2.00)<br>\nTP: 1.08700 (+40 pips / +$4.00)<br><br>\nResult: Price rises toward resistance and touches 1.08700. The trade closes automatically with <strong>+$4.00 profit</strong> recorded in your Trade History ledger.\n",
    "diagram": "\n<svg viewBox=\"0 0 600 70\" style=\"width:100%; height:auto; max-height:70px;\">\n  <rect x=\"40\" y=\"15\" width=\"150\" height=\"40\" rx=\"4\" fill=\"#151E2E\" stroke=\"#334155\"/>\n  <text x=\"115\" y=\"40\" fill=\"#94A3B8\" font-size=\"11\" font-weight=\"700\" text-anchor=\"middle\">1. Plan SL & TP</text>\n\n  <text x=\"210\" y=\"40\" fill=\"#D6AD52\" font-size=\"16\" font-weight=\"700\">&#8594;</text>\n\n  <rect x=\"230\" y=\"15\" width=\"150\" height=\"40\" rx=\"4\" fill=\"#151E2E\" stroke=\"#D6AD52\"/>\n  <text x=\"305\" y=\"40\" fill=\"#D6AD52\" font-size=\"11\" font-weight=\"700\" text-anchor=\"middle\">2. Enter 0.01 Lot</text>\n\n  <text x=\"400\" y=\"40\" fill=\"#D6AD52\" font-size=\"16\" font-weight=\"700\">&#8594;</text>\n\n  <rect x=\"420\" y=\"15\" width=\"150\" height=\"40\" rx=\"4\" fill=\"#151E2E\" stroke=\"#22C55E\"/>\n  <text x=\"495\" y=\"40\" fill=\"#22C55E\" font-size=\"11\" font-weight=\"700\" text-anchor=\"middle\">3. Audit History</text>\n</svg>\n",
    "quiz": {
      "question": "What is the primary objective of trading on a demo account before opening a live funded account?",
      "options": [
        "To generate real withdrawable cash profits.",
        "To build muscle memory, test execution, and prove risk discipline without risking real capital.",
        "To bypass broker identity verification regulations.",
        "To trade maximum 100-lot positions without consequence."
      ],
      "correct": 1,
      "explanation": "Demo accounts allow traders to master the terminal, test strategy rules, and verify disciplined execution without financial risk.",
      "wrongHints": [
        "Demo accounts use virtual currency; profits cannot be converted to real cash.",
        "",
        "Demo accounts do not replace legal KYC/identity verification for live broker accounts.",
        "Trading reckless maximum lot sizes on demo builds destructive habits that destroy live accounts."
      ]
    }
  },
  {
    "id": "i1",
    "level": "intermediate",
    "levelTitle": "Intermediate: Analysis and Strategy",
    "lessonNum": 1,
    "globalNum": 13,
    "title": "Candlestick Charts",
    "summary": "Read candlestick anatomy, interpret wicks and bodies, and identify key reversal patterns like Pin Bars and Engulfing candles.",
    "objectives": [
      "Dissect Japanese candlestick anatomy (Open, High, Low, Close).",
      "Interpret buying and selling pressure from wick length.",
      "Recognize foundational patterns: Bullish/Bearish Engulfing and Pin Bars (Rejection Hammers)."
    ],
    "content": "\n<p>Originating in 18th-century Japan for rice trading, <strong>candlestick charts</strong> are the primary visual language of modern technical analysis. Each candle represents the battle between buyers (bulls) and sellers (bears) over a specific time window (e.g., M15, H1, D1).</p>\n\n<h3>Candlestick Anatomy</h3>\n<ul>\n  <li><strong>Real Body:</strong> The wide portion between the Open and Close prices. If Close > Open, the candle is bullish (typically green). If Close < Open, it is bearish (typically red).</li>\n  <li><strong>Upper Shadow (Wick):</strong> Shows the highest price reached during the period.</li>\n  <li><strong>Lower Shadow (Wick):</strong> Shows the lowest price reached during the period.</li>\n</ul>\n\n<h3>Key Rejection Patterns</h3>\n<ul>\n  <li><strong>Pin Bar (Hammer / Shooting Star):</strong> A small body with a long tail (at least 2x the body length). A long lower tail indicates aggressive rejection of lower prices\u2014buyers stepped in.</li>\n  <li><strong>Engulfing Pattern:</strong> A candle whose body completely covers and exceeds the body of the preceding candle, signaling a strong shift in market momentum.</li>\n</ul>\n",
    "example": "\n<strong>Spotting a Pin Bar Rejection on XAUUSD (M15):</strong><br>\nPrice drops sharply into a $2,640 support level. Within the 15-minute candle, price dips to $2,636 but aggressive institutional buyers step in. The candle closes back at $2,642, leaving a long 6-dollar lower wick.<br>\nThis indicates lower prices were rejected, presenting a high-probability bullish setup.\n",
    "diagram": "\n<svg viewBox=\"0 0 600 120\" style=\"width:100%; height:auto; max-height:120px;\">\n  <!-- Bullish Candle -->\n  <line x1=\"200\" y1=\"15\" x2=\"200\" y2=\"105\" stroke=\"#22C55E\" stroke-width=\"2\"/>\n  <rect x=\"180\" y=\"35\" width=\"40\" height=\"50\" fill=\"#22C55E\" rx=\"2\"/>\n  <text x=\"145\" y=\"38\" fill=\"#94A3B8\" font-size=\"9\">Close</text>\n  <text x=\"145\" y=\"85\" fill=\"#94A3B8\" font-size=\"9\">Open</text>\n  <text x=\"200\" y=\"118\" fill=\"#22C55E\" font-size=\"10\" font-weight=\"700\" text-anchor=\"middle\">BULLISH (Green)</text>\n\n  <!-- Bearish Candle -->\n  <line x1=\"380\" y1=\"15\" x2=\"380\" y2=\"105\" stroke=\"#EF4444\" stroke-width=\"2\"/>\n  <rect x=\"360\" y=\"35\" width=\"40\" height=\"50\" fill=\"#EF4444\" rx=\"2\"/>\n  <text x=\"415\" y=\"38\" fill=\"#94A3B8\" font-size=\"9\">Open</text>\n  <text x=\"415\" y=\"85\" fill=\"#94A3B8\" font-size=\"9\">Close</text>\n  <text x=\"380\" y=\"118\" fill=\"#EF4444\" font-size=\"10\" font-weight=\"700\" text-anchor=\"middle\">BEARISH (Red)</text>\n</svg>\n",
    "quiz": {
      "question": "What does a long lower wick on a candlestick indicate?",
      "options": [
        "Sellers completely controlled the market from start to finish.",
        "Price attempted to move lower, but strong buying pressure pushed it back up before the close, rejecting lower prices.",
        "The broker's data feed experienced an error.",
        "Trading volume was exactly zero."
      ],
      "correct": 1,
      "explanation": "A long lower wick reveals that price visited lower levels, but buyers entered aggressively and pushed the close higher, signaling rejection.",
      "wrongHints": [
        "A lower wick indicates sellers were rejected; sellers dominated only if the candle closed at its absolute low.",
        "",
        "Wicks are natural market fluctuations, not broker chart feed errors.",
        "A wick requires active trading volume to form."
      ]
    }
  },
  {
    "id": "i2",
    "level": "intermediate",
    "levelTitle": "Intermediate: Analysis and Strategy",
    "lessonNum": 2,
    "globalNum": 14,
    "title": "Support and Resistance",
    "summary": "Identify key horizontal price zones where supply and demand historically concentrate, and master role reversal.",
    "objectives": [
      "Define horizontal Support (floor) and Resistance (ceiling) zones.",
      "Understand why support and resistance are zones rather than single lines.",
      "Apply the principle of Role Reversal: broken support becomes new resistance."
    ],
    "content": "\n<p><strong>Support and Resistance</strong> are among the most powerful concepts in technical analysis. They represent historical price levels where buying or selling pressure was strong enough to halt or reverse price direction.</p>\n\n<h3>Support: The Demand Floor</h3>\n<p>Support is a price level where buying interest is sufficiently strong to overcome selling pressure. When price approaches a proven support zone, buyers perceive value and step in, causing price to bounce upward.</p>\n\n<h3>Resistance: The Supply Ceiling</h3>\n<p>Resistance is a price level where selling interest overcomes buying pressure. When price rallies toward resistance, sellers take profit or initiate short positions, pushing price back down.</p>\n\n<h3>The Principle of Role Reversal</h3>\n<p>When a major support zone is convincingly broken to the downside, that price zone flips into a <strong>new resistance level</strong> on subsequent retests. Conversely, broken resistance becomes future support.</p>\n",
    "example": "\n<strong>Role Reversal in Action on EUR/USD:</strong><br>\nEUR/USD tests 1.0900 three times over a week and bounces upward each time (strong support).<br>\nFollowing an interest rate announcement, price violently breaks below 1.0900 down to 1.0840.<br>\nTwo days later, price retraces upward to 1.0900. Previous buyers who were trapped now sell to break even, and new sellers enter. 1.0900 acts as <strong>new resistance</strong>, repelling price back down to 1.0820.\n",
    "diagram": "\n<svg viewBox=\"0 0 600 100\" style=\"width:100%; height:auto; max-height:100px;\">\n  <line x1=\"50\" y1=\"50\" x2=\"550\" y2=\"50\" stroke=\"#D6AD52\" stroke-width=\"2\" stroke-dasharray=\"6\"/>\n  <text x=\"80\" y=\"42\" fill=\"#D6AD52\" font-size=\"10\" font-weight=\"700\">HISTORICAL 1.0900 ZONE</text>\n  \n  <!-- Path bouncing, breaking, retesting -->\n  <path d=\"M 60 70 Q 120 50 160 50 Q 200 70 240 50 Q 280 80 340 50 L 380 90 L 440 50 L 520 85\" fill=\"none\" stroke=\"#F1F5F9\" stroke-width=\"2\"/>\n  <text x=\"200\" y=\"75\" fill=\"#22C55E\" font-size=\"9\" text-anchor=\"middle\">Support Bounce</text>\n  <text x=\"360\" y=\"105\" fill=\"#EF4444\" font-size=\"9\" text-anchor=\"middle\">Breakdown</text>\n  <text x=\"440\" y=\"38\" fill=\"#EF4444\" font-size=\"9\" text-anchor=\"middle\">Retest as Resistance</text>\n</svg>\n",
    "quiz": {
      "question": "What happens when a strongly tested Support level is decisively broken to the downside?",
      "options": [
        "It ceases to have any market significance permanently.",
        "It frequently flips into a Resistance level on subsequent upward retests.",
        "The broker automatically closes all market orders.",
        "Exchange rates immediately freeze."
      ],
      "correct": 1,
      "explanation": "Role reversal is a core market mechanic: once buyers fail to defend support and price breaks through, that level becomes a barrier of supply (resistance) on future retests.",
      "wrongHints": [
        "Broken support zones do not disappear; they retain institutional memory as future supply barriers.",
        "",
        "Order execution continues smoothly through broken support levels.",
        "Exchange rates never freeze when support breaks."
      ]
    }
  },
  {
    "id": "i3",
    "level": "intermediate",
    "levelTitle": "Intermediate: Analysis and Strategy",
    "lessonNum": 3,
    "globalNum": 15,
    "title": "Market Structure and Trends",
    "summary": "Analyze trend direction using Higher Highs and Higher Lows, identify ranges, and spot Breaks of Structure (BOS).",
    "objectives": [
      "Classify market states: Uptrend, Downtrend, and Ranging (Consolidation).",
      "Identify swing highs, swing lows, Higher Highs (HH), and Higher Lows (HL).",
      "Detect a Break of Structure (BOS) signaling trend continuation or reversal."
    ],
    "content": "\n<p>Market price does not travel in straight lines; it moves in waves of expansion and retracement. Reading <strong>market structure</strong> allows you to trade with the institutional trend rather than fighting it.</p>\n\n<h3>The Three Market States</h3>\n<ol>\n  <li><strong>Uptrend (Bullish):</strong> Characterized by a series of <strong>Higher Highs (HH)</strong> and <strong>Higher Lows (HL)</strong>. Buyers consistently push price past previous peaks, and pullbacks are caught at progressively higher floors.</li>\n  <li><strong>Downtrend (Bearish):</strong> Characterized by a series of <strong>Lower Lows (LL)</strong> and <strong>Lower Highs (LH)</strong>. Sellers break previous bottoms, and rallies fail to exceed prior highs.</li>\n  <li><strong>Consolidation (Range-Bound):</strong> Price bounces horizontally between defined support and resistance boundaries without establishing higher or lower swing points.</li>\n</ol>\n\n<h3>Break of Structure (BOS)</h3>\n<p>A Break of Structure occurs when an active trend decisively breaches a key swing point (e.g., price closes above the most recent Lower High in a downtrend). This is the earliest structural clue that momentum has shifted.</p>\n",
    "example": "\n<strong>Mapping Structure on Gold:</strong><br>\n- Swing Low: $2,620<br>\n- Swing High: $2,640 (New High)<br>\n- Pullback Low: $2,630 (Higher Low - HL)<br>\n- Expansion High: $2,655 (Higher High - HH)<br><br>\nBecause the market is forming Higher Highs and Higher Lows, the structural trend is decisively bullish. Disciplined traders search only for BUY setups on pullbacks to the HL zone.\n",
    "diagram": "\n<svg viewBox=\"0 0 600 100\" style=\"width:100%; height:auto; max-height:100px;\">\n  <path d=\"M 50 85 L 150 40 L 220 65 L 340 25 L 410 50 L 530 15\" fill=\"none\" stroke=\"#22C55E\" stroke-width=\"2.5\"/>\n  <circle cx=\"150\" cy=\"40\" r=\"4\" fill=\"#22C55E\"/>\n  <text x=\"150\" y=\"30\" fill=\"#22C55E\" font-size=\"10\" font-weight=\"700\" text-anchor=\"middle\">HH1</text>\n  <circle cx=\"220\" cy=\"65\" r=\"4\" fill=\"#D6AD52\"/>\n  <text x=\"220\" y=\"80\" fill=\"#D6AD52\" font-size=\"10\" font-weight=\"700\" text-anchor=\"middle\">HL1</text>\n  <circle cx=\"340\" cy=\"25\" r=\"4\" fill=\"#22C55E\"/>\n  <text x=\"340\" y=\"15\" fill=\"#22C55E\" font-size=\"10\" font-weight=\"700\" text-anchor=\"middle\">HH2</text>\n  <circle cx=\"410\" cy=\"50\" r=\"4\" fill=\"#D6AD52\"/>\n  <text x=\"410\" y=\"65\" fill=\"#D6AD52\" font-size=\"10\" font-weight=\"700\" text-anchor=\"middle\">HL2</text>\n</svg>\n",
    "quiz": {
      "question": "How is a healthy Bullish Uptrend defined in market structure?",
      "options": [
        "A continuous series of Lower Highs and Lower Lows.",
        "A series of Higher Highs and Higher Lows.",
        "Horizontal price movement with zero volume.",
        "A straight vertical line with no retracements."
      ],
      "correct": 1,
      "explanation": "A bullish trend requires successive Higher Highs and Higher Lows, indicating ongoing dominance by buyers on both expansion and pullback phases.",
      "wrongHints": [
        "Lower Highs and Lower Lows define a Downtrend (bearish market state).",
        "",
        "Horizontal price action without higher highs or lower lows defines Consolidation/Range.",
        "Vertical parabolic movement without pullbacks is unsustainable and precedes sharp reversals."
      ]
    }
  },
  {
    "id": "i4",
    "level": "intermediate",
    "levelTitle": "Intermediate: Analysis and Strategy",
    "lessonNum": 4,
    "globalNum": 16,
    "title": "Multiple Timeframe Analysis",
    "summary": "Align macro trend direction with micro entry execution using a structured top-down analysis framework.",
    "objectives": [
      "Implement a 3-tier top-down analysis model (Macro, Structure, Execution).",
      "Avoid trading against the higher-timeframe trend.",
      "Use lower timeframes (M15/M5) for precise risk-reducing entries."
    ],
    "content": "\n<p>One of the most common retail mistakes is viewing only a single timeframe (like M5) in isolation. <strong>Multiple Timeframe Analysis (MTFA)</strong> resolves this by establishing higher-level context before executing orders.</p>\n\n<h3>The 3-Tier Top-Down Framework</h3>\n<ol>\n  <li><strong>Macro Context (Daily / H4):</strong> Establishes the overall market bias. Is the macro trend bullish, bearish, or ranging? Where are the major weekly/daily support and resistance levels?</li>\n  <li><strong>Intermediate Structure (H1):</strong> Confirms the current swing direction. Identifies intermediate key levels, supply/demand zones, and trend breaks.</li>\n  <li><strong>Execution Timeframe (M15 / M5):</strong> Used strictly for pinpointing entries. Look for candlestick confirmations (e.g., pin bars, engulfing patterns) aligned with the H4/H1 trend.</li>\n</ol>\n<p><strong>The Core Rule:</strong> Never take a trade on M5 that contradicts the primary trend established on H4/D1.</p>\n",
    "example": "\n<strong>Applying MTFA to EUR/USD:</strong><br>\n- <strong>Daily Chart:</strong> Price is in a clear uptrend bouncing off a key support zone.<br>\n- <strong>H1 Chart:</strong> A small downward retracement is losing momentum near an EMA 50 support.<br>\n- <strong>M15 Chart:</strong> Price prints a bullish engulfing candle rejecting the H1 support zone.<br><br>\nYou enter a BUY on M15 with a tight 15-pip stop loss, fully aligned with the multi-day macro uptrend.\n",
    "diagram": "\n<svg viewBox=\"0 0 600 90\" style=\"width:100%; height:auto; max-height:90px;\">\n  <rect x=\"30\" y=\"15\" width=\"160\" height=\"60\" rx=\"4\" fill=\"#151E2E\" stroke=\"#334155\"/>\n  <text x=\"110\" y=\"38\" fill=\"#D6AD52\" font-size=\"11\" font-weight=\"700\" text-anchor=\"middle\">1. Daily / H4</text>\n  <text x=\"110\" y=\"55\" fill=\"#94A3B8\" font-size=\"10\" text-anchor=\"middle\">Direction & Macro Bias</text>\n\n  <text x=\"205\" y=\"48\" fill=\"#94A3B8\" font-size=\"16\">&#8594;</text>\n\n  <rect x=\"220\" y=\"15\" width=\"160\" height=\"60\" rx=\"4\" fill=\"#151E2E\" stroke=\"#334155\"/>\n  <text x=\"300\" y=\"38\" fill=\"#D6AD52\" font-size=\"11\" font-weight=\"700\" text-anchor=\"middle\">2. H1 Chart</text>\n  <text x=\"300\" y=\"55\" fill=\"#94A3B8\" font-size=\"10\" text-anchor=\"middle\">Structure & Key Zones</text>\n\n  <text x=\"395\" y=\"48\" fill=\"#94A3B8\" font-size=\"16\">&#8594;</text>\n\n  <rect x=\"410\" y=\"15\" width=\"160\" height=\"60\" rx=\"4\" fill=\"#151E2E\" stroke=\"#22C55E\"/>\n  <text x=\"490\" y=\"38\" fill=\"#22C55E\" font-size=\"11\" font-weight=\"700\" text-anchor=\"middle\">3. M15 / M5</text>\n  <text x=\"490\" y=\"55\" fill=\"#22C55E\" font-size=\"10\" text-anchor=\"middle\">Precision Entry & Tight SL</text>\n</svg>\n",
    "quiz": {
      "question": "What is the primary danger of trading exclusively on a 5-minute chart without consulting higher timeframes?",
      "options": [
        "Your internet connection will slow down.",
        "You risk taking positions directly into major higher-timeframe support or resistance zones, fighting institutional order flow.",
        "MetaTrader 5 will automatically disable buy orders.",
        "Spreads become completely fixed."
      ],
      "correct": 1,
      "explanation": "Lower timeframe price action is subordinate to higher timeframe flows. Trading M5 in isolation blinds you to major daily and 4-hour support/resistance barriers.",
      "wrongHints": [
        "Timeframe selection has zero impact on internet latency or ping.",
        "",
        "MetaTrader supports order execution across all timeframes.",
        "Bid-ask spreads are determined by interbank market depth, not your chart timeframe."
      ]
    }
  },
  {
    "id": "i5",
    "level": "intermediate",
    "levelTitle": "Intermediate: Analysis and Strategy",
    "lessonNum": 5,
    "globalNum": 17,
    "title": "Technical Indicators",
    "summary": "Understand moving averages, RSI, and ATR. Learn how to use indicators as secondary confirmation rather than primary entry signals.",
    "objectives": [
      "Differentiate between trend-following (lagging) and momentum (leading) indicators.",
      "Use Exponential Moving Averages (EMA 20 / EMA 50) for dynamic trend identification.",
      "Avoid 'indicator overload' and understand that price action always precedes indicators."
    ],
    "content": "\n<p>A <strong>technical indicator</strong> is a mathematical calculation derived from historical price and volume data. Indicators are valuable tools for filtering market conditions, but they must never replace pure price action.</p>\n\n<h3>Core Institutional Indicators</h3>\n<ul>\n  <li><strong>Exponential Moving Average (EMA):</strong> Gives greater weight to recent prices.\n    <ul>\n      <li><strong>EMA 20 & EMA 50:</strong> Used to define short-to-medium trend momentum. When EMA 20 is above EMA 50 and price is trading above both, the trend is bullish.</li>\n      <li><strong>EMA 200:</strong> The institutional dividing line between long-term bull and bear regimes.</li>\n    </ul>\n  </li>\n  <li><strong>Relative Strength Index (RSI):</strong> A momentum oscillator measuring the speed and change of price moves (scaled 0-100). Readings above 70 indicate overbought conditions; readings below 30 indicate oversold conditions.</li>\n  <li><strong>Average True Range (ATR):</strong> Measures market volatility in points/pips. Essential for setting realistic, volatility-based stop-loss distances.</li>\n</ul>\n\n<h3>The Trap of Indicator Overload</h3>\n<p>Plastering 6 indicators on your chart causes 'analysis paralysis'\u2014where indicators provide contradictory signals. Keep your charts clean: 1 or 2 complementary indicators maximum.</p>\n",
    "example": "\n<strong>Setting Stop-Loss with ATR:</strong><br>\nCurrent ATR (14) on XAUUSD (H1) is <strong>$6.00</strong>.<br>\nIf you enter a buy trade, setting your Stop-Loss at only $1.50 away means normal hourly noise will stop you out. Using a <strong>1.5 &times; ATR rule</strong> (1.5 &times; $6 = $9.00 stop-loss distance) keeps your stop comfortably outside routine random fluctuations.\n",
    "diagram": "\n<svg viewBox=\"0 0 600 80\" style=\"width:100%; height:auto; max-height:80px;\">\n  <!-- Trend with EMA line -->\n  <path d=\"M 50 65 Q 150 55 250 45 Q 350 30 550 20\" fill=\"none\" stroke=\"#06B6D4\" stroke-width=\"2\"/>\n  <text x=\"560\" y=\"24\" fill=\"#06B6D4\" font-size=\"10\" font-weight=\"700\">EMA 20</text>\n  <path d=\"M 50 75 Q 150 68 250 58 Q 350 45 550 35\" fill=\"none\" stroke=\"#F59E0B\" stroke-width=\"2\"/>\n  <text x=\"560\" y=\"39\" fill=\"#F59E0B\" font-size=\"10\" font-weight=\"700\">EMA 50</text>\n  <text x=\"300\" y=\"70\" fill=\"#94A3B8\" font-size=\"11\" text-anchor=\"middle\">Bullish Dynamic Trend: Price > EMA 20 > EMA 50</text>\n</svg>\n",
    "quiz": {
      "question": "What is the primary purpose of the Average True Range (ATR) indicator?",
      "options": [
        "It predicts the exact hour that price will reverse direction.",
        "It measures market volatility over a set lookback period, helping traders set realistic stop-loss distances.",
        "It guarantees that a trade will hit its take-profit target.",
        "It calculates the broker's commission."
      ],
      "correct": 1,
      "explanation": "ATR measures how much an asset moves on average per candle, making it an invaluable tool for volatility-adjusted position sizing and stop placement.",
      "wrongHints": [
        "No technical indicator can predict the exact future minute or hour of a price reversal.",
        "",
        "Indicators do not guarantee that take-profit targets will be reached.",
        "Brokers do not use ATR to calculate commission."
      ]
    }
  },
  {
    "id": "i6",
    "level": "intermediate",
    "levelTitle": "Intermediate: Analysis and Strategy",
    "lessonNum": 6,
    "globalNum": 18,
    "title": "Fundamental Analysis",
    "summary": "Understand macro drivers of currency valuation: interest rate differentials, central bank policies, and macroeconomic health.",
    "objectives": [
      "Identify the role of Central Banks in determining currency values.",
      "Understand Interest Rate Differentials and the Carry Trade.",
      "Connect inflation (CPI), employment (NFP), and GDP growth to market sentiment."
    ],
    "content": "\n<p>While technical analysis studies price charts, <strong>fundamental analysis</strong> examines the economic, social, and political forces that determine the supply and demand for a nation's currency.</p>\n\n<h3>Interest Rates: The Engine of Currency Valuation</h3>\n<p>Central bank interest rates are the single most influential fundamental driver in foreign exchange. Capital naturally flows toward currencies offering higher yields or rising rate trajectories:</p>\n<ul>\n  <li>When a central bank (like the Federal Reserve) raises interest rates to combat inflation, global investors buy USD assets to earn higher returns, driving the Dollar upward.</li>\n  <li>When a central bank cuts interest rates to stimulate a weakening economy, capital leaves that currency in search of higher yields elsewhere.</li>\n</ul>\n\n<h3>Key Macroeconomic Indicators</h3>\n<ul>\n  <li><strong>Inflation (CPI / PPI / PCE):</strong> High inflation forces central banks to hike rates or keep them elevated.</li>\n  <li><strong>Employment Data (Non-Farm Payrolls, Unemployment Rate):</strong> Robust job growth signals economic resilience, supporting currency strength.</li>\n  <li><strong>Gross Domestic Product (GDP):</strong> The broadest gauge of economic growth and output.</li>\n</ul>\n",
    "example": "\n<strong>The Fed Rate Hike Impact:</strong><br>\nIn 2022, the US Federal Reserve rapidly raised rates from 0.25% to over 5.00% to combat inflation, while the Bank of Japan kept rates at -0.10%.<br>\nThis massive <strong>interest rate differential</strong> caused investors worldwide to borrow cheap Yen to invest in higher-yielding Dollars, driving USD/JPY from 115.00 to over 150.00.\n",
    "diagram": "\n<svg viewBox=\"0 0 600 80\" style=\"width:100%; height:auto; max-height:80px;\">\n  <rect x=\"50\" y=\"15\" width=\"220\" height=\"50\" rx=\"4\" fill=\"#151E2E\" stroke=\"#22C55E\"/>\n  <text x=\"160\" y=\"35\" fill=\"#22C55E\" font-size=\"11\" font-weight=\"700\" text-anchor=\"middle\">Higher Interest Rates</text>\n  <text x=\"160\" y=\"52\" fill=\"#F1F5F9\" font-size=\"10\" text-anchor=\"middle\">&#8594; Foreign Capital Inflow (Currency Rises)</text>\n\n  <rect x=\"330\" y=\"15\" width=\"220\" height=\"50\" rx=\"4\" fill=\"#151E2E\" stroke=\"#EF4444\"/>\n  <text x=\"440\" y=\"35\" fill=\"#EF4444\" font-size=\"11\" font-weight=\"700\" text-anchor=\"middle\">Lower Interest Rates</text>\n  <text x=\"440\" y=\"52\" fill=\"#F1F5F9\" font-size=\"10\" text-anchor=\"middle\">&#8594; Capital Outflow (Currency Weakens)</text>\n</svg>\n",
    "quiz": {
      "question": "What typically happens to a currency's exchange rate when its central bank unexpectedly hikes interest rates?",
      "options": [
        "The currency tends to appreciate (strengthen) as foreign investors seek higher yields.",
        "The currency immediately drops by 50%.",
        "The currency is delisted from global brokers.",
        "Trading in that currency becomes completely illegal."
      ],
      "correct": 0,
      "explanation": "Higher interest rates attract foreign capital seeking higher returns on sovereign debt and bank deposits, increasing demand for that currency.",
      "wrongHints": [
        "",
        "A rate hike typically strengthens a currency, not causes a 50% crash.",
        "Central bank rate changes are standard monetary policy and do not lead to delisting.",
        "Interest rate adjustments are legally mandated central bank policy."
      ]
    }
  },
  {
    "id": "i7",
    "level": "intermediate",
    "levelTitle": "Intermediate: Analysis and Strategy",
    "lessonNum": 7,
    "globalNum": 19,
    "title": "Economic Calendar and News",
    "summary": "Navigate high-impact news releases, manage volatility spikes, and protect trades during major economic events.",
    "objectives": [
      "Read an economic calendar and identify high-impact (Red Folder) events.",
      "Understand slippage, spread widening, and execution risk during news releases.",
      "Develop a rule-based protocol for managing trades around news events."
    ],
    "content": "\n<p>An <strong>economic calendar</strong> tracks the scheduled dates, times, and consensus forecasts for major macroeconomic data releases. Scheduled news events are catalysts for the largest intraday volatility spikes in the market.</p>\n\n<h3>High-Impact Event Tiers</h3>\n<ul>\n  <li><strong>US Non-Farm Payrolls (NFP):</strong> Released on the first Friday of every month at 12:30 UTC. Measures US monthly job creation and causes explosive volatility across all USD pairs and Gold.</li>\n  <li><strong>Consumer Price Index (CPI):</strong> Primary gauge of inflation. Dictates central bank rate expectations.</li>\n  <li><strong>FOMC / ECB / BOE Rate Decisions & Press Conferences:</strong> Sets benchmark interest rates and monetary policy guidance.</li>\n</ul>\n\n<h3>The News Trading Reality: Slippage & Spread Widening</h3>\n<p>During the exact second of a high-impact release, interbank algorithms pull their limit orders, causing liquidity to evaporate for a few moments. Spreads on Gold and majors can widen by 5-10x, and market orders can slip by 20-50 pips. Professional quantitative systems avoid entering orders during the first 5 minutes of high-impact releases.</p>\n",
    "example": "\n<strong>Surprise NFP Release:</strong><br>\nForecast: +180,000 jobs | Actual Result: +350,000 jobs (massive beat).<br><br>\nBecause the US economy added far more jobs than expected, interest rate cut expectations diminish immediately. The US Dollar surges 80 pips within 3 minutes, while Spot Gold plunges $35.00.<br>\nTraders holding unprotected long positions on gold without stops suffer severe drawdown.\n",
    "diagram": "\n<svg viewBox=\"0 0 600 70\" style=\"width:100%; height:auto; max-height:70px;\">\n  <rect x=\"50\" y=\"10\" width=\"500\" height=\"50\" rx=\"4\" fill=\"#151E2E\" stroke=\"#EF4444\"/>\n  <text x=\"75\" y=\"38\" fill=\"#EF4444\" font-size=\"12\" font-weight=\"800\">ALERT</text>\n  <text x=\"140\" y=\"30\" fill=\"#F1F5F9\" font-size=\"11\" font-weight=\"700\">US CPI Release (12:30 UTC)</text>\n  <text x=\"140\" y=\"48\" fill=\"#94A3B8\" font-size=\"10\">Spreads widen 5-10x &bull; High Slippage Risk &bull; Algorithmic Freeze Window</text>\n</svg>\n",
    "quiz": {
      "question": "Why is entering market orders immediately at the release second of high-impact news dangerous for retail traders?",
      "options": [
        "Trading servers are always turned off during news.",
        "Liquidity providers temporarily withdraw quotes, causing severe spread widening and adverse slippage.",
        "Brokers charge double commissions on winning trades.",
        "Exchange rates only change once per week."
      ],
      "correct": 1,
      "explanation": "During high-impact releases, liquidity briefly dries up, causing spreads to expand dramatically and exposing market orders to severe slippage.",
      "wrongHints": [
        "Trading servers operate normally during economic news releases.",
        "",
        "Broker commissions are fixed per traded lot and do not double during news.",
        "Exchange rates fluctuate continuously every millisecond."
      ]
    }
  },
  {
    "id": "i8",
    "level": "intermediate",
    "levelTitle": "Intermediate: Analysis and Strategy",
    "lessonNum": 8,
    "globalNum": 20,
    "title": "Liquidity and Market Sessions",
    "summary": "Master the 4 global sessions, London/NY overlap volume, Asian range sweeps, and the rollover danger hour.",
    "objectives": [
      "Map the 4 major sessions: Asian (Tokyo/Sydney), London, New York, and Rollover.",
      "Understand the London/New York overlap as the peak liquidity window.",
      "Identify the Asian session 'Judas Swing' liquidity sweep."
    ],
    "content": "\n<p>Market volatility and spreads are not uniform throughout the day. Institutional volume is governed by the operating hours of physical financial centers in London, New York, Tokyo, and Sydney.</p>\n\n<h3>The Session Lifecycle</h3>\n<ol>\n  <li><strong>Asian Session (00:00 - 08:00 UTC):</strong> Tokyo and Sydney. Characterized by lower volatility and consolidated horizontal ranges. Establishes the Asian High and Low liquidity boundaries.</li>\n  <li><strong>London Open (07:00 - 11:00 UTC):</strong> Volume surges as Europe opens. Often produces the 'Judas Swing'\u2014a false breakout sweeping the Asian session high or low before initiating the real trend of the day. Spreads compress to minimum.</li>\n  <li><strong>London / New York Overlap (12:30 - 16:30 UTC):</strong> The peak liquidity window of the 24-hour cycle. Accounts for over 50% of total daily global volume.</li>\n  <li><strong>Rollover & Swap Hour (21:00 - 23:00 UTC):</strong> Interbank desks close and rebalance daily swap financing. Spreads widen up to 500-800%. Trading should be avoided.</li>\n</ol>\n",
    "example": "\n<strong>The London Asian Sweep:</strong><br>\nDuring the Asian session, Gold ranges between $2,640 and $2,648.<br>\nAt 07:15 UTC (London Open), price spikes aggressively to $2,651, triggering buy-stops above the Asian High.<br>\nWithin 15 minutes, price snaps back inside the range and plummets to $2,630.<br>\nThis was an institutional liquidity sweep (Judas Swing) harvesting retail breakout stops before driving the true downward trend.\n",
    "diagram": "\n<svg viewBox=\"0 0 600 70\" style=\"width:100%; height:auto; max-height:70px;\">\n  <rect x=\"30\" y=\"15\" width=\"120\" height=\"40\" rx=\"3\" fill=\"#151E2E\" stroke=\"#334155\"/>\n  <text x=\"90\" y=\"38\" fill=\"#94A3B8\" font-size=\"10\" font-weight=\"700\" text-anchor=\"middle\">Asian (Range)</text>\n\n  <rect x=\"160\" y=\"15\" width=\"130\" height=\"40\" rx=\"3\" fill=\"#151E2E\" stroke=\"#22C55E\"/>\n  <text x=\"225\" y=\"38\" fill=\"#22C55E\" font-size=\"10\" font-weight=\"700\" text-anchor=\"middle\">London (Expansion)</text>\n\n  <rect x=\"300\" y=\"15\" width=\"150\" height=\"40\" rx=\"3\" fill=\"#151E2E\" stroke=\"#D6AD52\"/>\n  <text x=\"375\" y=\"38\" fill=\"#D6AD52\" font-size=\"10\" font-weight=\"700\" text-anchor=\"middle\">Overlap (Peak Vol)</text>\n\n  <rect x=\"460\" y=\"15\" width=\"110\" height=\"40\" rx=\"3\" fill=\"#151E2E\" stroke=\"#EF4444\"/>\n  <text x=\"515\" y=\"38\" fill=\"#EF4444\" font-size=\"10\" font-weight=\"700\" text-anchor=\"middle\">Rollover (Trap)</text>\n</svg>\n",
    "quiz": {
      "question": "Which trading window offers the highest liquidity and lowest average spreads during the 24-hour cycle?",
      "options": [
        "The Sunday evening market open",
        "The London / New York overlap window (12:30 - 16:30 UTC)",
        "The daily rollover hour (21:00 - 23:00 UTC)",
        "Midday in the Tokyo session"
      ],
      "correct": 1,
      "explanation": "When both the London and New York banking centers are operating simultaneously, market depth is at its peak and spreads are tightest.",
      "wrongHints": [
        "The Sunday evening market open has the thinnest liquidity and widest spreads of the week.",
        "",
        "The rollover hour (21:00-23:00 UTC) has thin liquidity and wide spreads.",
        "The Tokyo session has significantly lower volume than the European and US sessions."
      ]
    }
  },
  {
    "id": "i9",
    "level": "intermediate",
    "levelTitle": "Intermediate: Analysis and Strategy",
    "lessonNum": 9,
    "globalNum": 21,
    "title": "Risk-to-Reward Ratio",
    "summary": "Master mathematical expectancy. Learn why a favorable risk-to-reward ratio allows you to be profitable even with a 40% win rate.",
    "objectives": [
      "Define the Risk-to-Reward Ratio (R:R).",
      "Calculate mathematical expectancy across a sample of 100 trades.",
      "Understand why high win-rate strategies with poor R:R frequently blow accounts."
    ],
    "content": "\n<p>Novice traders are obsessed with achieving a 90% win rate. Professional quantitative traders focus on <strong>mathematical expectancy</strong> driven by a favorable <strong>Risk-to-Reward ratio (R:R)</strong>.</p>\n\n<h3>What Is Risk-to-Reward?</h3>\n<p>The Risk-to-Reward ratio compares how much capital you are risking on a trade against the potential gain you expect to make:</p>\n<ul>\n  <li><strong>1:1 R:R:</strong> You risk $10 to make $10. You need > 50% win rate to be profitable.</li>\n  <li><strong>1:2 R:R:</strong> You risk $10 to make $20. You need only a <strong>33.3% win rate</strong> to break even!</li>\n  <li><strong>1:3 R:R:</strong> You risk $10 to make $30. You need only a <strong>25% win rate</strong> to break even!</li>\n</ul>\n\n<h3>The Expectancy Formula</h3>\n<p style=\"font-family:monospace; background:#0B1120; padding:8px; border-radius:4px; color:#D6AD52;\">\nExpectancy = (Win Rate &times; Average Win) - (Loss Rate &times; Average Loss)\n</p>\n<p>If your expectancy is positive, your trading system will reliably compound capital over hundreds of trades, regardless of short-term losing streaks.</p>\n",
    "example": "\n<strong>100 Trades with a 40% Win Rate (1:2 R:R):</strong><br>\nStarting Balance: $1,000 | Risk per trade: $10 (1%) | Target: $20 (2%)<br><br>\n- <strong>60 Losses:</strong> 60 &times; -$10 = -$600<br>\n- <strong>40 Wins:</strong> 40 &times; +$20 = +$800<br>\n- <strong>Net Profit:</strong> +$800 - $600 = <strong>+$200.00 Net Gain (+20%)</strong>.<br><br>\nEven though you lost 60% of your trades, you achieved a solid 20% portfolio return due to mathematical expectancy.\n",
    "diagram": "\n<svg viewBox=\"0 0 600 80\" style=\"width:100%; height:auto; max-height:80px;\">\n  <rect x=\"80\" y=\"25\" width=\"120\" height=\"30\" rx=\"3\" fill=\"#151E2E\" stroke=\"#EF4444\"/>\n  <text x=\"140\" y=\"44\" fill=\"#EF4444\" font-size=\"11\" font-weight=\"700\" text-anchor=\"middle\">1R Risk ($10)</text>\n\n  <rect x=\"220\" y=\"25\" width=\"240\" height=\"30\" rx=\"3\" fill=\"#151E2E\" stroke=\"#22C55E\"/>\n  <text x=\"340\" y=\"44\" fill=\"#22C55E\" font-size=\"11\" font-weight=\"700\" text-anchor=\"middle\">2R Reward ($20) &bull; Break-even at 33.3% Win Rate</text>\n</svg>\n",
    "quiz": {
      "question": "If your trading strategy maintains an average Risk-to-Reward ratio of 1:2, what win rate is required to break even over time?",
      "options": [
        "66.7%",
        "50.0%",
        "33.3%",
        "10.0%"
      ],
      "correct": 2,
      "explanation": "At 1:2 R:R, winning 1 out of 3 trades (33.3%) breaks even: 1 win * $20 = $20, 2 losses * $10 = $20. Any win rate above 33.3% produces net profit.",
      "wrongHints": [
        "A 66.7% win rate at 1:2 R:R would yield massive profits, far exceeding break-even.",
        "A 50.0% win rate at 1:2 R:R yields a large net profit (Win $20, Loss $10).",
        "",
        "At a 10% win rate, you lose 9 trades (-$90) for every 1 win (+$20), producing net loss."
      ]
    }
  },
  {
    "id": "i10",
    "level": "intermediate",
    "levelTitle": "Intermediate: Analysis and Strategy",
    "lessonNum": 10,
    "globalNum": 22,
    "title": "Trading Plans and Journals",
    "summary": "Build a written rulebook: entry checklists, invalidation criteria, trade logging, and weekly performance reviews.",
    "objectives": [
      "Construct a formalized, written trading plan.",
      "Maintain an auditable trade journal tracking emotional state and technical metrics.",
      "Conduct structured post-trade reviews to identify and correct behavioral leakage."
    ],
    "content": "\n<p>If you trade without a written plan, you are gambling. A <strong>trading plan</strong> is your personal business operations manual that removes emotional decision-making from the live execution environment.</p>\n\n<h3>Essential Components of a Trading Plan</h3>\n<ol>\n  <li><strong>Permitted Instruments & Sessions:</strong> Only trade pairs you have tested (e.g., EUR/USD, XAUUSD during London/NY sessions).</li>\n  <li><strong>Setup Criteria Checklist:</strong> All confluence factors required before entering (e.g., H4 trend direction + key support level + M15 rejection candle).</li>\n  <li><strong>Risk Parameters:</strong> Exactly 1% or 2% maximum risk per trade; hard stop-loss entered before clicking execute.</li>\n  <li><strong>Invalidation Rules:</strong> The exact market condition that proves your idea wrong.</li>\n  <li><strong>Daily Loss Limit:</strong> Stop trading for the day after 2 consecutive losses or reaching a 2% drawdown.</li>\n</ol>\n\n<h3>The Power of Trade Journaling</h3>\n<p>Track every trade: Date, Pair, Direction, Entry Price, SL, TP, Result (R-multiple), and Screenshot. Review your journal weekly to identify recurring mistakes (e.g., entering too early, cutting winners prematurely).</p>\n",
    "example": "\n<strong>Trade Journal Entry Template:</strong><br>\n- <strong>Date/Time:</strong> Oct 24, 13:45 UTC<br>\n- <strong>Instrument:</strong> XAUUSD.m | <strong>Direction:</strong> BUY 0.01 lot<br>\n- <strong>Setup:</strong> H1 bullish structure + retest of $2,640 support + M15 pin bar.<br>\n- <strong>Risk / Reward:</strong> SL $2,636 ($4 risk / 1R) | TP $2,648 ($8 target / 2R)<br>\n- <strong>Outcome:</strong> Hit TP (+2R / +$8.00)<br>\n- <strong>Psychology Note:</strong> Followed rulebook calmly; resisted temptation to close early at 1R.\n",
    "diagram": "\n<svg viewBox=\"0 0 600 70\" style=\"width:100%; height:auto; max-height:70px;\">\n  <rect x=\"30\" y=\"15\" width=\"160\" height=\"40\" rx=\"3\" fill=\"#151E2E\" stroke=\"#334155\"/>\n  <text x=\"110\" y=\"38\" fill=\"#F1F5F9\" font-size=\"10\" font-weight=\"700\" text-anchor=\"middle\">1. Pre-Trade Checklist</text>\n\n  <text x=\"205\" y=\"38\" fill=\"#D6AD52\" font-size=\"16\">&#8594;</text>\n\n  <rect x=\"220\" y=\"15\" width=\"160\" height=\"40\" rx=\"3\" fill=\"#151E2E\" stroke=\"#D6AD52\"/>\n  <text x=\"300\" y=\"38\" fill=\"#D6AD52\" font-size=\"10\" font-weight=\"700\" text-anchor=\"middle\">2. Disciplined Execution</text>\n\n  <text x=\"395\" y=\"38\" fill=\"#D6AD52\" font-size=\"16\">&#8594;</text>\n\n  <rect x=\"410\" y=\"15\" width=\"160\" height=\"40\" rx=\"3\" fill=\"#151E2E\" stroke=\"#22C55E\"/>\n  <text x=\"490\" y=\"38\" fill=\"#22C55E\" font-size=\"10\" font-weight=\"700\" text-anchor=\"middle\">3. Post-Trade Audit</text>\n</svg>\n",
    "quiz": {
      "question": "What is the primary value of maintaining a detailed trading journal?",
      "options": [
        "It guarantees that your broker will refund your trading losses.",
        "It allows you to objectively analyze your edge, identify psychological leaks, and measure whether you followed your plan.",
        "It automatically trades for you while you sleep.",
        "It is required by tax authorities in every country."
      ],
      "correct": 1,
      "explanation": "A trade journal transforms subjective opinions into objective data, exposing whether losses are due to random market variance or undisciplined rule-breaking.",
      "wrongHints": [
        "Brokers never refund trading losses.",
        "",
        "Journals do not automate execution; they are diagnostic self-improvement logs.",
        "Tax reporting rules do not mandate detailed trade journaling."
      ]
    }
  },
  {
    "id": "a1",
    "level": "advanced",
    "levelTitle": "Advanced: Risk and Execution",
    "lessonNum": 1,
    "globalNum": 23,
    "title": "Position Sizing",
    "summary": "Master fixed fractional position sizing formulas. Never choose an arbitrary lot size again.",
    "objectives": [
      "Master the mathematical position sizing formula: Lot Size = (Capital * Risk%) / (SL Pips * Pip Value).",
      "Understand why fixed-lot sizing causes account ruin during wide stop-loss setups.",
      "Implement automated position sizing across currency pairs and gold."
    ],
    "content": "\n<p>Professional risk managers never open a trade with an arbitrary lot size (like 'always trading 0.10 lots'). Instead, your <strong>lot size must be dynamically calculated</strong> so that your risk is strictly identical in dollars regardless of whether your stop-loss is 15 pips or 50 pips wide.</p>\n\n<h3>The Fixed Fractional Sizing Formula</h3>\n<p style=\"font-family:monospace; background:#0B1120; padding:10px; border-radius:4px; color:#D6AD52; font-size:12px;\">\nLot Size = Risk Capital ($) / [ Stop Loss (Pips) &times; Pip Value per Standard Lot ($10) ]\n</p>\n<p>Where <em>Risk Capital</em> = Account Balance &times; Risk Percentage (e.g., $100 &times; 1% = $1.00 USD).</p>\n\n<h3>The Problem with Fixed-Lot Trading</h3>\n<p>If you always trade 0.05 lots: A 20-pip stop loss risks $10.00. But on a volatile Gold setup with a 60-pip stop loss, you inadvertently risk $30.00! One single loss wipes out three previous winning trades. Dynamic sizing eliminates this asymmetry.</p>\n",
    "example": "\n<strong>Applying the Sizing Formula:</strong><br>\n- Account Balance: $100.00 USD<br>\n- Risk per Trade: 2.0% ($2.00 maximum risk)<br>\n- Stop-Loss distance on EUR/USD: 25 pips<br><br>\nCalculation:<br>\n$2.00 / (25 pips &times; $10/pip) = $2.00 / $250 = <strong>0.008 Lots</strong>.<br>\nFloored to minimum broker volume step: <strong>0.01 Micro-Lot</strong>.<br>\nMaximum actual loss if stopped out: 25 pips &times; $0.10 = $2.50 USD (2.5% account risk).\n",
    "diagram": "\n<svg viewBox=\"0 0 600 70\" style=\"width:100%; height:auto; max-height:70px;\">\n  <rect x=\"50\" y=\"15\" width=\"500\" height=\"40\" rx=\"4\" fill=\"#0B1120\" stroke=\"#D6AD52\"/>\n  <text x=\"300\" y=\"38\" fill=\"#D6AD52\" font-size=\"12\" font-family=\"monospace\" font-weight=\"700\" text-anchor=\"middle\">\n    Lots = (Balance &times; Risk %) / (SL Distance &times; Pip Value)\n  </text>\n</svg>\n",
    "quiz": {
      "question": "If your account balance is $200 and your risk rule is 1% ($2.00 risk), what lot size should you trade if your stop-loss on EUR/USD is 20 pips?",
      "options": [
        "0.10 Mini-Lot ($20 risk)",
        "0.01 Micro-Lot ($2.00 risk)",
        "1.00 Standard Lot ($200 risk)",
        "0.05 Lots ($10 risk)"
      ],
      "correct": 1,
      "explanation": "20 pips on 0.01 micro-lot = 20 * $0.10 = $2.00. That matches your exact 1% ($2.00) risk allowance.",
      "wrongHints": [
        "A 0.10 mini-lot on 20 pips risks $20.00 (10% of a $200 account), violating your 1% rule.",
        "",
        "A 1.00 standard lot on 20 pips risks $200.00, which is 100% of the entire account.",
        "A 0.05 lot risks $10.00 (5% of the account)."
      ]
    }
  },
  {
    "id": "a2",
    "level": "advanced",
    "levelTitle": "Advanced: Risk and Execution",
    "lessonNum": 2,
    "globalNum": 24,
    "title": "Advanced Risk Management",
    "summary": "Manage currency correlation, portfolio heat, daily loss limits, and automated circuit breakers.",
    "objectives": [
      "Calculate currency correlation to prevent hidden duplicate exposure.",
      "Set portfolio heat limits (maximum open risk across all positions).",
      "Establish daily loss limits and consecutive-loss circuit breakers."
    ],
    "content": "\n<p>Risk management is not just about a single trade's stop-loss. It is about protecting your entire portfolio from systemic cluster risks.</p>\n\n<h3>Currency Correlation Risk</h3>\n<p>Many currency pairs move in tandem due to shared macroeconomic drivers:</p>\n<ul>\n  <li><strong>Positive Correlation:</strong> EUR/USD and GBP/USD frequently move in the same direction (correlation > +0.80). If you buy EUR/USD and buy GBP/USD at the same time, you do not have two independent trades; you have doubled your risk on US Dollar weakness.</li>\n  <li><strong>Negative Correlation:</strong> EUR/USD and USD/CHF move inversely (correlation < -0.85). Buying EUR/USD and buying USD/CHF cancels out gains and doubles transaction costs.</li>\n</ul>\n\n<h3>The Daily Loss Circuit Breaker</h3>\n<p>Top quantitative desks employ hard circuit breakers: if daily drawdown reaches <strong>2% to 3%</strong>, or if the account experiences <strong>2 consecutive losses</strong>, all trading halts automatically for 4 to 24 hours. This eliminates emotional revenge trading.</p>\n",
    "example": "\n<strong>Correlation Trap:</strong><br>\nA trader buys 0.01 EUR/USD, 0.01 GBP/USD, and 0.01 AUD/USD, believing they are diversified.<br>\nAt 12:30 UTC, US CPI comes in red-hot. The US Dollar surges across all pairs.<br>\nAll three trades hit their stop-losses simultaneously, tripling the expected loss to 6% in 2 minutes. True diversification requires uncorrelated assets.\n",
    "diagram": "\n<svg viewBox=\"0 0 600 70\" style=\"width:100%; height:auto; max-height:70px;\">\n  <rect x=\"50\" y=\"15\" width=\"220\" height=\"40\" rx=\"3\" fill=\"#151E2E\" stroke=\"#EF4444\"/>\n  <text x=\"160\" y=\"38\" fill=\"#EF4444\" font-size=\"10\" font-weight=\"700\" text-anchor=\"middle\">Buy EUR/USD + Buy GBP/USD = 2x Risk</text>\n\n  <rect x=\"330\" y=\"15\" width=\"220\" height=\"40\" rx=\"3\" fill=\"#151E2E\" stroke=\"#22C55E\"/>\n  <text x=\"440\" y=\"38\" fill=\"#22C55E\" font-size=\"10\" font-weight=\"700\" text-anchor=\"middle\">Uncorrelated Assets = True Risk Buffer</text>\n</svg>\n",
    "quiz": {
      "question": "Why is simultaneously buying EUR/USD and buying GBP/USD considered double exposure rather than diversification?",
      "options": [
        "Because both pairs share high positive correlation driven by the US Dollar.",
        "Because MetaTrader 5 will error out on two European pairs.",
        "Because the British Pound is pegged to the Euro.",
        "Because broker margins double automatically."
      ],
      "correct": 0,
      "explanation": "EUR/USD and GBP/USD have high positive correlation. Going long on both effectively doubles your directional risk on the US Dollar.",
      "wrongHints": [
        "",
        "MT5 allows multiple positions across European pairs without error.",
        "The British Pound floats independently and is not pegged to the Euro.",
        "Required margin per lot is unchanged, but total risk exposure is doubled."
      ]
    }
  },
  {
    "id": "a3",
    "level": "advanced",
    "levelTitle": "Advanced: Risk and Execution",
    "lessonNum": 3,
    "globalNum": 25,
    "title": "Drawdown and Capital Preservation",
    "summary": "Understand the non-linear physics of asymmetric drawdown and why capital preservation is mathematically mandatory.",
    "objectives": [
      "Calculate required recovery gain using the Asymmetric Recovery Formula.",
      "Understand why recovering from large drawdowns is non-linear and mathematically catastrophic.",
      "Apply the $20 daily profit target / 200-pip principle on a $100 starting deposit."
    ],
    "content": "\n<p>In portfolio mathematics, capital drawdown operates on an <strong>asymmetric scale</strong>. A loss is linear, but the gain required on remaining capital to break even scales quadratically to infinity.</p>\n\n<h3>The Asymmetric Recovery Formula</h3>\n<p style=\"font-family:monospace; background:#0B1120; padding:10px; border-radius:4px; color:#D6AD52; font-size:12px;\">\nRequired Recovery Gain (R) = [ 1 / (1 - Loss Fraction) - 1 ] &times; 100%\n</p>\n\n<h3>The Non-Linear Drawdown Matrix</h3>\n<ul>\n  <li><strong>10% Loss:</strong> Requires an <strong>11.1% gain</strong> to break even (manageable).</li>\n  <li><strong>20% Loss:</strong> Requires a <strong>25.0% gain</strong> to break even (moderate).</li>\n  <li><strong>50% Loss:</strong> Requires a <strong>100.0% gain</strong> to break even (must double your remaining capital!).</li>\n  <li><strong>80% Loss:</strong> Requires a <strong>400.0% gain</strong> to break even (5x return required).</li>\n  <li><strong>90% Loss:</strong> Requires a <strong>900.0% gain</strong> (statistically terminal).</li>\n</ul>\n\n<h3>The $20 Daily Profit Target / 200 Pip Principle</h3>\n<p>On a $100 starting deposit using strict 0.01 micro-lots, capturing 200 pips yields exactly $20.00 profit (+20% in a single day). Locking in gains and shutting down the terminal permanently prevents late-session give-backs, emotional revenge trades, and overtrading decay.</p>\n",
    "example": "\n<strong>The Reality of a 50% Drawdown:</strong><br>\nYou start with $100. You take excessive risks and lose $50 (50% drawdown).<br>\nYou have $50 left.<br>\nTo return to your original $100, you now need to make $50 profit on your $50 balance\u2014which is a <strong>+100% gain</strong>.<br>\nGenerating a 100% return while preserving capital requires immense discipline and luck. Never allow your account to cross beyond a 5-10% drawdown.\n",
    "diagram": "\n<svg viewBox=\"0 0 600 80\" style=\"width:100%; height:auto; max-height:80px;\">\n  <rect x=\"50\" y=\"20\" width=\"100\" height=\"40\" rx=\"3\" fill=\"#151E2E\" stroke=\"#22C55E\"/>\n  <text x=\"100\" y=\"38\" fill=\"#22C55E\" font-size=\"10\" font-weight=\"700\" text-anchor=\"middle\">-10% Loss</text>\n  <text x=\"100\" y=\"52\" fill=\"#F1F5F9\" font-size=\"9\" text-anchor=\"middle\">+11% to recover</text>\n\n  <rect x=\"180\" y=\"20\" width=\"100\" height=\"40\" rx=\"3\" fill=\"#151E2E\" stroke=\"#D6AD52\"/>\n  <text x=\"230\" y=\"38\" fill=\"#D6AD52\" font-size=\"10\" font-weight=\"700\" text-anchor=\"middle\">-20% Loss</text>\n  <text x=\"230\" y=\"52\" fill=\"#F1F5F9\" font-size=\"9\" text-anchor=\"middle\">+25% to recover</text>\n\n  <rect x=\"310\" y=\"20\" width=\"110\" height=\"40\" rx=\"3\" fill=\"#151E2E\" stroke=\"#EF4444\"/>\n  <text x=\"365\" y=\"38\" fill=\"#EF4444\" font-size=\"10\" font-weight=\"700\" text-anchor=\"middle\">-50% Loss</text>\n  <text x=\"365\" y=\"52\" fill=\"#EF4444\" font-size=\"9\" font-weight=\"700\" text-anchor=\"middle\">+100% TO RECOVER</text>\n\n  <rect x=\"450\" y=\"20\" width=\"110\" height=\"40\" rx=\"3\" fill=\"#151E2E\" stroke=\"#EF4444\"/>\n  <text x=\"505\" y=\"38\" fill=\"#EF4444\" font-size=\"10\" font-weight=\"700\" text-anchor=\"middle\">-80% Loss</text>\n  <text x=\"505\" y=\"52\" fill=\"#EF4444\" font-size=\"9\" font-weight=\"700\" text-anchor=\"middle\">+400% TO RECOVER</text>\n</svg>\n",
    "quiz": {
      "question": "If a trading account suffers a 50% drawdown, what percentage gain on the remaining capital is required to return to the original balance?",
      "options": [
        "50%",
        "75%",
        "100% (must double remaining balance)",
        "25%"
      ],
      "correct": 2,
      "explanation": "If a $100 account drops to $50 (50% loss), you must generate $50 on your remaining $50 to break even, which is an exact +100% gain.",
      "wrongHints": [
        "A 50% gain on remaining $50 yields only $75, leaving you still down $25.",
        "A 75% gain on remaining $50 yields only $87.50, still short of break-even.",
        "",
        "A 25% gain on $50 yields only $62.50."
      ]
    }
  },
  {
    "id": "a4",
    "level": "advanced",
    "levelTitle": "Advanced: Risk and Execution",
    "lessonNum": 4,
    "globalNum": 26,
    "title": "Trading Psychology",
    "summary": "Overcome cognitive biases: revenge trading, loss aversion, FOMO, and the illusion of control.",
    "objectives": [
      "Identify the psychological root causes of retail failure (FOMO, Revenge Trading, Overconfidence).",
      "Understand Loss Aversion theory (Kahneman & Tversky).",
      "Develop psychological detachment by thinking in probabilistic sample sizes."
    ],
    "content": "\n<p>Trading psychology is the mental and emotional management of fear, greed, hope, and regret. Even the most mathematically sound trading system will fail if the human operator violates its execution rules.</p>\n\n<h3>Cognitive Biases That Destroy Capital</h3>\n<ul>\n  <li><strong>Loss Aversion:</strong> Behavioral economists proved that the emotional pain of losing $100 is twice as intense as the joy of winning $100. This causes traders to hold losing trades hoping for a miracle, while cutting winners prematurely to secure small relief.</li>\n  <li><strong>Revenge Trading:</strong> After a losing trade, the ego feels attacked. The trader immediately enters a larger, impulsive trade to 'make the money back,' leading to severe spiral drawdown.</li>\n  <li><strong>Fear Of Missing Out (FOMO):</strong> Chasing an asset after it has already moved 50 pips, entering right at the top of a buying climax.</li>\n</ul>\n\n<h3>The Probabilistic Mindset</h3>\n<p>Professional traders treat individual trades like coin flips in a game where the coin lands heads 55% of the time. Any individual flip can land tails; your edge only reveals itself over a sample of <strong>100 consecutive, disciplined executions</strong>.</p>\n",
    "example": "\n<strong>Revenge Trading Trap vs Disciplined Reset:</strong><br>\nScenario: Your gold trade hits a 20-pip stop loss (-$2.00).<br>\n- <strong>Amateur Response:</strong> Gets angry, doubles lot size to 0.05, clicks BUY without analysis. Market dumps further; account loses $15.00.<br>\n- <strong>Professional Response:</strong> Accepts the loss as the routine cost of doing business. Closes the terminal, takes a 30-minute walk, and reviews the setup against the written trading plan before returning.\n",
    "diagram": "\n<svg viewBox=\"0 0 600 70\" style=\"width:100%; height:auto; max-height:70px;\">\n  <rect x=\"40\" y=\"15\" width=\"230\" height=\"40\" rx=\"3\" fill=\"#151E2E\" stroke=\"#EF4444\"/>\n  <text x=\"155\" y=\"38\" fill=\"#EF4444\" font-size=\"10\" font-weight=\"700\" text-anchor=\"middle\">Emotional Trading: Fear &bull; Greed &bull; Revenge</text>\n\n  <text x=\"295\" y=\"38\" fill=\"#D6AD52\" font-size=\"16\">&#8594;</text>\n\n  <rect x=\"320\" y=\"15\" width=\"240\" height=\"40\" rx=\"3\" fill=\"#151E2E\" stroke=\"#22C55E\"/>\n  <text x=\"440\" y=\"38\" fill=\"#22C55E\" font-size=\"10\" font-weight=\"700\" text-anchor=\"middle\">Probabilistic Mindset: Edge &bull; Sample Size &bull; Rules</text>\n</svg>\n",
    "quiz": {
      "question": "What is 'Loss Aversion' and how does it manifest in retail trading?",
      "options": [
        "It causes traders to refuse to open demo accounts.",
        "It causes traders to feel the pain of losses twice as intensely as equivalent wins, leading them to hold losers too long and cut winners too quickly.",
        "It guarantees that brokers will never experience server outages.",
        "It causes all trades to hit break-even."
      ],
      "correct": 1,
      "explanation": "Loss aversion causes traders to avoid realizing paper losses, leading them to widen stops or hold losing trades while prematurely taking tiny profits on winning trades.",
      "wrongHints": [
        "Loss aversion affects live funded risk, not demo account creation.",
        "",
        "Loss aversion is an internal psychological bias, not a broker technical issue.",
        "Loss aversion causes traders to avoid taking small losses, resulting in catastrophic blowouts."
      ]
    }
  },
  {
    "id": "a5",
    "level": "advanced",
    "levelTitle": "Advanced: Risk and Execution",
    "lessonNum": 5,
    "globalNum": 27,
    "title": "Strategy Backtesting",
    "summary": "Validate trading edges using rigorous historical backtesting, walk-forward testing, and overfitting prevention.",
    "objectives": [
      "Understand the methodology of manual versus automated backtesting.",
      "Recognize sample size significance (minimum 100-200 trades across multiple market regimes).",
      "Avoid curve-fitting (overfitting) and survivorship bias."
    ],
    "content": "\n<p><strong>Backtesting</strong> is the process of applying your trading rules to historical market data to verify whether the strategy possessed a genuine mathematical edge.</p>\n\n<h3>The Backtesting Protocol</h3>\n<ol>\n  <li><strong>Define Exact Rules:</strong> Every entry, stop-loss, take-profit, and position-sizing parameter must be 100% objective. If two analysts cannot reach the exact same trade decision on a chart, the rule is subjective.</li>\n  <li><strong>Sufficient Sample Size:</strong> A backtest of 15 trades is statistically meaningless. You need a minimum of <strong>100 to 200 trades</strong> spanning trending, ranging, and high-volatility regimes across at least 1-2 years of historical data.</li>\n  <li><strong>Include Transaction Friction:</strong> Deduct realistic spreads (0.8 - 1.5 pips) and overnight swap fees from every single historical trade. A strategy that is profitable without spread often becomes unprofitable once real broker friction is applied.</li>\n</ol>\n\n<h3>The Danger of Curve-Fitting (Overfitting)</h3>\n<p>Curve-fitting occurs when you optimize indicator parameters (e.g., tweaking an RSI to period 14.37) until the backtest looks perfect in hindsight. An overfitted strategy fails immediately in forward live trading.</p>\n",
    "example": "\n<strong>Testing an M15 Breakout Strategy on Gold:</strong><br>\n- Lookback: Jan 2025 - Dec 2025 (12 months)<br>\n- Total Trades: 184<br>\n- Win Rate: 48.4% (89 Wins / 95 Losses)<br>\n- Average Win: 2.2R | Average Loss: 1.0R<br>\n- Spread Deducted: 1.2 pips per trade<br><br>\nResult: Net Expectancy = +0.55R per trade. Max Historical Drawdown = 4.8%. The strategy demonstrates robust statistical persistence.\n",
    "diagram": "\n<svg viewBox=\"0 0 600 70\" style=\"width:100%; height:auto; max-height:70px;\">\n  <rect x=\"40\" y=\"15\" width=\"150\" height=\"40\" rx=\"3\" fill=\"#151E2E\" stroke=\"#334155\"/>\n  <text x=\"115\" y=\"38\" fill=\"#F1F5F9\" font-size=\"10\" font-weight=\"700\" text-anchor=\"middle\">Historical Tick Data</text>\n\n  <text x=\"205\" y=\"38\" fill=\"#D6AD52\" font-size=\"16\">&#8594;</text>\n\n  <rect x=\"225\" y=\"15\" width=\"150\" height=\"40\" rx=\"3\" fill=\"#151E2E\" stroke=\"#D6AD52\"/>\n  <text x=\"300\" y=\"38\" fill=\"#D6AD52\" font-size=\"10\" font-weight=\"700\" text-anchor=\"middle\">Friction-Adjusted Test</text>\n\n  <text x=\"395\" y=\"38\" fill=\"#D6AD52\" font-size=\"16\">&#8594;</text>\n\n  <rect x=\"415\" y=\"15\" width=\"150\" height=\"40\" rx=\"3\" fill=\"#151E2E\" stroke=\"#22C55E\"/>\n  <text x=\"490\" y=\"38\" fill=\"#22C55E\" font-size=\"10\" font-weight=\"700\" text-anchor=\"middle\">Walk-Forward Live Demo</text>\n</svg>\n",
    "quiz": {
      "question": "Why must historical backtests always include broker spreads, commissions, and swap fees?",
      "options": [
        "Because MT5 will not run without them.",
        "Because a strategy that appears profitable on paper without friction can easily become net-negative once real execution costs are deducted.",
        "To speed up the computer's CPU processing.",
        "Because historical prices are always 100% incorrect."
      ],
      "correct": 1,
      "explanation": "Transaction friction (spreads and commissions) is unavoidable in live trading; failing to model it creates wildly unrealistic expectations.",
      "wrongHints": [
        "MT5 can run backtests with or without custom spread modeling.",
        "",
        "Deducting transaction friction does not impact CPU processing speed.",
        "Historical tick data is real broker price history."
      ]
    }
  },
  {
    "id": "a6",
    "level": "advanced",
    "levelTitle": "Advanced: Risk and Execution",
    "lessonNum": 6,
    "globalNum": 28,
    "title": "Advanced Market Structure",
    "summary": "Master Fair Value Gaps (FVG), order blocks, internal versus external liquidity, and institutional order flow.",
    "objectives": [
      "Identify institutional Order Blocks and Fair Value Gaps (FVG).",
      "Map Internal Range Liquidity (IRL) and External Range Liquidity (ERL).",
      "Understand how institutional algorithms engineer liquidity to fill large orders."
    ],
    "content": "\n<p>Modern institutional trading relies heavily on understanding <strong>order flow</strong> and algorithmic liquidity targeting. Large institutions cannot enter a 5,000-lot position at once without moving the market against themselves; they must engineer counterparty liquidity.</p>\n\n<h3>Core Institutional Mechanics</h3>\n<ul>\n  <li><strong>Liquidity Pools:</strong> Resting clusters of retail stop orders located directly above equal swing highs (Buy-Side Liquidity - BSL) and below equal swing lows (Sell-Side Liquidity - SSL).</li>\n  <li><strong>Fair Value Gap (FVG):</strong> A three-candle pattern where an aggressive expansion candle leaves an imbalance between the high of Candle 1 and the low of Candle 3. Price frequently returns to rebalance this inefficiency.</li>\n  <li><strong>Order Block (OB):</strong> The final opposing candle before a violent structural displacement break. Represents the zone where institutional limit orders were placed.</li>\n</ul>\n\n<h3>The Liquidity Sweep Cycle</h3>\n<p>Institutional algorithms routinely drive price through prominent retail swing points to trigger retail stop-loss orders. These stop-loss orders provide the exact volume required for institutional desks to fill their opposing positions at wholesale prices.</p>\n",
    "example": "\n<strong>Trading an FVG Retest on Gold:</strong><br>\nCandle 1 High: $2,642.00 | Candle 2: Explosive green expansion to $2,654.00 | Candle 3 Low: $2,648.00.<br>\nThere is an imbalance gap between $2,642.00 and $2,648.00 (a $6.00 Fair Value Gap).<br><br>\nThe trader sets a Buy Limit inside the FVG at $2,645.00 with a stop loss below Candle 1 ($2,641.00). Price retraces into the gap, fills the order, and resumes upward to $2,660.00.\n",
    "diagram": "\n<svg viewBox=\"0 0 600 80\" style=\"width:100%; height:auto; max-height:80px;\">\n  <!-- Candle 1 -->\n  <rect x=\"180\" y=\"35\" width=\"20\" height=\"30\" fill=\"#22C55E\"/>\n  <!-- Candle 2 Huge expansion -->\n  <rect x=\"220\" y=\"10\" width=\"20\" height=\"60\" fill=\"#22C55E\"/>\n  <!-- Candle 3 -->\n  <rect x=\"260\" y=\"15\" width=\"20\" height=\"35\" fill=\"#22C55E\"/>\n  <!-- FVG Zone -->\n  <rect x=\"200\" y=\"30\" width=\"80\" height=\"15\" fill=\"rgba(214,173,82,0.25)\" stroke=\"#D6AD52\" stroke-dasharray=\"3\"/>\n  <text x=\"350\" y=\"42\" fill=\"#D6AD52\" font-size=\"10\" font-weight=\"700\">Fair Value Gap (FVG Imbalance Zone)</text>\n</svg>\n",
    "quiz": {
      "question": "What is a Fair Value Gap (FVG) in institutional market analysis?",
      "options": [
        "A holiday when bank exchanges close completely.",
        "A three-candle price imbalance where aggressive displacement leaves an unfilled gap between candle wicks.",
        "A broker's spread fee during news releases.",
        "A technical error in the MT5 platform."
      ],
      "correct": 1,
      "explanation": "An FVG represents price inefficiency caused by one-sided institutional buying or selling, leaving a price pocket that the market frequently revisits to rebalance.",
      "wrongHints": [
        "FVGs are chart technical formations, not bank exchange holidays.",
        "",
        "Spread fees are transaction costs, not Fair Value Gaps.",
        "FVGs are legitimate market inefficiencies, not MT5 software bugs."
      ]
    }
  },
  {
    "id": "a7",
    "level": "advanced",
    "levelTitle": "Advanced: Risk and Execution",
    "lessonNum": 7,
    "globalNum": 29,
    "title": "XAUUSD Trading Mechanics",
    "summary": "Master spot gold volatility, tick sizes, London physical fixing auctions, real interest rate correlations, and DXY dynamics.",
    "objectives": [
      "Understand the unique contract specifications of Spot Gold (100 oz per standard lot).",
      "Calculate pip and point values on gold accurately ($0.01 move = $1.00 on 1.00 lot, $0.10 on 0.10 lot, $0.01 on 0.01 lot).",
      "Analyze macroeconomic drivers: US 10-Year Real Yields (TIPS) and the US Dollar Index (DXY)."
    ],
    "content": "\n<p><strong>Spot Gold (XAUUSD)</strong> is a unique precious metal instrument that behaves simultaneously as a monetary store of value, an inflation hedge, and an active speculative vehicle. Its daily volatility is significantly higher than major currency pairs.</p>\n\n<h3>Contract Specifications</h3>\n<ul>\n  <li><strong>Contract Size:</strong> 1 Standard Lot represents <strong>100 Troy Ounces</strong> of pure gold bullion.</li>\n  <li><strong>Tick Size:</strong> $0.01 (1 point).</li>\n  <li><strong>Pip Definition:</strong> On gold, 1 pip is conventionally $0.10 (10 points). A $1.00 move in gold price equals <strong>10 pips / 100 points</strong>.</li>\n</ul>\n\n<h3>Gold Valuation Table</h3>\n<ul>\n  <li><strong>0.01 Micro-Lot:</strong> A $1.00 price move = <strong>$1.00 USD</strong>. A $10.00 daily swing = $10.00 USD.</li>\n  <li><strong>0.10 Mini-Lot:</strong> A $1.00 price move = <strong>$10.00 USD</strong>. A $10.00 swing = $100.00 USD.</li>\n  <li><strong>1.00 Standard Lot:</strong> A $1.00 price move = <strong>$100.00 USD</strong>. A $10.00 swing = $1,000.00 USD.</li>\n</ul>\n\n<h3>Key Macro Drivers of Gold</h3>\n<ul>\n  <li><strong>US Real Yields (10Y TIPS):</strong> Gold yields zero nominal interest. When real US bond yields rise, capital flows to bonds, pressuring gold downward. When real yields fall, gold rallies.</li>\n  <li><strong>US Dollar Index (DXY):</strong> Gold is priced in USD. A strengthening dollar makes gold more expensive for foreign buyers, creating an inverse correlation.</li>\n</ul>\n",
    "example": "\n<strong>Trading a Daily Gold Range:</strong><br>\nAccount Balance: $100.00 | Lot Size: 0.01 micro-lot<br>\nGold opens at $2,640.00 and rallies to $2,655.00 (+15.00 move / +150 pips).<br><br>\nProfit on 0.01 lot = $15.00 USD (+15% single-trade gain on a $100 balance).<br>\nBecause gold easily moves $20 to $40 daily, trading 0.01 lots provides ample profit potential while keeping downside risk strictly manageable ($2.00 to $4.00).\n",
    "diagram": "\n<svg viewBox=\"0 0 600 70\" style=\"width:100%; height:auto; max-height:70px;\">\n  <rect x=\"50\" y=\"15\" width=\"220\" height=\"40\" rx=\"3\" fill=\"#151E2E\" stroke=\"#D6AD52\"/>\n  <text x=\"160\" y=\"35\" fill=\"#D6AD52\" font-size=\"11\" font-weight=\"700\" text-anchor=\"middle\">Gold Contract: 100 Troy Oz</text>\n  <text x=\"160\" y=\"50\" fill=\"#94A3B8\" font-size=\"9\" text-anchor=\"middle\">0.01 Lot: $1.00 move = $1.00 USD</text>\n\n  <rect x=\"330\" y=\"15\" width=\"220\" height=\"40\" rx=\"3\" fill=\"#151E2E\" stroke=\"#334155\"/>\n  <text x=\"440\" y=\"35\" fill=\"#F1F5F9\" font-size=\"11\" font-weight=\"700\" text-anchor=\"middle\">Macro Drivers</text>\n  <text x=\"440\" y=\"50\" fill=\"#94A3B8\" font-size=\"9\" text-anchor=\"middle\">Inverse to 10Y Real Yields & DXY</text>\n</svg>\n",
    "quiz": {
      "question": "If you buy 0.01 micro-lots of XAUUSD at $2,640.00 and close it at $2,645.00 (a $5.00 price move), what is your gross profit in USD?",
      "options": [
        "$50.00",
        "$5.00",
        "$0.50",
        "$500.00"
      ],
      "correct": 1,
      "explanation": "On a 0.01 micro-lot of gold (1 oz), a $1.00 move equals $1.00 USD. A $5.00 price move equals exactly $5.00 profit.",
      "wrongHints": [
        "$50.00 profit would require a 0.10 mini-lot.",
        "",
        "$0.50 profit would be a $0.50 price move.",
        "$500.00 profit would require a 1.00 standard lot."
      ]
    }
  },
  {
    "id": "a8",
    "level": "advanced",
    "levelTitle": "Advanced: Risk and Execution",
    "lessonNum": 8,
    "globalNum": 30,
    "title": "Trading System Evaluation",
    "summary": "Evaluate quantitative trading models using Sharpe Ratio, Profit Factor, Max Drawdown, and return stability.",
    "objectives": [
      "Calculate and interpret the Sharpe Ratio and Sortino Ratio.",
      "Understand Profit Factor (Gross Profits / Gross Losses).",
      "Evaluate system quality using Maximum Drawdown and Return-to-Drawdown metrics."
    ],
    "content": "\n<p>In institutional finance, raw profit percentage is meaningless without measuring the risk taken to generate it. A system that makes +50% with an 80% drawdown is catastrophic. A system that makes +25% with a 4% drawdown is institutional-grade.</p>\n\n<h3>Key Performance Metrics</h3>\n<ul>\n  <li><strong>Profit Factor (PF):</strong> Total Gross Profits divided by Total Gross Losses.\n    <ul>\n      <li>< 1.0: Losing system.</li>\n      <li>1.0 - 1.5: Marginally profitable.</li>\n      <li>1.75 - 2.5: High-expectancy professional trading system.</li>\n    </ul>\n  </li>\n  <li><strong>Sharpe Ratio:</strong> Measures annualized risk-adjusted return relative to a risk-free benchmark. A Sharpe Ratio above 2.0 indicates an exceptional, low-volatility equity curve.</li>\n  <li><strong>Maximum Drawdown (Max DD):</strong> The largest peak-to-trough decline in account equity. In institutional prop trading, max drawdown must strictly remain under 5% to 10%.</li>\n  <li><strong>Recovery Factor:</strong> Net Profit divided by Max Drawdown. Demonstrates how quickly a system recovers from historical losing clusters.</li>\n</ul>\n",
    "example": "\n<strong>Comparing Two Trading Systems:</strong><br>\n- <strong>System A:</strong> +120% Return | Max Drawdown: 68% | Profit Factor: 1.15<br>\n- <strong>System B:</strong> +42% Return | Max Drawdown: 4.2% | Profit Factor: 2.40 | Sharpe Ratio: 3.2<br><br>\nSystem A is a dangerous gambling model one step away from total ruin.<br>\nSystem B is a world-class quantitative framework capable of compounding capital reliably over decades.\n",
    "diagram": "\n<svg viewBox=\"0 0 600 70\" style=\"width:100%; height:auto; max-height:70px;\">\n  <rect x=\"50\" y=\"15\" width=\"140\" height=\"40\" rx=\"3\" fill=\"#151E2E\" stroke=\"#22C55E\"/>\n  <text x=\"120\" y=\"38\" fill=\"#22C55E\" font-size=\"10\" font-weight=\"700\" text-anchor=\"middle\">Profit Factor > 2.0</text>\n\n  <rect x=\"230\" y=\"15\" width=\"140\" height=\"40\" rx=\"3\" fill=\"#151E2E\" stroke=\"#D6AD52\"/>\n  <text x=\"300\" y=\"38\" fill=\"#D6AD52\" font-size=\"10\" font-weight=\"700\" text-anchor=\"middle\">Sharpe Ratio > 2.5</text>\n\n  <rect x=\"410\" y=\"15\" width=\"140\" height=\"40\" rx=\"3\" fill=\"#151E2E\" stroke=\"#22C55E\"/>\n  <text x=\"480\" y=\"38\" fill=\"#22C55E\" font-size=\"10\" font-weight=\"700\" text-anchor=\"middle\">Max Drawdown < 5%</text>\n</svg>\n",
    "quiz": {
      "question": "What is the Profit Factor of a trading system that generated $6,000 in gross profits and suffered $2,500 in gross losses?",
      "options": [
        "0.41",
        "2.40",
        "3.50",
        "1.00"
      ],
      "correct": 1,
      "explanation": "Profit Factor = Gross Profits / Gross Losses = $6,000 / $2,500 = 2.40. A Profit Factor of 2.40 indicates high positive expectancy.",
      "wrongHints": [
        "0.41 is the inverse (losses divided by profits).",
        "",
        "3.50 would require $8,750 in gross profits.",
        "1.00 is exactly break-even ($2,500 profit / $2,500 loss)."
      ]
    }
  }
];
window.FOREX_GLOSSARY = [
  {
    "term": "Ask (Offer)",
    "def": "The price at which the market will sell to you. It is the price you pay when executing a BUY order."
  },
  {
    "term": "ATR (Average True Range)",
    "def": "A technical indicator measuring market volatility over a set number of periods, expressed in pips or points."
  },
  {
    "term": "Base Currency",
    "def": "The first currency listed in a currency pair (e.g., EUR in EUR/USD). It represents 1 unit of exchange."
  },
  {
    "term": "Bearish",
    "def": "A market outlook characterized by falling prices and dominant selling pressure."
  },
  {
    "term": "Bid",
    "def": "The price at which the market will buy from you. It is the price you receive when executing a SELL order."
  },
  {
    "term": "Bullish",
    "def": "A market outlook characterized by rising prices and dominant buying pressure."
  },
  {
    "term": "Candlestick",
    "def": "A graphical representation of price action showing the Open, High, Low, and Close for a specific time period."
  },
  {
    "term": "Drawdown",
    "def": "The percentage decline in account equity from its historical peak to a subsequent trough."
  },
  {
    "term": "ECN (Electronic Communication Network)",
    "def": "A broker bridge model linking retail orders directly to interbank liquidity providers without dealer intervention."
  },
  {
    "term": "Equity",
    "def": "The true real-time financial value of an account: Account Balance plus floating profits minus floating losses."
  },
  {
    "term": "Fair Value Gap (FVG)",
    "def": "A price imbalance occurring across three candles where aggressive displacement leaves an unfilled liquidity gap."
  },
  {
    "term": "Free Margin",
    "def": "Account Equity minus Used Margin. The capital currently available to buffer losses or open new positions."
  },
  {
    "term": "Leverage",
    "def": "The use of borrowed broker capital to control a larger trade position than your cash balance would ordinarily allow."
  },
  {
    "term": "Limit Order",
    "def": "A pending order instructing the broker to buy below current price or sell above current price when the market reaches that level."
  },
  {
    "term": "Liquidity",
    "def": "The ease with which an asset can be rapidly bought or sold in large volume without causing significant price dislocation."
  },
  {
    "term": "Long Position",
    "def": "Buying a currency pair with the expectation that its price will appreciate."
  },
  {
    "term": "Lot",
    "def": "The standardized unit of trade volume in Forex (Standard: 100,000 units; Mini: 10,000 units; Micro: 1,000 units)."
  },
  {
    "term": "Margin",
    "def": "The collateral deposit locked by your broker to support an open leveraged position."
  },
  {
    "term": "Margin Call",
    "def": "A broker alert warning that account equity has dropped to near-equal with required margin collateral."
  },
  {
    "term": "Micro-Lot",
    "def": "0.01 standard lots, representing 1,000 units of base currency ($0.10 per pip on EUR/USD). Recommended for $100 starting accounts."
  },
  {
    "term": "Order Block (OB)",
    "def": "The final opposing candle before a violent displacement move, signaling institutional accumulation or distribution."
  },
  {
    "term": "Pip",
    "def": "Percentage in Point. The standardized unit of price change in Forex, usually the 4th decimal place (0.0001)."
  },
  {
    "term": "Quote Currency",
    "def": "The second currency listed in a currency pair (e.g., USD in EUR/USD). It reflects the cost of 1 base unit."
  },
  {
    "term": "Risk-to-Reward Ratio",
    "def": "The comparison between the dollar capital risked on a trade and the potential profit targeted."
  },
  {
    "term": "Short Position",
    "def": "Selling a currency pair with the expectation that its price will depreciate."
  },
  {
    "term": "Slippage",
    "def": "The difference between the expected execution price of an order and the actual price at which it is filled by the broker."
  },
  {
    "term": "Spread",
    "def": "The difference between the Ask price and the Bid price. It represents the primary transaction cost of trading."
  },
  {
    "term": "Stop-Loss (SL)",
    "def": "An automated defensive order closing a trade at a set price if the market moves adversely, capping maximum loss."
  },
  {
    "term": "Stop-Out",
    "def": "An automated broker safeguard that forcefully closes active trades when equity drops below a critical margin threshold."
  },
  {
    "term": "Take-Profit (TP)",
    "def": "An automated order closing a profitable trade once price reaches a predetermined target level."
  },
  {
    "term": "XAUUSD",
    "def": "The financial ticker symbol for Spot Gold quoted in US Dollars (1 Standard Lot = 100 Troy Ounces)."
  }
];
