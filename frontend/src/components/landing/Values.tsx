import { BookOpen, UsersThree, Heart, Sparkle } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { useSection } from '../../hooks/useSiteSettings';
import { siteDefaults, type CoreValue } from '../../data/siteDefaults';
import { Reveal } from './Reveal';

const VALUE_ICONS: ReactNode[] = [<BookOpen size={24} />, <UsersThree size={24} />, <Heart size={24} />];

export function Values() {
  const data = useSection('values', siteDefaults.values);
  const values: (CoreValue & { icon: ReactNode })[] =
    data.values && data.values.length > 0
      ? data.values.map((v: CoreValue, i: number) => ({ ...v, icon: VALUE_ICONS[i % VALUE_ICONS.length] ?? <Sparkle size={24} /> }))
      : siteDefaults.values.values.map((v, i) => ({ ...v, icon: VALUE_ICONS[i % VALUE_ICONS.length] ?? <Sparkle size={24} /> }));

  return (
    <section className="bg-white">
      <div className="mx-auto w-full max-w-[1120px] px-6 md:px-12 py-16 md:py-24">
        <Reveal from="left">
          <div className="mb-12">
            <p className="mb-4 font-display text-[13px] font-extrabold uppercase tracking-[0.16em] text-royal">
              {data.kicker ?? siteDefaults.values.kicker}
            </p>
            <h2 className="font-display font-extrabold text-ink text-3xl md:text-4xl leading-tight">
              {data.title ?? siteDefaults.values.title}
            </h2>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          {values.map((value, i) => (
            <Reveal key={value.title} from="up" delay={i * 120}>
              <article className="h-full group bg-white border border-ink/10 rounded-[18px] p-8 transition-all duration-300 hover:-translate-y-1.5 hover:border-ink/20">
                <div
                  className="w-14 h-14 rounded-[14px] bg-royal/10 grid place-items-center text-royal flex-shrink-0 mb-5 transition-transform duration-300 group-hover:scale-110"
                  aria-hidden="true"
                >
                  {value.icon}
                </div>
                <h3 className="mb-3 font-display text-lg font-extrabold text-ink">
                  {value.title}
                </h3>
                <p className="text-ink-soft leading-relaxed">{value.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
