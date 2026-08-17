import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ArrowClockwise,
  ArrowCounterClockwise,
  CaretRight,
  Compass,
  Eye,
  FloppyDisk,
  FlowArrow,
  Palette,
  Play,
  Sparkle,
  SquaresFour,
  TextT,
  X,
} from '@phosphor-icons/react';
import { settings as settingsApi } from '../../services/api';
import { siteDefaults } from '../../data/siteDefaults';
import {
  clearSettingsOverrides,
  clearSiteSettingsCache,
  markSettingsPublished,
  mergeSectionWithDefault,
  setSettingsOverrides,
} from '../../hooks/useSiteSettings';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { errMsg } from '../../lib/utils';
import { SectionForm } from './contentForms';
import { BrandingForm, ColorsForm, FlowForm, FontsForm, MotionForm, StylesForm } from './designForms';

type BuilderMode = 'page' | 'branding' | 'fonts' | 'colors' | 'styles' | 'motion' | 'flow';

interface SectionDef {
  key: string;
  label: string;
}

interface PageDef {
  id: string;
  label: string;
  sections: SectionDef[];
}

const PAGES: PageDef[] = [
  {
    id: 'home',
    label: 'Home',
    sections: [
      { key: 'hero', label: 'Hero Slides' },
      { key: 'stats', label: 'Stats' },
      { key: 'who_we_are', label: 'Who We Are' },
      { key: 'values', label: 'Values' },
      { key: 'programs', label: 'Programs & Events' },
      { key: 'ministries', label: 'Ministries' },
      { key: 'leadership_preview', label: 'Leadership Preview' },
      { key: 'testimonies', label: 'Testimonies' },
    ],
  },
  { id: 'about', label: 'About', sections: [{ key: 'about', label: 'About Page' }] },
  { id: 'leadership', label: 'Leadership', sections: [{ key: 'leadership', label: 'Leadership Directory' }] },
  { id: 'ministries', label: 'Ministries', sections: [{ key: 'ministries', label: 'Ministries' }] },
  { id: 'pensice', label: 'PENSICE', sections: [{ key: 'pensice', label: 'PENSICE' }] },
  { id: 'plc', label: 'PLC', sections: [{ key: 'plc', label: 'PLC' }] },
  { id: 'cenacle', label: 'Cenacle', sections: [{ key: 'cenacle', label: 'Cenacle' }] },
  { id: 'gallery', label: 'Gallery', sections: [{ key: 'gallery', label: 'Gallery' }] },
  { id: 'news', label: 'News & Events', sections: [{ key: 'news', label: 'News & Events' }] },
  { id: 'resources', label: 'Resources', sections: [{ key: 'resources', label: 'Resources' }] },
  { id: 'contact', label: 'Contact', sections: [{ key: 'contact', label: 'Contact' }] },
  { id: 'footer', label: 'Footer', sections: [{ key: 'footer', label: 'Footer' }] },
];

const NAV_ITEMS: { id: BuilderMode; label: string; icon: ReactNode }[] = [
  { id: 'page', label: 'Page', icon: <SquaresFour size={20} /> },
  { id: 'branding', label: 'Branding', icon: <Sparkle size={20} /> },
  { id: 'fonts', label: 'Fonts', icon: <TextT size={20} /> },
  { id: 'colors', label: 'Colors', icon: <Palette size={20} /> },
  { id: 'styles', label: 'Styles', icon: <Compass size={20} /> },
  { id: 'motion', label: 'Motion', icon: <Play size={20} /> },
  { id: 'flow', label: 'Flow', icon: <FlowArrow size={20} /> },
];

function initialDrafts(): Record<string, any> {
  const data: Record<string, any> = {};
  for (const key of Object.keys(siteDefaults)) {
    data[key] = (siteDefaults as Record<string, any>)[key];
  }
  return data;
}

export function SiteBuilder({ onClose }: { onClose: () => void }) {
  const toast = useToast();

  const [drafts, setDrafts] = useState<Record<string, any>>(() => initialDrafts());
  const savedRef = useRef<Record<string, any>>(initialDrafts());

  // Undo/redo history
  const historyRef = useRef<{ stack: string[]; index: number }>({
    stack: [JSON.stringify(initialDrafts())],
    index: 0,
  });
  const [mode, setMode] = useState<BuilderMode>('page');
  const [pageId, setPageId] = useState('home');
  const [activeSection, setActiveSection] = useState('hero');
  const [saving, setSaving] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [loading, setLoading] = useState(true);

  const page = PAGES.find((p) => p.id === pageId) ?? PAGES[0]!;

  const dirty = JSON.stringify(drafts) !== JSON.stringify(savedRef.current);

  useEffect(() => {
    setSettingsOverrides(drafts);
    return () => clearSettingsOverrides();
  }, [drafts]);

  // Load saved settings once and treat them as the saved baseline.
  useEffect(() => {
    (async () => {
      try {
        const all = await settingsApi.list();
        const data: Record<string, any> = { ...initialDrafts() };
        all.forEach((s) => {
          try {
            data[s.section] = mergeSectionWithDefault(
              JSON.parse(s.value),
              data[s.section],
            );
          } catch {
            data[s.section] = {};
          }
        });
        setDrafts(data);
        savedRef.current = JSON.parse(JSON.stringify(data));
        historyRef.current = { stack: [JSON.stringify(data)], index: 0 };
      } catch (e) {
        toast.error(errMsg(e));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Warn before closing the browser tab with unsaved changes.
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const pushHistory = (snapshot: string) => {
    const h = historyRef.current;
    const nh = [...h.stack.slice(0, h.index + 1), snapshot].slice(-50);
    h.stack = nh;
    h.index = nh.length - 1;
  };

  const update = useCallback(
    (section: string, patch: any) => {
      // Compute the next state outside the setState updater: StrictMode invokes
      // updater functions twice, so pushing history inside them would record
      // every edit twice and break undo/redo.
      const next = { ...drafts, [section]: { ...(drafts[section] || {}), ...patch } };
      pushHistory(JSON.stringify(next));
      setDrafts(next);
    },
    [drafts]
  );

  const undo = () => {
    const h = historyRef.current;
    if (h.index <= 0) return;
    h.index -= 1;
    setDrafts(JSON.parse(h.stack[h.index]!));
  };

  const redo = () => {
    const h = historyRef.current;
    if (h.index >= h.stack.length - 1) return;
    h.index += 1;
    setDrafts(JSON.parse(h.stack[h.index]!));
  };

  const canUndo = historyRef.current.index > 0;
  const canRedo = historyRef.current.index < historyRef.current.stack.length - 1;

  const saveAll = async () => {
    setSaving(true);
    try {
      const changed = Object.keys(drafts).filter(
        (k) => JSON.stringify(drafts[k]) !== JSON.stringify(savedRef.current[k]),
      );
      for (const section of changed) {
        await settingsApi.upsert(section, { value: JSON.stringify(drafts[section] ?? {}) });
      }
      savedRef.current = JSON.parse(JSON.stringify(drafts));
      clearSiteSettingsCache();
      clearSettingsOverrides();
      markSettingsPublished();
      toast.success(changed.length > 0 ? 'Saved & published' : 'No changes to save');
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  const requestClose = () => {
    if (dirty) setConfirmClose(true);
    else onClose();
  };

  const discardAndClose = () => {
    clearSettingsOverrides();
    setConfirmClose(false);
    onClose();
  };

  const saveAndClose = async () => {
    await saveAll();
    setConfirmClose(false);
    onClose();
  };

  const openPreview = () => {
    // Opens a preview of the site with the current drafts applied (?preview=1).
    // The live site (no flag) is untouched until Save & Publish.
    window.open('/?preview=1', '_blank');
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#f0f0f0] flex flex-col">
      {/* ---------- Top bar ---------- */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-white border-b border-ink/10 shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-2 rounded-lg text-ink-soft hover:bg-ink/5 hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Undo"
          >
            <ArrowCounterClockwise size={18} />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-2 rounded-lg text-ink-soft hover:bg-ink/5 hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Redo"
          >
            <ArrowClockwise size={18} />
          </button>
        </div>

        <div className="flex items-center gap-1 text-sm font-bold text-ink-soft ml-2 min-w-0">
          {mode === 'page' && (
            <>
              <span className="text-ink">{page.label}</span>
              <CaretRight size={14} />
              <span className="text-ink-soft truncate">
                {page.sections.find((s) => s.key === activeSection)?.label ?? ''}
              </span>
            </>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={openPreview} icon={<Eye size={15} />}>
            Preview
          </Button>
          <Button size="sm" onClick={saveAll} loading={saving} icon={<FloppyDisk size={15} weight="bold" />}>
            Save & Publish
          </Button>
          <button
            onClick={requestClose}
            className="p-2 rounded-lg text-ink-soft hover:bg-ink/5 hover:text-ink transition-colors"
            title="Close builder"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ---------- Workspace ---------- */}
      <div className="flex flex-1 min-h-0">
        {/* Page & section selection — left sidebar */}
        {mode === 'page' && (
          <aside className="w-[240px] bg-white border-r border-ink/10 flex flex-col min-h-0 shrink-0">
            <div className="p-4 border-b border-ink/10">
              <p className="text-xs font-extrabold uppercase tracking-widest text-ink-soft mb-2">Pages</p>
              <div className="flex flex-wrap gap-1.5">
                {PAGES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setPageId(p.id);
                      setActiveSection(p.sections[0]?.key ?? '');
                    }}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                      pageId === p.id ? 'bg-royal text-white' : 'bg-ink/[0.05] text-ink-soft hover:text-ink'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <p className="text-xs font-extrabold uppercase tracking-widest text-ink-soft mb-2 px-1">Sections</p>
              <div className="space-y-1">
                {page.sections.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setActiveSection(s.key)}
                    className={`w-full text-left px-3 py-2 rounded-[10px] text-sm font-semibold transition-colors ${
                      activeSection === s.key ? 'bg-royal text-white' : 'text-ink-soft hover:bg-ink/5 hover:text-ink'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Canvas workspace — the form fields live on the canvas */}
        <div
          className="flex-1 min-w-0 overflow-y-auto"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(22,40,158,0.15) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        >
          <div className="mx-auto my-6 bg-white min-h-[70vh] max-w-[1100px] p-5 space-y-4">
            {mode === 'page' ? (
              loading ? (
                <p className="text-sm text-ink-soft">Loading…</p>
              ) : (
                <SectionForm section={activeSection} value={drafts[activeSection] || {}} onUpdate={(patch) => update(activeSection, patch)} />
              )
            ) : (
              <>
                {mode === 'branding' && <BrandingForm value={drafts.branding || {}} onUpdate={(patch) => update('branding', patch)} />}
                {mode === 'fonts' && <FontsForm value={drafts.fonts || {}} onUpdate={(patch) => update('fonts', patch)} />}
                {mode === 'colors' && <ColorsForm value={drafts.colors || {}} onUpdate={(patch) => update('colors', patch)} />}
                {mode === 'styles' && <StylesForm value={drafts.styles || {}} onUpdate={(patch) => update('styles', patch)} />}
                {mode === 'motion' && <MotionForm value={drafts.motion || {}} onUpdate={(patch) => update('motion', patch)} />}
                {mode === 'flow' && <FlowForm value={drafts.flow || {}} onUpdate={(patch) => update('flow', patch)} />}
              </>
            )}
          </div>
        </div>

        {/* Right nav rail */}
        <aside className="w-[76px] bg-white border-l border-ink/10 flex flex-col items-center py-3 gap-1 shrink-0">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setMode(item.id)}
              className={`flex flex-col items-center gap-1 w-[64px] py-2.5 rounded-[14px] transition-all ${
                mode === item.id
                  ? 'bg-white text-royal border border-royal/25 shadow-sm'
                  : 'text-ink-soft hover:bg-ink/5 hover:text-ink border border-transparent'
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-extrabold">{item.label}</span>
            </button>
          ))}
        </aside>
      </div>

      {/* ---------- Unsaved changes guard ---------- */}
      <Modal open={confirmClose} onClose={() => setConfirmClose(false)} title="Unsaved changes">
        <p className="text-sm text-ink-soft mb-6">
          You have unsaved changes. They are mandatory to save before leaving — otherwise your edits will be lost.
        </p>
        <div className="flex flex-col gap-2">
          <Button onClick={saveAndClose} loading={saving} icon={<FloppyDisk size={15} weight="bold" />}>
            Save & Publish
          </Button>
          <Button variant="secondary" onClick={discardAndClose}>
            Discard changes
          </Button>
          <Button variant="ghost" onClick={() => setConfirmClose(false)}>
            Keep editing
          </Button>
        </div>
      </Modal>
    </div>
  );
}
