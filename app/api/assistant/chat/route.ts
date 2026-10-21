// app/api/assistant/chat/route.ts
import { NextResponse } from 'next/server';
import { queryKnowledgeBase, KNOWLEDGE_TOPICS } from '@/lib/assistant-knowledge';

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
          message: 'Please provide a question or topic for the AI assistant.'
        },
        { status: 400 }
      );
    }

    // Security & Data Leak Check: Intercept attempted submission of master passwords or sensitive credentials
    const lowerMessage = userMessage.toLowerCase();
    if (
      lowerMessage.includes('master password') ||
      lowerMessage.includes('trading password') ||
      lowerMessage.includes('broker password')
    ) {
      if (
        lowerMessage.includes('my password is') ||
        lowerMessage.includes('pass is') ||
        lowerMessage.includes('here is my password')
      ) {
        return NextResponse.json({
          success: true,
          reply:
            'SECURITY WARNING: Never submit or transmit your master broker trading password. Velarion operates strictly on least-privilege investor (read-only) credentials. We will never ask for your master password or phone number. Please change your password on JustMarkets immediately if you have exposed it.',
          suggestions: [
            'How do I get an Investor Password?',
            'How do I start the 5-step funnel?',
            'What is the partner referral code?'
          ],
          category: 'Security Warning',
          referenceLinks: [
            { label: 'Accounts Desk', href: '/accounts' },
            { label: 'How It Works', href: '/how-it-works' }
          ]
        });
      }
    }

    // Try Gemini LLM provider if GEMINI_API_KEY is configured
    const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
    if (geminiApiKey) {
      try {
        const systemPrompt = `You are the Velarion AI Assistant, an institutional quantitative trading educator and system guide for the Velarion platform.
Platform Guidelines you MUST obey:
1. Rule 1: ZERO EMOJIS. Never output any emoji under any circumstances.
2. Rule 2: ZERO DECORATIVE BULLETS. Do not use bullets or bullet symbols. Use clean numbered lists (1., 2., 3.) or plain text paragraphs.
3. Rule 3: STRICT NON-CUSTODIAL & DATA PRIVACY. Never ask for or accept master trading passwords, phone numbers, or private emails. Velarion only uses read-only MT5 investor passwords.
4. Funnel steps: 1. Register JustMarkets with code tohstb0d83 -> 2. Deposit ($10 Cent or $200 Pro) -> 3. Complete every required core lesson (currently unavailable; early checkpoints are not graduation) -> 4. Link MT5 investor password -> 5. Separately opt into demo automation.
5. Automation is strictly DEMO-FIRST in this release; live execution is locked behind release readiness gates.
6. The reviewed 160 historical trades (73.75% win rate, -$163.57 net loss, avg win $0.38 vs avg loss $5.09) is a risk warning on loss asymmetry and cost drag, solved by Candidate Strategy v2 (1.8:1 min R:R, ATR protective stops).
7. Keep answers structured, professional, concise, and helpful.`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

        // Format conversation history for Gemini
        const contents = [];
        for (const item of history.slice(-4)) {
          contents.push({
            role: item.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: item.content }]
          });
        }
        contents.push({
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nUser Question: ${userMessage}` }]
        });

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 600
            }
          }),
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          let replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            // Strip any accidental emojis or decorative bullets
            replyText = replyText
              .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
              .replace(/[\u2022\u00b7\u25cf]/g, '-')
              .trim();

            const fallbackSuggestions = queryKnowledgeBase(userMessage).suggestions;

            return NextResponse.json({
              success: true,
              reply: replyText,
              suggestions: fallbackSuggestions,
              category: 'Gemini AI Assistant',
              referenceLinks: [
                { label: 'How It Works', href: '/how-it-works' },
                { label: 'School Preview', href: '/school-preview' }
              ]
            });
          }
        }
      } catch (geminiError) {
        // Fall back gracefully to authoritative knowledge base
        console.warn('Gemini API call timed out or failed; falling back to knowledge base:', geminiError);
      }
    }

    // Authoritative Knowledge Base Engine
    const result = queryKnowledgeBase(userMessage);

    return NextResponse.json({
      success: true,
      reply: result.reply,
      suggestions: result.suggestions,
      category: result.category,
      referenceLinks: result.referenceLinks
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'SERVER_ERROR',
        message: error?.message || 'Internal server error processing AI assistant query.'
      },
      { status: 500 }
    );
  }
}
