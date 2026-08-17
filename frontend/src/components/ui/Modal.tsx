import { useEffect, type ReactNode } from 'react';
import { X } from '@phosphor-icons/react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  footer?: ReactNode;
}

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function Modal({ open, onClose, title, children, size = 'md', footer }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-[18px] w-full ${SIZES[size]} animate-modal-in`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-ink/10">
            <h2 className="font-display font-extrabold text-lg text-ink">{title}</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-ink/5 text-ink-soft transition-colors">
              <X size={20} />
            </button>
          </div>
        )}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-ink/10">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}