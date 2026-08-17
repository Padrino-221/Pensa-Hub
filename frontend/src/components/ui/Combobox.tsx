import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';

interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  label?: string;
  required?: boolean;
}

export function Combobox({ value, onChange, options, placeholder, label, required }: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [pos, setPos] = useState<{ top: number; left: number; width: number; flipUp: boolean } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const filtered = options.filter((o) => o.toLowerCase().includes(value.toLowerCase()));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const place = useCallback(() => {
    const input = inputRef.current;
    const panel = panelRef.current;
    if (!input || !panel) return;
    const rect = input.getBoundingClientRect();
    const panelH = panel.offsetHeight;
    const panelW = Math.max(rect.width, 200);
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const flipUp = spaceBelow < panelH + 8 && rect.top > panelH + 8;
    setPos({
      top: flipUp ? rect.top - panelH - 8 : rect.bottom + 8,
      left: Math.min(Math.max(8, rect.left), Math.max(8, window.innerWidth - panelW - 8)),
      width: rect.width,
      flipUp,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    place();
    const raf = requestAnimationFrame(place);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, place]);

  const pick = (option: string) => {
    onChange(option);
    setOpen(false);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setActive(-1);
        return;
      }
      setActive((prev) => {
        if (filtered.length === 0) return -1;
        const dir = e.key === 'ArrowDown' ? 1 : -1;
        const next = prev + dir;
        if (next < 0) return filtered.length - 1;
        if (next >= filtered.length) return 0;
        return next;
      });
    } else if (e.key === 'Enter') {
      if (open && active >= 0 && filtered[active]) {
        e.preventDefault();
        pick(filtered[active]!);
      } else {
        setOpen(false);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-bold text-ink">{label}</label>}
      <input
        ref={inputRef}
        type="text"
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        className="w-full bg-white border border-ink/20 rounded-[12px] px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-royal/30 focus:border-royal"
      />
      {open && filtered.length > 0 && createPortal(
        <div
          ref={panelRef}
          role="listbox"
          className="fixed z-[120] bg-white rounded-[14px] border border-ink/20 py-1.5 max-h-56 overflow-y-auto animate-dropdown-in shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)]"
          style={{
            top: pos?.top ?? 0,
            left: pos?.left ?? 0,
            width: pos?.width ?? '100%',
            visibility: pos ? 'visible' : 'hidden',
          }}
        >
          {filtered.map((option, i) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onClick={() => pick(option)}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                i === active ? 'text-ink bg-ink/[0.04]' : 'text-ink-soft hover:bg-ink/5'
              }`}
            >
              {option}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </div>
  );
}
