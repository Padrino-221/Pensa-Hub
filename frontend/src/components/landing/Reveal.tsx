import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  from?: 'up' | 'left' | 'right' | 'zoom' | 'flip' | 'pop';
  delay?: number;
  className?: string;
}

export function Reveal({ children, from = 'up', delay = 0, className = '' }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -48px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const variantClass =
    from === 'left'
      ? 'reveal-from-left'
      : from === 'right'
        ? 'reveal-from-right'
        : from === 'zoom'
          ? 'reveal-zoom'
          : from === 'flip'
            ? 'reveal-flip'
            : from === 'pop'
              ? 'reveal-pop'
              : '';

  return (
    <div
      ref={ref}
      className={`reveal ${variantClass} ${inView ? 'is-inview' : ''} ${className}`}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}