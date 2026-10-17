// app/assistant/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import MemberNav from '@/components/MemberNav';

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  category?: string;
  suggestions?: string[];
  referenceLinks?: Array<{ label: string; href: string }>;
  timestamp: string;
}

const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: 'intro',
    role: 'assistant',
    text: `Welcome to the Velarion AI Guidance Desk. I am your specialized system mentor and risk analyst.

How can I help you benefit from the Velarion ecosystem today?
1. Follow the 5-step member journey to unlock free platform access via JustMarkets.
2. Choose between the $10 Standard Cent account (micro 1 oz lots) and the $200 Pro account.
3. Understand the Forex School curriculum and pass your checkpoint quizzes.
4. Set up your MetaTrader 5 Investor (read-only) password without exposing master credentials.
5. Review the mathematical truth behind loss asymmetry and our Candidate Strategy v2 rules.

Select one of the quick topics below or enter your question.`,
    suggestions: [
      'How do I start the 5-step funnel?',
      'Explain $10 Cent vs Standard Account',
      'What is an Investor Password?',
      'Why did the 160-trade test lose money?',
      'How do I pass School quizzes?'
    ],
    timestamp: 'Initial session'
  }
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(DEFAULT_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data?.authenticated && data?.session) {
          setSessionUser(data.session);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText || inputValue).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!overrideText) setInputValue('');
    setLoading(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.text
      }));

      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyPayload
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const asstMsg: ChatMessage = {
          id: `asst_${Date.now()}`,
          role: 'assistant',
          text: data.reply,
          category: data.category,
          suggestions: data.suggestions || [],
          referenceLinks: data.referenceLinks || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, asstMsg]);
      } else {
        const errorMsg: ChatMessage = {
          id: `err_${Date.now()}`,
          role: 'assistant',
          text: data.message || 'Unable to retrieve guidance at this time. Please select a suggested topic.',
          suggestions: ['How do I start the 5-step funnel?', 'Explain $10 Cent vs Standard Account'],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch {
      const netErrorMsg: ChatMessage = {
        id: `net_${Date.now()}`,
        role: 'assistant',
        text: 'Network communication failure. Please check your internet connection.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, netErrorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages(DEFAULT_MESSAGES);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base, #FFFFFF)', color: 'var(--text-primary, #0F172A)' }}>
      {sessionUser && (
        <MemberNav
          accountId={sessionUser.mt5Account || sessionUser.accountId}
          environment="DEMO"
          automationStatus="OFF"
        />
      )}

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px 64px' }}>
        {/* Desk Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--accent-gold, #B45309)',
                backgroundColor: 'rgba(180, 83, 9, 0.08)',
                padding: '3px 8px',
                borderRadius: '4px',
                border: '1px solid rgba(180, 83, 9, 0.25)'
              }}
            >
              Velarion Intelligence Copilot
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--accent-green, #047857)',
                backgroundColor: 'rgba(4, 120, 87, 0.10)',
                padding: '3px 8px',
                borderRadius: '4px'
              }}
            >
              ONLINE / DEMO ASSISTANT
            </span>
          </div>
          <h1 style={{ fontSize: '30px', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
            AI System Guide & Member Support Desk
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-muted, #64748B)', maxWidth: '780px', margin: 0 }}>
            Interactive guidance on navigating the 5-step member funnel, choosing your account tier, mastering the Forex School, connecting least-privilege investor passwords, and understanding quantitative risk.
          </p>
        </div>

        {/* Dual Layout: Knowledge Quick-Access & Interactive Chat Desk */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: '28px', alignItems: 'start' }}>
          {/* Left Column: Quick Knowledge Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 5-Step Member Journey Card */}
            <div
              style={{
                padding: '24px',
                backgroundColor: 'var(--bg-surface-1, #F8FAFC)',
                border: '1px solid var(--border-default, #CBD5E1)',
                borderRadius: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
                  The 5-Step Member Funnel
                </h3>
                <Link
                  href="/how-it-works"
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--accent-gold, #B45309)',
                    textDecoration: 'none'
                  }}
                >
                  View Full Guide &rarr;
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--accent-gold, #B45309)' }}>1.</span>
                  <span><strong>Register on JustMarkets:</strong> Use partner code <code>tohstb0d83</code> to subsidize platform access.</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--accent-gold, #B45309)' }}>2.</span>
                  <span><strong>Fund Your Account:</strong> $10 for Standard Cent (1 oz/lot) or $200 for Pro (raw spread).</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--accent-gold, #B45309)' }}>3.</span>
                  <span><strong>Forex School:</strong> Pass 30 sequential lessons and 6 required checkpoints.</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--accent-gold, #B45309)' }}>4.</span>
                  <span><strong>Link MT5 (Least-Privilege):</strong> Connect read-only investor password; master passwords prohibited.</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--accent-gold, #B45309)' }}>5.</span>
                  <span><strong>Demo Automation:</strong> Opt into Candidate Strategy v2 with instant Pause and Emergency Stop controls.</span>
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <button
                  onClick={() => handleSend('How do I start the 5-step funnel?')}
                  style={{
                    width: '100%',
                    padding: '9px 14px',
                    backgroundColor: 'var(--bg-base, #FFFFFF)',
                    border: '1px solid var(--border-default, #CBD5E1)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: 'var(--text-primary, #0F172A)'
                  }}
                >
                  Ask AI to Walk Me Through Step 1
                </button>
              </div>
            </div>

            {/* Account Tiers Overview Card */}
            <div
              style={{
                padding: '24px',
                backgroundColor: 'var(--bg-surface-1, #F8FAFC)',
                border: '1px solid var(--border-default, #CBD5E1)',
                borderRadius: '12px'
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 12px' }}>
                Account Sizing & Contract Specifications
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div
                  style={{
                    padding: '12px',
                    backgroundColor: 'var(--bg-base, #FFFFFF)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle, #E2E8F0)'
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-gold, #B45309)', textTransform: 'uppercase' }}>
                    Standard Cent ($10)
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '4px' }}>1 Lot = 1 Troy Oz</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted, #64748B)', marginTop: '4px' }}>
                    0.01 lot = 0.01 oz. Ideal for beginners learning risk control with 1,000 cents.
                  </div>
                </div>

                <div
                  style={{
                    padding: '12px',
                    backgroundColor: 'var(--bg-base, #FFFFFF)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle, #E2E8F0)'
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-green, #047857)', textTransform: 'uppercase' }}>
                    Pro Account ($200)
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '4px' }}>1 Lot = 100 Troy Oz</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted, #64748B)', marginTop: '4px' }}>
                    Raw spreads from 0.1 pips. Tailored for quantitative traders seeking lowest friction.
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSend('Explain $10 Cent vs Standard Account')}
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  backgroundColor: 'var(--bg-base, #FFFFFF)',
                  border: '1px solid var(--border-default, #CBD5E1)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: 'var(--text-primary, #0F172A)'
                }}
              >
                Compare Contract Specifications in Detail
              </button>
            </div>

            {/* Investor Password Safety Notice */}
            <div
              style={{
                padding: '20px 24px',
                backgroundColor: 'rgba(180, 83, 9, 0.05)',
                border: '1px solid rgba(180, 83, 9, 0.25)',
                borderRadius: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(180, 83, 9, 0.15)',
                    color: 'var(--accent-gold, #B45309)',
                    fontWeight: 700,
                    fontSize: '12px'
                  }}
                >
                  i
                </span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-gold, #B45309)' }}>
                  Least-Privilege Security Guarantee
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary, #334155)', margin: 0, lineHeight: 1.5 }}>
                Velarion operates under a non-custodial model. We only connect using read-only investor passwords. We never ask for or accept master trading passwords. Neither Velarion nor any third party can withdraw your funds or place arbitrary trades.
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Chat Console */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface-1, #F8FAFC)',
              border: '1px solid var(--border-default, #CBD5E1)',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              height: '740px',
              overflow: 'hidden'
            }}
          >
            {/* Chat Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-subtle, #E2E8F0)',
                backgroundColor: 'var(--bg-base, #FFFFFF)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(180, 83, 9, 0.12)',
                    border: '1px solid rgba(180, 83, 9, 0.35)',
                    color: 'var(--accent-gold, #B45309)'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="10" rx="2" />
                    <circle cx="12" cy="5" r="2" />
                    <path d="M12 7v4" />
                    <line x1="8" y1="16" x2="8" y2="16" />
                    <line x1="16" y1="16" x2="16" y2="16" />
                  </svg>
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary, #0F172A)' }}>
                    Velarion System Mentor
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted, #64748B)' }}>
                    Real-time knowledge base & compliance reasoning
                  </div>
                </div>
              </div>

              <button
                onClick={handleReset}
                title="Reset session"
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-muted, #64748B)',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-subtle, #E2E8F0)',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  cursor: 'pointer'
                }}
              >
                Reset Chat
              </button>
            </div>

            {/* Chat Body */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                backgroundColor: 'var(--bg-base, #FFFFFF)'
              }}
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '100%'
                  }}
                >
                  <div
                    style={{
                      maxWidth: '88%',
                      padding: '14px 18px',
                      borderRadius: m.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      backgroundColor:
                        m.role === 'user'
                          ? '#0F172A'
                          : 'var(--bg-surface-1, #F8FAFC)',
                      color:
                        m.role === 'user'
                          ? '#F8FAFC'
                          : 'var(--text-primary, #0F172A)',
                      border:
                        m.role === 'user'
                          ? '1px solid #1E293B'
                          : '1px solid var(--border-subtle, #E2E8F0)',
                      fontSize: '13px',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}
                  >
                    {m.text}

                    {m.referenceLinks && m.referenceLinks.length > 0 && (
                      <div
                        style={{
                          marginTop: '12px',
                          paddingTop: '10px',
                          borderTop: '1px solid var(--border-subtle, #E2E8F0)',
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '8px'
                        }}
                      >
                        {m.referenceLinks.map((link, idx) => (
                          <Link
                            key={idx}
                            href={link.href}
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              color: 'var(--accent-gold, #B45309)',
                              textDecoration: 'none',
                              padding: '4px 9px',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(180, 83, 9, 0.08)',
                              border: '1px solid rgba(180, 83, 9, 0.25)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <span>{link.label}</span>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: '10px', color: 'var(--text-muted, #64748B)', marginTop: '4px', padding: '0 4px' }}>
                    {m.timestamp}
                  </div>

                  {m.suggestions && m.suggestions.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px', maxWidth: '90%' }}>
                      {m.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSend(sug)}
                          disabled={loading}
                          style={{
                            fontSize: '11px',
                            padding: '6px 12px',
                            backgroundColor: 'var(--bg-surface-2, #F1F5F9)',
                            color: 'var(--text-secondary, #334155)',
                            border: '1px solid var(--border-subtle, #E2E8F0)',
                            borderRadius: '9999px',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted, #64748B)', fontSize: '12px' }}>
                  <span>AI Assistant consulting knowledge base...</span>
                </div>
              )}
              <div ref={chatScrollRef} />
            </div>

            {/* Input Bar */}
            <div
              style={{
                padding: '16px 20px',
                borderTop: '1px solid var(--border-subtle, #E2E8F0)',
                backgroundColor: 'var(--bg-surface-1, #F8FAFC)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about onboarding, account linking, school quizzes, or strategy risk..."
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  backgroundColor: 'var(--bg-base, #FFFFFF)',
                  color: 'var(--text-primary, #0F172A)',
                  border: '1px solid var(--border-default, #CBD5E1)',
                  borderRadius: '8px',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !inputValue.trim()}
                style={{
                  padding: '12px 20px',
                  backgroundColor: inputValue.trim() && !loading ? '#0F172A' : '#94A3B8',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: inputValue.trim() && !loading ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Send</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
