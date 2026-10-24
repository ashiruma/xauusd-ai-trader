export interface LevelDefinition {
  key: 'foundation' | 'beginner' | 'intermediate' | 'advanced';
  title: string;
  badgeKicker: string;
  certificateTitle: string;
  lessonRange: [number, number];
  totalLessons: number;
  capstoneLesson: number;
  description: string;
  verifiedSkills: string[];
  nextActionText: string;
  nextActionHref: string;
  depositPrompt?: boolean;
}

export const CURRICULUM_LEVELS: Record<string, LevelDefinition> = {
  foundation: {
    key: 'foundation',
    title: 'Foundation Risk & Execution Track',
    badgeKicker: 'LEVEL 1 CERTIFIED / FOUNDATION TIER',
    certificateTitle: 'Foundation Risk & Execution Certification',
    lessonRange: [1, 5],
    totalLessons: 5,
    capstoneLesson: 5,
    description: 'You have mastered currency structure, bid/ask spread costs, contract sizing, margin calls, and affirmative demo-first automation governance.',
    verifiedSkills: [
      'Currency Mechanics & Spread Cost Asymmetry',
      'Cent vs Standard Contract Specification Calculations',
      'Leverage Multipliers & Margin Stop-Out Dynamics',
      'Algorithmic Risk Governance & Affirmative Automation Consent'
    ],
    nextActionText: 'Activate Live Trading Floor &rarr;',
    nextActionHref: '/overview',
    depositPrompt: true,
  },
  beginner: {
    key: 'beginner',
    title: 'Beginner Quantitative Foundations',
    badgeKicker: 'LEVEL 2 CERTIFIED / BEGINNER FOLIO',
    certificateTitle: 'Quantitative Market Mechanics Certification',
    lessonRange: [1, 12],
    totalLessons: 12,
    capstoneLesson: 12,
    description: 'You have successfully completed all 12 Beginner units, proving proficiency in technical indicators, session liquidity profiles, and order placement discipline.',
    verifiedSkills: [
      'Multi-Session Liquidity Clocks (London & New York Overlap)',
      'Trend Continuation & Fibonacci Confluence Zones',
      'Order Types, Slippage Mitigation & Stop Placement',
      'Volatility Sizing (ATR) & Execution Asymmetry'
    ],
    nextActionText: 'Advance to Intermediate Tier (Lesson 13) &rarr;',
    nextActionHref: '/academy/lesson-13',
  },
  intermediate: {
    key: 'intermediate',
    title: 'Intermediate Technical & Risk Architecture',
    badgeKicker: 'LEVEL 3 CERTIFIED / INTERMEDIATE TIER',
    certificateTitle: 'Institutional Order Flow & Risk Certification',
    lessonRange: [13, 22],
    totalLessons: 10,
    capstoneLesson: 22,
    description: 'You have conquered intermediate algorithmic concepts including Fair Value Gaps, Smart Money sweeps, and portfolio variance protection.',
    verifiedSkills: [
      'Institutional Liquidity Sweeps & FVG Invalidation',
      'Order Block Identification & Breaker Blocks',
      'Statistical Win/Loss Expectancy Modeling',
      'Maximum Drawdown Control & Position Scaling Governors'
    ],
    nextActionText: 'Advance to Advanced Tier (Lesson 23) &rarr;',
    nextActionHref: '/academy/lesson-23',
  },
  advanced: {
    key: 'advanced',
    title: 'Advanced Institutional Strategies & Quantitative Mastery',
    badgeKicker: 'LEVEL 4 CERTIFIED / MASTER TIER',
    certificateTitle: 'Master Quantitative Trader Certification',
    lessonRange: [23, 30],
    totalLessons: 8,
    capstoneLesson: 30,
    description: 'You have achieved complete mastery across all 30 syllabus units. You are accredited in multi-agent fusion, macro catalysts, and algorithmic risk engineering.',
    verifiedSkills: [
      'Autonomous Multi-Agent Confluence Protocols',
      'High-Impact Macro Event Execution Filtering',
      'Monte Carlo Backtest Verification & Out-of-Sample Testing',
      'Capital Preservation Governors & Prop Firm Discipline'
    ],
    nextActionText: 'Launch Autonomous Live Trading Desk &rarr;',
    nextActionHref: '/overview',
  },
};

export function getLevelForLesson(lessonNum: number): LevelDefinition {
  if (lessonNum <= 5) return CURRICULUM_LEVELS.foundation;
  if (lessonNum <= 12) return CURRICULUM_LEVELS.beginner;
  if (lessonNum <= 22) return CURRICULUM_LEVELS.intermediate;
  return CURRICULUM_LEVELS.advanced;
}

export function evaluateLevelCompletion(
  completedLessons: readonly number[],
  newlyPassedLesson: number
): LevelDefinition | null {
  const completedSet = new Set(completedLessons);
  completedSet.add(newlyPassedLesson);

  // Check from highest level to lowest or specific capstone lesson
  if (newlyPassedLesson === 30) {
    const all30 = Array.from({ length: 30 }, (_, i) => i + 1).every((n) => completedSet.has(n));
    if (all30) return CURRICULUM_LEVELS.advanced;
  }

  if (newlyPassedLesson === 22) {
    const allInt = Array.from({ length: 10 }, (_, i) => i + 13).every((n) => completedSet.has(n));
    if (allInt) return CURRICULUM_LEVELS.intermediate;
  }

  if (newlyPassedLesson === 12) {
    const allBeg = Array.from({ length: 12 }, (_, i) => i + 1).every((n) => completedSet.has(n));
    if (allBeg) return CURRICULUM_LEVELS.beginner;
  }

  if (newlyPassedLesson === 5) {
    const allFound = [1, 2, 3, 4, 5].every((n) => completedSet.has(n));
    if (allFound) return CURRICULUM_LEVELS.foundation;
  }

  return null;
}
