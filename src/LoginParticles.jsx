import { useEffect, useRef } from "react";

export default function LoginParticles() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const sizeRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const parent = canvas.parentElement;
    if (!ctx || !parent) return;

    const N = 64;
    const repulseR = 130;

    const syncCanvas = () => {
      const w = parent.clientWidth || 400;
      const h = parent.clientHeight || 400;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { w, h };
      return { w, h };
    };

    const initParticles = (w, h) => {
      particlesRef.current = Array.from({ length: N }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.55,
        vy: (Math.random() - 0.5) * 0.55,
        r: 0.9 + Math.random() * 2.6,
        a: 0.22 + Math.random() * 0.42,
      }));
    };

    syncCanvas();
    initParticles(sizeRef.current.w, sizeRef.current.h);

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    let rafId = 0;
    const loop = () => {
      const cw = parent.clientWidth || 400;
      const ch = parent.clientHeight || 400;
      if (cw !== sizeRef.current.w || ch !== sizeRef.current.h) {
        syncCanvas();
        initParticles(sizeRef.current.w, sizeRef.current.h);
      }
      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) {
          p.vx *= -1;
          p.x = Math.max(0, Math.min(w, p.x));
        }
        if (p.y < 0 || p.y > h) {
          p.vy *= -1;
          p.y = Math.max(0, Math.min(h, p.y));
        }
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (dist < repulseR) {
          const t = ((repulseR - dist) / repulseR) ** 1.15;
          p.x += (dx / dist) * t * 3.5;
          p.y += (dy / dist) * t * 3.5;
        }
        ctx.beginPath();
        ctx.fillStyle = `rgba(147, 197, 253, ${p.a})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    const ro = new ResizeObserver(() => {
      syncCanvas();
      initParticles(sizeRef.current.w, sizeRef.current.h);
    });
    ro.observe(parent);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
