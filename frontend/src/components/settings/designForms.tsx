import { Trash } from '@phosphor-icons/react';
import { Button } from '../ui/Button';
import { ImageUpload } from '../ui/ImageUpload';
import { Select } from '../ui/Select';
import { Field, TextInput, AddRemove } from './contentForms';

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-bold text-ink">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-royal' : 'bg-ink/20'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={/^#[0-9a-fA-F]{6}$/.test(value ?? '') ? value : '#16289e'}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded-[10px] border border-ink/20 bg-white p-1 cursor-pointer shrink-0"
      />
      <div className="flex-1">
        <label className="block text-sm font-bold text-ink mb-1">{label}</label>
        <TextInput value={value ?? ''} onChange={onChange} placeholder="#16289e" />
      </div>
    </div>
  );
}

export function BrandingForm({ value, onUpdate }: { value: any; onUpdate: (patch: any) => void }) {
  return (
    <div className="space-y-4">
      <ImageUpload label="Logo image" value={value?.logo} onChange={(v) => onUpdate({ logo: v })} aspect="aspect-square" />
      <Field label="Brand name (dashboard)"><TextInput value={value?.brandName} onChange={(v) => onUpdate({ brandName: v })} placeholder="PU-HUB" /></Field>
      <Field label="Brand tagline (dashboard)"><TextInput value={value?.brandTagline} onChange={(v) => onUpdate({ brandTagline: v })} placeholder="PENSA UENR Hub" /></Field>
      <Field label="Site name (header)"><TextInput value={value?.siteName} onChange={(v) => onUpdate({ siteName: v })} placeholder="PENSA-UENR" /></Field>
      <Field label="Site tagline"><TextInput value={value?.siteTagline} onChange={(v) => onUpdate({ siteTagline: v })} placeholder="Pentecost Students & Associates · UENR" /></Field>
    </div>
  );
}

export function FontsForm({ value, onUpdate }: { value: any; onUpdate: (patch: any) => void }) {
  return (
    <div className="space-y-4">
      <Field label="Display font"><TextInput value={value?.displayFont} onChange={(v) => onUpdate({ displayFont: v })} placeholder="Sora" /></Field>
      <Field label="Body font"><TextInput value={value?.bodyFont} onChange={(v) => onUpdate({ bodyFont: v })} placeholder="Plus Jakarta Sans" /></Field>
      <p className="text-xs text-ink-soft">Font names are used as the CSS font-family. Ensure the font is loaded (Google Fonts) for it to render.</p>
    </div>
  );
}

export function ColorsForm({ value, onUpdate }: { value: any; onUpdate: (patch: any) => void }) {
  return (
    <div className="space-y-3">
      <ColorField label="Primary" value={value?.primary} onChange={(v) => onUpdate({ primary: v })} />
      <ColorField label="Primary dark" value={value?.primaryDark} onChange={(v) => onUpdate({ primaryDark: v })} />
      <ColorField label="Primary light" value={value?.primaryLight} onChange={(v) => onUpdate({ primaryLight: v })} />
      <ColorField label="Accent" value={value?.accent} onChange={(v) => onUpdate({ accent: v })} />
      <ColorField label="Accent cream" value={value?.accentCream} onChange={(v) => onUpdate({ accentCream: v })} />
      <ColorField label="Surface" value={value?.surface} onChange={(v) => onUpdate({ surface: v })} />
      <ColorField label="Text" value={value?.text} onChange={(v) => onUpdate({ text: v })} />
      <ColorField label="Text muted" value={value?.textMuted} onChange={(v) => onUpdate({ textMuted: v })} />
    </div>
  );
}

export function StylesForm({ value, onUpdate }: { value: any; onUpdate: (patch: any) => void }) {
  return (
    <div className="space-y-4">
      <Field label="Corner radius (px)">
        <input
          type="number"
          min={0}
          max={48}
          className="w-full bg-white border border-ink/20 rounded-[12px] px-3.5 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-royal/30 focus:border-royal"
          value={value?.cornerRadius ?? 16}
          onChange={(e) => onUpdate({ cornerRadius: Number(e.target.value) || 0 })}
        />
      </Field>
      <Field label="Button style">
        <Select
          options={[
            { value: 'filled', label: 'Filled' },
            { value: 'outline', label: 'Outline' },
            { value: 'shadowed', label: 'Shadowed' },
          ]}
          value={value?.buttonStyle ?? 'filled'}
          onChange={(e) => onUpdate({ buttonStyle: e.target.value })}
        />
      </Field>
      <Toggle label="Show icons in components" checked={!!value?.showIcons} onChange={(v) => onUpdate({ showIcons: v })} />
      <Field label="Icon alignment">
        <Select
          options={[
            { value: 'left', label: 'Left' },
            { value: 'right', label: 'Right' },
          ]}
          value={value?.iconAlignment ?? 'left'}
          onChange={(e) => onUpdate({ iconAlignment: e.target.value })}
        />
      </Field>
    </div>
  );
}

export function MotionForm({ value, onUpdate }: { value: any; onUpdate: (patch: any) => void }) {
  return (
    <div className="space-y-4">
      <Toggle label="Scroll reveal animations" checked={!!value?.revealAnimations} onChange={(v) => onUpdate({ revealAnimations: v })} />
      <Toggle label="Auto-play carousels" checked={!!value?.autoPlayCarousels} onChange={(v) => onUpdate({ autoPlayCarousels: v })} />
      <Toggle label="Hover effects & transitions" checked={!!value?.hoverEffects} onChange={(v) => onUpdate({ hoverEffects: v })} />
    </div>
  );
}

export function FlowForm({ value, onUpdate }: { value: any; onUpdate: (patch: any) => void }) {
  const navGroups = value?.navGroups ?? [];
  const setGroups = (navGroups: any[]) => onUpdate({ navGroups });
  const setGroupAt = (i: number, patch: any) => {
    const next = [...navGroups];
    next[i] = { ...(next[i] || {}), ...patch };
    setGroups(next);
  };
  const setChildAt = (gi: number, ci: number, patch: any) => {
    const next = [...navGroups];
    const children = [...(next[gi]?.children ?? [])];
    children[ci] = { ...(children[ci] || {}), ...patch };
    next[gi] = { ...(next[gi] || {}), children };
    setGroups(next);
  };
  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-soft">Top navigation links shown in the website header. Items with children appear as dropdowns.</p>
      <AddRemove
        count={navGroups.length}
        addLabel="Add nav item"
        itemLabel="Nav item"
        getTitle={(i) => navGroups[i]?.label || ''}
        onAdd={() => setGroups([...navGroups, { label: '', href: '/', children: [] }])}
        onRemove={(i) => setGroups(navGroups.filter((_: any, idx: number) => idx !== i))}
      >
        {(i) => {
          const children = navGroups[i]?.children ?? [];
          return (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Field label="Label"><TextInput value={navGroups[i]?.label} onChange={(v) => setGroupAt(i, { label: v })} /></Field>
                <Field label="Href"><TextInput value={navGroups[i]?.href} onChange={(v) => setGroupAt(i, { href: v })} /></Field>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-ink">Dropdown children</label>
                {children.map((c: any, ci: number) => (
                  <div key={ci} className="flex gap-2 items-start">
                    <TextInput value={c?.label} onChange={(v) => setChildAt(i, ci, { label: v })} placeholder="Label" />
                    <TextInput value={c?.href} onChange={(v) => setChildAt(i, ci, { href: v })} placeholder="/about" />
                    <button
                      type="button"
                      onClick={() => setGroupAt(i, { children: children.filter((_: any, idx: number) => idx !== ci) })}
                      className="mt-1 shrink-0 p-1.5 rounded-lg text-danger hover:bg-danger/10 transition-colors"
                      aria-label="Remove"
                      title="Remove"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="self-start"
                  onClick={() => setGroupAt(i, { children: [...children, { label: '', href: '/' }] })}
                >
                  Add child
                </Button>
              </div>
            </div>
          );
        }}
      </AddRemove>
    </div>
  );
}
