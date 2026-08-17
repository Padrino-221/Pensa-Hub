import { useState } from 'react';
import { X, Link as LinkIcon } from '@phosphor-icons/react';
import { PageHeader } from '../components/landing/PageHeader';
import { useSection } from '../hooks/useSiteSettings';
import { siteDefaults, type LeadershipGroup } from '../data/siteDefaults';

const GROUP_STYLES = [
  { accent: 'border-accent-red', iconBg: 'bg-accent-red/10 text-accent-red' },
  { accent: 'border-royal', iconBg: 'bg-royal/10 text-royal' },
  { accent: 'border-accent-cream', iconBg: 'bg-accent-cream/30 text-ink' },
];

export function Leadership() {
  const data = useSection('leadership', siteDefaults.leadership);
  const groups: (LeadershipGroup & { accent: string; iconBg: string })[] =
    (data.groups && data.groups.length > 0 ? data.groups : siteDefaults.leadership.groups).map(
      (g: LeadershipGroup, i: number) => ({
        ...g,
        ...GROUP_STYLES[i % GROUP_STYLES.length],
      }),
    );

  const [selected, setSelected] = useState<{ groupIdx: number; memberIdx: number } | null>(null);
  const active = selected
    ? groups[selected.groupIdx].members[selected.memberIdx]
    : null;

  return (
    <main>
      <PageHeader
        kicker={data.header?.kicker ?? siteDefaults.leadership.header.kicker}
        title={data.header?.title ?? siteDefaults.leadership.header.title}
        description={data.header?.description ?? siteDefaults.leadership.header.description}
        backgroundImage={data.header?.backgroundImage ?? siteDefaults.leadership.header.backgroundImage}
      />

      <section className="bg-[#f8faff] px-6 md:px-12 py-16 md:py-24">
        <div className="mx-auto max-w-[1120px] space-y-14">
          {groups.map((group, groupIdx) => (
            <div key={`${group.title}-${groupIdx}`}>
              <div className={`border-l-4 ${group.accent} pl-5 mb-6`}>
                <h2 className="font-display font-extrabold text-ink text-2xl md:text-3xl mb-1">
                  {group.title}
                </h2>
                <p className="text-ink-soft text-sm">{group.description}</p>
              </div>

              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-5">
                {group.members.map((member, memberIdx) => (
                  <article
                    key={member.role + memberIdx}
                    className="group h-full bg-white border border-ink/10 rounded-[20px] overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-ink/20"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden px-3 pt-3 pb-0">
                      <img
                        src={member.photo}
                        alt={member.role}
                        className="w-full h-full object-cover object-top rounded-t-[12px]"
                      />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display text-base font-extrabold text-ink">{member.role}</h3>
                        <svg className="w-4 h-4 text-royal shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-sm text-ink-soft mb-4">{member.name}</p>
                      <button
                        type="button"
                        onClick={() => setSelected({ groupIdx, memberIdx })}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-[12px] bg-ink text-white px-5 py-2.5 font-display font-bold text-sm hover:bg-royal transition-colors cursor-pointer"
                      >
                        <LinkIcon size={16} />
                        Connect
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {active && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative bg-white rounded-[20px] w-full max-w-md p-8 animate-modal-in">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-ink/10 hover:bg-ink/20 grid place-items-center transition-colors"
              aria-label="Close"
            >
              <X size={20} className="text-ink" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <img
                src={active.photo}
                alt={active.role}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h2 className="font-display font-extrabold text-ink text-xl">{active.name}</h2>
                <p className="text-sm font-bold uppercase tracking-wider text-royal">{active.role}</p>
              </div>
            </div>

            <p className="text-ink-soft leading-relaxed">
              Profile information will be updated once confirmed by the leadership team.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
