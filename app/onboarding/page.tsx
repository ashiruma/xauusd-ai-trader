import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SignOutButton from '@/components/SignOutButton';
import styles from './onboarding.module.css';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function Onboarding() {
  let authenticated = false;
  let isVerified = false;
  let isAdmin = false;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      authenticated = true;
      const { data: profile } = await supabase
        .from('profiles')
        .select('status, is_admin, mt5_account_id')
        .eq('id', user.id)
        .maybeSingle();

      isVerified = profile?.status === 'approved' || Boolean(profile?.is_admin);
      isAdmin = Boolean(profile?.is_admin);

      // Auto-elevate initial existing accounts (<= 2 users)
      if (!isVerified) {
        const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        if (count === null || count <= 2) {
          isVerified = true;
          isAdmin = true;
        }
      }

      // Verified members directly onboard to the Forex School (Academy)
      if (isVerified) {
        redirect('/academy');
      }
    }
  } catch (err) {
    // If redirect throws Next.js NEXT_REDIRECT, rethrow
    if (err && typeof err === 'object' && 'digest' in err) {
      throw err;
    }
  }

  // 1. Authenticated but awaiting admin verification
  if (authenticated) {
    return (
      <main className={styles.page}>
        <div style={{ maxWidth: '640px', margin: '40px auto 0' }}>
          <header className={styles.hero} style={{ textAlign: 'center', paddingBottom: '20px' }}>
            <div className={styles.eyebrow}>VELARION MARKETS</div>
            <div style={{ marginTop: '16px' }}>
              <span className={styles.badge} style={{ borderColor: 'var(--accent-gold)' }}>
                <span aria-hidden="true" className={styles.statusDot} style={{ background: 'var(--accent-gold)' }} />
                AWAITING VERIFICATION
              </span>
            </div>
            <h1 style={{ fontSize: '32px', margin: '16px 0 10px' }}>Account Under Review</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6 }}>
              Your account has been created. An administrator will verify your JustMarkets partner attribution and activate your live trading terminal shortly.
            </p>
          </header>

          <div className={styles.card} style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Broker Partner Attribution
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
                  JustMarkets Partner Code: <code>tohstb0d83</code>
                </div>
              </div>
              <a
                href="https://one.justmarkets.link/a/tohstb0d83"
                target="_blank"
                rel="noopener noreferrer sponsored"
                className={styles.secondaryAction}
                style={{ fontSize: '13px' }}
              >
                JustMarkets Link &rarr;
              </a>
            </div>
          </div>

          <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/academy" className={styles.secondaryAction}>
              Explore Forex Academy &rarr;
            </Link>
            {isAdmin && (
              <Link href="/control" className={styles.primaryAction} style={{ textDecoration: 'none' }}>
                Admin Dashboard &rarr;
              </Link>
            )}
            <SignOutButton />
          </div>
        </div>
      </main>
    );
  }

  // 2. Unauthenticated visitor: Simple 2-step onboarding
  return (
    <main className={styles.page}>
      <div style={{ maxWidth: '640px', margin: '40px auto 0' }}>
        <header className={styles.hero} style={{ textAlign: 'center', paddingBottom: '20px' }}>
          <div className={styles.eyebrow}>VELARION MARKETS</div>
          <h1 style={{ fontSize: '34px', margin: '18px 0 10px' }}>Get Started with Velarion</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: 1.6 }}>
            Access institutional-grade XAUUSD trading models, real-time execution blotters, and our 30-lesson structured academy.
          </p>
        </header>

        <div className={styles.card} style={{ marginTop: '24px', display: 'grid', gap: '22px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-gold)', letterSpacing: '1px' }}>
              STEP 1
            </div>
            <h3 style={{ fontSize: '16px', margin: '4px 0 6px' }}>Register Your JustMarkets Account</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Register via our official partner link with code <code>tohstb0d83</code> to qualify for 100% free lifetime platform access.
            </p>
            <div style={{ marginTop: '14px' }}>
              <a
                href="https://one.justmarkets.link/a/tohstb0d83"
                target="_blank"
                rel="noopener noreferrer sponsored"
                className={styles.primaryAction}
                style={{ textDecoration: 'none' }}
              >
                Register on JustMarkets &rarr;
              </a>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-gold)', letterSpacing: '1px' }}>
              STEP 2
            </div>
            <h3 style={{ fontSize: '16px', margin: '4px 0 6px' }}>Sign In to Your Workspace</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Log in with your email to access your trading terminal, performance telemetry, and curriculum.
            </p>
            <div style={{ marginTop: '14px' }}>
              <Link
                href="/login"
                className={styles.primaryAction}
                style={{
                  textDecoration: 'none',
                  background: 'var(--bg-surface-2)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border-default)',
                }}
              >
                Sign In to Velarion &rarr;
              </Link>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '28px', textAlign: 'center' }}>
          <Link href="/academy" className={styles.secondaryAction} style={{ fontSize: '13px' }}>
            Preview 30-Lesson Forex Curriculum &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}
