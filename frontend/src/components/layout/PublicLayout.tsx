import { Outlet } from 'react-router-dom';
import { LandingHeader } from '../landing/LandingHeader';
import { LandingFooter } from '../landing/LandingFooter';
import { ScrollToTop } from './ScrollToTop';
import { SiteTheme } from '../theme/SiteTheme';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteTheme />
      <ScrollToTop />
      <LandingHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <LandingFooter />
    </div>
  );
}