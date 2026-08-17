import { useState } from 'react';
import { X, Link as LinkIcon } from '@phosphor-icons/react';
import { useSection } from '../../hooks/useSiteSettings';
import { siteDefaults, type Leader } from '../../data/siteDefaults';
import { Reveal } from './Reveal';

export function Leadership() {
  const data = useSection('leadership_preview', siteDefaults.leadership_preview);
  const leaders: Leader[] =
    data.leaders && data.leaders.length > 0 ? data.leaders : siteDefaults.leadership_preview.leaders;

  const [selected, setSelected] = useState<number | null>(null);
  const active = selected !== null ? leaders[selected] : null;

  return (
    <section id="leadership" className="relative bg-ink overflow-hidden">
      <svg className="absolute inset-0 w-full h-full opacity-[0.07]" aria-hidden="true">
        <defs>
          <pattern id="poly-leadership" width="44" height="44" patternUnits="userSpaceOnUse">
            <polygon points="22,0 44,22 22,44 0,22" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#poly-leadership)" />
      </svg>
      <div className="mx-auto w-full max-w-[1120px] px-6 md:px-12 py-16 md:py-24">
        <Reveal from="left">
          <div className="flex items-end justify-between gap-4 flex-wrap mb-12">
            <div>
              <p className="mb-4 font-display text-[13px] font-extrabold uppercase tracking-[0.16em] text-accent-cream">
                {data.kicker ?? siteDefaults.leadership_preview.kicker}
              </p>
              <h2 className="font-display font-extrabold text-white text-3xl md:text-4xl leading-tight">
                {data.title ?? siteDefaults.leadership_preview.title}
              </h2>
            </div>
            <a
              href="/about#leadership"
              className="inline-flex items-center justify-center rounded-full border-2 border-white/30 text-white px-6 py-3 font-display font-extrabold text-sm hover:bg-white/10 hover:border-accent-cream transition-colors"
            >
              All Leaders
            </a>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          {leaders.map((leader, i) => (
            <Reveal key={leader.name} from="up" delay={i * 120}>
              <article className="group h-full bg-white rounded-[20px] overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)]">
                <div className="relative aspect-[4/3] overflow-hidden px-3 pt-3 pb-0">
                  <img src={leader.photo} alt={leader.role} className="w-full h-full object-cover object-top rounded-t-[12px]" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display text-lg font-extrabold text-ink">{leader.role}</h3>
                    <svg className="w-5 h-5 text-royal shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm text-ink-soft mb-5">{leader.name}</p>
                  <button
                    type="button"
                    onClick={() => setSelected(i)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-[12px] bg-ink text-white px-5 py-3 font-display font-bold text-sm hover:bg-royal transition-colors cursor-pointer"
                  >
                    <LinkIcon size={16} />
                    Connect
                  </button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Connect Modal */}
        {active && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
            <div className="relative bg-white rounded-[20px] w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-modal-in">
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-ink/10 hover:bg-ink/20 grid place-items-center transition-colors"
                aria-label="Close"
              >
                <X size={20} className="text-ink" />
              </button>

              <div className="grid md:grid-cols-[260px_1fr] gap-0">
                {/* Left: Photo */}
                <div className="relative overflow-hidden rounded-t-[20px] md:rounded-l-[20px] md:rounded-tr-none min-h-[280px]">
                  <img src={active.photo} alt={active.role} className="absolute inset-0 w-full h-full object-cover" />
                </div>

                {/* Right: Info */}
                <div className="p-8">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-display font-extrabold text-ink text-2xl">{active.name}</h2>
                    <svg className="w-5 h-5 text-royal shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="mb-6 text-sm font-bold uppercase tracking-wider text-royal">{active.role}</p>

                  <div className="mb-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-ink-soft mb-2">Profile</p>
                    <p className="text-ink-soft leading-relaxed">{active.profile}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-ink-soft mb-2">Favourite Quote</p>
                    <p className="font-display italic text-ink font-semibold">{active.favoriteQuote}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
