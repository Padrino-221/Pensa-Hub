import { useEffect, useState } from 'react';
import { siteDefaults } from '../data/siteDefaults';

// Module-level cache so every public section shares a single fetch per session.
let cache: Record<string, unknown> | null = null;
let inflight: Promise<Record<string, unknown>> | null = null;

// Draft overrides written by the site builder. Kept in localStorage (not
// sessionStorage) so every tab — the builder, a Preview tab opened via
// window.open, and already-open site tabs — sees the same draft. This is what
// makes the Preview button show the edited version and lets edits appear
// instantly on the website. Cleared on Save & Publish.
let overrides: Record<string, unknown> = {};
let storedOverrides: Record<string, unknown> | null = null;
const OVERRIDE_KEY = 'puhub_builder_overrides';
const PUBLISH_KEY = 'puhub_settings_published_at';
// Stale drafts (e.g. the browser was closed without saving) expire after an hour.
const OVERRIDE_TTL_MS = 60 * 60 * 1000;

function getStoredOverrides(): Record<string, unknown> {
  if (storedOverrides) return storedOverrides;
  try {
    const raw = localStorage.getItem(OVERRIDE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { ts?: number; data?: Record<string, unknown> };
      if (parsed && parsed.data && typeof parsed.data === 'object') {
        if (!parsed.ts || Date.now() - parsed.ts < OVERRIDE_TTL_MS) {
          storedOverrides = parsed.data;
          return storedOverrides;
        }
        localStorage.removeItem(OVERRIDE_KEY); // stale draft — drop it
      }
    }
  } catch {
    // ignore malformed storage
  }
  storedOverrides = {};
  return storedOverrides;
}

function fetchAllSettings(): Promise<Record<string, unknown>> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = fetch('/api/public/settings')
      .then(async (res) => {
        if (!res.ok) return {};
        const list = (await res.json()) as { section: string; value: string }[];
        const data: Record<string, unknown> = {};
        for (const s of list) {
          try {
            data[s.section] = JSON.parse(s.value);
          } catch {
            // Ignore malformed rows; the section falls back to defaults.
          }
        }
        cache = data;
        return data;
      })
      .catch(() => ({}))
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/** Clears the shared cache so the next load refetches from the API. */
export function clearSiteSettingsCache(): void {
  cache = null;
  inflight = null;
}

/**
 * Broadcasts that settings were published. Open site tabs listen for this via
 * the `storage` event and refetch so Save & Publish is reflected immediately.
 */
export function markSettingsPublished(): void {
  try {
    localStorage.setItem(PUBLISH_KEY, String(Date.now()));
  } catch {
    // ignore storage errors
  }
}

/** Replaces the draft overrides (used by the site builder for live preview). */
export function setSettingsOverrides(next: Record<string, unknown>): void {
  overrides = next;
  storedOverrides = null;
  try {
    localStorage.setItem(OVERRIDE_KEY, JSON.stringify({ ts: Date.now(), data: next }));
  } catch {
    // ignore storage errors
  }
}

/** Clears draft overrides so the site returns to saved/default content. */
export function clearSettingsOverrides(): void {
  overrides = {};
  storedOverrides = null;
  try {
    localStorage.removeItem(OVERRIDE_KEY);
  } catch {
    // ignore storage errors
  }
}

/**
 * Deep-merges saved/overridden section data over the default section shape.
 * - Objects merge recursively (saved keys win, default keys fill gaps).
 * - Arrays merge item-by-item against the default item at the same index
 *   (empty saved arrays fall back to the defaults entirely).
 * - Scalars: the saved value wins only when its type matches the default;
 *   otherwise the default wins (stale/old-formatted data can't break the site).
 */
export function mergeSectionWithDefault(
  saved: unknown,
  def: unknown,
): unknown {
  if (saved === undefined || saved === null) return def;
  if (Array.isArray(def)) {
    if (!Array.isArray(saved)) return def;
    if (saved.length === 0) return def;
    return saved.map((item, i) => mergeSectionWithDefault(item, def[i] ?? def[0] ?? {}));
  }
  if (def && typeof def === 'object') {
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return def;
    const out: Record<string, unknown> = { ...(def as Record<string, unknown>) };
    for (const key of Object.keys(saved as Record<string, unknown>)) {
      if (key in out) {
        out[key] = mergeSectionWithDefault((saved as Record<string, unknown>)[key], out[key]);
      } else {
        out[key] = (saved as Record<string, unknown>)[key];
      }
    }
    return out;
  }
  // Scalars: keep the saved value only if it's the same kind as the default,
  // with lenient number/string coercion (forms that save numbers as text, e.g.
  // stats values, still apply instead of silently falling back to the default).
  if (typeof saved === typeof def) return saved;
  if (typeof def === 'number' && typeof saved === 'string' && saved.trim() !== '' && !Number.isNaN(Number(saved))) {
    return Number(saved);
  }
  if (typeof def === 'string' && typeof saved === 'number') return String(saved);
  return def;
}

function resolveSection(section: string): Record<string, unknown> {
  const def = ((siteDefaults as Record<string, unknown>)[section] as Record<string, unknown> | undefined) ?? {};
  if (overrides[section]) return mergeSectionWithDefault(overrides[section], def) as Record<string, unknown>;
  const stored = getStoredOverrides();
  if (stored[section]) return mergeSectionWithDefault(stored[section], def) as Record<string, unknown>;
  if (cache && cache[section]) return mergeSectionWithDefault(cache[section], def) as Record<string, unknown>;
  return def;
}

export interface SiteSettings {
  /** Returns the saved value for a section, falling back to the built-in default. */
  get: (section: string) => Record<string, unknown>;
}

export function useSiteSettings(): SiteSettings {
  const [, setTick] = useState(0);

  useEffect(() => {
    // Re-render once saved settings arrive (and after any refetch) so the
    // published content actually renders instead of staying on defaults.
    fetchAllSettings().then(() => setTick((n) => n + 1));

    // React to draft/publish changes made in other tabs (the site builder).
    const handler = (e: StorageEvent) => {
      if (e.key === OVERRIDE_KEY) {
        // Drafts changed/cleared elsewhere — re-read and re-render live.
        storedOverrides = null;
        setTick((n) => n + 1);
      } else if (e.key === PUBLISH_KEY) {
        // Settings were published — drop the stale cache and refetch.
        clearSiteSettingsCache();
        setTick((n) => n + 1);
        fetchAllSettings().then(() => setTick((n) => n + 1));
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const get = (section: string): Record<string, unknown> => resolveSection(section);

  return { get };
}

/**
 * Convenience hook: returns the saved value for a section (or the fallback),
 * typed as T. Use with a section key from `siteDefaults`.
 */
export function useSection<T>(section: string, fallback: T): T {
  const { get } = useSiteSettings();
  return (get(section) as unknown as T) ?? fallback;
}
