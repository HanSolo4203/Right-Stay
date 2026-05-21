'use client';

import { useEffect, useRef, useState } from 'react';

/** Decorative admin backdrop. Pauses when tab is hidden and respects reduced motion. */
export default function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let drops: number[] = [];
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let running = false;

    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?';
    const charArray = chars.split('');
    const fontSize = 14;

    const initColumns = () => {
      const maxColumns = window.innerWidth < 768 ? 48 : 120;
      const columns = Math.min(Math.floor(canvas.width / fontSize), maxColumns);
      drops = Array.from({ length: columns }, () => Math.random() * -100);
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initColumns();
    };

    const draw = () => {
      if (!running) return;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00ff41';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        const opacity = Math.min(1, (drops[i] * fontSize) / (canvas.height * 0.3));
        ctx.globalAlpha = opacity;
        ctx.fillText(text, x, y);
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      ctx.globalAlpha = 1;
    };

    const start = () => {
      if (running) return;
      running = true;
      if (!intervalId) {
        intervalId = setInterval(draw, 80);
      }
    };

    const stop = () => {
      running = false;
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('visibilitychange', onVisibility);

    if (!document.hidden) start();

    return () => {
      stop();
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    return <StaticAdminBackdrop />;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ background: '#000000' }}
      aria-hidden
    />
  );
}

function StaticAdminBackdrop() {
  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #0a1f0a 0%, #000 70%)' }}
      aria-hidden
    />
  );
}
