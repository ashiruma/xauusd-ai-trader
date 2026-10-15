'use client';

import React, { useEffect, useRef } from 'react';

interface StarfieldBackgroundProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function StarfieldBackground({ className = '', style }: StarfieldBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

    interface CosmicStar {
      x: number;
      y: number;
      radius: number;
      color: string;
      speed: number;
      angle: number;
      pulse: number;
      pulseOffset: number;
    }

    interface AmbientStar {
      x: number;
      y: number;
      size: number;
      opacity: number;
      drift: number;
    }

    let stars: CosmicStar[] = [];
    let ambientStars: AmbientStar[] = [];
    const mouse: { x: number | null; y: number | null } = { x: null, y: null };

    const STAR_COLORS = [
      'rgba(230, 194, 158, ', // Bronze/gold (calibrated to XAUUSD theme)
      'rgba(244, 244, 246, ', // Pure soft starlight white
      'rgba(173, 140, 255, ', // Purple starlight
      'rgba(135, 206, 250, '  // Cool space blue
    ];

    function getRandomColor(): string {
      return STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
    }

    function resize() {
      if (!canvas) return;
      const parent = canvas.parentElement || document.body;
      width = parent.clientWidth;
      height = parent.clientHeight || window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      // Tier 1: Drifting cosmic starlight particles
      stars = [];
      const starCount = Math.max(50, Math.floor(width / 22));
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.5 + 0.5,
          color: getRandomColor(),
          speed: Math.random() * 0.15 + 0.04,
          angle: Math.random() * Math.PI * 2,
          pulse: Math.random() * 0.02 + 0.005,
          pulseOffset: Math.random() * Math.PI * 2
        });
      }

      // Tier 2: Ambient background starlight layer
      ambientStars = [];
      const ambientCount = Math.max(70, Math.floor(width / 16));
      for (let i = 0; i < ambientCount; i++) {
        ambientStars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 0.8 + 0.3,
          opacity: Math.random() * 0.5 + 0.15,
          drift: Math.random() * 0.03 + 0.01
        });
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    resize();

    let animationFrameId: number;
    let isMounted = true;

    function render(now: number) {
      if (!isMounted || !ctx) return;
      ctx.clearRect(0, 0, width, height);

      // 1. Ambient Background Twinkling Starlight
      for (let i = 0; i < ambientStars.length; i++) {
        const s = ambientStars[i];
        s.y -= s.drift;
        if (s.y < 0) s.y = height;
        ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
        ctx.fillRect(s.x, s.y, s.size, s.size);
      }

      // 2. Cosmic Floating Star Portal Particles
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;

        // Subtle mouse interaction
        if (mouse.x !== null && mouse.y !== null) {
          const dx = s.x - mouse.x;
          const dy = s.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120 && dist > 0) {
            const force = ((120 - dist) / 120) * 0.18;
            s.x += (dx / dist) * force;
            s.y += (dy / dist) * force;
          }
        }

        // Bounds wrapping
        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;
        if (s.y < 0) s.y = height;
        if (s.y > height) s.y = 0;

        // Micro-fluctuation
        s.speed += (Math.random() - 0.5) * 0.006;
        s.speed = Math.max(0.04, Math.min(s.speed, 0.22));

        // Pulsing glow alpha
        const alpha = 0.3 + Math.abs(Math.sin(now * s.pulse + s.pulseOffset)) * 0.7;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${s.color}${alpha.toFixed(3)})`;
        ctx.shadowBlur = s.radius * 3.5;
        ctx.shadowColor = `${s.color}0.75)`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      isMounted = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`hero-starfield-canvas ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}
