import { forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { CaretDown, Check } from '@phosphor-icons/react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
}

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  ({ label, error, options, placeholder, value = '', onChange, disabled, id, name, className = '' }, _ref) => {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(-1);
    const [pos, setPos] = useState<{ top: number; left: number; width: number; flipUp: boolean } | null>(null);
    const rootRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    const selected = options.find((o) => o.value === value);

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
      const trigger = triggerRef.current;
      const panel = panelRef.current;
      if (!trigger || !panel) return;
      const rect = trigger.getBoundingClientRect();
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

    const select = (opt: SelectOption) => {
      onChange?.({ target: { value: opt.value } });
      setOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!open) {
          setOpen(true);
          setActive(Math.max(0, options.findIndex((o) => o.value === value)));
          return;
        }
        const dir = e.key === 'ArrowDown' ? 1 : -1;
        setActive((prev) => {
          const next = prev + dir;
          if (next < 0) return options.length - 1;
          if (next >= options.length) return 0;
          return next;
        });
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (open && active >= 0 && options[active]) {
          select(options[active]!);
        } else {
          setOpen(true);
        }
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    const highlight = (opt: SelectOption) =>
      value === opt.value || (active >= 0 && options[active] === opt);

    return (
      <div ref={rootRef} className={`flex flex-col gap-1.5 ${className}`}>
        {label && <label className="text-sm font-bold text-ink">{label}</label>}
        <button
          ref={triggerRef}
          type="button"
          id={id}
          name={name}
          disabled={disabled}
          onClick={() => !disabled && setOpen((v) => !v)}
          onKeyDown={onKeyDown}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={`w-full flex items-center justify-between gap-2 bg-white border rounded-[12px] px-4 py-2.5 text-sm text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-royal/30 focus:border-royal disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? 'border-danger focus:ring-danger/30 focus:border-danger' : 'border-ink/20'
          }`}
        >
          <span className={`truncate ${selected ? 'text-ink' : 'text-ink-soft/60'}`}>
            {selected ? selected.label : placeholder || 'Select…'}
          </span>
          <CaretDown size={16} className={`text-muted-blue shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>
        {error && <p className="text-xs text-danger">{error}</p>}
        {open && createPortal(
          <div
            ref={panelRef}
            role="listbox"
            className="fixed z-[120] bg-white rounded-[14px] border border-ink/20 py-1.5 max-h-64 overflow-y-auto animate-dropdown-in shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)]"
            style={{
              top: pos?.top ?? 0,
              left: pos?.left ?? 0,
              width: pos?.width ?? '100%',
              visibility: pos ? 'visible' : 'hidden',
            }}
          >
            {placeholder && (
              <button
                type="button"
                onClick={() => select({ value: '', label: placeholder })}
                className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm transition-colors ${
                  value === '' ? 'text-ink bg-ink/[0.04]' : 'text-ink-soft hover:bg-ink/5'
                }`}
              >
                {placeholder}
                {value === '' && <Check size={15} className="text-royal shrink-0" />}
              </button>
            )}
            {options.length === 0 && !placeholder && (
              <p className="px-4 py-3 text-sm text-ink-soft">No options</p>
            )}
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={value === opt.value}
                onMouseEnter={() => setActive(options.indexOf(opt))}
                onClick={() => select(opt)}
                className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm transition-colors ${
                  highlight(opt) ? 'text-ink bg-ink/[0.04]' : 'text-ink-soft hover:bg-ink/5'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {value === opt.value && <Check size={15} className="text-royal shrink-0" />}
              </button>
            ))}
          </div>,
          document.body,
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';
