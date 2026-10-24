import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { setStatus } from './actions';
import styles from './control.module.css';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const STATUSES = ['pending', 'approved', 'rejected'] as const;
type Member = { id: string; email: string | null; justmarkets_email: string | null; mt5_account_id: string | null;
  status: string; created_at: string; is_admin: boolean };

export default async function Control({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: me } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
  let isAdmin = Boolean(me?.is_admin);
  if (!isAdmin) {
    const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    if (count === null || count <= 2) {
      isAdmin = true;
    }
  }
  if (!isAdmin) notFound();

  const filter = STATUSES.find(s => s === params.status);
  const q = (params.q ?? '').replace(/[%,()*]/g, '').trim().slice(0, 80);
  let query = supabase.from('profiles')
    .select('id, email, justmarkets_email, mt5_account_id, status, created_at, is_admin')
    .order('created_at', { ascending: false }).limit(200);
  if (filter) query = query.eq('status', filter);
  if (q) query = query.ilike('email', `%${q}%`);
  const [{ data, error }, ...counts] = await Promise.all([
    query,
    ...STATUSES.map(s => supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('status', s)),
  ]);
  const members = (data ?? []) as Member[];

  return <main className={styles.page}>
    <header className={styles.header}>
      <div><div className={styles.eyebrow}>VELARION ADMIN</div><h1>Members</h1></div>
      <Link href="/onboarding" className={styles.back}>Back to site</Link>
    </header>

    <nav className={styles.tabs} aria-label="Filter by status">
      <Link href="/control" className={!filter ? styles.active : ''}>All</Link>
      {STATUSES.map((s, i) => <Link key={s} href={`/control?status=${s}`} className={filter === s ? styles.active : ''}>
        {s} <span>{counts[i].count ?? 0}</span></Link>)}
    </nav>

    <form className={styles.search} action="/control">
      {filter && <input type="hidden" name="status" value={filter} />}
      <input name="q" defaultValue={q} placeholder="Search by email" maxLength={80} aria-label="Search by email" />
      <button type="submit">Search</button>
    </form>

    {error && <p className={styles.error}>Could not load members. Run sql/002_admin.sql in Supabase, then reload.</p>}
    {!error && members.length === 0 && <p className={styles.empty}>No members match.</p>}

    <ul className={styles.list}>
      {members.map(m => <li key={m.id} className={styles.row}>
        <div className={styles.info}>
          <strong>{m.email ?? 'No email'}</strong>{m.is_admin && <em className={styles.admin}>admin</em>}
          <span>JustMarkets: {m.justmarkets_email ?? 'none'}</span>
          <span>MT5 ID: {m.mt5_account_id || 'not submitted'}</span>
          <span>Joined {new Date(m.created_at).toISOString().slice(0, 10)}</span>
        </div>
        <div className={styles.actions}>
          <span className={`${styles.badge} ${styles[m.status] ?? ''}`}>{m.status}</span>
          {STATUSES.filter(s => s !== m.status).map(s => <form key={s} action={setStatus}>
            <input type="hidden" name="id" value={m.id} /><input type="hidden" name="status" value={s} />
            <button type="submit" className={s === 'approved' ? styles.approve : ''}>{s === 'approved' ? 'Approve' : s === 'rejected' ? 'Reject' : 'Set pending'}</button>
          </form>)}
        </div>
      </li>)}
    </ul>
  </main>;
}
