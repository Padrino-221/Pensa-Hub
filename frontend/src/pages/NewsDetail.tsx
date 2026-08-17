import { useParams, NavLink } from 'react-router-dom';
import { ArrowLeft } from '@phosphor-icons/react';
import { useSection } from '../hooks/useSiteSettings';
import { usePageMeta } from '../hooks/usePageMeta';
import { siteDefaults, type NewsArticle } from '../data/siteDefaults';

export function NewsDetail() {
  const { slug } = useParams<{ slug: string }>();
  const data = useSection('news', siteDefaults.news);
  const articles: NewsArticle[] =
    data.articles && data.articles.length > 0 ? data.articles : siteDefaults.news.articles;
  const article = articles.find((item) => item.slug === slug);

  usePageMeta(
    article?.title || 'News',
    article?.body?.slice(0, 155) || 'News article from PENSA-UENR.',
    `/community/news/${slug ?? ''}`,
  );

  if (!article) {
    return (
      <main className="bg-[#f8faff] px-6 md:px-12 py-16 md:py-24">
        <div className="mx-auto max-w-[720px] text-center">
          <h1 className="font-display font-extrabold text-ink text-3xl mb-4">Article not found</h1>
          <p className="text-ink-soft mb-8">The news article you are looking for does not exist.</p>
          <NavLink
            to="/community/news"
            className="inline-flex items-center gap-2 text-royal font-semibold hover:underline"
          >
            <ArrowLeft size={18} /> Back to News & Events
          </NavLink>
        </div>
      </main>
    );
  }

  return (
    <main>
      {/* Hero image */}
      <section className="relative bg-ink overflow-hidden">
        <img
          src={article.image}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(180deg, rgba(22,40,158,0.55) 0%, rgba(22,40,158,0.7) 100%)',
          }}
        />
        <div className="relative mx-auto w-full max-w-[1120px] px-6 md:px-12 py-16 md:py-24">
          <p className="mb-4 font-display text-[13px] font-extrabold uppercase tracking-[0.16em] text-accent-cream">
            {article.meta}
          </p>
          <h1 className="font-display font-extrabold text-white text-4xl md:text-5xl leading-tight tracking-tight">
            {article.title}
          </h1>
        </div>
      </section>

      {/* Article content */}
      <section className="bg-white px-6 md:px-12 py-12 md:py-16">
        <div className="mx-auto max-w-[720px]">
          <NavLink
            to="/community/news"
            className="inline-flex items-center gap-2 text-royal font-semibold text-sm hover:underline mb-10"
          >
            <ArrowLeft size={16} /> Back to News & Events
          </NavLink>

          <div className="space-y-5">
            {(article.content ?? [article.body]).map((paragraph, i) => (
              <p key={i} className="text-ink-soft leading-relaxed text-[15px] md:text-base">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
