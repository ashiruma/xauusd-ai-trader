'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { LevelDefinition } from '@/lib/curriculum-levels';

interface LevelCelebrationModalProps {
  level: LevelDefinition;
  onClose: () => void;
  passedLessonNum: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  shape: 'diamond' | 'rect' | 'circle' | 'star';
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  fadeSpeed: number;
}

export default function LevelCelebrationModal({
  level,
  onClose,
  passedLessonNum,
}: LevelCelebrationModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const verificationHash = `VLR-${level.key.toUpperCase()}-${passedLessonNum.toString().padStart(2, '0')}-${Date.now().toString(16).slice(-6).toUpperCase()}`;

  // 1. Play Soft Harmonic Web Audio Chime on Mount
  useEffect(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Major chord arpeggio: C5 (523Hz), E5 (659Hz), G5 (784Hz), B5 (988Hz), C6 (1046Hz)
      const frequencies = [523.25, 659.25, 783.99, 987.77, 1046.5];
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + idx * 0.11;

        osc.type = idx === frequencies.length - 1 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.14, startTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.95);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 1.0);
      });
    } catch {
      // Audio autoplay restrictions gracefully handled
    }
  }, []);

  // 2. Luxury Geometric Confetti Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const colors = [
      '#D4AF37', // Velarion Classic Gold
      '#F59E0B', // Amber
      '#FDE68A', // Pale Gold
      '#10B981', // Emerald
      '#34D399', // Bright Mint
      '#FFFFFF', // Crisp White
      '#E2D9C8', // Cream Citrine
    ];

    const particles: Particle[] = [];
    const particleCount = 110;
    const shapes: Particle['shape'][] = ['diamond', 'rect', 'circle', 'star'];

    // Spawn burst from top center
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.random() * Math.PI) + (Math.PI * 0.15); // downward spread
      const speed = Math.random() * 9 + 4;
      particles.push({
        x: width * 0.5 + (Math.random() - 0.5) * 320,
        y: height * 0.22 + (Math.random() - 0.5) * 120,
        vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
        vy: -Math.abs(Math.sin(angle) * speed * 0.75) + (Math.random() * 2),
        size: Math.random() * 7 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.16,
        opacity: 1,
        fadeSpeed: Math.random() * 0.005 + 0.003,
      });
    }

    let startTime = Date.now();
    const duration = 4000; // 4 seconds

    const render = () => {
      const elapsed = Date.now() - startTime;
      ctx.clearRect(0, 0, width, height);

      let aliveCount = 0;
      for (const p of particles) {
        if (p.opacity <= 0.01) continue;
        aliveCount++;

        // Physics
        p.vy += 0.18; // gravity
        p.vx *= 0.99; // drag
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.opacity = Math.max(0, p.opacity - p.fadeSpeed);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
        } else if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'diamond') {
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.lineTo(p.size * 0.7, 0);
          ctx.lineTo(0, p.size);
          ctx.lineTo(-p.size * 0.7, 0);
          ctx.closePath();
          ctx.fill();
        } else if (p.shape === 'star') {
          ctx.beginPath();
          for (let s = 0; s < 4; s++) {
            ctx.lineTo(Math.cos(((s * 90) * Math.PI) / 180) * p.size, Math.sin(((s * 90) * Math.PI) / 180) * p.size);
            ctx.lineTo(Math.cos(((s * 90 + 45) * Math.PI) / 180) * (p.size * 0.35), Math.sin(((s * 90 + 45) * Math.PI) / 180) * (p.size * 0.35));
          }
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      }

      if (aliveCount > 0 && elapsed < duration) {
        animId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const copyHash = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(verificationHash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2500);
    }
  };

  return (
    <>
      {/* Background Interactive Particle Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 10001,
        }}
      />

      {/* Modal Backdrop Overlay */}
      <div
        className="modal-overlay"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(3, 7, 15, 0.88)',
          backdropFilter: 'blur(10px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          overflowY: 'auto',
        }}
      >
        <div
          className="modal-card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="celebration-title"
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: '640px',
            width: '100%',
            background: 'linear-gradient(180deg, #0e1726 0%, #060b14 100%)',
            border: '1.5px solid var(--accent-gold, #D4AF37)',
            borderRadius: '12px',
            padding: '38px 32px 32px',
            textAlign: 'center',
            boxShadow: '0 25px 70px rgba(0, 0, 0, 0.85), 0 0 50px rgba(212, 175, 55, 0.15)',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '18px',
              right: '20px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '22px',
              cursor: 'pointer',
              padding: '6px',
              lineHeight: 1,
            }}
            aria-label="Close celebration dialog"
          >
            &times;
          </button>

          {/* Luxury SVG Medal / Crest */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
            <div
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(212, 175, 55, 0.22) 0%, rgba(14, 23, 38, 0.8) 70%)',
                border: '2px solid var(--accent-gold, #D4AF37)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 30px rgba(212, 175, 55, 0.3)',
              }}
            >
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Outer Ring */}
                <circle cx="24" cy="24" r="21" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="3 2" />
                {/* Inner Crest Shield */}
                <path
                  d="M24 7L36 12V24C36 31 31 37 24 41C17 37 12 31 12 24V12L24 7Z"
                  fill="rgba(212, 175, 55, 0.18)"
                  stroke="#D4AF37"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                {/* Laurel Leaves (Left) */}
                <path d="M16 20C15 22 15 25 17 28M15 24C13 26 14 28 16 30" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
                {/* Laurel Leaves (Right) */}
                <path d="M32 20C33 22 33 25 31 28M33 24C35 26 34 28 32 30" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
                {/* Central Verified Checkmark */}
                <polyline points="19 24 23 28 30 19" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Level Passed Badge Kicker */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '5px 14px',
              background: 'var(--accent-gold-subtle, rgba(212, 175, 55, 0.12))',
              border: '1px solid var(--border-accent, #D4AF37)',
              borderRadius: '4px',
              marginBottom: '14px',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: 'var(--accent-gold, #D4AF37)',
                fontFamily: 'var(--font-mono, monospace)',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
              }}
            >
              {level.badgeKicker}
            </span>
          </div>

          {/* Title & Celebration Heading */}
          <h2
            id="celebration-title"
            style={{
              fontSize: '26px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              margin: '0 0 10px',
              letterSpacing: '-0.4px',
              lineHeight: 1.25,
            }}
          >
            {level.certificateTitle}
          </h2>

          <p
            style={{
              fontSize: '14.5px',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              maxWidth: '540px',
              margin: '0 auto 24px',
            }}
          >
            {level.description}
          </p>

          {/* Verified Competencies Panel */}
          <div
            style={{
              background: 'var(--bg-surface-2, #111a2e)',
              border: '1px solid var(--border-default, #1e293b)',
              borderRadius: '8px',
              padding: '18px 20px',
              marginBottom: '24px',
              textAlign: 'left',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 700,
                color: 'var(--accent-gold, #D4AF37)',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                marginBottom: '10px',
              }}
            >
              Verified Institutional Competencies
            </div>
            <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-primary)' }}>
              {level.verifiedSkills.map((skill, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Next Action Call-to-Action for Level 5 / Foundation vs Later Levels */}
          {level.depositPrompt ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(16, 185, 129, 0.08) 100%)',
                  border: '1px solid var(--accent-gold)',
                  borderRadius: '6px',
                  padding: '14px 16px',
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  textAlign: 'left',
                  lineHeight: 1.5,
                }}
              >
                <strong style={{ color: 'var(--text-primary)' }}>Trading Floor Transition:</strong>
                <p style={{ margin: '4px 0 0' }}>
                  You have cleared all 5 required foundation gates. Make your initial deposit of at least USD 50 into your JustMarkets live account to arm the Autonomous AI Trading Terminal and unlock Advanced Lessons 6&ndash;30.
                </p>
              </div>

              <a
                href="https://one.justmarkets.link/a/tohstb0d83"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{
                  padding: '13px 24px',
                  fontSize: '14px',
                  fontWeight: 700,
                  backgroundColor: 'var(--accent-gold, #D4AF37)',
                  color: '#000000',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  display: 'block',
                }}
              >
                Deposit Minimum USD 50 on JustMarkets &rarr;
              </a>

              <Link
                href="/overview"
                className="btn btn-outline-gold"
                style={{
                  padding: '11px 20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  textDecoration: 'none',
                  border: '1px solid var(--border-accent)',
                  color: 'var(--accent-gold)',
                  display: 'block',
                }}
              >
                Open Trading Control Desk &rarr;
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <Link
                href={level.nextActionHref}
                className="btn btn-primary"
                style={{
                  padding: '13px 24px',
                  fontSize: '14px',
                  fontWeight: 700,
                  backgroundColor: 'var(--accent-gold, #D4AF37)',
                  color: '#000000',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  display: 'block',
                }}
              >
                <span dangerouslySetInnerHTML={{ __html: level.nextActionText }} />
              </Link>

              <Link
                href="/school"
                className="btn btn-outline-gold"
                style={{
                  padding: '11px 20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  textDecoration: 'none',
                  border: '1px solid var(--border-accent)',
                  color: 'var(--accent-gold)',
                  display: 'block',
                }}
              >
                Return to School Folio &rarr;
              </Link>
            </div>
          )}

          {/* Cryptographic Verification Hash & Copy */}
          <div
            style={{
              paddingTop: '16px',
              borderTop: '1px solid var(--border-subtle, #1e293b)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              fontSize: '11.5px',
              fontFamily: 'var(--font-mono, monospace)',
              color: 'var(--text-muted)',
            }}
          >
            <span>Audit Ref: <strong style={{ color: 'var(--text-secondary)' }}>{verificationHash}</strong></span>
            <button
              type="button"
              onClick={copyHash}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-default)',
                borderRadius: '4px',
                padding: '4px 10px',
                color: copiedHash ? '#10B981' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '11px',
                fontFamily: 'var(--font-mono, monospace)',
              }}
            >
              {copiedHash ? 'Hash Copied' : 'Copy Hash'}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
