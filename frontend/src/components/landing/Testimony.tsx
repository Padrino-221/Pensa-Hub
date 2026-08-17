import { useEffect, useState } from 'react';
import { useSection } from '../../hooks/useSiteSettings';
import { siteDefaults, type Testimony as TestimonyItem } from '../../data/siteDefaults';
import { Reveal } from './Reveal';

export function Testimony() {
  const data = useSection('testimonies', siteDefaults.testimonies);
  const testimonies: TestimonyItem[] =
    data.testimonies && data.testimonies.length > 0 ? data.testimonies : siteDefaults.testimonies.testimonies;

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % Math.max(testimonies.length, 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [testimonies.length]);

  return (
    <section className="bg-white">
      <div className="mx-auto w-full max-w-[1120px] px-6 md:px-12 py-16 md:py-24">
        <Reveal from="up">
          <div className="text-center mb-10">
            <p className="mb-4 font-display text-[13px] font-extrabold uppercase tracking-[0.16em] text-royal">
              {data.kicker ?? siteDefaults.testimonies.kicker}
            </p>
            <h2 className="font-display font-extrabold text-ink text-3xl md:text-4xl leading-tight">
              {data.title ?? siteDefaults.testimonies.title}
            </h2>
          </div>
        </Reveal>

        <Reveal from="up" delay={120}>
          <div className="relative max-w-[780px] mx-auto bg-royal rounded-[2rem] px-8 py-10 md:px-14 md:py-14">
            {testimonies.map((testimony, i) => (
              <blockquote
                key={testimony.cite}
                className={`m-0 text-center ${i === current ? 'block animate-t-slide motion-reduce:animate-none' : 'hidden'}`}
              >
                <p className="mx-auto mb-6 max-w-[60ch] font-display text-xl md:text-2xl font-bold leading-relaxed text-white">
                  &ldquo;{testimony.quote}&rdquo;
                </p>
                <cite className="font-display not-italic font-extrabold text-sm text-accent-cream">
                  {testimony.cite}
                </cite>
              </blockquote>
            ))}

            <div className="flex justify-center gap-2 mt-8">
              {testimonies.map((testimony, i) => (
                <button
                  key={testimony.cite}
                  type="button"
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to testimony ${i + 1}`}
                  className={`w-2.5 h-2.5 rounded-full border-none p-0 cursor-pointer transition-all duration-150 ${
                    i === current ? 'bg-accent-cream scale-125' : 'bg-white/30 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
