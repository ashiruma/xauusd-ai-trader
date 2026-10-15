import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body.email || '').trim().toLowerCase();
    const consent = Boolean(body.consent);
    const utmSource = String(body.utmSource || body.utm_source || '').trim();
    const utmCampaign = String(body.utmCampaign || body.utm_campaign || '').trim();
    const ref = String(body.ref || '').trim();

    if (!email || !email.includes('@') || !email.includes('.')) {
      return NextResponse.json(
        { error: 'Valid email address is required.' },
        { status: 400 }
      );
    }

    if (!consent) {
      return NextResponse.json(
        { error: 'Affirmative consent is required to receive market intelligence updates.' },
        { status: 400 }
      );
    }

    // In-memory or log record of subscriber with attribution metadata
    const subscriberRecord = {
      email,
      subscribedAt: new Date().toISOString(),
      source: 'web_briefing_optin',
      attribution: {
        utmSource: utmSource || 'organic',
        utmCampaign: utmCampaign || 'none',
        ref: ref || 'direct'
      }
    };

    console.log('[Newsletter Subscription Record]', JSON.stringify(subscriberRecord));

    return NextResponse.json({
      success: true,
      message: 'Subscribed to Velarion Institutional Daily Briefing.',
      email,
      subscribedAt: subscriberRecord.subscribedAt
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to process subscription request.' },
      { status: 500 }
    );
  }
}
