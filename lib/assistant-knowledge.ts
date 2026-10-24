// lib/assistant-knowledge.ts
/**
 * Velarion AI Assistant Knowledge Base and Response Generator
 * Provides authoritative, non-custodial, education-led guidance for the Velarion ecosystem.
 * Strictly adheres to Universal System Rules: Zero emojis, Zero bullets, Data Leak Prevention.
 */

export interface AssistantMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AssistantResponse {
  reply: string;
  suggestions: string[];
  category: string;
  referenceLinks?: Array<{ label: string; href: string }>;
}

export const KNOWLEDGE_TOPICS = [
  {
    id: 'how_to_start',
    triggers: [
      'how to start',
      'how do i get started',
      'how to join',
      'how does the system work',
      'how to benefit',
      'steps to join',
      'what is velarion',
      'member funnel',
      'onboarding'
    ],
    title: 'How to Benefit from Velarion (The 5-Step Member Journey)',
    category: 'Onboarding & Funnel',
    links: [
      { label: 'How It Works (Full Guide)', href: '/how-it-works' },
      { label: 'School Preview', href: '/school-preview' }
    ],
    suggestions: [
      'Explain $10 Cent vs Standard Account',
      'What is an Investor Password?',
      'How does the Forex School work?',
      'Why is automation demo-first?'
    ],
    generateAnswer: () => `To benefit from Velarion, follow our structured 5-step institutional member funnel:

1. Step 1: Register with JustMarkets using the official Velarion partner referral link (partner code: tohstb0d83). This establishes your broker account and subsidizes full platform access so you pay no platform subscription fees.
2. Step 2: Open your trading account and fund the initial deposit directly with JustMarkets. We recommend the $10 Standard Cent account for new traders (1 lot = 1 oz gold) or the Pro account ($200) for institutional spreads.
3. Step 3: Complete the Velarion Forex School sequentially. You must pass all 30 lessons and 6 essential risk checkpoints (leverage, margin, spread costs, loss asymmetry, stop loss sizing, and automation consent) to graduate.
4. Step 4: Securely link your trading account using least-privilege investor (read-only) credentials. Velarion never asks for or accepts master trading passwords; funds cannot be withdrawn or traded arbitrarily by external software.
5. Step 5: Separately and explicitly opt into automated trading. For this release, automation is restricted to verified DEMO trading using Candidate Strategy v2 rules, equipped with instant Pause and Emergency Stop controls.

You can begin immediately by reading the full walkthrough on our How It Works page or previewing the curriculum.`
  },
  {
    id: 'account_types',
    triggers: [
      'cent account',
      'standard account',
      'pro account',
      'account tiers',
      'account types',
      'which account',
      'how much deposit',
      'minimum deposit',
      'contract size',
      '10 dollar',
      'cent vs standard'
    ],
    title: 'Account Tiers, Deposit Requirements, and Contract Sizes',
    category: 'Broker & Accounts',
    links: [
      { label: 'Accounts Desk', href: '/accounts' },
      { label: 'How It Works', href: '/how-it-works' }
    ],
    suggestions: [
      'How do I get an Investor Password?',
      'How do I start the 5-step funnel?',
      'What is the partner referral code?'
    ],
    generateAnswer: () => `JustMarkets offers three primary account tiers tailored to different risk profiles:

1. Standard Cent Account (Minimum Deposit: $10)
- Contract Size: 1 standard lot = 1 troy ounce of gold (XAUUSD).
- Sizing Precision: 0.01 lot = 0.01 oz (approximately $0.026 equity movement per 100-point gold move).
- Best For: Beginners, curriculum learners, and strategy testing. $10 converts into 1,000 account cents, allowing realistic multi-tier trade management without risk of sudden liquidation.

2. Standard Account (Minimum Deposit: $10)
- Contract Size: 1 standard lot = 100 troy ounces of gold.
- Sizing Precision: 0.01 lot = 1 oz (approximately $2.65 equity movement per 100-point move).
- Best For: Experienced traders with at least $100 to $500 balance who understand standard lot leverage.

3. Pro Account (Minimum Deposit: $200)
- Contract Size: 1 standard lot = 100 troy ounces.
- Spreads: Raw institutional pricing from 0.1 pips with zero commission.
- Best For: Capitalized quantitative execution requiring minimal transaction friction.

Important Note: All deposits are made directly through your personal JustMarkets client portal. Velarion is non-custodial and never accepts or handles user deposits.`
  },
  {
    id: 'investor_password',
    triggers: [
      'investor password',
      'read only password',
      'master password',
      'account linking',
      'how to link',
      'link mt5',
      'security',
      'is it safe',
      'can velarion withdraw',
      'withdraw funds'
    ],
    title: 'Least-Privilege Security and Investor (Read-Only) Passwords',
    category: 'Security & Custody',
    links: [
      { label: 'Accounts Desk', href: '/accounts' },
      { label: 'Security & Settings', href: '/settings' }
    ],
    suggestions: [
      'How do I start the 5-step funnel?',
      'Why is master password rejected?',
      'What is the partner referral code?'
    ],
    generateAnswer: () => `Velarion operates on a strict least-privilege, non-custodial architecture:

1. What is an Investor Password?
An Investor Password in MetaTrader 5 provides read-only authorization. It allows our telemetry engine to verify your account equity, balance, open positions, and margin health in real time without granting any order execution or withdrawal permissions.

2. Master Trading Passwords Are Strictly Prohibited:
Our account linking desk explicitly intercepts and rejects master trading passwords with an HTTP 400 error. You must never share your master trading password with anyone, including Velarion.

3. How to Set Your MT5 Investor Password in JustMarkets:
- Log in to your personal JustMarkets client area.
- Select your MT5 trading account and navigate to Account Settings.
- Click "Change Investor Password" (or "Set Read-Only Password").
- Choose a secure password and save.
- Return to Velarion's Accounts desk (/accounts) and submit your Account ID, MT5 Server name, and the Investor Password.

4. Fund Protection:
Because only read-only access is established, neither Velarion nor any third party can initiate withdrawals or execute arbitrary trades from your broker balance. All withdrawals remain under your exclusive control at JustMarkets.`
  },
  {
    id: 'forex_school',
    triggers: [
      'school',
      'curriculum',
      'quiz',
      'failed quiz',
      'quiz reset',
      'pass quiz',
      'lessons',
      'academy',
      'how many lessons',
      'learn forex'
    ],
    title: 'Forex School Curriculum and Sequential Quiz Engine',
    category: 'Education & School',
    links: [
      { label: 'School Preview', href: '/school-preview' },
      { label: 'Member School Portal', href: '/school' }
    ],
    suggestions: [
      'Why did my quiz reset?',
      'What are the 6 essential checkpoints?',
      'How to get started?'
    ],
    generateAnswer: () => `The Velarion Forex School contains 30 sequential lessons structured across 6 core pillars:

1. Structure and Checkpoints:
- Checkpoint 1: Leverage and Notional Exposure (calculating contract size and true exposure).
- Checkpoint 2: Margin Requirements and Liquidation Thresholds (calculating margin levels and stop-out triggers).
- Checkpoint 3: Transaction Costs and Spread Drag (accounting for bid/ask spread, commission, and overnight swaps).
- Checkpoint 4: Loss Asymmetry and Expectancy (understanding why equal percentage wins cannot offset equal percentage losses).
- Checkpoint 5: Position Sizing and Capital Preservation (strict single-ticket 1% risk limit).
- Checkpoint 6: Demo Validation and Automation Consent (understanding candidate strategy rules and fail-safe stop controls).

2. Quiz Grading, Retry Policy and Timed Study Lockout:
To graduate and unlock subsequent modules, every question in a checkpoint quiz must be answered correctly:
- Exactly 1 Retry Allowed: If you fail on your first attempt, you are granted exactly 1 retry.
- Mandatory 10-Minute Study Lock: If you fail twice, the assessment is locked and you must re-read the entire lesson for at least 10 minutes (timed with a live countdown).
- Timeout Reversal: If the session times out before passing, your progress is reversed by two previous lessons (max(1, current - 2)) to enforce thorough comprehension.
- Anti-Guessing: Correct answers are never highlighted or leaked on failure to prevent mechanical brute-forcing.

Take time to read each lesson thoroughly before taking the assessment.`
  },
  {
    id: 'loss_asymmetry_160_trades',
    triggers: [
      '160 trades',
      'win rate',
      '73%',
      '73.75%',
      'loss asymmetry',
      'why did it lose',
      'loss warning',
      'historical trades',
      'candidate strategy v2',
      'strategy rules'
    ],
    title: 'Truthful Analysis of the 160-Trade Historical Sample',
    category: 'Risk & Strategy',
    links: [
      { label: 'Risk & Performance Audit', href: '/risk-and-performance' },
      { label: 'How It Works', href: '/how-it-works' }
    ],
    suggestions: [
      'What are Candidate Strategy v2 rules?',
      'How does demo automation work?',
      'What is an Investor Password?'
    ],
    generateAnswer: () => `Velarion treats historical trading performance with complete mathematical transparency:

1. The 160-Trade Reviewed Sample Reality Check:
A sample of 160 historical trades tagged with video evidence showed a headline win rate of 73.75% (118 wins out of 160 trades). Despite winning nearly three out of every four trades, the cumulative result was a net loss of -$163.57.

2. Why Did a 73.75% Win Rate Lose Money?
- Profit Ratcheting: Winning trades were closed early for small gains (+25 to +80 points = +$0.25 to +$0.80 average win of $0.38).
- Uncontrolled Left-Tail Losses: Losing trades were held without disciplined stops (average loss of -$5.09, over 13 times larger than the average win).
- Basket Averaging Down: A 10-position sell basket was averaged into an opposing gold trend, culminating in a single -$202.17 catastrophic drawdown.
- Transaction Cost Drag: With spreads ranging from 25 to 35 points on micro moves, transaction friction consumed profits.

3. Candidate Strategy v2 Solution:
- Strict single-ticket execution: No grid averaging or adding to losing trades.
- Minimum 1.8:1 reward-to-risk ratio on every candidate setup.
- Volatility-adjusted protective stop losses derived from 14-period ATR.
- Daily loss circuit breaker at 2% of equity, pausing all execution immediately.`
  },
  {
    id: 'demo_first_automation',
    triggers: [
      'automation',
      'automated trading',
      'bot',
      'demo first',
      'live trading',
      'activate automation',
      'pause automation',
      'emergency stop',
      'stop controls',
      'audit trail'
    ],
    title: 'Demo-First Automation Console and Stop Controls',
    category: 'Automation Console',
    links: [
      { label: 'Automation Console', href: '/automation' },
      { label: 'Activity Blotter', href: '/activity' }
    ],
    suggestions: [
      'What are the 160-trade findings?',
      'How do I link an account?',
      'What is the partner referral code?'
    ],
    generateAnswer: () => `Automated trading in Velarion is built on conservative release boundaries:

1. Demo-First Release Boundary:
Automation is turned OFF by default. In this release, automation is restricted exclusively to DEMO trading environments. Live execution requests fail closed and return an HTTP 403 error until formal broker infrastructure and regulatory gates are completed.

2. Explicit Activation Consent:
Before activating demo automation, members must review and confirm a 6-item consent modal:
- Acknowledge market risk and price volatility in spot gold (XAUUSD).
- Confirm strategy candidate ID and risk parameters (1% max risk per trade, 2% daily loss limit).
- Acknowledge that paper/demo performance does not guarantee future live returns.
- Confirm understanding that Velarion acts under an educational referral model with JustMarkets.

3. Instant Operator Controls:
- PAUSE: Instantly halts new entry scans while leaving existing protective stop losses intact.
- RESUME: Restores automated scanning following market analysis.
- EMERGENCY STOP: Halts all scanning, disconnects the automation loop, and attempts an immediate market-order liquidation of any open positions.
- Audit Trail: Every state transition (activation, pause, resume, emergency stop) is stamped with UTC time, operator ID, and IP address in an immutable audit ledger.`
  },
  {
    id: 'partner_verification',
    triggers: [
      'partner code',
      'referral code',
      'tohstb0d83',
      'pending verification',
      'partner pending',
      'justmarkets registration',
      'how to verify',
      'contact support',
      'ashirumaabala@gmail.com'
    ],
    title: 'JustMarkets Partner Referral and Verification Support',
    category: 'Onboarding & Funnel',
    links: [
      { label: 'How It Works', href: '/how-it-works' },
      { label: 'Settings & Partner Desk', href: '/settings' }
    ],
    suggestions: [
      'How to choose an account type?',
      'How to link an account?',
      'What is an Investor Password?'
    ],
    generateAnswer: () => `Here are the details regarding the JustMarkets partner referral program:

1. Official Partner Referral Link and Code:
- Partner Referral Code: tohstb0d83
- Official Registration URL: https://one.justmarkets.link/a/tohstb0d83
- Secondary / Overflow Code: p4cui0wkfz (https://one.justmarkets.link/a/p4cui0wkfz)

2. What If My Verification Status Is Pending?
When you register and fund your account on JustMarkets, attribution is verified by our system. If your account shows as "Verification Pending":
- Ensure your JustMarkets Account ID is entered correctly in your profile (/settings).
- Reach out to our partner verification desk at ashirumaabala@gmail.com with your JustMarkets Account ID and registration date.
- Note: Never email passwords, phone numbers, or private banking details. Only your public broker Account ID is required for verification.`
  },
  {
    id: 'gold_market_hours',
    triggers: [
      'gold hours',
      'trading hours',
      'market open',
      'market close',
      'spread',
      'best time to trade',
      'session hours',
      'london session',
      'new york session'
    ],
    title: 'XAUUSD Gold Market Hours and Optimal Liquidity Sessions',
    category: 'Market Intelligence',
    links: [
      { label: 'Overview Dashboard', href: '/overview' },
      { label: 'Risk & Performance', href: '/risk-and-performance' }
    ],
    suggestions: [
      'What are Candidate Strategy v2 rules?',
      'How to start the 5-step funnel?',
      'Explain $10 Cent vs Standard'
    ],
    generateAnswer: () => `Spot Gold (XAUUSD) trading hours and liquidity dynamics:

1. Trading Schedule (Server Time / UTC):
- Market Opens: Sunday 22:00 UTC (01:00 EEST / broker time).
- Market Closes: Friday 21:00 UTC (23:59 EEST).
- Daily Rollover Pause: 21:00 to 22:00 UTC daily. Spreads widen substantially during rollover; trading during this hour is not recommended.

2. Optimal High-Liquidity Sessions:
- London Session (07:00 - 16:00 UTC): High institutional volume, clean breakout structures, and typical tight spreads (18 - 25 points on standard accounts).
- New York Overlap (12:00 - 16:00 UTC): Maximum daily liquidity as US economic data (CPI, Non-Farm Payrolls, FOMC) is released. Spreads are tightest, but slippage risk increases around red-folder news.
- Asian Session (22:00 - 06:00 UTC): Generally range-bound with lower liquidity. Spreads can widen to 30 - 45 points; break-even targets are harder to reach.`
  },
  {
    id: 'human_support',
    triggers: [
      'human support',
      'speak to human',
      'talk to human',
      'human agent',
      'talk to person',
      'real person',
      'contact support',
      'talk to admin',
      'speak to admin',
      'admin support',
      'support ticket',
      'live agent',
      'help from human',
      'request human support'
    ],
    title: 'Human Support and Administrative Escalation',
    category: 'Human Support Desk',
    links: [
      { label: 'Accounts Desk', href: '/accounts' },
      { label: 'How It Works', href: '/how-it-works' }
    ],
    suggestions: [
      'What is the partner referral code?',
      'How to link an account?',
      'How does the Forex School work?'
    ],
    generateAnswer: () => `Human Support and Administrative Escalation at Velarion:

1. Platform Administrator Escalation:
If you need direct human assistance regarding broker attribution, account linking, or membership review, you can request an escalation directly through this assistant or email our administrative coordinator at ashirumaabala@gmail.com.

2. What to Include in Your Support Request:
- Your JustMarkets MT5 Account ID (for attribution or deposit review).
- A clear description of the inquiry or technical question.
- Never include your master trading password, credit card numbers, or personal phone numbers. Velarion operates strictly on non-custodial least-privilege principles.

3. SLA and Turnaround Time:
Administrative support reviews tickets continuously during active trading sessions (London and New York overlaps). Urgent verification requests are typically addressed promptly.`
  },
  {
    id: 'ict_smc_trading_logic',
    triggers: [
      'ict',
      'smc',
      'smart money concepts',
      'inner circle trader',
      'liquidity sweep',
      'fair value gap',
      'fvg',
      'market structure shift',
      'mss',
      'optimal trade entry',
      'ote',
      'killzone',
      'killzones',
      '5 profitable trades',
      '5 trades',
      'profitable trades per day',
      'closing balance',
      'starting balance'
    ],
    title: 'ICT/SMC Institutional Confluence and 5-Win Daily Profit Lock',
    category: 'Quantitative Strategy & SMC',
    links: [
      { label: 'Quantitative Strategies', href: '/strategies' },
      { label: 'Live Terminal', href: '/terminal' },
      { label: 'Overview Dashboard', href: '/overview' }
    ],
    suggestions: [
      'What are Candidate Strategy v2 rules?',
      'Why is automation demo-first?',
      'Explain $10 Cent vs Standard Account'
    ],
    generateAnswer: () => `Velarion XAUUSD trading logic aligns directly with Smart Money Concepts (SMC) and Inner Circle Trader (ICT) principles, governed by strict multi-account capital preservation rules:

1. Institutional Liquidity Sweeps:
The algorithm monitors retail liquidity resting above the Asian Session High or Previous Day High (Buy-Side Liquidity / BSL) and below the Asian Session Low or Previous Day Low (Sell-Side Liquidity / SSL). It initiates watch state once a false breakout sweep is detected.

2. Market Structure Shift (MSS) Displacement:
Following a liquidity sweep, the system requires an aggressive displacement candle breaking the opposing fractal swing structure on the 5-minute or 15-minute timeframe.

3. Fair Value Gap (FVG) and Optimal Trade Entry (OTE):
Displacement must generate a 3-candle Fair Value Gap (BISI for longs, SIBI for shorts). Execution occurs upon retracement into the FVG within the Optimal Trade Entry zone (61.8% to 78.6% Fibonacci retracement).

4. Killzone Time Filters:
Entries are permitted exclusively within high-volume institutional windows:
- London Killzone: 07:00 to 10:00 UTC.
- New York Killzone: 12:00 to 15:00 UTC.

5. Maximum 5 Profitable Trades Per Account Per Day:
To eliminate over-trading and secure daily gains, every active verified trader account is capped at 5 winning trades per calendar day. Once an account reaches 5 profitable trades, the risk engine locks new trade allocation for that account until the next day rollover.

6. Net Positive Daily Capital Growth (Closing Balance > Starting Balance):
Every setup requires a minimum 2.0:1 reward-to-risk ratio. The system activates an algorithmic trailing stop ratchet that moves stop loss to profit (+5 to +25 points) once +80 points gain is achieved. Combined with a 3.0% maximum daily drawdown circuit breaker, the risk architecture is designed to ensure the closing balance exceeds the starting balance.`
  }
];

/**
 * Searches knowledge base for best matching topic
 */
export function queryKnowledgeBase(userQuery: string): AssistantResponse {
  const query = userQuery.toLowerCase().trim();

  // 1. Direct topic match by triggers
  for (const topic of KNOWLEDGE_TOPICS) {
    for (const trigger of topic.triggers) {
      if (query.includes(trigger)) {
        return {
          reply: topic.generateAnswer(),
          suggestions: topic.suggestions,
          category: topic.category,
          referenceLinks: topic.links
        };
      }
    }
  }

  if (query.includes('ict') || query.includes('smc') || query.includes('fvg') || query.includes('killzone') || query.includes('5 profitable') || query.includes('5 trades')) {
    const topic = KNOWLEDGE_TOPICS.find(t => t.id === 'ict_smc_trading_logic')!;
    return {
      reply: topic.generateAnswer(),
      suggestions: topic.suggestions,
      category: topic.category,
      referenceLinks: topic.links
    };
  }

  // 2. Keyword fallback matching
  if (query.includes('human') || query.includes('support') || query.includes('admin') || query.includes('ticket')) {
    const topic = KNOWLEDGE_TOPICS.find(t => t.id === 'human_support')!;
    return {
      reply: topic.generateAnswer(),
      suggestions: topic.suggestions,
      category: topic.category,
      referenceLinks: topic.links
    };
  }
  if (query.includes('deposit') || query.includes('money') || query.includes('fund')) {
    const topic = KNOWLEDGE_TOPICS.find(t => t.id === 'account_types')!;
    return {
      reply: topic.generateAnswer(),
      suggestions: topic.suggestions,
      category: topic.category,
      referenceLinks: topic.links
    };
  }

  if (query.includes('password') || query.includes('link') || query.includes('login') || query.includes('connect')) {
    const topic = KNOWLEDGE_TOPICS.find(t => t.id === 'investor_password')!;
    return {
      reply: topic.generateAnswer(),
      suggestions: topic.suggestions,
      category: topic.category,
      referenceLinks: topic.links
    };
  }

  if (query.includes('strategy') || query.includes('win') || query.includes('loss') || query.includes('drawdown') || query.includes('risk')) {
    const topic = KNOWLEDGE_TOPICS.find(t => t.id === 'loss_asymmetry_160_trades')!;
    return {
      reply: topic.generateAnswer(),
      suggestions: topic.suggestions,
      category: topic.category,
      referenceLinks: topic.links
    };
  }

  if (query.includes('quiz') || query.includes('lesson') || query.includes('course') || query.includes('study')) {
    const topic = KNOWLEDGE_TOPICS.find(t => t.id === 'forex_school')!;
    return {
      reply: topic.generateAnswer(),
      suggestions: topic.suggestions,
      category: topic.category,
      referenceLinks: topic.links
    };
  }

  // 3. Default institutional overview response
  return {
    reply: `I am your Velarion AI Assistant. I can guide you through every stage of benefiting from our platform:

1. The 5-Step Member Funnel: How to join through JustMarkets, complete verification, fund your account, and access subsidized member desks.
2. Account Sizing: Deciding between the $10 Standard Cent account (1 lot = 1 oz) and the $200 Pro account.
3. Forex School Guidance: Understanding core concepts (leverage, margin, spread drag, and position sizing) without cheating on checkpoint quizzes.
4. Least-Privilege Account Linking: How to generate and connect an MT5 Investor (read-only) password so your funds and master password remain 100% secure.
5. Trading Risk and Candidate Strategy v2: Understanding loss asymmetry, why 73% win rates fail without tail management, and how demo automation safeguards capital.

Select one of the suggested topics below or ask a specific question.`,
    suggestions: [
      'How do I start the 5-step funnel?',
      'Explain $10 Cent vs Standard Account',
      'What is an Investor Password?',
      'Why did the 160-trade test lose money?',
      'How does the Forex School work?'
    ],
    category: 'System Overview',
    referenceLinks: [
      { label: 'How It Works', href: '/how-it-works' },
      { label: 'Forex School', href: '/school-preview' },
      { label: 'Risk & Performance', href: '/risk-and-performance' }
    ]
  };
}
