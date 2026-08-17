import { PageHeader } from '../components/landing/PageHeader';
import { Values } from '../components/landing/Values';
import { useSection } from '../hooks/useSiteSettings';
import { siteDefaults } from '../data/siteDefaults';

export function About() {
  const data = useSection('about', siteDefaults.about);
  const story = data.story && data.story.length > 0 ? data.story : siteDefaults.about.story;
  const timeline =
    data.timeline && data.timeline.length > 0 ? data.timeline : siteDefaults.about.timeline;
  const faithIntro = data.faithIntro ?? siteDefaults.about.faithIntro;
  const faithPoints =
    data.faithPoints && data.faithPoints.length > 0 ? data.faithPoints : siteDefaults.about.faithPoints;

  return (
    <>
      <PageHeader
        kicker={data.kicker}
        title={data.title}
        description={data.description || undefined}
        backgroundImage={data.backgroundImage}
      />

      <section className="bg-white">
        <div className="mx-auto w-full max-w-[1120px] px-6 md:px-12 py-16 md:py-24 grid md:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
          <div>
            <p className="mb-4 font-display text-[13px] font-extrabold uppercase tracking-[0.16em] text-royal">
              Who we are
            </p>
            <h2 className="mb-5 font-display font-extrabold text-ink text-3xl md:text-4xl leading-tight">
              Basically disciples on campus
            </h2>
            {story.map((paragraph: string, i: number) => (
              <p key={i} className={i === 0 ? 'mb-4 text-ink-soft' : 'text-ink-soft'}>
                {paragraph}
              </p>
            ))}
          </div>

          <div>
            <img
              src={data.image}
              alt="Members serving together"
              width="1200"
              height="800"
              className="block w-full aspect-[4/3] object-cover border-2 border-ink/10 rounded-[18px]"
            />
          </div>
        </div>
      </section>

      <section id="history" className="relative bg-ink border-y border-white/10 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-[0.07]" aria-hidden="true">
          <defs>
            <pattern id="poly-history" width="40" height="40" patternUnits="userSpaceOnUse">
              <polygon points="20,0 40,20 20,40 0,20" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#poly-history)" />
        </svg>
        <div className="relative mx-auto w-full max-w-[1120px] px-6 md:px-12 py-16 md:py-24">
          <div className="mb-10">
            <p className="mb-4 font-display text-[13px] font-extrabold uppercase tracking-[0.16em] text-accent-cream">
              Our history
            </p>
            <h2 className="font-display font-extrabold text-white text-3xl md:text-4xl leading-tight">
              Documenting God's faithfulness
            </h2>
          </div>

          <div className="border-l border-white/20 pl-6 md:pl-10 space-y-8">
            {timeline.map((item) => (
              <div key={item.year} className="relative">
                <span className="absolute -left-[31px] md:-left-[45px] top-1.5 w-3 h-3 rounded-full bg-accent-cream" aria-hidden="true" />
                <h3 className="mb-1.5 font-display font-extrabold text-lg text-accent-cream">{item.year}</h3>
                <p className="text-muted-blue max-w-[72ch] leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto w-full max-w-[1120px] px-6 md:px-12 py-16 md:py-20">
          <div className="mb-10">
            <p className="mb-4 font-display text-[13px] font-extrabold uppercase tracking-[0.16em] text-royal">
              Vision &amp; mission
            </p>
            <h2 className="font-display font-extrabold text-ink text-3xl md:text-4xl leading-tight">
              Where we are going
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <article className="bg-ink border border-ink-3 rounded-[18px] p-8">
              <p className="mb-2 font-display text-[13px] font-extrabold uppercase tracking-[0.16em] text-accent-cream">
                Our vision
              </p>
              <p className="text-white/80 leading-relaxed">{data.vision}</p>
            </article>
            <article className="bg-ink border border-ink-3 rounded-[18px] p-8">
              <p className="mb-2 font-display text-[13px] font-extrabold uppercase tracking-[0.16em] text-accent-cream">
                Our mission
              </p>
              <p className="text-white/80 leading-relaxed">{data.mission}</p>
            </article>
          </div>
        </div>
      </section>

      <Values />

      <section className="relative bg-ink border-y border-white/10 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-[0.07]" aria-hidden="true">
          <defs>
            <pattern id="poly-faith" width="40" height="40" patternUnits="userSpaceOnUse">
              <polygon points="20,0 40,20 20,40 0,20" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#poly-faith)" />
        </svg>
        <div className="relative mx-auto w-full max-w-[1120px] px-6 md:px-12 py-16 md:py-24">
          <div className="mb-10">
            <p className="mb-4 font-display text-[13px] font-extrabold uppercase tracking-[0.16em] text-accent-cream">
              Statement of faith
            </p>
            <h2 className="font-display font-extrabold text-white text-3xl md:text-4xl leading-tight">
              What we believe
            </h2>
          </div>

          <div className="bg-ink-2 border border-white/15 rounded-[18px] p-8 md:p-10">
            <p className="mb-6 text-muted-blue leading-relaxed">{faithIntro}</p>
            <ul className="space-y-3.5">
              {faithPoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-white/85 leading-relaxed">
                  <span className="mt-2 w-2 h-2 rounded-full bg-accent-cream flex-shrink-0" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}