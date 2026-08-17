interface PageHeaderProps {
  kicker: string;
  title: string;
  description?: string;
  backgroundImage?: string;
}

export function PageHeader({ kicker, title, description, backgroundImage }: PageHeaderProps) {
  return (
    <section className="relative bg-ink overflow-hidden">
      {backgroundImage && (
        <>
          <img
            src={backgroundImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(180deg, rgba(22,40,158,0.55) 0%, rgba(22,40,158,0.7) 100%)',
            }}
          />
        </>
      )}
      {!backgroundImage && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(600px 360px at 85% 0%, rgba(22,40,158,0.28), transparent 62%)',
          }}
        />
      )}
      <div className="relative mx-auto w-full max-w-[1120px] px-6 md:px-12 py-16 md:py-24">
        <p className="mb-4 font-display text-[13px] font-extrabold uppercase tracking-[0.16em] text-accent-cream">
          {kicker}
        </p>
        <h1 className="mb-3 font-display font-extrabold text-white text-4xl md:text-5xl leading-tight tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-muted-blue text-lg max-w-[60ch]">{description}</p>
        )}
      </div>
    </section>
  );
}
