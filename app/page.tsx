import Link from 'next/link';
import type { Metadata } from 'next';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';
import styles from './home.module.css';

export const metadata: Metadata = {
  alternates: { canonical: 'https://velarion-one.vercel.app' },
  title: 'Velarion Markets | A More Considered Approach to Gold',
  description: 'An education-led approach to XAUUSD. Explore structured learning, rule-based research, and a transparent path from broker registration to separately authorized automation.',
  openGraph: {
    title: 'Velarion Markets | Clarity before capital.',
    description: 'Structured education, rule-based research, and deliberate decisions. Trading involves risk; Kenya regulatory review remains a pre-launch requirement.',
    url: '/',
    type: 'website',
    images: [{ url: '/velarion_brand_navy.png', alt: 'Velarion Markets' }],
  },
  twitter: {
    card: 'summary',
    title: 'Velarion Markets | Clarity before capital.',
    description: 'An education-led approach to gold markets. Trading involves risk of loss.',
    images: ['/velarion_brand_navy.png'],
  },
};

const journey = [
  { number: '01', title: 'Register with JustMarkets', copy: 'Use the referral link and confirm partner attribution. Eligibility and broker terms apply.' },
  { number: '02', title: 'Fund your broker account', copy: 'Deposit directly with the broker—not Velarion. Review the risks before committing capital.' },
  { number: '03', title: 'Complete required learning', copy: 'Complete every required core lesson in order, with mandatory assessments, before account linking. The early milestone is not graduation. Full lessons and assessments are temporarily unavailable.' },
  { number: '04', title: 'Link your account', copy: 'After learning, complete verification and review account permissions. Linking is not activation.' },
  { number: '05', title: 'Authorize automation', copy: 'Automation starts off. Activation is a separate, explicit decision after eligibility, risk settings, and demo-first checks.' },
];

export default function HomePage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="home-title">
        {/* Original CSS architectural artwork: no unlicensed photography or performance chart. */}
        <div className={styles.architecture} aria-hidden="true">
          <div className={styles.light} />
          <div className={`${styles.plane} ${styles.planeBack}`} />
          <div className={`${styles.plane} ${styles.planeMiddle}`} />
          <div className={`${styles.plane} ${styles.planeFront}`} />
          <div className={styles.horizon} />
        </div>
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={styles.heroInner}>
          <div className={styles.heroTopline}><span>VELARION / A CONSIDERED APPROACH</span><span>XAUUSD</span></div>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Gold markets. Clear perspective.</p>
            <h1 id="home-title">Clarity before<br /><span>capital.</span></h1>
            <p className={styles.heroDescription}>A more considered approach to gold trading. Structured education, rule-based research, and deliberate decisions—before execution.</p>
            <div className={styles.actions}>
              <Link className={styles.primaryButton} href="/how-it-works">Explore the approach <span aria-hidden="true">↗</span></Link>
              <Link className={styles.heroLink} href="/school-preview">Preview the School <span aria-hidden="true">→</span></Link>
            </div>
          </div>
          <div className={styles.heroBottom}>
            <p>Education first.<br /><span>Your capital stays with your broker.</span></p>
            <a href="#framework" className={styles.scrollLink}>Discover the framework <span aria-hidden="true">↓</span></a>
          </div>
        </div>
      </section>

      <aside className={styles.riskStrip} aria-label="Important trading risk">
        <div className={styles.container}><strong>Risk comes first</strong><p>Leveraged gold trading can result in the loss of your entire deposit. Larger deposits do not guarantee returns or safety.</p><Link href="/risk-and-performance">Review risks <span aria-hidden="true">↗</span></Link></div>
      </aside>

      <section id="framework" className={`${styles.section} ${styles.framework}`} aria-labelledby="framework-title">
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <div><p className={styles.eyebrow}>01 / The framework</p><h2 id="framework-title">Less noise.<br />More understanding.</h2></div>
            <p className={styles.intro}>One focused environment for learning the gold market, examining strategy rules, and making informed decisions. No promises of performance.</p>
          </div>
          <div className={styles.pillars}>
            <Link href="/school-preview" className={styles.pillar}>
              <div className={styles.pillarTop}><span>LEARN</span><span aria-hidden="true">↗</span></div>
              <h3>A foundation<br />before a position.</h3>
              <p>A structured School covering market mechanics, analysis, and risk—with mandatory comprehension checks.</p>
              <span className={styles.pillarFooter}>Explore the curriculum <span aria-hidden="true">→</span></span>
            </Link>
            <Link href="/strategies" className={styles.pillar}>
              <div className={styles.pillarTop}><span>UNDERSTAND</span><span aria-hidden="true">↗</span></div>
              <h3>Rules.<br />Not guesswork.</h3>
              <p>Explore four XAUUSD strategy models and the conditions behind each setup. Model rules are not evidence of future returns.</p>
              <span className={styles.pillarFooter}>Examine the models <span aria-hidden="true">→</span></span>
            </Link>
            <Link href="/risk-and-performance" className={styles.pillar}>
              <div className={styles.pillarTop}><span>EVALUATE</span><span aria-hidden="true">↗</span></div>
              <h3>See the risks.<br />Know the limits.</h3>
              <p>Review evidence, limitations, and open questions before considering automation. Illustrations are not verified live performance.</p>
              <span className={styles.pillarFooter}>Read risk &amp; performance <span aria-hidden="true">→</span></span>
            </Link>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.journey}`} aria-labelledby="journey-title">
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <div><p className={styles.eyebrow}>02 / A deliberate progression</p><h2 id="journey-title">Every step.<br />In the right order.</h2></div>
            <div className={styles.journeyIntro}><p className={styles.intro}>Learning is mandatory. Linking an account and activating automation are separate steps—not the same consent.</p><Link className={styles.textLink} href="/how-it-works">View the full journey <span aria-hidden="true">↗</span></Link></div>
          </div>
          <ol className={styles.steps}>
            {journey.map(step => <li key={step.number}><span className={styles.stepNumber} aria-hidden="true">{step.number}</span><h3>{step.title}</h3><p>{step.copy}</p></li>)}
          </ol>
          <div className={styles.partnerLine}><span>ACCESS THROUGH JUSTMARKETS <span className={styles.partnerCode}>/ {DEFAULT_PARTNER_CONFIG.primaryCode}</span></span><a className={styles.textLink} href={DEFAULT_PARTNER_CONFIG.primaryLink} target="_blank" rel="noopener noreferrer sponsored">View broker registration <span aria-hidden="true">↗</span></a></div>
          <p className={styles.partnerNote}>Referral / IB relationship: Velarion receives referral compensation and volume-based rebates, creating a conflict of interest. Broker trading costs apply. <Link href="/legal/ib-disclosure">Read the full disclosure.</Link></p>
        </div>
      </section>

      <section className={`${styles.section} ${styles.transparency}`} aria-labelledby="transparency-title">
        <div className={`${styles.container} ${styles.transparencyGrid}`}>
          <div><p className={styles.eyebrow}>03 / Transparency by design</p><h2 id="transparency-title">A polished interface.<br />An honest conversation.</h2><p className={styles.intro}>Professional presentation is not proof of regulatory approval, investment protection, or trading performance.</p><Link className={styles.textLink} href="/legal/risk-disclosure">Read the disclosures <span aria-hidden="true">↗</span></Link></div>
          <div className={styles.disclosures}>
            <article><span className={styles.pending}>PRE-LAUNCH REQUIREMENT</span><h3>Kenya regulatory review</h3><p>Velarion has not obtained algorithmic trading licensing or retail investment adviser approval from Kenya’s CMA. Legal and regulatory review remains required before commercial deployment of this model in Kenya.</p></article>
            <article><span className={styles.pending}>SUBJECT TO VERIFICATION</span><h3>Eligibility &amp; execution readiness</h3><p>Partner attribution, broker entity and jurisdiction, account permissions, and execution readiness must be verified. Registration or a deposit does not confirm access or authorize live trading.</p></article>
            <Link className={styles.textLink} href="/risk-and-performance">Review evidence &amp; unresolved items <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>

      <section className={styles.closing} aria-labelledby="closing-title"><div className={styles.container}><div><p className={styles.eyebrow}>Start with understanding</p><h2 id="closing-title">Your next step is knowledge.</h2></div><Link className={styles.primaryButton} href="/school-preview">Preview the School <span aria-hidden="true">↗</span></Link></div></section>
    </div>
  );
}
