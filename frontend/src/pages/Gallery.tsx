import { PageHeader } from '../components/landing/PageHeader';
import { useSection } from '../hooks/useSiteSettings';
import { siteDefaults, type GalleryPhoto } from '../data/siteDefaults';

export function Gallery() {
  const data = useSection('gallery', siteDefaults.gallery);
  const photos: GalleryPhoto[] =
    data.photos && data.photos.length > 0 ? data.photos : siteDefaults.gallery.photos;

  return (
    <>
      <PageHeader
        kicker={data.header?.kicker ?? siteDefaults.gallery.header.kicker}
        title={data.header?.title ?? siteDefaults.gallery.header.title}
        description={data.header?.description ?? siteDefaults.gallery.header.description}
        backgroundImage={data.header?.backgroundImage ?? siteDefaults.gallery.header.backgroundImage}
      />

      <section className="bg-white">
        <div className="mx-auto w-full max-w-[1120px] px-6 md:px-12 py-16 md:py-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {photos.map((photo) => (
              <figure key={photo.src} className="m-0 overflow-hidden rounded-[18px] border border-ink/10">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  width="1200"
                  height="800"
                  loading="lazy"
                  className="block w-full aspect-[4/3] object-cover hover:scale-[1.03] transition-transform duration-300"
                />
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}