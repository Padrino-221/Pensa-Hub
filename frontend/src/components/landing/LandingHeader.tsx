import { useState } from 'react';
import { CaretDown, List, X } from '@phosphor-icons/react';
import { NavLink } from 'react-router-dom';
import { useSection } from '../../hooks/useSiteSettings';
import { siteDefaults, type NavGroup } from '../../data/siteDefaults';

export function LandingHeader() {
  const data = useSection('flow', siteDefaults.flow);
  const branding = useSection('branding', siteDefaults.branding);
  const navGroups: NavGroup[] =
    data.navGroups && data.navGroups.length > 0 ? data.navGroups : siteDefaults.flow.navGroups;

  const [open, setOpen] = useState(false);

  const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-[15px] font-medium transition-colors ${
      isActive ? 'text-accent-cream' : 'text-white/70 hover:text-white'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-ink py-4">
      <div className="mx-auto w-full max-w-[1120px] px-6 md:px-12 flex items-center justify-between">
        <NavLink to="/" className="inline-flex items-center gap-2.5 font-display font-extrabold text-lg text-white tracking-wide whitespace-nowrap">
          <img
            src={(branding.logo as string) || '/logo.png'}
            alt="PENSA UENR logo"
            className="w-8 h-8 object-contain"
          />
          <span className="whitespace-nowrap">
            {(branding.siteName as string) || 'PENSA-UENR'}
          </span>
        </NavLink>

        <nav className="hidden lg:flex items-center gap-8" aria-label="Primary">
          {navGroups.map((group) =>
            group.children && group.children.length > 0 ? (
              <div key={group.label} className="relative group">
                <NavLink
                  to={group.href}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-1 text-[15px] font-medium transition-colors ${
                      isActive ? 'text-accent-cream' : 'text-white/70 group-hover:text-white'
                    }`
                  }
                >
                  {group.label}{' '}
                  <CaretDown size={14} weight="bold" className="transition-transform group-hover:rotate-180" />
                </NavLink>
                <div className="invisible opacity-0 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100 transition-all duration-150 absolute left-0 top-full pt-3">
                  <div className="bg-ink-2 border border-white/15 rounded-[14px] py-2 min-w-[180px]">
                    {group.children.map((child) => (
                      <NavLink
                        key={child.label}
                        to={child.href}
                        className={({ isActive }) =>
                          `block px-4 py-2.5 text-[14px] font-medium transition-colors ${
                            isActive ? 'text-accent-cream' : 'text-white/70 hover:text-accent-cream'
                          }`
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <NavLink key={group.label} to={group.href} className={desktopLinkClass}>
                {group.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="flex items-center gap-4">
          <NavLink
            to="/ministries"
            className="hidden lg:inline-flex items-center justify-center rounded-full bg-accent-cream text-ink px-6 py-2.5 font-display font-extrabold text-sm hover:bg-accent-cream-hover transition-colors"
          >
            Join PENSA
          </NavLink>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden p-2 text-white"
            aria-label={open ? 'Close menu' : 'Toggle menu'}
            aria-expanded={open}
          >
            {open ? <X size={24} /> : <List size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="lg:hidden absolute top-full left-0 right-0 bg-ink/95 backdrop-blur-md border-b border-white/10" aria-label="Mobile">
          <div className="flex flex-col gap-0.5 px-6 py-4">
            {navGroups.map((group) =>
              group.children && group.children.length > 0 ? (
                <div key={group.label}>
                  <NavLink to={group.href} onClick={() => setOpen(false)} className={mobileLinkClass}>
                    {group.label}
                  </NavLink>
                  {group.children.map((child) => (
                    <NavLink
                      key={child.label}
                      to={child.href}
                      onClick={() => setOpen(false)}
                      className={mobileLinkClass}
                    >
                      <span className="pl-4">{child.label}</span>
                    </NavLink>
                  ))}
                </div>
              ) : (
                <NavLink key={group.label} to={group.href} onClick={() => setOpen(false)} className={mobileLinkClass}>
                  {group.label}
                </NavLink>
              ),
            )}
            <NavLink
              to="/ministries"
              onClick={() => setOpen(false)}
              className="mt-3 inline-flex items-center justify-center rounded-full bg-accent-cream text-ink px-6 py-3 font-display font-extrabold text-sm"
            >
              Join PENSA
            </NavLink>
          </div>
        </nav>
      )}
    </header>
  );
}

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  `py-3 px-2 font-medium border-b border-white/10 ${
    isActive ? 'text-accent-cream' : 'text-white/80 hover:text-white'
  }`;
