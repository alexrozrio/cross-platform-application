import React, { useEffect, useRef } from "react";

const COLORS = [
  "#f43f5e", "#ec4899", "#a855f7", "#6366f1",
  "#3b82f6", "#06b6d4", "#10b981", "#f59e0b",
  "#ef4444", "#84cc16", "#fb923c", "#e879f9",
];

type Shape = "rect" | "circle" | "ribbon";

interface Particle {
  id: number;
  x: number;
  color: string;
  size: number;
  duration: number;
  delay: number;
  rotation: number;
  rotationSpeed: number;
  shape: Shape;
  swayAmp: number;
  swayFreq: number;
}

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: randomBetween(0, 100),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: randomBetween(6, 14),
    duration: randomBetween(2.2, 4.5),
    delay: randomBetween(0, 1.6),
    rotation: randomBetween(0, 360),
    rotationSpeed: randomBetween(-720, 720),
    shape: (["rect", "circle", "ribbon"] as Shape[])[Math.floor(Math.random() * 3)],
    swayAmp: randomBetween(20, 60),
    swayFreq: randomBetween(1.5, 3.5),
  }));
}

interface ConfettiProps {
  count?: number;
}

export function Confetti({ count = 90 }: ConfettiProps) {
  const particles = useRef<Particle[]>(generateParticles(count));

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[200] overflow-hidden"
    >
      {particles.current.map((p) => (
        <ConfettiPiece key={p.id} particle={p} />
      ))}
    </div>
  );
}

function ConfettiPiece({ particle: p }: { particle: Particle }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const startX = (p.x / 100) * window.innerWidth;
    let startTime: number | null = null;
    let raf: number;

    const delayMs = p.delay * 1000;
    const durationMs = p.duration * 1000;

    function animate(ts: number) {
      if (!el) return;
      if (startTime === null) {
        startTime = ts;
      }
      const elapsed = ts - startTime - delayMs;
      if (elapsed < 0) {
        raf = requestAnimationFrame(animate);
        return;
      }
      const t = Math.min(elapsed / durationMs, 1);
      const y = t * (window.innerHeight + 40) - 20;
      const sway = Math.sin(t * Math.PI * p.swayFreq) * p.swayAmp;
      const rot = p.rotation + t * p.rotationSpeed;
      const opacity = t < 0.1 ? t / 0.1 : t > 0.85 ? (1 - t) / 0.15 : 1;

      el.style.transform = `translate(${startX + sway}px, ${y}px) rotate(${rot}deg)`;
      el.style.opacity = String(opacity);

      if (t < 1) {
        raf = requestAnimationFrame(animate);
      } else {
        el.style.display = "none";
      }
    }

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [p]);

  const shapeStyle: React.CSSProperties =
    p.shape === "circle"
      ? { borderRadius: "50%", width: p.size, height: p.size }
      : p.shape === "ribbon"
      ? { borderRadius: "1px", width: p.size * 0.35, height: p.size * 1.8 }
      : { borderRadius: "2px", width: p.size, height: p.size * 0.55 };

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        backgroundColor: p.color,
        willChange: "transform, opacity",
        opacity: 0,
        ...shapeStyle,
      }}
    />
  );
}
