import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CaretLeft, CaretRight, CalendarBlank } from '@phosphor-icons/react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
  placeholder?: string;
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function DatePicker({ value, onChange, label, placeholder = 'Select date' }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [flipUp, setFlipUp] = useState(false);
  const d = value ? new Date(value + 'T00:00:00') : new Date();
  const [viewYear, setViewYear] = useState(d.getFullYear());
  const [viewMonth, setViewMonth] = useState(d.getMonth());

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Position the floating calendar under the trigger; flip upward when it
  // would overflow the viewport. Repositions on scroll/resize so it stays
  // anchored even inside scrollable modal bodies.
  const place = useCallback(() => {
    const trigger = triggerRef.current;
    const panel = panelRef.current;
    if (!trigger || !panel) return;
    const rect = trigger.getBoundingClientRect();
    const panelH = panel.offsetHeight;
    const panelW = panel.offsetWidth;
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const up = spaceBelow < panelH + 8 && rect.top > panelH + 8;
    setFlipUp(up);
    setPos({
      top: up ? rect.top - panelH - 8 : rect.bottom + 8,
      left: Math.min(Math.max(8, rect.left), Math.max(8, window.innerWidth - panelW - 8)),
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

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const select = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onChange(`${viewYear}-${mm}-${dd}`);
    setOpen(false);
  };

  const moveMonth = (dir: 1 | -1) => {
    if (dir === 1) {
      if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
      else setViewMonth(viewMonth + 1);
    } else {
      if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
      else setViewMonth(viewMonth - 1);
    }
  };

  return (
    <div ref={triggerRef} className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-bold text-ink">{label}</label>}
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
        }}
        className="w-full flex items-center gap-2 bg-white border border-ink/20 rounded-[12px] px-4 py-2.5 text-sm text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-royal/30 focus:border-royal"
      >
        <CalendarBlank size={16} className="text-muted-blue shrink-0" />
        <span className={value ? 'text-ink' : 'text-ink-soft/60'}>{value || placeholder}</span>
      </button>
      {open && createPortal(
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Date picker"
          className="fixed z-[120] bg-white rounded-[14px] border border-ink/20 p-4 w-72 animate-dropdown-in shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)]"
          style={{ top: pos?.top ?? 0, left: pos?.left ?? 0, visibility: pos ? 'visible' : 'hidden' }}
        >
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={() => moveMonth(-1)} aria-label="Previous month">
              <CaretLeft size={16} className="text-ink-soft" />
            </button>
            <span className="text-sm font-extrabold font-display">{MONTHS[viewMonth]} {viewYear}</span>
            <button type="button" onClick={() => moveMonth(1)} aria-label="Next month">
              <CaretRight size={16} className="text-ink-soft" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-[10px] font-bold text-ink-soft py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((day, i) =>
              day === null ? (
                <div key={`e-${i}`} />
              ) : (
                <button
                  key={day}
                  type="button"
                  onClick={() => select(day)}
                  className={`w-8 h-8 mx-auto text-sm rounded-lg transition-colors ${
                    value === `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                      ? 'bg-royal text-white font-bold'
                      : 'hover:bg-ink/5 text-ink'
                  }`}
                >
                  {day}
                </button>
              )
            )}
          </div>
          {flipUp && (
            <div className="mt-3 pt-3 border-t border-ink/10 flex justify-between">
              <button
                type="button"
                onClick={() => moveMonth(-1)}
                className="text-xs font-bold text-royal hover:underline"
              >
                Prev month
              </button>
              <button
                type="button"
                onClick={() => moveMonth(1)}
                className="text-xs font-bold text-royal hover:underline"
              >
                Next month
              </button>
            </div>
          )}
        </div>,
        document.body,
      )}
    </div>
  );
}
