import { usePageMeta } from '../hooks/usePageMeta';
import { Hero } from '../components/landing/Hero';
import { Stats } from '../components/landing/Stats';
import { WhoWeAre } from '../components/landing/WhoWeAre';
import { Values } from '../components/landing/Values';
import { Programs } from '../components/landing/Programs';
import { Ministries } from '../components/landing/Ministries';
import { Leadership } from '../components/landing/Leadership';
import { Testimony } from '../components/landing/Testimony';

export function Landing() {
  usePageMeta(
    'PENSA-UENR',
    'Pentecost Students & Associates fellowship of The Church of Pentecost at UENR, Sunyani — worship, prayer, outreach, and discipleship on campus.',
    '/',
  );
  return (
    <div className="scroll-smooth">
      <Hero />
      <Stats />
      <WhoWeAre />
      <Values />
      <Programs />
      <Ministries />
      <Leadership />
      <Testimony />
    </div>
  );
}