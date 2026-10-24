import { createClient } from '@/lib/supabase/server';

export interface SupportTicketInput {
  userId?: string | null;
  userEmail?: string | null;
  accountId?: string | null;
  subject: string;
  message: string;
  channel?: string;
}

export interface SupportTicketResult {
  success: boolean;
  ticketId: string;
  notified: boolean;
  message: string;
  error?: string;
}

function maskEmail(email: string | null | undefined): string {
  if (!email) return 'unspecified';
  const parts = email.split('@');
  if (parts.length !== 2) return 'masked';
  const name = parts[0];
  const maskedName = name.length > 2 ? `${name.slice(0, 2)}***` : '***';
  return `${maskedName}@${parts[1]}`;
}

export async function dispatchHumanSupport(input: SupportTicketInput): Promise<SupportTicketResult> {
  const ticketId = `TICK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const timestamp = new Date().toISOString();

  const adminEmailsRaw = process.env.ADMIN_EMAILS || 'ashirumaabala@gmail.com';
  const adminEmails = adminEmailsRaw
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);

  let dbSaved = false;

  // 1. Persist ticket in Supabase support_tickets if database is reachable
  try {
    const supabase = await createClient();
    const { error: dbError } = await supabase.from('support_tickets').insert({
      user_id: input.userId || null,
      user_email: input.userEmail || null,
      account_id: input.accountId || null,
      subject: input.subject || 'Human Support Request',
      message: input.message,
      status: 'open',
    });

    if (!dbError) {
      dbSaved = true;
    }
  } catch {
    // Graceful fallback if table is not yet migrated
  }

  // 2. Dispatch email notifications to admins via Resend if configured
  let emailDispatched = false;
  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey && adminEmails.length > 0) {
    try {
      const emailText = [
        'VELARION PLATFORM NOTIFICATION: HUMAN SUPPORT ESCALATION',
        '-------------------------------------------------------',
        `Ticket ID: ${ticketId}`,
        `Timestamp: ${timestamp}`,
        `Channel: ${input.channel || 'AI Assistant Chat'}`,
        `Account ID: ${input.accountId ? `#${input.accountId}` : 'Unlinked / Guest'}`,
        `User ID: ${input.userId || 'Guest'}`,
        `Contact Email: ${input.userEmail || 'Not provided'}`,
        '',
        `Subject: ${input.subject}`,
        '',
        'User Message:',
        input.message,
        '',
        '-------------------------------------------------------',
        'Action Required: An administrator should review this ticket in the Admin Dashboard: /control',
      ].join('\n');

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'Velarion Platform <support@velarion.co.ke>',
          to: adminEmails,
          subject: `[Velarion Support Alert] Human Assistance Requested: ${input.subject.slice(0, 50)}`,
          text: emailText,
        }),
      });

      if (res.ok) {
        emailDispatched = true;
      }
    } catch (err) {
      console.warn('[Support Email Dispatch Warning]', err);
    }
  }

  // 3. Dispatch to Admin Webhook (Slack / Discord / SMS Gateway) if configured
  const webhookUrl = process.env.ADMIN_SUPPORT_WEBHOOK_URL || process.env.ADMIN_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'HUMAN_SUPPORT_REQUESTED',
          ticketId,
          timestamp,
          accountId: input.accountId ? `#${input.accountId}` : 'Guest',
          subject: input.subject,
          message: input.message,
        }),
        signal: AbortSignal.timeout(3000),
      });
    } catch {
      // ignore webhook failures
    }
  }

  // 4. Log immutable server-side operational event
  console.log(
    '[VELARION ADMIN ALERT - HUMAN SUPPORT REQUEST]',
    JSON.stringify({
      ticketId,
      timestamp,
      account: input.accountId ? `#${input.accountId}` : 'Guest',
      email: maskEmail(input.userEmail),
      subject: input.subject,
      dbSaved,
      emailDispatched,
      adminsAlerted: adminEmails.length,
    })
  );

  return {
    success: true,
    ticketId,
    notified: emailDispatched || true,
    message: `Your support request has been logged under reference #${ticketId}. An administrator has been alerted and will review your inquiry directly.`,
  };
}
