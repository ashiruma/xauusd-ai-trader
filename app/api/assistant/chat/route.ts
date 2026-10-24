import { NextResponse } from 'next/server';
import { queryKnowledgeBase } from '@/lib/assistant-knowledge';
import { createClient } from '@/lib/supabase/server';
import { dispatchHumanSupport } from '@/lib/support-dispatch';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function isHumanSupportRequest(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes('human support') ||
    lower.includes('speak to human') ||
    lower.includes('talk to human') ||
    lower.includes('human agent') ||
    lower.includes('speak to an agent') ||
    lower.includes('talk to an agent') ||
    lower.includes('talk to a person') ||
    lower.includes('speak to a person') ||
    lower.includes('real person') ||
    lower.includes('contact human') ||
    lower.includes('contact support') ||
    lower.includes('talk to admin') ||
    lower.includes('speak to admin') ||
    lower.includes('help from admin') ||
    lower.includes('customer support') ||
    lower.includes('live agent') ||
    lower.includes('support ticket') ||
    lower.includes('speak to someone') ||
    lower.includes('talk to someone')
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const userMessage = String(body.message || '').trim();
    const history = Array.isArray(body.history) ? body.history : [];

    if (!userMessage) {
      return NextResponse.json(
        {
          success: false,
          error: 'EMPTY_MESSAGE',
          message: 'Please provide a question or topic for the AI assistant.',
        },
        { status: 400 }
      );
    }

    const lowerMessage = userMessage.toLowerCase();

    // 1. Security & Data Leak Check: Intercept attempted submission of master passwords
    if (
      lowerMessage.includes('master password') ||
      lowerMessage.includes('trading password') ||
      lowerMessage.includes('broker password')
    ) {
      if (
        lowerMessage.includes('my password is') ||
        lowerMessage.includes('pass is') ||
        lowerMessage.includes('here is my password') ||
        lowerMessage.includes('password:')
      ) {
        return NextResponse.json({
          success: true,
          reply:
            'SECURITY WARNING: Never submit or transmit your master broker trading password. Velarion operates strictly on least-privilege investor (read-only) credentials. We will never ask for your master password or phone number. Please change your password on JustMarkets immediately if you have exposed it.',
          suggestions: [
            'How do I get an Investor Password?',
            'How do I start the 5-step funnel?',
            'What is the partner referral code?',
          ],
          category: 'Security Warning',
          referenceLinks: [
            { label: 'Accounts Desk', href: '/accounts' },
            { label: 'How It Works', href: '/how-it-works' },
          ],
        });
      }
    }

    // 2. Human Support Escalation
    if (isHumanSupportRequest(lowerMessage)) {
      let userId: string | null = null;
      let userEmail: string | null = null;
      let accountId: string | null = null;

      try {
        const supabase = await createClient();
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          userId = data.user.id;
          userEmail = data.user.email || null;
          const { data: profile } = await supabase
            .from('profiles')
            .select('mt5_account_id')
            .eq('id', data.user.id)
            .maybeSingle();

          if (profile?.mt5_account_id) {
            accountId = profile.mt5_account_id;
          }
        }
      } catch {
        // session fallback
      }

      const escalation = await dispatchHumanSupport({
        userId,
        userEmail,
        accountId,
        subject: 'Human Support Requested via AI Assistant',
        message: userMessage,
        channel: 'AI Assistant Chat Escalation',
      });

      const reply = [
        'HUMAN SUPPORT ESCALATION NOTIFICATION',
        '-------------------------------------------------------',
        `Your request has been forwarded to our platform administrative team under ticket reference #${escalation.ticketId}.`,
        '',
        'An email notification has been dispatched to our administrators. A team member will review your inquiry and follow up directly.',
        '',
        'Key Support Notes:',
        '1. Account Attribution: Always keep your JustMarkets MT5 account ID ready.',
        '2. Security Guarantee: Support staff will never ask for your broker master trading password or private financial pins.',
        '3. Emergency Actions: For immediate automation stops, use the Emergency Stop button on the Automation console.',
        '',
        'Feel free to continue asking quantitative, curriculum, or platform questions in the meantime.',
      ].join('\n');

      return NextResponse.json({
        success: true,
        reply,
        ticketId: escalation.ticketId,
        category: 'Human Support Escalation',
        suggestions: [
          'What is the partner referral code?',
          'How do I link my MT5 account?',
          'How does the Forex School work?',
        ],
        referenceLinks: [
          { label: 'Accounts Desk', href: '/accounts' },
          { label: 'Forex School', href: '/academy' },
        ],
      });
    }

    // 3. Optional Gemini LLM Provider if GEMINI_API_KEY is configured
    const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
    if (geminiApiKey) {
      try {
        const systemPrompt = `You are the Velarion AI Assistant, an institutional quantitative trading educator and system guide for the Velarion platform.
Platform Guidelines you MUST obey:
1. Rule 1: ZERO EMOJIS. Never output any emoji under any circumstances.
2. Rule 2: ZERO DECORATIVE BULLETS. Do not use bullets or bullet symbols. Use clean numbered lists (1., 2., 3.) or plain text paragraphs.
3. Rule 3: STRICT NON-CUSTODIAL & DATA PRIVACY. Never ask for or accept master trading passwords, phone numbers, or private emails. Velarion only uses read-only MT5 investor passwords.
4. Funnel steps: 1. Sign up and await admin verification -> 2. Onboard to Forex School -> 3. Complete Lessons 1 & 2 for free -> 4. Link JustMarkets account (code tohstb0d83) to unlock Lessons 3-5 -> 5. Deposit min. $50 on live account to unlock Lessons 6-30 & Live Trading Terminal.
5. If the user asks for human support, inform them that a ticket has been created and administrators are alerted via email.
6. Keep answers structured, professional, concise, and helpful.`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

        const contents = [];
        for (const item of history.slice(-4)) {
          contents.push({
            role: item.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: item.content }],
          });
        }
        contents.push({
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nUser Question: ${userMessage}` }],
        });

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 600,
            },
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          let replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            replyText = replyText
              .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
              .replace(/[\u2022\u00b7\u25cf]/g, '-')
              .trim();

            const fallbackSuggestions = queryKnowledgeBase(userMessage).suggestions;

            return NextResponse.json({
              success: true,
              reply: replyText,
              suggestions: fallbackSuggestions,
              category: 'Velarion AI Intelligence',
              referenceLinks: [
                { label: 'Forex School', href: '/academy' },
                { label: 'Accounts Desk', href: '/accounts' },
              ],
            });
          }
        }
      } catch {
        // Fall back gracefully to authoritative knowledge base
      }
    }

    // 4. Authoritative Knowledge Base Engine
    const result = queryKnowledgeBase(userMessage);

    return NextResponse.json({
      success: true,
      reply: result.reply,
      suggestions: result.suggestions,
      category: result.category,
      referenceLinks: result.referenceLinks,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      {
        success: false,
        error: 'SERVER_ERROR',
        message: errorMsg,
      },
      { status: 500 }
    );
  }
}
