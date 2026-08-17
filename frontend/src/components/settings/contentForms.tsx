import { useEffect, useState } from 'react';
import { CaretDown, CaretRight } from '@phosphor-icons/react';
import { Button } from '../ui/Button';
import { ImageUpload } from '../ui/ImageUpload';
import { formatBytes } from '../../lib/utils';

/* ---------- Generic field helpers ---------- */

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-bold text-ink">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full bg-white border border-ink/20 rounded-[12px] px-3.5 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-royal/30 focus:border-royal';

export function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input className={inputCls} value={value ?? ''} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)} />
  );
}

export function AreaInput({ value, onChange, rows = 3, placeholder }: { value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <textarea className={`${inputCls} resize-y`} rows={rows} value={value ?? ''} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)} />
  );
}

export function AddRemove({
  count, onAdd, onRemove, addLabel, itemLabel, getTitle, children,
}: {
  count: number; onAdd: () => void; onRemove: (i: number) => void;
  addLabel?: string;
  /** Base label shown in each item's header, e.g. "Slide" → "Slide 1". */
  itemLabel?: string;
  /** Optional current title for an item, shown in its header. */
  getTitle?: (i: number) => string;
  children: (i: number) => React.ReactNode;
}) {
  // Accordion: one item open at a time so the form stays short instead of a long scroll.
  const [open, setOpen] = useState<number | null>(0);

  // Keep the open index valid when items are removed.
  useEffect(() => {
    if (open !== null && open >= count) setOpen(count > 0 ? count - 1 : null);
  }, [count, open]);

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => {
        const isOpen = open === i;
        const title = getTitle ? getTitle(i) : '';
        return (
          <div key={i} className="rounded-[14px] bg-ink/[0.03] border border-ink/10 overflow-hidden">
            <div className="flex items-center gap-1 pl-3 pr-2 py-2">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex items-center gap-2 min-w-0 flex-1 text-left py-1"
              >
                {isOpen ? (
                  <CaretDown size={14} weight="bold" className="text-ink-soft shrink-0" />
                ) : (
                  <CaretRight size={14} weight="bold" className="text-ink-soft shrink-0" />
                )}
                <span className="text-sm font-bold text-ink truncate">
                  {itemLabel ? `${itemLabel} ${i + 1}` : `Item ${i + 1}`}
                  {title ? <span className="font-semibold text-ink-soft"> · {title}</span> : null}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="text-xs font-bold text-danger hover:underline shrink-0 px-2 py-1 rounded-md hover:bg-danger/5"
              >
                Remove
              </button>
            </div>
            {isOpen && (
              <div className="px-4 pb-4 pt-3 space-y-3 border-t border-ink/10">
                {children(i)}
              </div>
            )}
          </div>
        );
      })}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => {
          onAdd();
          setOpen(count); // open the newly added item
        }}
      >
        {addLabel ?? 'Add item'}
      </Button>
    </div>
  );
}

/** Standard page-header editor (kicker, title, description, background image). */
export function HeaderFields({ value, onUpdate }: { value: any; onUpdate: (patch: any) => void }) {
  const header = value?.header ?? {};
  const setHeader = (patch: any) => onUpdate({ header: { ...header, ...patch } });
  return (
    <div className="space-y-3">
      <div className="rounded-[12px] bg-ink/[0.04] px-4 py-2 text-sm font-bold text-ink">Page header</div>
      <Field label="Kicker"><TextInput value={header?.kicker} onChange={(v) => setHeader({ kicker: v })} /></Field>
      <Field label="Title"><TextInput value={header?.title} onChange={(v) => setHeader({ title: v })} /></Field>
      <Field label="Description"><AreaInput value={header?.description} onChange={(v) => setHeader({ description: v })} rows={2} /></Field>
      <ImageUpload label="Background image" value={header?.backgroundImage} onChange={(v) => setHeader({ backgroundImage: v })} hint="Used as the page banner" />
    </div>
  );
}

/** Section kicker + heading (used by landing sections). */
function SectionKickerTitle({ value, onUpdate }: { value: any; onUpdate: (patch: any) => void }) {
  return (
    <>
      <Field label="Section kicker"><TextInput value={value?.kicker} onChange={(v) => onUpdate({ kicker: v })} /></Field>
      <Field label="Section title"><TextInput value={value?.title} onChange={(v) => onUpdate({ title: v })} /></Field>
    </>
  );
}

/** Simple list of strings (story paragraphs, faith points, ...). */
function StringListEditor({ label, items, onChange, addLabel, placeholder }: {
  label: string; items: string[]; onChange: (next: string[]) => void; addLabel: string; placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-bold text-ink">{label}</label>
      {items.map((p: string, i: number) => (
        <div key={i} className="flex gap-2 items-start">
          <AreaInput value={p} onChange={(v) => onChange(items.map((x: string, idx: number) => (idx === i ? v : x)))} rows={2} placeholder={placeholder} />
          <button type="button" onClick={() => onChange(items.filter((_: string, idx: number) => idx !== i))}
            className="mt-1 text-xs font-bold text-danger hover:underline shrink-0">Remove</button>
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" className="self-start" onClick={() => onChange([...items, ''])}>{addLabel}</Button>
    </div>
  );
}

/* ---------- Section forms ---------- */

export function SectionForm({ section, value, onUpdate }: { section: string; value: any; onUpdate: (patch: any) => void }) {
  switch (section) {
    case 'hero': return <HeroForm value={value} onUpdate={onUpdate} />;
    case 'stats': return <StatsForm value={value} onUpdate={onUpdate} />;
    case 'who_we_are': return <WhoWeAreForm value={value} onUpdate={onUpdate} />;
    case 'values': return <ValuesForm value={value} onUpdate={onUpdate} />;
    case 'programs': return <ProgramsForm value={value} onUpdate={onUpdate} />;
    case 'testimonies': return <TestimoniesForm value={value} onUpdate={onUpdate} />;
    case 'leadership_preview': return <LeadershipForm value={value} onUpdate={onUpdate} />;
    case 'about': return <AboutForm value={value} onUpdate={onUpdate} />;
    case 'leadership': return <LeadershipDirectoryForm value={value} onUpdate={onUpdate} />;
    case 'ministries': return <MinistriesForm value={value} onUpdate={onUpdate} />;
    case 'pensice': return <CommunityForm section="PENSICE" value={value} onUpdate={onUpdate} />;
    case 'plc': return <CommunityForm section="PLC" value={value} onUpdate={onUpdate} />;
    case 'cenacle': return <CommunityForm section="Cenacle" value={value} onUpdate={onUpdate} />;
    case 'gallery': return <GalleryForm value={value} onUpdate={onUpdate} />;
    case 'news': return <NewsForm value={value} onUpdate={onUpdate} />;
    case 'resources': return <ResourcesForm value={value} onUpdate={onUpdate} />;
    case 'contact': return <ContactForm value={value} onUpdate={onUpdate} />;
    case 'footer': return <FooterForm value={value} onUpdate={onUpdate} />;
    default: return <p className="text-sm text-ink-soft">Unknown section.</p>;
  }
}

function HeroForm({ value, onUpdate }: { value: any; onUpdate: (patch: any) => void }) {
  const slides = value?.slides ?? [];
  const setSlides = (slides: any[]) => onUpdate({ slides });
  const setAt = (i: number, patch: any) => {
    const next = [...slides];
    next[i] = { ...(next[i] || {}), ...patch };
    setSlides(next);
  };
  return (
    <AddRemove
      count={slides.length}
      addLabel="Add slide"
      itemLabel="Slide"
      getTitle={(i) => slides[i]?.title?.[0] || slides[i]?.kicker || ''}
      onAdd={() => setSlides([...slides, { image: '', kicker: '', title: [''], titleAccent: '', description: '', cta: { label: '', href: '' }, ctaSecondary: { label: '', href: '' } }])}
      onRemove={(i) => setSlides(slides.filter((_: any, idx: number) => idx !== i))}
    >
      {(i) => (
        <>
          <ImageUpload label="Background image" value={slides[i]?.image} onChange={(v) => setAt(i, { image: v })} hint="Hero slide backdrop" />
          <Field label="Kicker"><TextInput value={slides[i]?.kicker} onChange={(v) => setAt(i, { kicker: v })} placeholder="Pentecost Students" /></Field>
          <Field label="Title (first line)">
            <TextInput value={slides[i]?.title?.[0] ?? ''} onChange={(v) => setAt(i, { title: [v, slides[i]?.title?.[1] ?? ''] })} placeholder="Where faith & campus life" />
          </Field>
          <Field label="Title second line (accent)">
            <TextInput value={slides[i]?.title?.[1] ?? slides[i]?.titleAccent ?? ''} onChange={(v) => setAt(i, { titleAccent: v, title: [slides[i]?.title?.[0] ?? '', v] })} placeholder="grow as one" />
          </Field>
          <Field label="Description"><AreaInput value={slides[i]?.description} onChange={(v) => setAt(i, { description: v })} rows={3} /></Field>
          <Field label="CTA label"><TextInput value={slides[i]?.cta?.label} onChange={(v) => setAt(i, { cta: { ...(slides[i]?.cta || {}), label: v } })} placeholder="Join PENSA" /></Field>
          <Field label="CTA href"><TextInput value={slides[i]?.cta?.href} onChange={(v) => setAt(i, { cta: { ...(slides[i]?.cta || {}), href: v } })} placeholder="/ministries" /></Field>
          <Field label="Secondary CTA label"><TextInput value={slides[i]?.ctaSecondary?.label} onChange={(v) => setAt(i, { ctaSecondary: { ...(slides[i]?.ctaSecondary || {}), label: v } })} placeholder="Upcoming Events" /></Field>
          <Field label="Secondary CTA href"><TextInput value={slides[i]?.ctaSecondary?.href} onChange={(v) => setAt(i, { ctaSecondary: { ...(slides[i]?.ctaSecondary || {}), href: v } })} placeholder="/community/news" /></Field>
        </>
      )}
    </AddRemove>
  );
}

function StatsForm({ value, onUpdate }: { value: any; onUpdate: (patch: any) => void }) {
  const items = value?.items ?? [];
  const setItems = (items: any[]) => onUpdate({ items });
  const setAt = (i: number, patch: any) => {
    const next = [...items];
    next[i] = { ...(next[i] || {}), ...patch };
    setItems(next);
  };
  return (
    <AddRemove
      count={items.length}
      addLabel="Add statistic"
      itemLabel="Statistic"
      getTitle={(i) => items[i]?.label || ''}
      onAdd={() => setItems([...items, { value: '', label: '', suffix: '' }])}
      onRemove={(i) => setItems(items.filter((_: any, idx: number) => idx !== i))}
    >
      {(i) => (
        <>
          <Field label="Value"><TextInput value={String(items[i]?.value ?? '')} onChange={(v) => setAt(i, { value: v })} placeholder="1200" /></Field>
          <Field label="Label"><TextInput value={items[i]?.label} onChange={(v) => setAt(i, { label: v })} placeholder="Students reached" /></Field>
          <Field label="Suffix"><TextInput value={items[i]?.suffix} onChange={(v) => setAt(i, { suffix: v })} placeholder="+" /></Field>
        </>
      )}
    </AddRemove>
  );
}

function WhoWeAreForm({ value, onUpdate }: { value: any; onUpdate: (patch: any) => void }) {
  return (
    <div className="space-y-4">
      <Field label="Kicker"><TextInput value={value?.kicker} onChange={(v) => onUpdate({ kicker: v })} placeholder="Who we are" /></Field>
      <Field label="Title"><TextInput value={value?.title} onChange={(v) => onUpdate({ title: v })} placeholder="The Hope of God's Glory" /></Field>
      <Field label="Body"><AreaInput value={value?.body} onChange={(v) => onUpdate({ body: v })} rows={4} /></Field>
      <ImageUpload label="Image" value={value?.image} onChange={(v) => onUpdate({ image: v })} />
    </div>
  );
}

function ValuesForm({ value, onUpdate }: { value: any; onUpdate: (patch: any) => void }) {
  const vals = value?.values ?? [];
  const setVals = (vals: any[]) => onUpdate({ values: vals });
  const setAt = (i: number, patch: any) => {
    const next = [...vals];
    next[i] = { ...(next[i] || {}), ...patch };
    setVals(next);
  };
  return (
    <div className="space-y-4">
      <SectionKickerTitle value={value} onUpdate={onUpdate} />
      <AddRemove
        count={vals.length}
        addLabel="Add value"
        itemLabel="Value"
        getTitle={(i) => vals[i]?.title || ''}
        onAdd={() => setVals([...vals, { title: '', body: '' }])}
        onRemove={(i) => setVals(vals.filter((_: any, idx: number) => idx !== i))}
      >
        {(i) => (
          <>
            <Field label="Title"><TextInput value={vals[i]?.title} onChange={(v) => setAt(i, { title: v })} placeholder="Word & Prayer" /></Field>
            <Field label="Body"><AreaInput value={vals[i]?.body} onChange={(v) => setAt(i, { body: v })} rows={2} /></Field>
          </>
        )}
      </AddRemove>
    </div>
  );
}

function ProgramsForm({ value, onUpdate }: { value: any; onUpdate: (patch: any) => void }) {
  const progs = value?.programs ?? [];
  const setProgs = (progs: any[]) => onUpdate({ programs: progs });
  const setAt = (i: number, patch: any) => {
    const next = [...progs];
    next[i] = { ...(next[i] || {}), ...patch };
    setProgs(next);
  };
  return (
    <div className="space-y-4">
      <SectionKickerTitle value={value} onUpdate={onUpdate} />
      <AddRemove
        count={progs.length}
        addLabel="Add program"
        itemLabel="Program"
        getTitle={(i) => progs[i]?.title || ''}
        onAdd={() => setProgs([...progs, { image: '', title: '', meta: '' }])}
        onRemove={(i) => setProgs(progs.filter((_: any, idx: number) => idx !== i))}
      >
        {(i) => (
          <>
            <ImageUpload label="Image" value={progs[i]?.image} onChange={(v) => setAt(i, { image: v })} />
            <Field label="Title"><TextInput value={progs[i]?.title} onChange={(v) => setAt(i, { title: v })} placeholder="Sunday Service" /></Field>
            <Field label="Meta (day / time)"><TextInput value={progs[i]?.meta} onChange={(v) => setAt(i, { meta: v })} placeholder="Sun · 10:30 AM" /></Field>
          </>
        )}
      </AddRemove>
    </div>
  );
}

function TestimoniesForm({ value, onUpdate }: { value: any; onUpdate: (patch: any) => void }) {
  const items = value?.testimonies ?? [];
  const setItems = (items: any[]) => onUpdate({ testimonies: items });
  const setAt = (i: number, patch: any) => {
    const next = [...items];
    next[i] = { ...(next[i] || {}), ...patch };
    setItems(next);
  };
  return (
    <div className="space-y-4">
      <SectionKickerTitle value={value} onUpdate={onUpdate} />
      <AddRemove
        count={items.length}
        addLabel="Add testimony"
        itemLabel="Testimony"
        getTitle={(i) => items[i]?.cite || ''}
        onAdd={() => setItems([...items, { quote: '', cite: '' }])}
        onRemove={(i) => setItems(items.filter((_: any, idx: number) => idx !== i))}
      >
        {(i) => (
          <>
            <Field label="Quote"><AreaInput value={items[i]?.quote} onChange={(v) => setAt(i, { quote: v })} rows={3} /></Field>
            <Field label="Cite (name · details)"><TextInput value={items[i]?.cite} onChange={(v) => setAt(i, { cite: v })} placeholder="Ama Serwaa · Level 300, Nursing" /></Field>
          </>
        )}
      </AddRemove>
    </div>
  );
}

function LeadersEditor({ value, onUpdate, listKey }: { value: any; onUpdate: (patch: any) => void; listKey: string }) {
  const leaders = value?.[listKey] ?? [];
  const setLeaders = (leaders: any[]) => onUpdate({ [listKey]: leaders });
  const setAt = (i: number, patch: any) => {
    const next = [...leaders];
    next[i] = { ...(next[i] || {}), ...patch };
    setLeaders(next);
  };
  return (
    <AddRemove
      count={leaders.length}
      addLabel="Add leader"
      itemLabel="Leader"
      getTitle={(i) => leaders[i]?.name || ''}
      onAdd={() => setLeaders([...leaders, { name: '', role: '', initials: '', photo: '', profile: '', favoriteQuote: '' }])}
      onRemove={(i) => setLeaders(leaders.filter((_: any, idx: number) => idx !== i))}
    >
      {(i) => (
        <>
          <Field label="Role"><TextInput value={leaders[i]?.role} onChange={(v) => setAt(i, { role: v })} placeholder="President" /></Field>
          <Field label="Name"><TextInput value={leaders[i]?.name} onChange={(v) => setAt(i, { name: v })} placeholder="Full name" /></Field>
          <Field label="Initials"><TextInput value={leaders[i]?.initials} onChange={(v) => setAt(i, { initials: v })} placeholder="KM" /></Field>
          <ImageUpload label="Photo" value={leaders[i]?.photo} onChange={(v) => setAt(i, { photo: v })} aspect="aspect-square" />
          <Field label="Profile"><AreaInput value={leaders[i]?.profile} onChange={(v) => setAt(i, { profile: v })} rows={3} /></Field>
          <Field label="Favorite quote"><AreaInput value={leaders[i]?.favoriteQuote} onChange={(v) => setAt(i, { favoriteQuote: v })} rows={2} /></Field>
        </>
      )}
    </AddRemove>
  );
}

function LeadershipForm({ value, onUpdate }: { value: any; onUpdate: (patch: any) => void }) {
  return (
    <div className="space-y-4">
      <SectionKickerTitle value={value} onUpdate={onUpdate} />
      <LeadersEditor value={value} onUpdate={onUpdate} listKey="leaders" />
    </div>
  );
}

function LeadershipDirectoryForm({ value, onUpdate }: { value: any; onUpdate: (patch: any) => void }) {
  const groups = value?.groups ?? [];
  const setGroups = (groups: any[]) => onUpdate({ groups });
  const setGroupAt = (i: number, patch: any) => {
    const next = [...groups];
    next[i] = { ...(next[i] || {}), ...patch };
    setGroups(next);
  };
  const setMemberAt = (gi: number, mi: number, patch: any) => {
    const next = [...groups];
    const members = [...(next[gi]?.members ?? [])];
    members[mi] = { ...(members[mi] || {}), ...patch };
    next[gi] = { ...(next[gi] || {}), members };
    setGroups(next);
  };
  const addMember = (gi: number) => {
    const next = [...groups];
    const members = [...(next[gi]?.members ?? []), { role: '', name: '', photo: '' }];
    next[gi] = { ...(next[gi] || {}), members };
    setGroups(next);
  };
  const removeMember = (gi: number, mi: number) => {
    const next = [...groups];
    const members = (next[gi]?.members ?? []).filter((_: any, idx: number) => idx !== mi);
    next[gi] = { ...(next[gi] || {}), members };
    setGroups(next);
  };
  return (
    <div className="space-y-4">
      <HeaderFields value={value} onUpdate={onUpdate} />
      <AddRemove
        count={groups.length}
        addLabel="Add group"
        itemLabel="Group"
        getTitle={(i) => groups[i]?.title || ''}
        onAdd={() => setGroups([...groups, { title: '', description: '', members: [{ role: '', name: '', photo: '' }] }])}
        onRemove={(i) => setGroups(groups.filter((_: any, idx: number) => idx !== i))}
      >
        {(i) => (
          <div className="space-y-3">
            <Field label="Group title"><TextInput value={groups[i]?.title} onChange={(v) => setGroupAt(i, { title: v })} /></Field>
            <Field label="Group description"><AreaInput value={groups[i]?.description} onChange={(v) => setGroupAt(i, { description: v })} rows={2} /></Field>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-ink">Members</label>
              {(groups[i]?.members ?? []).map((m: any, mi: number) => (
                <div key={mi} className="rounded-[12px] bg-white border border-ink/10 p-3 space-y-2">
                  <div className="flex justify-end">
                    <button type="button" onClick={() => removeMember(i, mi)} className="text-xs font-bold text-danger hover:underline">Remove</button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <Field label="Role"><TextInput value={m?.role} onChange={(v) => setMemberAt(i, mi, { role: v })} placeholder="President" /></Field>
                    <Field label="Name"><TextInput value={m?.name} onChange={(v) => setMemberAt(i, mi, { name: v })} placeholder="Full name" /></Field>
                  </div>
                  <ImageUpload label="Photo" value={m?.photo} onChange={(v) => setMemberAt(i, mi, { photo: v })} aspect="aspect-square" />
                </div>
              ))}
              <Button type="button" variant="secondary" size="sm" className="self-start" onClick={() => addMember(i)}>Add member</Button>
            </div>
          </div>
        )}
      </AddRemove>
    </div>
  );
}

function AboutForm({ value, onUpdate }: { value: any; onUpdate: (patch: any) => void }) {
  const story = value?.story ?? [];
  const setStory = (story: string[]) => onUpdate({ story });
  const timeline = value?.timeline ?? [];
  const setTimeline = (timeline: any[]) => onUpdate({ timeline });
  const setTimelineAt = (i: number, patch: any) => {
    const next = [...timeline];
    next[i] = { ...(next[i] || {}), ...patch };
    setTimeline(next);
  };
  return (
    <div className="space-y-4">
      <Field label="Kicker"><TextInput value={value?.kicker} onChange={(v) => onUpdate({ kicker: v })} placeholder="Who we are" /></Field>
      <Field label="Title"><TextInput value={value?.title} onChange={(v) => onUpdate({ title: v })} placeholder="Basically disciples on campus" /></Field>
      <Field label="Vision"><AreaInput value={value?.vision} onChange={(v) => onUpdate({ vision: v })} rows={3} /></Field>
      <Field label="Mission"><AreaInput value={value?.mission} onChange={(v) => onUpdate({ mission: v })} rows={3} /></Field>
      <ImageUpload label="Image" value={value?.image} onChange={(v) => onUpdate({ image: v })} />
      <ImageUpload label="Header background image" value={value?.backgroundImage} onChange={(v) => onUpdate({ backgroundImage: v })} />
      <StringListEditor label="Story paragraphs" items={story} onChange={setStory} addLabel="Add paragraph" />
      <div className="rounded-[12px] bg-ink/[0.04] px-4 py-2 text-sm font-bold text-ink">History timeline</div>
      <AddRemove
        count={timeline.length}
        addLabel="Add timeline entry"
        itemLabel="Entry"
        getTitle={(i) => timeline[i]?.year || ''}
        onAdd={() => setTimeline([...timeline, { year: '', body: '' }])}
        onRemove={(i) => setTimeline(timeline.filter((_: any, idx: number) => idx !== i))}
      >
        {(i) => (
          <>
            <Field label="Year"><TextInput value={timeline[i]?.year} onChange={(v) => setTimelineAt(i, { year: v })} placeholder="2013" /></Field>
            <Field label="Body"><AreaInput value={timeline[i]?.body} onChange={(v) => setTimelineAt(i, { body: v })} rows={3} /></Field>
          </>
        )}
      </AddRemove>
      <Field label="Statement of faith intro"><AreaInput value={value?.faithIntro} onChange={(v) => onUpdate({ faithIntro: v })} rows={3} /></Field>
      <StringListEditor label="Faith points" items={value?.faithPoints ?? []} onChange={(points) => onUpdate({ faithPoints: points })} addLabel="Add faith point" />
    </div>
  );
}

function MinistriesForm({ value, onUpdate }: { value: any; onUpdate: (patch: any) => void }) {
  const ministries = value?.ministries ?? [];
  const setMinistries = (list: any[]) => onUpdate({ ministries: list });
  const setAt = (i: number, patch: any) => {
    const next = [...ministries];
    next[i] = { ...(next[i] || {}), ...patch };
    setMinistries(next);
  };
  const setActivities = (i: number, acts: string[]) => setAt(i, { keyActivities: acts });
  const cta = value?.cta ?? {};
  const setCta = (patch: any) => onUpdate({ cta: { ...cta, ...patch } });
  return (
    <div className="space-y-4">
      <HeaderFields value={value} onUpdate={onUpdate} />
      <div className="rounded-[12px] bg-ink/[0.04] px-4 py-2 text-sm font-bold text-ink">Get-involved banner</div>
      <Field label="Kicker"><TextInput value={cta?.kicker} onChange={(v) => setCta({ kicker: v })} /></Field>
      <Field label="Title"><TextInput value={cta?.title} onChange={(v) => setCta({ title: v })} /></Field>
      <Field label="Button label"><TextInput value={cta?.label} onChange={(v) => setCta({ label: v })} /></Field>
      <Field label="Button href"><TextInput value={cta?.href} onChange={(v) => setCta({ href: v })} /></Field>
      <AddRemove
        count={ministries.length}
        addLabel="Add ministry"
        itemLabel="Ministry"
        getTitle={(i) => ministries[i]?.title || ''}
        onAdd={() => setMinistries([...ministries, { title: '', body: '', mainLeader: '', assistantLeader: '', keyActivities: [], meetingPlace: '', contact: '', image1: '', image2: '' }])}
        onRemove={(i) => setMinistries(ministries.filter((_: any, idx: number) => idx !== i))}
      >
        {(i) => {
          const acts = ministries[i]?.keyActivities ?? [];
          return (
            <>
              <Field label="Title"><TextInput value={ministries[i]?.title} onChange={(v) => setAt(i, { title: v })} placeholder="Evangelism & Outreach" /></Field>
              <Field label="Body"><AreaInput value={ministries[i]?.body} onChange={(v) => setAt(i, { body: v })} rows={2} /></Field>
              <div className="grid md:grid-cols-2 gap-3">
                <Field label="Main leader"><TextInput value={ministries[i]?.mainLeader} onChange={(v) => setAt(i, { mainLeader: v })} /></Field>
                <Field label="Assistant leader"><TextInput value={ministries[i]?.assistantLeader} onChange={(v) => setAt(i, { assistantLeader: v })} /></Field>
                <Field label="Meeting place"><TextInput value={ministries[i]?.meetingPlace} onChange={(v) => setAt(i, { meetingPlace: v })} /></Field>
                <Field label="Contact"><TextInput value={ministries[i]?.contact} onChange={(v) => setAt(i, { contact: v })} /></Field>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <ImageUpload label="Image 1" value={ministries[i]?.image1} onChange={(v) => setAt(i, { image1: v })} />
                <ImageUpload label="Image 2" value={ministries[i]?.image2} onChange={(v) => setAt(i, { image2: v })} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-ink">Key activities</label>
                {acts.map((a: string, j: number) => (
                  <div key={j} className="flex gap-2 items-start">
                    <TextInput value={a} onChange={(v) => setActivities(i, acts.map((x: string, idx: number) => (idx === j ? v : x)))} />
                    <button type="button" onClick={() => setActivities(i, acts.filter((_: string, idx: number) => idx !== j))}
                      className="mt-1 text-xs font-bold text-danger hover:underline shrink-0">Remove</button>
                  </div>
                ))}
                <Button type="button" variant="secondary" size="sm" className="self-start" onClick={() => setActivities(i, [...acts, ''])}>Add activity</Button>
              </div>
            </>
          );
        }}
      </AddRemove>
    </div>
  );
}

function CommunityForm({ section, value, onUpdate }: { section: string; value: any; onUpdate: (patch: any) => void }) {
  const body = value?.body ?? [];
  const setBody = (body: string[]) => onUpdate({ body });
  const photos = value?.gallery ?? [];
  const setPhotos = (gallery: string[]) => onUpdate({ gallery });
  return (
    <div className="space-y-4">
      <div className="rounded-[12px] bg-ink/[0.04] px-4 py-2 text-sm font-bold text-ink">Editing: {section}</div>
      <Field label="Kicker"><TextInput value={value?.kicker} onChange={(v) => onUpdate({ kicker: v })} placeholder={`Community · ${section.toUpperCase()}`} /></Field>
      <Field label="Title"><TextInput value={value?.title} onChange={(v) => onUpdate({ title: v })} placeholder={section} /></Field>
      <Field label="Page description"><TextInput value={value?.description} onChange={(v) => onUpdate({ description: v })} /></Field>
      <ImageUpload label="Main image" value={value?.image} onChange={(v) => onUpdate({ image: v })} />
      <ImageUpload label="Header background image" value={value?.backgroundImage} onChange={(v) => onUpdate({ backgroundImage: v })} />
      <StringListEditor label="Body paragraphs" items={body} onChange={setBody} addLabel="Add paragraph" />
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-ink">Gallery photos</label>
        {photos.map((p: string, i: number) => (
          <div key={i} className="rounded-[12px] bg-ink/[0.03] border border-ink/10 p-3 space-y-2">
            <ImageUpload value={p} onChange={(v) => setPhotos(photos.map((x: string, idx: number) => (idx === i ? v : x)))} aspect="aspect-[4/3]" />
            <button type="button" onClick={() => setPhotos(photos.filter((_: string, idx: number) => idx !== i))}
              className="text-xs font-bold text-danger hover:underline">Remove photo</button>
          </div>
        ))}
        <Button type="button" variant="secondary" size="sm" className="self-start" onClick={() => setPhotos([...photos, ''])}>Add photo</Button>
      </div>
    </div>
  );
}

function GalleryForm({ value, onUpdate }: { value: any; onUpdate: (patch: any) => void }) {
  const photos = value?.photos ?? [];
  const setPhotos = (photos: any[]) => onUpdate({ photos });
  const setAt = (i: number, patch: any) => {
    const next = [...photos];
    next[i] = { ...(next[i] || {}), ...patch };
    setPhotos(next);
  };
  return (
    <div className="space-y-4">
      <HeaderFields value={value} onUpdate={onUpdate} />
      <AddRemove
        count={photos.length}
        addLabel="Add photo"
        itemLabel="Photo"
        getTitle={(i) => photos[i]?.alt || ''}
        onAdd={() => setPhotos([...photos, { src: '', alt: '' }])}
        onRemove={(i) => setPhotos(photos.filter((_: any, idx: number) => idx !== i))}
      >
        {(i) => (
          <>
            <ImageUpload label="Photo" value={photos[i]?.src} onChange={(v) => setAt(i, { src: v })} aspect="aspect-[4/3]" />
            <Field label="Alt text"><TextInput value={photos[i]?.alt} onChange={(v) => setAt(i, { alt: v })} placeholder="Description" /></Field>
          </>
        )}
      </AddRemove>
    </div>
  );
}

function NewsForm({ value, onUpdate }: { value: any; onUpdate: (patch: any) => void }) {
  const articles = value?.articles ?? [];
  const setArticles = (list: any[]) => onUpdate({ articles: list });
  const setAt = (i: number, patch: any) => {
    const next = [...articles];
    next[i] = { ...(next[i] || {}), ...patch };
    setArticles(next);
  };
  const setContent = (i: number, content: string[]) => setAt(i, { content });
  const events = value?.events ?? [];
  const setEvents = (events: any[]) => onUpdate({ events });
  const setEventAt = (i: number, patch: any) => {
    const next = [...events];
    next[i] = { ...(next[i] || {}), ...patch };
    setEvents(next);
  };
  return (
    <div className="space-y-4">
      <HeaderFields value={value} onUpdate={onUpdate} />
      <div className="rounded-[12px] bg-ink/[0.04] px-4 py-2 text-sm font-bold text-ink">Upcoming events sidebar</div>
      <AddRemove
        count={events.length}
        addLabel="Add event"
        itemLabel="Event"
        getTitle={(i) => events[i]?.title || ''}
        onAdd={() => setEvents([...events, { title: '', meta: '' }])}
        onRemove={(i) => setEvents(events.filter((_: any, idx: number) => idx !== i))}
      >
        {(i) => (
          <>
            <Field label="Title"><TextInput value={events[i]?.title} onChange={(v) => setEventAt(i, { title: v })} /></Field>
            <Field label="Meta (day · time)"><TextInput value={events[i]?.meta} onChange={(v) => setEventAt(i, { meta: v })} /></Field>
          </>
        )}
      </AddRemove>
      <AddRemove
        count={articles.length}
        addLabel="Add article"
        itemLabel="Article"
        getTitle={(i) => articles[i]?.title || ''}
        onAdd={() => setArticles([...articles, { slug: '', image: '', meta: '', title: '', body: '', content: [] }])}
        onRemove={(i) => setArticles(articles.filter((_: any, idx: number) => idx !== i))}
      >
        {(i) => {
          const content = articles[i]?.content ?? [];
          return (
            <>
              <Field label="Title"><TextInput value={articles[i]?.title} onChange={(v) => setAt(i, { title: v })} /></Field>
              <Field label="Slug"><TextInput value={articles[i]?.slug} onChange={(v) => setAt(i, { slug: v })} placeholder="building-project-fund-drive" /></Field>
              <Field label="Meta"><TextInput value={articles[i]?.meta} onChange={(v) => setAt(i, { meta: v })} placeholder="Announcement · Aug 2026" /></Field>
              <ImageUpload label="Image" value={articles[i]?.image} onChange={(v) => setAt(i, { image: v })} />
              <Field label="Summary (body)"><AreaInput value={articles[i]?.body} onChange={(v) => setAt(i, { body: v })} rows={2} /></Field>
              <StringListEditor label="Content paragraphs" items={content} onChange={(c) => setContent(i, c)} addLabel="Add paragraph" />
            </>
          );
        }}
      </AddRemove>
    </div>
  );
}

function ResourcesForm({ value, onUpdate }: { value: any; onUpdate: (patch: any) => void }) {
  const sections = value?.sections ?? [];
  const setSections = (list: any[]) => onUpdate({ sections: list });
  const setAt = (i: number, patch: any) => {
    const next = [...sections];
    next[i] = { ...(next[i] || {}), ...patch };
    setSections(next);
  };
  const setItems = (i: number, items: any[]) => setAt(i, { items });
  return (
    <div className="space-y-4">
      <HeaderFields value={value} onUpdate={onUpdate} />
      <AddRemove
        count={sections.length}
        addLabel="Add section"
        itemLabel="Section"
        getTitle={(i) => sections[i]?.title || ''}
        onAdd={() => setSections([...sections, { title: '', description: '', items: [] }])}
        onRemove={(i) => setSections(sections.filter((_: any, idx: number) => idx !== i))}
      >
        {(i) => {
          const items = sections[i]?.items ?? [];
          return (
            <>
              <Field label="Section title"><TextInput value={sections[i]?.title} onChange={(v) => setAt(i, { title: v })} /></Field>
              <Field label="Section description"><AreaInput value={sections[i]?.description} onChange={(v) => setAt(i, { description: v })} rows={2} /></Field>
              <div className="flex flex-col gap-3 border-t border-ink/10 pt-3">
                <label className="text-sm font-bold text-ink">Items</label>
                {items.map((item: any, j: number) => (
                  <div key={j} className="rounded-[12px] bg-white border border-ink/10 p-3 space-y-2">
                    <div className="flex justify-end">
                      <button type="button" onClick={() => setItems(i, items.filter((_: any, idx: number) => idx !== j))}
                        className="text-xs font-bold text-danger hover:underline">Remove</button>
                    </div>
                    <Field label="Title"><TextInput value={item?.title} onChange={(v) => setItems(i, items.map((x: any, idx: number) => (idx === j ? { ...x, title: v } : x)))} /></Field>
                    <Field label="Description"><AreaInput value={item?.description} onChange={(v) => setItems(i, items.map((x: any, idx: number) => (idx === j ? { ...x, description: v } : x)))} rows={2} /></Field>
                    <ImageUpload
                      kind="file"
                      label="Document file"
                      value={item?.file}
                      onChange={(v) =>
                        setItems(i, items.map((x: any, idx: number) => (idx === j ? { ...x, file: v, fileSize: v ? x.fileSize : '' } : x)))
                      }
                      onUploaded={({ url, size }) =>
                        // Set the complete item in one update (both callbacks compute
                        // from the same closure, so the last one must carry everything).
                        setItems(i, items.map((x: any, idx: number) => (idx === j ? { ...x, file: url, fileSize: formatBytes(size) } : x)))
                      }
                      hint="PDF, Word, PowerPoint or Excel"
                    />
                  </div>
                ))}
                <Button type="button" variant="secondary" size="sm" className="self-start" onClick={() => setItems(i, [...items, { title: '', description: '', fileSize: '', file: '' }])}>Add item</Button>
              </div>
            </>
          );
        }}
      </AddRemove>
    </div>
  );
}

function ContactForm({ value, onUpdate }: { value: any; onUpdate: (patch: any) => void }) {
  const header = value?.header ?? {};
  const setHeader = (patch: any) => onUpdate({ header: { ...header, ...patch } });
  return (
    <div className="space-y-4">
      <div className="rounded-[12px] bg-ink/[0.04] px-4 py-2 text-sm font-bold text-ink">Page header</div>
      <Field label="Kicker"><TextInput value={header?.kicker} onChange={(v) => setHeader({ kicker: v })} placeholder="Contact" /></Field>
      <Field label="Title"><TextInput value={header?.title} onChange={(v) => setHeader({ title: v })} placeholder="Get in touch" /></Field>
      <Field label="Description"><AreaInput value={header?.description} onChange={(v) => setHeader({ description: v })} rows={2} /></Field>
      <ImageUpload label="Header background image" value={value?.backgroundImage} onChange={(v) => onUpdate({ backgroundImage: v })} />
      <Field label="Address"><TextInput value={value?.address} onChange={(v) => onUpdate({ address: v })} placeholder="UENR, Sunyani, Ghana" /></Field>
      <Field label="Phone"><TextInput value={value?.phone} onChange={(v) => onUpdate({ phone: v })} placeholder="+233 (0) 55 123 4567" /></Field>
      <Field label="Email"><TextInput value={value?.email} onChange={(v) => onUpdate({ email: v })} placeholder="info@pensa-uenr.org" /></Field>
    </div>
  );
}

function FooterForm({ value, onUpdate }: { value: any; onUpdate: (patch: any) => void }) {
  const social = value?.social ?? [];
  const setSocial = (list: any[]) => onUpdate({ social: list });
  const setSocialAt = (i: number, patch: any) => {
    const next = [...social];
    next[i] = { ...(next[i] || {}), ...patch };
    setSocial(next);
  };
  const explore = value?.explore ?? [];
  const setExplore = (list: any[]) => onUpdate({ explore: list });
  const setAt = (i: number, patch: any) => {
    const next = [...explore];
    next[i] = { ...(next[i] || {}), ...patch };
    setExplore(next);
  };
  const ci = value?.contactInfo ?? {};
  return (
    <div className="space-y-4">
      <Field label="Brand heading"><TextInput value={value?.brandHeading} onChange={(v) => onUpdate({ brandHeading: v })} placeholder="PENSA-UENR" /></Field>
      <Field label="Brand description"><AreaInput value={value?.brandDescription} onChange={(v) => onUpdate({ brandDescription: v })} rows={3} /></Field>
      <div className="rounded-[12px] bg-ink/[0.04] px-4 py-2 text-sm font-bold text-ink">Social links</div>
      <p className="text-xs text-ink-soft">Add any social platform — the footer picks the icon from the label (e.g. "Facebook", "X", "TikTok", "WhatsApp").</p>
      <AddRemove
        count={social.length}
        addLabel="Add social link"
        itemLabel="Social link"
        getTitle={(i) => social[i]?.label || ''}
        onAdd={() => setSocial([...social, { label: '', href: '' }])}
        onRemove={(i) => setSocial(social.filter((_: any, idx: number) => idx !== i))}
      >
        {(i) => (
          <>
            <Field label="Platform"><TextInput value={social[i]?.label} onChange={(v) => setSocialAt(i, { label: v })} placeholder="Facebook" /></Field>
            <Field label="URL"><TextInput value={social[i]?.href} onChange={(v) => setSocialAt(i, { href: v })} placeholder="https://facebook.com/pensa-uenr" /></Field>
          </>
        )}
      </AddRemove>
      <div className="rounded-[12px] bg-ink/[0.04] px-4 py-2 text-sm font-bold text-ink">Explore links</div>
      <AddRemove
        count={explore.length}
        addLabel="Add link"
        itemLabel="Link"
        getTitle={(i) => explore[i]?.label || ''}
        onAdd={() => setExplore([...explore, { label: '', href: '' }])}
        onRemove={(i) => setExplore(explore.filter((_: any, idx: number) => idx !== i))}
      >
        {(i) => (
          <>
            <Field label="Label"><TextInput value={explore[i]?.label} onChange={(v) => setAt(i, { label: v })} /></Field>
            <Field label="Href"><TextInput value={explore[i]?.href} onChange={(v) => setAt(i, { href: v })} /></Field>
          </>
        )}
      </AddRemove>
      <div className="rounded-[12px] bg-ink/[0.04] px-4 py-2 text-sm font-bold text-ink">Contact info</div>
      <Field label="Address"><TextInput value={ci?.address} onChange={(v) => onUpdate({ contactInfo: { ...ci, address: v } })} placeholder="UENR, Sunyani, Ghana" /></Field>
      <Field label="Phone"><TextInput value={ci?.phone} onChange={(v) => onUpdate({ contactInfo: { ...ci, phone: v } })} placeholder="+233 (0) 55 123 4567" /></Field>
      <Field label="Email"><TextInput value={ci?.email} onChange={(v) => onUpdate({ contactInfo: { ...ci, email: v } })} placeholder="info@pensa-uenr.org" /></Field>
    </div>
  );
}
