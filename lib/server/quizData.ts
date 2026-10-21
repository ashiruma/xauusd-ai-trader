import 'server-only';
import type { QuizQuestion } from '../curriculum-types';

export const LESSON_3_QUESTION_QUIZZES: Record<number, QuizQuestion[]> = {
  1: [
    {
      question: "Why does the Spot Gold (XAUUSD) and Forex market operate 24 hours a day during the business week?",
      options: [
        "Trading is centralized on a single London exchange that never closes its physical doors.",
        "As one major financial hub closes, another opens across consecutive global time zones (Sydney, Tokyo, London, New York).",
        "Automated retail algorithms trade continuously without requiring liquidity from commercial banks.",
        "International banking laws mandate around-the-clock price fixing across all asset classes."
      ],
      correct: 1,
      explanation: "Spot Gold trades Over-the-Counter (OTC) across global banking centres, ensuring continuous price discovery as sessions roll from Tokyo to London and New York."
    },
    {
      question: "In Spot Gold (XAUUSD), what does a quoted price of 2,650.00 specifically denote?",
      options: [
        "One gram of gold is worth 2,650 US Dollars.",
        "One Troy Ounce of physical gold is priced at 2,650.00 US Dollars.",
        "One standard gold bar of 400 oz costs 2,650.00 US Dollars.",
        "The price of gold has appreciated by 2,650 pips since market open."
      ],
      correct: 1,
      explanation: "XAUUSD quotes the price of exactly one fine Troy Ounce (31.1035 grams) of physical Gold denominated in US Dollars."
    },
    {
      question: "Which institutional session window produces the highest liquidity and cleanest 200-pip trend expansions for XAUUSD?",
      options: [
        "The quiet Asian accumulation window (00:00 - 05:00 UTC).",
        "The London and New York session overlap window (12:00 - 16:00 UTC).",
        "The Friday afternoon post-settlement quiet period (20:00 - 22:00 UTC).",
        "The daily Sydney open rollover window (21:00 - 23:00 UTC)."
      ],
      correct: 1,
      explanation: "The London/New York overlap brings together the world's two largest financial trading desks, driving peak institutional volume and major macroeconomic expansions."
    }
  ],
  2: [
    {
      question: "What is the primary role of Tier-1 commercial banks in the foreign exchange and Spot Gold ecosystem?",
      options: [
        "They set fixed non-negotiable exchange rates for retail tourists.",
        "They act as primary liquidity providers, quoting continuous two-way bid and ask prices to interbank participants.",
        "They insure retail accounts against adverse market stop-outs.",
        "They determine interest rates independently of sovereign central banks."
      ],
      correct: 1,
      explanation: "Tier-1 investment banks (such as JPMorgan, Citi, and UBS) quote continuous prices, absorbing massive institutional order flow and providing underlying market liquidity."
    },
    {
      question: "Why do retail traders frequently experience execution slippage during high-impact US macro announcements (e.g. CPI, NFP)?",
      options: [
        "Brokers intentionally delay trades to prevent retail clients from making profits.",
        "Interbank liquidity providers pull limit orders from the depth-of-market book, creating temporary liquidity vacuums.",
        "Electronic matching engines are manually shut down during government speeches.",
        "Gold stops trading for 15 minutes whenever inflation prints deviate from forecasts."
      ],
      correct: 1,
      explanation: "During extreme volatility, market makers withdraw passive limit bids and offers to mitigate inventory risk, causing market orders to fill at the next available price."
    },
    {
      question: "How do institutional algorithms utilize retail stop-loss orders positioned above obvious resistance levels?",
      options: [
        "They ignore retail orders entirely because they are too small to impact price.",
        "They trigger buy-stop orders above resistance to obtain the counterparty sell liquidity required to open large short positions.",
        "They file regulatory reports with the exchange before matching orders.",
        "They match retail buy stops exclusively with physical treasury bonds."
      ],
      correct: 1,
      explanation: "Large institutional participants need massive counterparty volume to fill positions; triggering retail buy stops (which are market buy orders) provides the liquidity needed to sell."
    }
  ],
  3: [
    {
      question: "In the quotation XAUUSD = 2,650.00, which component is the Base Asset and which is the Quote Currency?",
      options: [
        "USD is the Base Asset and XAU is the Quote Currency.",
        "XAU (Gold) is the Base Commodity and USD is the Quote Currency.",
        "Both assets are base currencies with fluctuating quotation units.",
        "XAU represents the leverage factor and USD represents the margin requirement."
      ],
      correct: 1,
      explanation: "In all financial quotes, the first symbol is the Base (1 unit of Gold), and the second is the Quote (number of US Dollars needed to buy 1 unit of Gold)."
    },
    {
      question: "On a standard MT5 CFD account, how many Troy Ounces of Gold are controlled by 1.00 Standard Lot of XAUUSD?",
      options: [
        "1 Troy Ounce.",
        "10 Troy Ounces.",
        "100 Troy Ounces.",
        "1,000 Troy Ounces."
      ],
      correct: 2,
      explanation: "One standard lot (1.00) of XAUUSD represents 100 Troy Ounces of gold. Therefore, 0.01 micro lot represents exactly 1 Troy Ounce."
    },
    {
      question: "If XAUUSD advances from 2,640.00 to 2,641.00, how many pips has the spot price moved?",
      options: [
        "1 pip.",
        "10 pips.",
        "100 pips.",
        "0.10 pip."
      ],
      correct: 1,
      explanation: "On Spot Gold, a $0.10 price change equals 1 pip ($1.00 price change equals 10 pips). Moving from 2,640.00 to 2,641.00 is a $1.00 move, or exactly 10 pips."
    }
  ],
  4: [
    {
      question: "When executing an instant market BUY order on XAUUSD, which price does your order execute at?",
      options: [
        "The Bid Price.",
        "The Ask Price.",
        "The Midpoint between Bid and Ask.",
        "The closing price of the previous 1-hour candle."
      ],
      correct: 1,
      explanation: "Buyers always execute at the Ask (offer) price, while sellers execute at the Bid price. The difference between them is the broker spread."
    },
    {
      question: "If you execute a 0.10 lot position on XAUUSD and capture a 50-pip price expansion, what is your gross profit?",
      options: [
        "$5.00",
        "$50.00",
        "$500.00",
        "$5,000.00"
      ],
      correct: 1,
      explanation: "For 0.10 lot (10 oz), each pip ($0.10 move) is worth $1.00. A 50-pip gain yields: 50 pips * $1.00/pip = $50.00."
    },
    {
      question: "Why is executing a 1.00 standard lot on a $200 account mathematically catastrophic for retail traders?",
      options: [
        "Brokers do not permit standard lot trading on MT5.",
        "A standard lot moves at $10.00 per pip; a normal 20-pip adverse move results in a $200 loss, completely liquidating the account.",
        "Standard lots are only tradeable during Asian session hours.",
        "Taxes on standard lot trades exceed total deposit value."
      ],
      correct: 1,
      explanation: "With 1.00 lot, each pip equals $10.00. Normal intraday volatility on Gold of 20 pips wipes out the entire $200 equity in minutes due to extreme over-leverage."
    }
  ],
  5: [
    {
      question: "What causes the XAUUSD bid-ask spread to widen significantly during the daily rollover (21:00 - 23:00 UTC)?",
      options: [
        "Central banks shut down all international wire transfers.",
        "Interbank liquidity drops sharply between the New York close and Sydney open, forcing banks to quote wider spreads to manage risk.",
        "Brokers assess overnight maintenance charges directly into the bid price.",
        "Gold mines pause bullion refining operations until morning."
      ],
      correct: 1,
      explanation: "During the brief interbank rollover window, liquidity providers reduce quote sizes and widen bid/ask spreads to protect against overnight gap risks."
    },
    {
      question: "If your broker provides 1:500 leverage, how much margin is required to hold 0.01 lot of XAUUSD when gold is trading at $2,650.00?",
      options: [
        "$2,650.00",
        "$26.50",
        "$5.30",
        "$1.00"
      ],
      correct: 2,
      explanation: "Notional value of 0.01 lot (1 oz) is $2,650.00. At 1:500 leverage, required margin is: $2,650 / 500 = $5.30."
    },
    {
      question: "What is the single most critical mathematical risk rule for sustaining long-term compounding on Spot Gold?",
      options: [
        "Always risk at least 20% of account equity on high-probability news trades.",
        "Never risk more than 1.0% to 2.0% of total account equity per trade, maintaining a minimum 1:3 Risk-to-Reward ratio.",
        "Double your lot size immediately following any losing trade to recover losses.",
        "Avoid using hard stop-losses to prevent algorithms from sweeping your position."
      ],
      correct: 1,
      explanation: "Restricting risk to 1-2% prevents catastrophic drawdowns, while an asymmetric 1:3 R:R allows the account to compound aggressively even with modest win rates."
    }
  ]
};

export function getQuizForLesson(lessonNum: number, fallback?: QuizQuestion): QuizQuestion[] {
  if (LESSON_3_QUESTION_QUIZZES[lessonNum]) {
    return LESSON_3_QUESTION_QUIZZES[lessonNum];
  }

  if (fallback) {
    return [fallback];
  }

  return [
    {
      question: `In Lesson ${lessonNum}, what is the primary quantitative principle for managing Spot Gold (XAUUSD) execution?`,
      options: [
        "Executing random entries during high-volatility announcements without stop-losses.",
        "Waiting for institutional market structure confirmation and strictly managing position sizing.",
        "Relying exclusively on delayed retail lagging indicators like moving averages.",
        "Over-leveraging capital to maximize single-day returns."
      ],
      correct: 1,
      explanation: "Disciplined execution on XAUUSD requires institutional structure confirmation and mathematical risk governance."
    }
  ];
}

export const LESSON_TAKEAWAYS: Record<number, { takeaways: string[]; proTip: string }> = {
  1: {
    takeaways: [
      "Spot Gold (XAUUSD) trades 24/5 Over-the-Counter across global interbank hubs: Tokyo, London, and New York.",
      "1 Troy Ounce of Gold = $2,650.00 USD. Central banks hold Gold as the ultimate non-fiat sovereign reserve asset.",
      "Peak liquidity occurs during the London and New York session overlap (12:00 - 16:00 UTC), producing 200-350 pip moves.",
      "Avoid holding new entries through the daily 21:00-23:00 UTC rollover window due to spread widening by liquidity providers."
    ],
    proTip: "Always monitor US 10-Year TIPS real yields and the DXY Dollar Index; Gold moves inversely with US real interest rates."
  },
  2: {
    takeaways: [
      "Tier-1 commercial investment banks control over 80% of interbank liquidity, quoting continuous two-way prices.",
      "Retail stop-loss orders are treated by algorithms as resting liquidity pools, not emotional exit points.",
      "Equal Highs (EQH) and Equal Lows (EQL) act as liquidity magnets for institutional sweep wicks.",
      "Wait for a Market Structure Shift (MSS) displacement candle before entering on order flow reversals."
    ],
    proTip: "Never place limit orders directly in front of obvious swing highs; wait for the institutional sweep wick to complete before executing."
  },
  3: {
    takeaways: [
      "In XAUUSD, Gold is the Base Commodity and USD is the Quote Currency (1 Troy Ounce priced in US Dollars).",
      "1.00 Standard Lot controls 100 Troy Ounces ($265,000 notional value at $2,650/oz).",
      "0.01 Micro Lot controls 1 Troy Ounce; every $0.10 price movement equals 1 pip ($0.10).",
      "A 100-pip move on 0.01 lot is $10.00; on 0.10 lot it is $100.00; on 1.00 standard lot it is $1,000.00."
    ],
    proTip: "Calculate exact pip risk in dollars prior to execution: Risk = (Stop Distance in Pips) * (Lot Size * $1.00)."
  },
  4: {
    takeaways: [
      "Buy orders execute at the Ask (offer); sell orders execute at the Bid. The difference is the broker transaction spread.",
      "Raw ECN spreads on JustMarkets average 2.0 to 2.8 pips ($0.20 - $0.28) on XAUUSD during active sessions.",
      "Position size must be calibrated strictly so that your stop-loss equals exactly 1.0% to 2.0% of account equity.",
      "Never increase lot size during a losing streak; geometric compounding happens on winning streaks."
    ],
    proTip: "Use our 200-Pip Growth Calculator to verify your exact lot sizing for your specific account equity."
  },
  5: {
    takeaways: [
      "Leverage of 1:500 reduces margin requirement to $5.30 per 0.01 lot on Gold ($2,650 notional value).",
      "High leverage increases available purchasing power but does NOT alter the Dollar value of each pip.",
      "Over-leveraging creates catastrophic drawdown ruin from normal intraday 20-pip market noise.",
      "Maintain a strict minimum 1:3 Risk-to-Reward ratio to ensure profitability even with a 40% win rate."
    ],
    proTip: "Target +60 pips with a -20 pip stop loss (1:3 R:R). 10 consecutive disciplined wins expand capital exponentially."
  }
};

export function getCheatSheetData(lessonNum: number, title: string) {
  if (LESSON_TAKEAWAYS[lessonNum]) {
    return LESSON_TAKEAWAYS[lessonNum];
  }
  return {
    takeaways: [
      `Master the core market structure principles presented in Lesson ${lessonNum} before trading live capital.`,
      "Wait for institutional confirmation signals rather than chasing impulsive candlestick breakouts.",
      "Strictly preserve capital by capping single-trade risk at 1.0% to 2.0% of account equity.",
      "Execute on JustMarkets MT5 to benefit from raw institutional spreads and non-custodial custody."
    ],
    proTip: `XAUUSD Execution Rule: Ensure full alignment across 15M market structure and 1H directional bias before entering Lesson ${lessonNum} setups.`
  };
}
