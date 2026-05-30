"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/** Right Stay brand greens — matches tailwind `right-stay` scale */
const GREEN_PRIMARY = { r: 51, g: 126, b: 47 }; // #337e2f
const GREEN_SOFT = { r: 107, g: 160, b: 102 }; // #6ba066
const GREEN_DEEP = { r: 35, g: 80, b: 32 }; // #235020

type Particle = {
  x: number;
  y: number;
  z: number;
  hue: "primary" | "soft" | "deep";
  phase: number;
};

type MouseState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
};

function createParticles(count: number): Particle[] {
  return Array.from({ length: count }, () => {
    const roll = Math.random();
    return {
      x: Math.random() * 1.25 - 0.12,
      y: Math.random() * 1.15 - 0.075,
      z: 0.12 + Math.random() * 0.88,
      hue: roll < 0.55 ? "primary" : roll < 0.88 ? "soft" : "deep",
      phase: Math.random() * Math.PI * 2,
    };
  });
}

function colorFor(hue: Particle["hue"], alpha: number): string {
  const c =
    hue === "soft" ? GREEN_SOFT : hue === "deep" ? GREEN_DEEP : GREEN_PRIMARY;
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`;
}

function particleCountForViewport(width: number, height: number): number {
  const area = width * height;
  return Math.min(2400, Math.max(900, Math.floor(area / 520)));
}

type GreenParticleBackgroundProps = {
  className?: string;
  particleCount?: number;
  /** Bounds for cursor interaction — use the full hero wrapper so text area still reacts. */
  interactionRef?: RefObject<HTMLElement | null>;
};

/** Wind-blown green sand pixel field — reacts to cursor, respects reduced motion. */
export default function GreenParticleBackground({
  className = "",
  particleCount,
  interactionRef,
}: GreenParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let particles: Particle[] = [];
    let frameId = 0;
    let running = false;
    let lastTime = 0;
    let elapsed = 0;

    const mouse: MouseState = { x: -9999, y: -9999, vx: 0, vy: 0, active: false };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;

      const count = particleCount ?? particleCountForViewport(width, height);
      particles = createParticles(count);
    };

    const onMouseMove = (event: MouseEvent) => {
      const target = interactionRef?.current ?? canvas;
      const rect = target.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (!inside) {
        mouse.active = false;
        mouse.vx = 0;
        mouse.vy = 0;
        return;
      }

      const nx = event.clientX - rect.left;
      const ny = event.clientY - rect.top;
      const rawVx = nx - mouse.x;
      const rawVy = ny - mouse.y;
      mouse.vx = Math.max(-8, Math.min(8, rawVx));
      mouse.vy = Math.max(-8, Math.min(8, rawVy));
      mouse.x = nx;
      mouse.y = ny;
      mouse.active = true;
    };

    const onMouseLeave = () => {
      mouse.active = false;
      mouse.vx = 0;
      mouse.vy = 0;
    };

    const wrapParticle = (p: Particle) => {
      if (p.x > 1.14) p.x = -0.08;
      if (p.x < -0.08) p.x = 1.14;
      if (p.y > 1.1) p.y = -0.05;
      if (p.y < -0.05) p.y = 1.1;
    };

    const draw = (time: number) => {
      if (!running) return;

      const dt = lastTime ? Math.min((time - lastTime) / 16.67, 2.4) : 1;
      lastTime = time;
      elapsed += dt * 0.016;

      const { width, height } = canvas.getBoundingClientRect();
      const t = elapsed;

      ctx.clearRect(0, 0, width, height);

      const glow = ctx.createRadialGradient(
        width * 0.5,
        height * 0.42,
        0,
        width * 0.5,
        height * 0.5,
        Math.min(width, height) * 0.65
      );
      glow.addColorStop(0, "rgba(51, 126, 47, 0.07)");
      glow.addColorStop(0.55, "rgba(51, 126, 47, 0.025)");
      glow.addColorStop(1, "rgba(10, 18, 16, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      const gust = Math.sin(t * 0.32) * 0.1 + Math.sin(t * 0.68 + 1.4) * 0.05;
      const baseWindX = (0.38 + gust) * dt;
      const baseWindY = Math.sin(t * 0.45) * 0.035 * dt;

      const influenceRadius = Math.min(width, height) * 0.22;

      for (const p of particles) {
        // Tighter depth range — avoids jarring fast foreground vs slow background
        const depthSpeed = 0.78 + p.z * 0.24;
        const ripple =
          Math.sin(p.y * 14 + t * 1.05 + p.phase) * 0.09 +
          Math.cos(p.y * 9 - t * 0.7 + p.phase * 0.6) * 0.06;

        let vx = (baseWindX + ripple * 0.1 * dt) * depthSpeed;
        let vy = (baseWindY + Math.sin(t * 0.9 + p.phase) * 0.035 * dt) * depthSpeed;

        let sx = p.x * width;
        let sy = p.y * height + (p.z - 0.5) * height * 0.06;

        if (mouse.active) {
          const dx = sx - mouse.x;
          const dy = sy - mouse.y;
          const dist = Math.hypot(dx, dy);

          if (dist < influenceRadius && dist > 0.5) {
            const falloff = 1 - dist / influenceRadius;
            const push = falloff * falloff * 1.6 * dt;

            vx += (dx / dist) * push * depthSpeed;
            vy += (dy / dist) * push * depthSpeed;
            vx += mouse.vx * 0.016 * falloff * depthSpeed;
            vy += mouse.vy * 0.016 * falloff * depthSpeed;
          }
        }

        p.x += vx / width;
        p.y += vy / height;
        wrapParticle(p);

        sx = p.x * width;
        sy = p.y * height + (p.z - 0.5) * height * 0.06;

        const depthNorm = p.z;
        const alpha = 0.18 + depthNorm * 0.58;
        const pixelSize = depthNorm > 0.78 ? 2 : 1;
        const px = Math.floor(sx);
        const py = Math.floor(sy);

        if (px < -4 || px > width + 4 || py < -4 || py > height + 4) continue;

        ctx.fillStyle = colorFor(p.hue, alpha);
        ctx.fillRect(px, py, pixelSize, pixelSize);
      }

      frameId = requestAnimationFrame(draw);
    };

    const start = () => {
      if (running) return;
      running = true;
      lastTime = 0;
      frameId = requestAnimationFrame(draw);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(frameId);
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    if (!interactionRef) {
      canvas.addEventListener("mouseleave", onMouseLeave);
    }
    document.addEventListener("visibilitychange", onVisibility);

    if (!document.hidden) start();

    return () => {
      stop();
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      if (!interactionRef) {
        canvas.removeEventListener("mouseleave", onMouseLeave);
      }
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reducedMotion, particleCount, interactionRef]);

  if (reducedMotion) {
    return <StaticGreenBackdrop className={className} />;
  }

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 h-full w-full ${className}`.trim()}
      aria-hidden
    />
  );
}

function StaticGreenBackdrop({ className }: { className: string }) {
  return (
    <div
      className={`absolute inset-0 ${className}`.trim()}
      aria-hidden
      style={{
        background: `
          radial-gradient(ellipse 70% 55% at 50% 38%, rgba(51, 126, 47, 0.22), transparent 68%),
          radial-gradient(ellipse 45% 35% at 72% 62%, rgba(107, 160, 102, 0.14), transparent 70%),
          linear-gradient(to bottom, #121816 0%, #101a17 45%, #0d1f16 100%)
        `,
      }}
    />
  );
}
