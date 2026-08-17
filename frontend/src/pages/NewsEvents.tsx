import { NavLink } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';
import { PageHeader } from '../components/landing/PageHeader';
import { useSection } from '../hooks/useSiteSettings';
import { usePageMeta } from '../hooks/usePageMeta';
import { siteDefaults, type NewsArticle } from '../data/siteDefaults';

export function NewsEvents() {
  usePageMeta(
    'News & Events',
    'Official PENSA-UENR news and events — announcements, evangelism reports, opportunities and achievements.',
    '/community/news',
  );
  const data = useSection('news', siteDefaults.news);
  const articles: NewsArticle[] =
    data.articles && data.articles.length > 0 ? data.articles : siteDefaults.news.articles;
  const events = data.events && data.events.length > 0 ? data.events : siteDefaults.news.events;
  const header = data.header ?? siteDefaults.news.header;

  return (
    <>
      <PageHeader
        kicker={header.kicker}
        title={header.title}
        description={header.description}
        backgroundImage={header.backgroundImage}
      />

      <section className="bg-white">
        <div className="mx-auto w-full max-w-[1120px] px-6 md:px-12 py-16 md:py-24">
          <div className="grid lg:grid-cols-[1fr_340px] gap-10">
            {/* News articles */}
            <div className="space-y-6">
              {articles.map((item) => (
                <NavLink
                  key={item.title}
                  to={`/community/news/${item.slug}`}
                  className="group block border border-ink/15 rounded-[18px] overflow-hidden hover:border-royal/30 hover:shadow-lg hover:shadow-royal/5 transition-all duration-300"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    width="1200"
                    height="800"
                    loading="lazy"
                    className="block w-full aspect-video object-cover"
                  />
                  <div className="px-6 md:px-8 py-6 md:py-8">
                    <p className="mb-2 font-display text-[12px] font-extrabold uppercase tracking-[0.1em] text-royal">
                      {item.meta}
                    </p>
                    <h2 className="mb-2 font-display font-extrabold text-ink text-xl md:text-2xl leading-tight group-hover:text-royal transition-colors">
                      {item.title}
                    </h2>
                    <p className="text-ink-soft leading-relaxed mb-4">{item.body}</p>
                    <span className="inline-flex items-center gap-1 text-royal font-semibold text-sm">
                      Read more <ArrowRight size={14} weight="bold" />
                    </span>
                  </div>
                </NavLink>
              ))}
            </div>

            {/* Upcoming events sidebar */}
            <aside>
              <div className="sticky top-24">
                <p className="mb-2 font-display text-[13px] font-extrabold uppercase tracking-[0.16em] text-royal">
                  Upcoming events
                </p>
                <h2 className="mb-6 font-display font-extrabold text-ink text-2xl md:text-3xl leading-tight">
                  This week at PENSA-UENR
                </h2>

                <div className="space-y-3">
                  {events.map((event) => (
                    <article
                      key={event.title}
                      className="border border-ink/15 rounded-[14px] px-5 py-5 hover:border-royal/40 transition-colors"
                    >
                      <h3 className="mb-1 font-display font-extrabold text-ink text-base leading-snug">
                        {event.title}
                      </h3>
                      <p className="font-display font-bold text-sm text-royal">{event.meta}</p>
                    </article>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
