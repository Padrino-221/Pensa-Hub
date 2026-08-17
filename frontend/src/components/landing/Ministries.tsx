import { useState } from 'react';
import { X, ArrowRight } from '@phosphor-icons/react';
import { useSection } from '../../hooks/useSiteSettings';
import { siteDefaults, type MinistryData } from '../../data/siteDefaults';
import { ministryIcon } from '../../data/ministries';
import { Reveal } from './Reveal';

export function Ministries() {
  const data = useSection('ministries', siteDefaults.ministries);
  const list =
    data.ministries && data.ministries.length > 0 ? data.ministries : siteDefaults.ministries.ministries;
  const ministries: (MinistryData & { icon: React.ReactNode })[] =
    list.map((m: MinistryData, i: number) => ({ ...m, icon: ministryIcon(i) }));

  const [selected, setSelected] = useState<number | null>(null);
  const active = selected !== null ? ministries[selected] : null;

  return (
    <section id="ministries" className="bg-white">
      <div className="mx-auto w-full max-w-[1120px] px-6 md:px-12 py-16 md:py-24">
        <Reveal from="left">
          <div className="mb-12">
            <p className="mb-4 font-display text-[13px] font-extrabold uppercase tracking-[0.16em] text-royal">
              {data.header?.kicker ?? 'Ministries'}
            </p>
            <h2 className="font-display font-extrabold text-ink text-3xl md:text-4xl leading-tight">
              {data.header?.title ?? 'Grow with us'}
            </h2>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ministries.map((ministry, i) => (
            <Reveal key={ministry.title} from="up" delay={i * 90}>
              <button
                type="button"
                onClick={() => setSelected(i)}
                className="w-full h-full text-left bg-white border border-ink/10 rounded-[18px] p-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_-20px_rgba(22,40,158,0.2)] cursor-pointer group"
              >
                <div
                  className="w-14 h-14 rounded-[14px] bg-royal/10 grid place-items-center text-royal flex-shrink-0 mb-5 transition-transform duration-300 group-hover:scale-110"
                  aria-hidden="true"
                >
                  {ministry.icon}
                </div>
                <h3 className="mb-3 font-display text-lg font-extrabold text-ink">
                  {ministry.title}
                </h3>
                <p className="text-ink-soft leading-relaxed mb-4">{ministry.body}</p>
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-royal">
                  Learn more <ArrowRight size={14} />
                </span>
              </button>
            </Reveal>
          ))}
        </div>

        {/* Ministry Detail Modal */}
        {active && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
            <div className="relative bg-white rounded-[18px] w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-modal-in">
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-ink/10 hover:bg-ink/20 grid place-items-center transition-colors"
                aria-label="Close"
              >
                <X size={20} className="text-ink" />
              </button>

              <div className="grid md:grid-cols-2 gap-0">
                {/* Left: Two landscape photos stacked */}
                <div className="flex flex-col gap-2 p-4">
                  <div className="rounded-[14px] overflow-hidden aspect-[16/9]">
                    <img
                      src={active.image1}
                      alt={`${active.title} photo 1`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="rounded-[14px] overflow-hidden aspect-[16/9]">
                    <img
                      src={active.image2}
                      alt={`${active.title} photo 2`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Right: Ministry info */}
                <div className="p-8 flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-[12px] bg-royal/10 grid place-items-center text-royal shrink-0">
                      {active.icon}
                    </div>
                    <h2 className="font-display font-extrabold text-ink text-2xl md:text-3xl">
                      {active.title}
                    </h2>
                  </div>

                  <p className="text-ink-soft leading-relaxed mb-6">{active.body}</p>

                  <div className="mb-6">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-ink-soft mb-2">Key Activities</p>
                    <ul className="flex flex-wrap gap-2">
                      {active.keyActivities.map((activity) => (
                        <li key={activity} className="text-sm bg-royal/10 text-royal px-3 py-1 rounded-full font-medium">
                          {activity}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-wider text-ink-soft mb-1">Main Leader</p>
                      <p className="font-semibold text-ink">{active.mainLeader}</p>
                    </div>
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-wider text-ink-soft mb-1">Assistant Leader</p>
                      <p className="font-semibold text-ink">{active.assistantLeader}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-wider text-ink-soft mb-1">Meeting Place</p>
                      <p className="font-semibold text-ink">{active.meetingPlace}</p>
                    </div>
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-wider text-ink-soft mb-1">Contact to Join</p>
                      <p className="font-semibold text-ink">{active.contact}</p>
                    </div>
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
