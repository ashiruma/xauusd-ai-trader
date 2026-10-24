import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Dispatches or logs an administrative notification when a new member registers.
 * Can be called by client auth callback or triggered via Supabase Database Webhook.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = body.email || body.record?.email;
    const userId = body.userId || body.record?.id;

    const notificationPayload = {
      event: 'NEW_MEMBER_SIGNUP',
      timestamp: new Date().toISOString(),
      memberId: userId || 'unknown',
      memberEmail: email ? email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : 'pending',
      actionRequired: 'Verify member in Admin Dashboard: /control',
    };

    // Log administrative event
    console.log('[VELARION ADMIN ALERT]', JSON.stringify(notificationPayload));

    return NextResponse.json({
      success: true,
      notified: true,
      message: 'Admin notification dispatched for review.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Notification error' }, { status: 500 });
  }
}
