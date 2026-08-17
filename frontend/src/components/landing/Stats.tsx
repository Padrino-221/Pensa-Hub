import { useEffect, useRef, useState } from 'react';
import { useSection } from '../../hooks/useSiteSettings';
import { siteDefaults, type StatItem } from '../../data/siteDefaults';
import { Reveal } from './Reveal';

function StatValue({ value, suffix, className = 'text-white' }: { value: number; suffix: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(value);
      return;
    }
    const duration = 1600;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(value * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, value]);

  return (
    <span
      ref={ref}
      className={`block font-display text-3xl md:text-4xl font-extrabold tabular-nums ${className}`}
    >
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export function Stats() {
  const data = useSection('stats', siteDefaults.stats);
  const stats: StatItem[] = data.items && data.items.length > 0 ? data.items : siteDefaults.stats.items;

  return (
    <section className="relative bg-ink-2 overflow-hidden">
      <svg className="absolute inset-0 w-full h-full opacity-[0.07]" aria-hidden="true">
        <defs>
          <pattern id="poly-stats" width="40" height="40" patternUnits="userSpaceOnUse">
            <polygon points="20,0 40,20 20,40 0,20" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#poly-stats)" />
      </svg>
      <div className="mx-auto w-full max-w-[1120px] px-6 md:px-12 py-12 grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Reveal
            key={stat.label}
            from="up"
            delay={i * 100}
            className={`text-center border rounded-[18px] p-6 transition-all duration-300 hover:-translate-y-1 ${
              i === 0
                ? 'bg-white border-ink/15 hover:border-ink/30'
                : 'border-white/10 bg-ink-3 hover:border-white/25'
            }`}
          >
            <StatValue value={Number(stat.value)} suffix={stat.suffix} className={i === 0 ? 'text-ink' : 'text-white'} />
            <span className={`mt-2 block text-xs font-extrabold uppercase tracking-[0.08em] ${
              i === 0 ? 'text-royal' : 'text-muted-blue'
            }`}>
              {stat.label}
            </span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
