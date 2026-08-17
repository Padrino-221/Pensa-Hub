import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { CheckCircle, Info, WarningCircle, X } from '@phosphor-icons/react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const ICONS: Record<ToastType, ReactNode> = {
  success: <CheckCircle size={20} weight="fill" className="text-success shrink-0" />,
  error: <WarningCircle size={20} weight="fill" className="text-danger shrink-0" />,
  info: <Info size={20} weight="fill" className="text-info shrink-0" />,
};

const BAR: Record<ToastType, string> = {
  success: 'bg-success',
  error: 'bg-danger',
  info: 'bg-info',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((type: ToastType, message: string) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev.slice(-4), { id, type, message }]);
    window.setTimeout(() => dismiss(id), 4500);
  }, [dismiss]);

  const api = useMemo<ToastContextType>(
    () => ({
      success: (m) => push('success', m),
      error: (m) => push('error', m),
      info: (m) => push('info', m),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-4 right-4 z-[120] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="relative overflow-hidden bg-white rounded-[14px] border border-ink/15 shadow-lg py-3.5 pl-4 pr-10 animate-toast-in"
          >
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${BAR[t.type]}`} />
            <div className="flex items-center gap-3">
              {ICONS[t.type]}
              <p className="text-sm text-ink leading-snug">{t.message}</p>
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="absolute right-2.5 top-2.5 text-ink-soft hover:text-ink transition-colors"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
