import { PageHeader } from '../components/landing/PageHeader';
import { useSection } from '../hooks/useSiteSettings';
import { usePageMeta } from '../hooks/usePageMeta';
import { siteDefaults } from '../data/siteDefaults';

export function Cenacle() {
  usePageMeta(
    'Cenacle',
    'Cenacle — the prayer and intercession wing of PENSA-UENR, devoted to prayer and the presence of God at UENR, Sunyani.',
    '/community/cenacle',
  );
  const data = useSection('cenacle', siteDefaults.cenacle);
  const body = data.body && data.body.length > 0 ? data.body : siteDefaults.cenacle.body;
  const gallery = data.gallery && data.gallery.length > 0 ? data.gallery : siteDefaults.cenacle.gallery;

  return (
    <>
      <PageHeader
        kicker={data.kicker}
        title={data.title}
        description={data.description}
        backgroundImage={data.backgroundImage}
      />

      <section className="bg-white">
        <div className="mx-auto w-full max-w-[1120px] px-6 md:px-12 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="mb-5 font-display font-extrabold text-ink text-2xl md:text-3xl leading-tight">
                About Cenacle
              </h2>
              {body.map((paragraph: string, i: number) => (
                <p key={i} className={i === 0 ? 'text-ink-soft leading-relaxed mb-4' : 'text-ink-soft leading-relaxed'}>
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="rounded-[2rem] overflow-hidden aspect-[4/3]">
              <img src={data.image} alt="Cenacle worship" className="w-full h-full object-cover" />
            </div>
          </div>

          <h3 className="font-display font-extrabold text-ink text-xl mb-6">Gallery</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {gallery.map((photo: string, i: number) => (
              <div key={i} className="rounded-[14px] overflow-hidden aspect-[4/3]">
                <img src={photo} alt={`Cenacle event ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
