import {
  Envelope,
  FacebookLogo,
  InstagramLogo,
  LinkSimple,
  LinkedinLogo,
  MapPin,
  Phone,
  TelegramLogo,
  TiktokLogo,
  WhatsappLogo,
  XLogo,
  YoutubeLogo,
} from '@phosphor-icons/react';
import { useSection } from '../../hooks/useSiteSettings';
import { siteDefaults } from '../../data/siteDefaults';

// Icons are matched by platform label (icons can't be stored in settings JSON).
const SOCIAL_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  facebook: FacebookLogo,
  instagram: InstagramLogo,
  youtube: YoutubeLogo,
  x: XLogo,
  twitter: XLogo,
  tiktok: TiktokLogo,
  whatsapp: WhatsappLogo,
  linkedin: LinkedinLogo,
  telegram: TelegramLogo,
};

function socialIcon(label: string): React.ComponentType<{ size?: number }> {
  const key = (label || '').toLowerCase().trim();
  for (const [name, icon] of Object.entries(SOCIAL_ICONS)) {
    if (key.includes(name)) return icon;
  }
  return LinkSimple;
}

export function LandingFooter() {
  const data = useSection('footer', siteDefaults.footer);
  const explore =
    data.explore && data.explore.length > 0 ? data.explore : siteDefaults.footer.explore;
  const contact = data.contactInfo ?? siteDefaults.footer.contactInfo;
  const social =
    data.social && data.social.length > 0 ? data.social : siteDefaults.footer.social;

  return (
    <footer id="contact" className="bg-[#02041c]">
      <div className="mx-auto w-full max-w-[1120px] px-6 md:px-12 py-16 grid md:grid-cols-[1.4fr_0.8fr_1fr] gap-10">
        <div className="footer-brand">
          <h3 className="mb-4 font-display font-extrabold text-white text-xl">{data.brandHeading}</h3>
          <p className="text-[15px] text-white/55 max-w-[46ch] leading-relaxed">
            {data.brandDescription}
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            {social.map((link: { label: string; href: string }) => {
              const Icon = socialIcon(link.label);
              return (
                <a
                  key={link.label || link.href}
                  href={link.href || '#'}
                  aria-label={link.label || 'Social link'}
                  title={link.label || ''}
                  className="p-2.5 rounded-xl bg-white/10 text-white/80 hover:bg-accent-cream hover:text-ink transition-colors"
                >
                  <Icon size={18} />
                </a>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-display text-[13px] font-extrabold uppercase tracking-[0.14em] text-white/45">
            Explore
          </h4>
          {explore.map((link: { label: string; href: string }) => (
            <a
              key={link.label}
              href={link.href}
              className="block mb-2.5 text-[15px] text-white/70 hover:text-accent-cream transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div>
          <h4 className="mb-4 font-display text-[13px] font-extrabold uppercase tracking-[0.14em] text-white/45">
            Contact
          </h4>
          <p className="flex items-center gap-2.5 mb-3 text-[15px] text-white/70">
            <MapPin size={16} /> {contact.address}
          </p>
          <p className="flex items-center gap-2.5 mb-3 text-[15px] text-white/70">
            <Phone size={16} /> {contact.phone}
          </p>
          <p className="flex items-center gap-2.5 text-[15px] text-white/70">
            <Envelope size={16} /> {contact.email}
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1120px] px-6 md:px-12 py-5 border-t border-white/10">
        <p className="text-sm text-white/45">© {new Date().getFullYear()} PENSA-UENR. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
