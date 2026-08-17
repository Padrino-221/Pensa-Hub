import { useEffect } from 'react';

const SITE_URL = 'https://pensa-hub.vercel.app';

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Sets the document title, meta description, and canonical URL for the
 * current page (client-side SEO for the SPA).
 */
export function usePageMeta(title: string, description?: string, path = '/') {
  useEffect(() => {
    document.title = title ? `${title} | PENSA-UENR` : 'PENSA-UENR — Pentecost Students & Associates, UENR Sunyani';

    if (description) {
      setMeta('name', 'description', description);
      setMeta('property', 'og:description', description);
      setMeta('name', 'twitter:description', description);
    }
    if (title) {
      setMeta('property', 'og:title', title);
      setMeta('name', 'twitter:title', title);
    }

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `${SITE_URL}${path}`);
  }, [title, description, path]);
}
