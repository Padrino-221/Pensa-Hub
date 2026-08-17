import { useState } from 'react';
import { ArrowLeft, ArrowRight, X } from '@phosphor-icons/react';
import { PageHeader } from '../components/landing/PageHeader';
import { useSection } from '../hooks/useSiteSettings';
import { usePageMeta } from '../hooks/usePageMeta';
import { siteDefaults, type MinistryData } from '../data/siteDefaults';
import { ministryIcon } from '../data/ministries';

export function MinistriesPage() {
  usePageMeta(
    'Ministries',
    'Explore the ministries of PENSA-UENR — worship, prayer, outreach, evangelism, and discipleship at UENR, Sunyani.',
    '/ministries',
  );
  const styles = useSection('styles', siteDefaults.styles);
  const showIcon = !!styles.showIcons;
  const data = useSection('ministries', siteDefaults.ministries);
  const list =
    data.ministries && data.ministries.length > 0 ? data.ministries : siteDefaults.ministries.ministries;
  const ministries: (MinistryData & { icon: React.ReactNode })[] =
    list.map((m: MinistryData, i: number) => ({ ...m, icon: ministryIcon(i) }));

  const [selected, setSelected] = useState<number | null>(null);
  const active = selected !== null ? ministries[selected] : null;

  return (
    <>
      <PageHeader
        kicker={data.header?.kicker ?? siteDefaults.ministries.header.kicker}
        title={data.header?.title ?? siteDefaults.ministries.header.title}
        description={data.header?.description ?? siteDefaults.ministries.header.description}
        backgroundImage={data.header?.backgroundImage ?? siteDefaults.ministries.header.backgroundImage}
      />

      <section className="bg-white">
        <div className="mx-auto w-full max-w-[1120px] px-6 md:px-12 py-16 md:py-24">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ministries.map((ministry, i) => (
              <button
                key={ministry.title}
                type="button"
                onClick={() => setSelected(i)}
                className="text-left bg-white border border-ink/15 rounded-[18px] p-6 flex items-start gap-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_-20px_rgba(22,40,158,0.2)] cursor-pointer group"
              >
                <div
                  className="w-[52px] h-[52px] rounded-[14px] bg-royal/12 grid place-items-center text-royal flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                  aria-hidden="true"
                >
                  {ministry.icon}
                </div>
                <div className="min-w-0">
                  <h2 className="mb-1.5 font-display text-[17px] font-extrabold uppercase tracking-[0.03em] text-ink">
                    {ministry.title}
                  </h2>
                  <p className="text-sm text-ink-soft leading-relaxed">{ministry.body}</p>
                </div>
              </button>
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

          <div className="mt-12 bg-ink border border-ink-3 rounded-[18px] px-8 py-10 md:px-12 flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="mb-2 font-display text-[13px] font-extrabold uppercase tracking-[0.16em] text-accent-cream">
                {data.cta?.kicker ?? siteDefaults.ministries.cta.kicker}
              </p>
              <h2 className="font-display font-extrabold text-white text-2xl md:text-3xl leading-tight">
                {data.cta?.title ?? siteDefaults.ministries.cta.title}
              </h2>
            </div>
            <a
              href={data.cta?.href ?? siteDefaults.ministries.cta.href}
              className="btn-primary inline-flex items-center justify-center gap-2 rounded-full bg-accent-cream text-ink px-7 py-3.5 font-display font-extrabold text-[15px] hover:bg-accent-cream-hover transition-colors"
            >
              {showIcon && styles.iconAlignment !== 'right' && <ArrowLeft size={17} weight="bold" />}
              {data.cta?.label ?? siteDefaults.ministries.cta.label}
              {showIcon && styles.iconAlignment === 'right' && <ArrowRight size={17} weight="bold" />}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
