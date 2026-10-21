'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  category?: string;
  suggestions?: string[];
  referenceLinks?: Array<{ label: string; href: string }>;
  timestamp: string;
}

const INITIAL_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  text: `Welcome to Velarion. This release offers curriculum summaries and pending-access sign-in, not enabled lessons or trading.
The intended journey is:
1. Register through this website’s JustMarkets link and create a demo MT5 account there.
2. Return using the same email and a separate Velarion password. The MT5 trading account ID is mandatory for planned verification; it does not prove ownership or referral attribution alone. Never share broker passwords here.
3. Complete five lessons, then provide trustworthy live-account evidence of at least USD 50 deposited before lessons 6–30. This checkpoint is planned, not enabled.
4. Complete all 30 lessons to graduate. Funding and graduation never activate trading.
5. Automation requires separate account-scoped consent, verified ownership and operational approval. It can lose money; no income while studying is guaranteed.
Velarion access is 100% free conditional on partner-link registration and verified attribution. Broker fees, deposits and losses remain yours. IB compensation creates a conflict, and Kenya regulatory review remains required before launch.`,
  suggestions: [
    'How do I start the 5-step funnel?',
    'What is the five-lesson USD 50 checkpoint?',
    'Why do I need a separate Velarion password and MT5 ID?',
    'What are the trading risks and IB conflicts?',
    'Why are all 30 lessons required?'
  ],
  timestamp: 'Just now'
};

export default function AiAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
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
        const assistantMsg: Message = {
          id: `asst_${Date.now()}`,
          role: 'assistant',
          text: data.reply,
          category: data.category,
          suggestions: data.suggestions || [],
          referenceLinks: data.referenceLinks || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const errorMsg: Message = {
          id: `err_${Date.now()}`,
          role: 'assistant',
          text: data.message || 'I encountered an issue retrieving that guidance. Please try again or select one of the suggested prompts below.',
          suggestions: [
            'How do I start the 5-step funnel?',
            'What is the five-lesson USD 50 checkpoint?',
            'Why do I need a separate Velarion password and MT5 ID?'
          ],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch {
      const networkErrorMsg: Message = {
        id: `net_${Date.now()}`,
        role: 'assistant',
        text: 'Network connection error. Please ensure you are connected and try again.',
        suggestions: ['How do I start the 5-step funnel?'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, networkErrorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9990,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '8px'
        }}
      >
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 16px',
              backgroundColor: '#082c21',
              color: '#f8f8f0',
              border: '1px solid #d8b86c',
              borderRadius: '2px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '12px',
              letterSpacing: '0.02em',
              transition: 'all 0.2s ease'
            }}
            aria-label="Open Velarion AI Assistant"
          >
            {/* SVG Robot/Assistant Icon */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                borderRadius: '2px',
                backgroundColor: 'rgba(216, 184, 108, 0.15)',
                border: '1px solid #d8b86c',
                color: '#e1c47c'
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <circle cx="12" cy="5" r="2" />
                <path d="M12 7v4" />
                <line x1="8" y1="16" x2="8" y2="16" />
                <line x1="16" y1="16" x2="16" y2="16" />
              </svg>
            </span>
            <span>AI Assistant</span>
            <span
              style={{
                fontSize: '10px',
                padding: '2px 6px',
                backgroundColor: 'rgba(4, 120, 87, 0.25)',
                color: '#34D399',
                borderRadius: '4px',
                border: '1px solid rgba(4, 120, 87, 0.4)',
                fontWeight: 700,
                letterSpacing: '0.05em'
              }}
            >
              GUIDE
            </span>
          </button>
        )}

        {/* Assistant Dialog Drawer */}
        {isOpen && (
          <div
            style={{
              width: '420px',
              maxWidth: 'calc(100vw - 32px)',
              height: '620px',
              maxHeight: 'calc(100vh - 100px)',
              backgroundColor: 'var(--bg-card, #FFFFFF)',
              border: '1px solid var(--border-default, #CBD5E1)',
              borderRadius: '2px',
              boxShadow: '0 16px 36px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              animation: 'fadeInUp 0.2s ease-out'
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-subtle, #E2E8F0)',
                backgroundColor: 'var(--bg-surface-1, #F8FAFC)',
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
                    borderRadius: '2px',
                    backgroundColor: 'rgba(20, 84, 55, 0.12)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--accent-gold)'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="10" rx="2" />
                    <circle cx="12" cy="5" r="2" />
                    <path d="M12 7v4" />
                    <line x1="8" y1="16" x2="8" y2="16" />
                    <line x1="16" y1="16" x2="16" y2="16" />
                  </svg>
                </span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary, #0F172A)' }}>
                      Velarion AI Assistant
                    </span>
                    <span
                      style={{
                        fontSize: '9px',
                        padding: '1px 5px',
                        backgroundColor: 'rgba(4, 120, 87, 0.15)',
                        color: 'var(--accent-green, #047857)',
                        borderRadius: '3px',
                        fontWeight: 700
                      }}
                    >
                      ONLINE
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted, #64748B)' }}>
                    System Guide & Education Copilot
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={handleClearHistory}
                  title="Reset conversation"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted, #64748B)',
                    padding: '6px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close Assistant"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted, #64748B)',
                    padding: '6px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Message Stream */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px 20px',
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
                      maxWidth: '92%',
                      padding: '12px 16px',
                      borderRadius: '2px',
                      backgroundColor:
                        m.role === 'user'
                          ? '#145437'
                          : 'var(--bg-surface-2)',
                      color:
                        m.role === 'user'
                          ? '#f7f7f0'
                          : 'var(--text-primary)',
                      border:
                        m.role === 'user'
                          ? '1px solid #145437'
                          : '1px solid var(--border-default)',
                      fontSize: '13px',
                      lineHeight: '1.55',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}
                  >
                    {m.text}

                    {/* Reference Links if provided */}
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
                            onClick={() => setIsOpen(false)}
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              color: 'var(--accent-gold, #B45309)',
                              textDecoration: 'none',
                              padding: '3px 8px',
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

                  <div
                    style={{
                      fontSize: '10px',
                      color: 'var(--text-muted, #64748B)',
                      marginTop: '4px',
                      padding: '0 4px'
                    }}
                  >
                    {m.timestamp}
                  </div>

                  {/* Suggestion Chips after Assistant reply */}
                  {m.suggestions && m.suggestions.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px',
                        marginTop: '8px',
                        maxWidth: '95%'
                      }}
                    >
                      {m.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSendMessage(sug)}
                          disabled={loading}
                          style={{
                            fontSize: '11px',
                            padding: '5px 10px',
                            backgroundColor: 'var(--bg-surface-2, #F1F5F9)',
                            color: 'var(--text-secondary, #334155)',
                            border: '1px solid var(--border-subtle, #E2E8F0)',
                            borderRadius: '9999px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.15s ease'
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
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--accent-gold, #B45309)', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
                    <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--accent-gold, #B45309)', borderRadius: '50%', animation: 'pulse 1s infinite 0.2s' }} />
                    <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--accent-gold, #B45309)', borderRadius: '50%', animation: 'pulse 1s infinite 0.4s' }} />
                  </div>
                  <span>Assistant analyzing knowledge base...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div
              style={{
                padding: '12px 16px',
                borderTop: '1px solid var(--border-subtle, #E2E8F0)',
                backgroundColor: 'var(--bg-surface-1, #F8FAFC)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask how to start, account tiers, school..."
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  backgroundColor: 'var(--bg-base, #FFFFFF)',
                  color: 'var(--text-primary, #0F172A)',
                  border: '1px solid var(--border-default, #CBD5E1)',
                  borderRadius: '2px',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={loading || !inputValue.trim()}
                style={{
                  padding: '10px 14px',
                  backgroundColor: inputValue.trim() && !loading ? '#145437' : 'var(--bg-surface-3)',
                  color: '#f7f7f0',
                  border: 'none',
                  borderRadius: '2px',
                  cursor: inputValue.trim() && !loading ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.15s ease'
                }}
                aria-label="Send message"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
