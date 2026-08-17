import { useSection } from '../../hooks/useSiteSettings';
import { siteDefaults } from '../../data/siteDefaults';
import { Reveal } from './Reveal';

export function WhoWeAre() {
  const data = useSection('who_we_are', siteDefaults.who_we_are);

  return (
    <section id="about" className="bg-white">
      <div className="mx-auto w-full max-w-[1120px] px-6 md:px-12 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <Reveal from="left">
          <p className="mb-4 font-display text-[13px] font-extrabold uppercase tracking-[0.16em] text-royal">
            {data.kicker}
          </p>
          <h2 className="mb-6 font-display font-extrabold text-ink text-3xl md:text-4xl leading-tight">
            {data.title}
          </h2>
          <p className="mb-8 text-ink-soft leading-relaxed max-w-[52ch]">
            {data.body}
          </p>
          <a
            href="/about"
            className="inline-flex items-center justify-center rounded-full bg-royal text-white px-7 py-3.5 font-display font-extrabold text-[15px] hover:bg-royal-400 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            Read Our Story
          </a>
        </Reveal>

        <Reveal from="right" delay={150}>
          <div className="relative rounded-[2rem] overflow-hidden aspect-[4/3]">
            <img
              src={data.image}
              alt="Members serving together"
              className="w-full h-full object-cover"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
