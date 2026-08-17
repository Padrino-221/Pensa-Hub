import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface DropdownItem {
  label: string;
  icon?: ReactNode;
  danger?: boolean;
  onClick: () => void;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
}

export function Dropdown({ trigger, items, align = 'right' }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

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
    const triggerEl = triggerRef.current;
    const panel = panelRef.current;
    if (!triggerEl || !panel) return;
    const rect = triggerEl.getBoundingClientRect();
    const panelH = panel.offsetHeight;
    const panelW = panel.offsetWidth;
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const flipUp = spaceBelow < panelH + 8 && rect.top > panelH + 8;
    const left = align === 'right' ? rect.right - panelW : rect.left;
    setPos({
      top: flipUp ? rect.top - panelH - 8 : rect.bottom + 8,
      left: Math.min(Math.max(8, left), Math.max(8, window.innerWidth - panelW - 8)),
    });
  }, [align]);

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

  return (
    <div ref={rootRef} className="relative">
      <div ref={triggerRef} onClick={() => setOpen(!open)} className="cursor-pointer">{trigger}</div>
      {open && createPortal(
        <div
          ref={panelRef}
          className="fixed z-[120] w-48 bg-white rounded-[14px] border border-ink/20 py-1.5 animate-dropdown-in shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)]"
          style={{ top: pos?.top ?? 0, left: pos?.left ?? 0, visibility: pos ? 'visible' : 'hidden' }}
        >
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => { item.onClick(); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                item.danger
                  ? 'text-danger hover:bg-danger-bg'
                  : 'text-ink hover:bg-ink/5'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </div>
  );
}
