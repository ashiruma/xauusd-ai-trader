import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { setStatus, setTicketStatus } from './actions';
import styles from './control.module.css';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const STATUSES = ['pending', 'approved', 'rejected'] as const;
const TICKET_STATUSES = ['open', 'in_progress', 'resolved'] as const;

type Member = {
  id: string;
  email: string | null;
  justmarkets_email: string | null;
  mt5_account_id: string | null;
  status: string;
  created_at: string;
  is_admin: boolean;
};

type SupportTicket = {
  id: string;
  user_id: string | null;
  user_email: string | null;
  account_id: string | null;
  subject: string;
  message: string;
  status: string;
  created_at: string;
};

export default async function Control({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; tab?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const ADMIN_EMAILS = ['ashirumaabala@gmail.com'];
  const { data: me } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
  const isStaffEmail = user.email ? ADMIN_EMAILS.includes(user.email.toLowerCase()) : false;
  const isAdmin = Boolean(me?.is_admin) || isStaffEmail;
  if (!isAdmin) notFound();

  const filter = STATUSES.find((s) => s === params.status);
  const q = (params.q ?? '').replace(/[%,()*]/g, '').trim().slice(0, 80);

  let query = supabase
    .from('profiles')
    .select('id, email, justmarkets_email, mt5_account_id, status, created_at, is_admin')
    .order('created_at', { ascending: false })
    .limit(200);

  if (filter) query = query.eq('status', filter);
  if (q) query = query.ilike('email', `%${q}%`);

  const [{ data, error }, ...counts] = await Promise.all([
    query,
    ...STATUSES.map((s) => supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('status', s)),
  ]);

  const members = (data ?? []) as Member[];

  // Fetch support tickets
  let tickets: SupportTicket[] = [];
  try {
    const { data: ticketRows } = await supabase
      .from('support_tickets')
      .select('id, user_id, user_email, account_id, subject, message, status, created_at')
      .order('created_at', { ascending: false })
      .limit(50);
    tickets = (ticketRows ?? []) as SupportTicket[];
  } catch {
    // Graceful fallback
  }

  const openTicketsCount = tickets.filter((t) => t.status === 'open').length;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <div className={styles.eyebrow}>VELARION ADMIN</div>
          <h1>Platform Operations</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/terminal" className={styles.back}>Trading Floor</Link>
          <Link href="/overview" className={styles.back}>Dashboard</Link>
        </div>
      </header>

      {/* Member Management Section */}
      <section style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
            Member Verification Desk
          </h2>
        </div>

        <nav className={styles.tabs} aria-label="Filter by status">
          <Link href="/control" className={!filter ? styles.active : ''}>All</Link>
          {STATUSES.map((s, i) => (
            <Link key={s} href={`/control?status=${s}`} className={filter === s ? styles.active : ''}>
              {s} <span>{counts[i].count ?? 0}</span>
            </Link>
          ))}
        </nav>

        <form className={styles.search} action="/control">
          {filter && <input type="hidden" name="status" value={filter} />}
          <input name="q" defaultValue={q} placeholder="Search by email" maxLength={80} aria-label="Search by email" />
          <button type="submit">Search</button>
        </form>

        {error && <p className={styles.error}>Could not load members. Run sql/002_admin.sql in Supabase, then reload.</p>}
        {!error && members.length === 0 && <p className={styles.empty}>No members match.</p>}

        <ul className={styles.list}>
          {members.map((m) => (
            <li key={m.id} className={styles.row}>
              <div className={styles.info}>
                <strong>{m.email ?? 'No email'}</strong>
                {m.is_admin && <em className={styles.admin}>admin</em>}
                <span>JustMarkets: {m.justmarkets_email ?? 'none'}</span>
                <span>MT5 ID: {m.mt5_account_id || 'not submitted'}</span>
                <span>Joined {new Date(m.created_at).toISOString().slice(0, 10)}</span>
              </div>
              <div className={styles.actions}>
                <span className={`${styles.badge} ${styles[m.status] ?? ''}`}>{m.status}</span>
                {STATUSES.filter((s) => s !== m.status).map((s) => (
                  <form key={s} action={setStatus}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="status" value={s} />
                    <button type="submit" className={s === 'approved' ? styles.approve : ''}>
                      {s === 'approved' ? 'Approve' : s === 'rejected' ? 'Reject' : 'Set pending'}
                    </button>
                  </form>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Human Support Escalations Section */}
      <section style={{ borderTop: '1px solid var(--border-default, #1E293B)', paddingTop: '32px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div className={styles.eyebrow}>AI ASSISTANT ESCALATIONS</div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '4px 0 0' }}>
              Human Support Tickets ({openTicketsCount} Open)
            </h2>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted, #94A3B8)' }}>
            Alerts dispatched to: <code>{process.env.ADMIN_EMAILS || 'ashirumaabala@gmail.com'}</code>
          </div>
        </div>

        {tickets.length === 0 ? (
          <div style={{ padding: '24px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-default, #1E293B)', borderRadius: '6px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
            No support tickets recorded yet. Requests initiated via the AI Assistant or Support desk will appear here automatically.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                style={{
                  padding: '16px 20px',
                  backgroundColor: 'var(--bg-surface-1, #0b1120)',
                  border: `1px solid ${ticket.status === 'open' ? 'var(--accent-gold, #D4AF37)' : 'var(--border-default, #1E293B)'}`,
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '14px',
                }}
              >
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--accent-gold, #D4AF37)', fontWeight: 700 }}>
                      #{ticket.id.slice(0, 8)}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        padding: '2px 8px',
                        borderRadius: '3px',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        backgroundColor: ticket.status === 'open' ? 'rgba(239, 68, 68, 0.15)' : ticket.status === 'in_progress' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: ticket.status === 'open' ? '#ef4444' : ticket.status === 'in_progress' ? 'var(--accent-gold, #D4AF37)' : '#10b981',
                      }}
                    >
                      {ticket.status.replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(ticket.created_at).toLocaleString()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                    {ticket.subject}
                  </h3>

                  <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: '0 0 10px', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                    {ticket.message}
                  </p>

                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span>Email: <strong>{ticket.user_email || 'Not specified'}</strong></span>
                    <span>MT5 Account: <strong>{ticket.account_id ? `#${ticket.account_id}` : 'Unlinked'}</strong></span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {TICKET_STATUSES.filter((s) => s !== ticket.status).map((s) => (
                    <form key={s} action={setTicketStatus}>
                      <input type="hidden" name="id" value={ticket.id} />
                      <input type="hidden" name="status" value={s} />
                      <button
                        type="submit"
                        style={{
                          padding: '6px 12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          borderRadius: '4px',
                          border: '1px solid var(--border-default)',
                          backgroundColor: s === 'resolved' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                          color: s === 'resolved' ? '#10b981' : 'var(--text-secondary)',
                          cursor: 'pointer',
                        }}
                      >
                        Mark {s.replace('_', ' ')} &rarr;
                      </button>
                    </form>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
