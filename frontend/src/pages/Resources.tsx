import { useState } from 'react';
import { PageHeader } from '../components/landing/PageHeader';
import {
  BookOpen, FileText, Users, Handshake, GraduationCap,
  Scroll, ClipboardText, Crown, Trophy, X, Download,
} from '@phosphor-icons/react';
import { useSection } from '../hooks/useSiteSettings';
import { usePageMeta } from '../hooks/usePageMeta';
import { siteDefaults } from '../data/siteDefaults';

interface ResourceCardItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  fileSize?: string;
  file?: string;
}

function fileTypeLabel(url?: string): string {
  const ext = (url ?? '').split('?')[0]!.split('.').pop()?.toLowerCase() ?? '';
  switch (ext) {
    case 'pdf': return 'PDF Document';
    case 'doc': case 'docx': return 'Word Document';
    case 'ppt': case 'pptx': return 'PowerPoint';
    case 'xls': case 'xlsx': return 'Excel Spreadsheet';
    case 'txt': return 'Text File';
    default: return 'Document';
  }
}

interface DisplaySection {
  title: string;
  description: string;
  accent: string;
  iconBg: string;
  items: ResourceCardItem[];
}

const SECTION_STYLES = [
  { accent: 'border-accent-red', iconBg: 'bg-accent-red/10 text-accent-red' },
  { accent: 'border-royal', iconBg: 'bg-royal/10 text-royal' },
  { accent: 'border-accent-cream', iconBg: 'bg-accent-cream/30 text-ink' },
];

const SECTION_ITEM_ICONS: React.ReactNode[][] = [
  [<BookOpen key="a" size={24} weight="light" />, <Scroll key="b" size={24} weight="light" />, <Crown key="c" size={24} weight="light" />],
  [<Users key="d" size={24} weight="light" />, <GraduationCap key="e" size={24} weight="light" />, <ClipboardText key="f" size={24} weight="light" />],
  [<FileText key="g" size={24} weight="light" />, <Handshake key="h" size={24} weight="light" />, <ClipboardText key="i" size={24} weight="light" />, <Trophy key="j" size={24} weight="light" />],
];

export function Resources() {
  usePageMeta(
    'Resources',
    'Access important PENSA-UENR documents and guides — tenets of the Church, constitutions, and study materials.',
    '/resources',
  );
  const data = useSection('resources', siteDefaults.resources);
  const sections = (
    data.sections && data.sections.length > 0 ? data.sections : siteDefaults.resources.sections
  ).map((section, i) => ({
    ...section,
    ...SECTION_STYLES[i % SECTION_STYLES.length],
    items: section.items.map((item, j) => ({
      ...item,
      icon: SECTION_ITEM_ICONS[i % SECTION_ITEM_ICONS.length]?.[j] ?? <FileText size={24} weight="light" />,
    })),
  })) as DisplaySection[];

  const [active, setActive] = useState<{ section: string; item: ResourceCardItem } | null>(null);

  return (
    <main>
      <PageHeader
        kicker={data.header?.kicker ?? siteDefaults.resources.header.kicker}
        title={data.header?.title ?? siteDefaults.resources.header.title}
        description={data.header?.description ?? siteDefaults.resources.header.description}
        backgroundImage={data.header?.backgroundImage ?? siteDefaults.resources.header.backgroundImage}
      />

      <section className="bg-[#f8faff] px-6 md:px-12 py-16 md:py-24">
        <div className="mx-auto max-w-[1120px] space-y-16">
          {sections.map((section, si) => (
            <div key={`${section.title}-${si}`}>
              <div className={`border-l-4 ${section.accent} pl-5 mb-8`}>
                <h2 className="font-display font-extrabold text-ink text-2xl md:text-3xl mb-2">
                  {section.title}
                </h2>
                <p className="text-ink-soft">{section.description}</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {section.items.map((item) => (
                  <button
                    key={item.title}
                    onClick={() => setActive({ section: section.title, item })}
                    className="group text-left bg-white border border-ink/10 rounded-[18px] p-6 md:p-8 transition-all duration-300 hover:shadow-lg hover:shadow-royal/5 hover:-translate-y-1 cursor-pointer"
                  >
                    <div className={`w-12 h-12 rounded-[12px] ${section.iconBg} grid place-items-center mb-5`}>
                      {item.icon}
                    </div>
                    <h3 className="font-display font-bold text-ink text-lg mb-2">{item.title}</h3>
                    <p className="text-ink-soft leading-relaxed text-sm">{item.description}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {active && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={() => setActive(null)} />
          <div className="relative bg-white rounded-[18px] w-full max-w-md p-8 animate-modal-in">
            <button
              onClick={() => setActive(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-ink/10 hover:bg-ink/20 grid place-items-center transition-colors"
              aria-label="Close"
            >
              <X size={20} className="text-ink" />
            </button>

            <div className="mb-6">
              <p className="text-xs font-extrabold uppercase tracking-wider text-ink-soft mb-2">{active.section}</p>
              <h2 className="font-display font-extrabold text-ink text-xl md:text-2xl">{active.item.title}</h2>
            </div>

            <p className="text-ink-soft leading-relaxed mb-8">{active.item.description}</p>

            <div className="flex items-center justify-between bg-[#f8faff] rounded-[12px] px-5 py-4 mb-6">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-ink-soft mb-1">File Type</p>
                <p className="font-semibold text-ink">{fileTypeLabel(active.item.file)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-extrabold uppercase tracking-wider text-ink-soft mb-1">Size</p>
                <p className="font-semibold text-ink">{active.item.fileSize || 'N/A'}</p>
              </div>
            </div>

            {active.item.file ? (
              <a
                href={active.item.file}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-royal text-white px-6 py-3.5 font-display font-bold text-sm hover:bg-royal-hover transition-colors"
              >
                <Download size={18} weight="bold" />
                Download Document
              </a>
            ) : (
              <div className="w-full text-center rounded-full bg-ink/10 text-ink-soft px-6 py-3.5 font-display font-bold text-sm">
                Document coming soon
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
