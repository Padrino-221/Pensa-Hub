import { siteDefaults } from '../data/siteDefaults';

export interface ThemeSections {
  colors?: Record<string, unknown>;
  fonts?: Record<string, unknown>;
  styles?: Record<string, unknown>;
  motion?: Record<string, unknown>;
}

/** Builds the CSS variable override block from settings sections (defaults applied for gaps). */
export function buildThemeCss(sections: ThemeSections): string {
  const colors = (sections.colors ?? siteDefaults.colors) as typeof siteDefaults.colors;
  const fonts = (sections.fonts ?? siteDefaults.fonts) as typeof siteDefaults.fonts;
  const styles = (sections.styles ?? siteDefaults.styles) as typeof siteDefaults.styles;
  const motion = (sections.motion ?? siteDefaults.motion) as typeof siteDefaults.motion;

  const radius = Number(styles.cornerRadius) || 16;
  const radiusVars: Record<string, string> = {
    '--radius-sm': `${Math.round(radius * 0.4)}px`,
    '--radius-md': `${Math.round(radius * 0.6)}px`,
    '--radius-lg': `${Math.round(radius * 0.8)}px`,
    '--radius-xl': `${radius}px`,
    '--radius-2xl': `${Math.round(radius * 1.3)}px`,
  };

  const parts: string[] = [];
  const root: string[] = [
    `--color-royal:${colors.primary};`,
    `--color-ink:${colors.primary};`,
    `--color-ink-2:${colors.primaryDark};`,
    `--color-ink-3:${colors.primaryDark};`,
    `--color-royal-400:${colors.primaryLight};`,
    `--color-primary:${colors.primary};`,
    `--color-primary-light:${colors.primaryLight};`,
    `--color-primary-lighter:${colors.primaryLight};`,
    `--color-accent:${colors.accent};`,
    `--color-accent-cream:${colors.accentCream};`,
    `--color-accent-cream-hover:${colors.accentCream};`,
    `--color-surface:${colors.surface};`,
    `--color-text-primary:${colors.text};`,
    `--color-text-secondary:${colors.primaryLight};`,
    `--color-text-muted:${colors.textMuted};`,
    `--color-muted-blue:${colors.textMuted};`,
    ...Object.entries(radiusVars).map(([k, v]) => `${k}:${v};`),
    `--font-display:'${fonts.displayFont}', 'Inter', 'Segoe UI', system-ui, sans-serif;`,
    `--font-sans:'${fonts.bodyFont}', 'Inter', 'Segoe UI', system-ui, sans-serif;`,
  ];
  parts.push(`:root{${root.join('')}}`);

  // Styles > Button style: the site's primary CTAs carry the .btn-primary
  // marker class; filled is the default (Tailwind utilities), outline and
  // shadowed override it here. `a.btn-primary` out-specifies the Tailwind
  // utilities (which are single-class), so these rules win.
  if (styles.buttonStyle === 'outline') {
    parts.push(
      'a.btn-primary{background:transparent;border:2px solid var(--color-accent-cream);color:var(--color-accent-cream)}' +
        'a.btn-primary:hover{background:color-mix(in srgb,var(--color-accent-cream) 14%,transparent)}',
    );
  } else if (styles.buttonStyle === 'shadowed') {
    parts.push('a.btn-primary{box-shadow:0 14px 30px -14px var(--color-accent)}');
  }

  if (!motion.revealAnimations) {
    parts.push(
      '.reveal,.reveal-from-left,.reveal-from-right,.reveal-zoom,.reveal-flip,.reveal-pop{opacity:1;transform:none;transition:none}',
    );
  }
  if (!motion.hoverEffects) {
    parts.push('*{transition-duration:0s!important}');
  }
  return parts.join('\n');
}
