import { useSection } from '../../hooks/useSiteSettings';
import { siteDefaults } from '../../data/siteDefaults';
import { buildThemeCss } from '../../lib/theme';

/** Applies the live theme to the public site (reads current settings/overrides). */
export function SiteTheme() {
  const colors = useSection('colors', siteDefaults.colors);
  const fonts = useSection('fonts', siteDefaults.fonts);
  const styles = useSection('styles', siteDefaults.styles);
  const motion = useSection('motion', siteDefaults.motion);
  return <style dangerouslySetInnerHTML={{ __html: buildThemeCss({ colors, fonts, styles, motion }) }} />;
}
