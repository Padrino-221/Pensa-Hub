import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import { useSection } from '../../hooks/useSiteSettings';
import { siteDefaults, type HeroSlide } from '../../data/siteDefaults';

export function Hero() {
  const data = useSection('hero', siteDefaults.hero);
  const slides: HeroSlide[] =
    data.slides && data.slides.length > 0 ? data.slides : siteDefaults.hero.slides;
  const motion = useSection('motion', siteDefaults.motion);
  const styles = useSection('styles', siteDefaults.styles);
  const showIcon = !!styles.showIcons;

  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % Math.max(slides.length, 1));
  }, [slides.length]);

  useEffect(() => {
    // Respect the Motion > auto-play carousels setting.
    if (paused || !motion.autoPlayCarousels) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, paused, motion.autoPlayCarousels]);

  const slide = slides[current % Math.max(slides.length, 1)];

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-ink"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background images */}
      {slides.map((s, i) => (
        <img
          key={s.image}
          src={s.image}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            i === current ? 'opacity-45' : 'opacity-0'
          }`}
        />
      ))}

      {/* Gradient overlay — darker on the left to keep text readable,
          gradually more transparent toward the right so the image pops */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(15,29,110,0.92) 0%, rgba(22,40,158,0.85) 25%, rgba(22,40,158,0.65) 50%, rgba(22,40,158,0.35) 75%, rgba(22,40,158,0.10) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative mx-auto w-full max-w-[1120px] px-6 md:px-12 py-20 md:py-32">
        <div key={current} className="animate-t-fade">
          <p className="mb-4 font-display text-[13px] font-extrabold uppercase tracking-[0.16em] text-accent-cream">
            {slide.kicker}
          </p>

          <h1 className="mb-6 font-display font-extrabold text-white text-4xl md:text-5xl lg:text-6xl leading-[1.08] tracking-tight max-w-[900px]">
            {slide.title[0]}{' '}
            <span className="text-accent-cream">{slide.titleAccent}</span>
          </h1>

          <p className="mb-8 text-white/70 text-lg max-w-[52ch] leading-relaxed">
            {slide.description}
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href={slide.cta.href}
              className="btn-primary inline-flex items-center justify-center gap-2 rounded-full bg-accent-cream text-ink px-8 py-3.5 font-display font-extrabold text-[15px] hover:bg-accent-cream-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              {showIcon && styles.iconAlignment !== 'right' && <ArrowLeft size={18} weight="bold" />}
              {slide.cta.label}
              {showIcon && styles.iconAlignment === 'right' && <ArrowRight size={18} weight="bold" />}
            </a>
            <a
              href={slide.ctaSecondary.href}
              className="inline-flex items-center justify-center rounded-full border-2 border-white/30 text-white px-8 py-3.5 font-display font-extrabold text-[15px] hover:bg-white/10 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              {slide.ctaSecondary.label}
            </a>
          </div>
        </div>

        {/* Dots */}
        <div className="flex gap-2 mt-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? 'w-8 bg-accent-cream' : 'w-2 bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
