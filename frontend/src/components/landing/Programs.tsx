import { useSection } from '../../hooks/useSiteSettings';
import { siteDefaults, type Program } from '../../data/siteDefaults';
import { Reveal } from './Reveal';

export function Programs() {
  const data = useSection('programs', siteDefaults.programs);
  const programs: Program[] =
    data.programs && data.programs.length > 0 ? data.programs : siteDefaults.programs.programs;
  const slides = [...programs, ...programs];

  return (
    <section id="programs" className="relative bg-ink overflow-hidden pb-12 md:pb-20">
      <svg className="absolute inset-0 w-full h-full opacity-[0.07]" aria-hidden="true">
        <defs>
          <pattern id="poly-programs" width="48" height="48" patternUnits="userSpaceOnUse">
            <polygon points="24,0 48,24 24,48 0,24" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#poly-programs)" />
      </svg>
      <div className="mx-auto w-full max-w-[1120px] px-6 md:px-12 pt-16 md:pt-24 pb-4">
        <Reveal from="left">
          <div className="mb-12">
            <p className="mb-4 font-display text-[13px] font-extrabold uppercase tracking-[0.16em] text-accent-cream">
              {data.kicker ?? siteDefaults.programs.kicker}
            </p>
            <h2 className="font-display font-extrabold text-white text-3xl md:text-4xl leading-tight">
              {data.title ?? siteDefaults.programs.title}
            </h2>
          </div>
        </Reveal>
      </div>

      <Reveal from="up" delay={120}>
        <div className="relative group">
          <div className="overflow-hidden">
            <div className="flex w-max animate-l-scroll motion-reduce:animate-none group-hover:[animation-play-state:paused]">
              {slides.map((program, i) => (
                <figure key={`${program.title}-${i}`} className="flex-none w-[320px] max-md:w-[280px] p-3">
                  <div className="h-full bg-ink-2 border border-white/10 rounded-[18px] overflow-hidden transition-transform duration-300 hover:scale-[1.03]">
                    <div className="overflow-hidden">
                      <img
                        src={program.image}
                        alt={program.title}
                        loading="lazy"
                        className="block w-full aspect-video object-cover"
                      />
                    </div>
                    <figcaption className="px-5 py-4">
                      <h3 className="font-display font-extrabold text-white text-lg">{program.title}</h3>
                      <p className="mt-1 text-sm font-bold text-accent-cream">{program.meta}</p>
                    </figcaption>
                  </div>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
