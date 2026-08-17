import { useEffect } from 'react';
import { Warning } from '@phosphor-icons/react';
import { Button } from './Button';

interface ConfirmAlertProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning';
  loading?: boolean;
}

export function ConfirmAlert({
  open, onClose, onConfirm, title, message,
  confirmLabel = 'Confirm', variant = 'danger', loading,
}: ConfirmAlertProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[18px] w-full max-w-sm animate-modal-in">
        <div className="flex flex-col items-center text-center px-6 pt-6 pb-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
            variant === 'danger' ? 'bg-danger-bg' : 'bg-warning-bg'
          }`}>
            <Warning size={28} weight="fill" className={variant === 'danger' ? 'text-danger' : 'text-warning'} />
          </div>
          <h3 className="font-display font-extrabold text-lg text-ink mb-2">{title}</h3>
          <p className="text-sm text-ink-soft">{message}</p>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant={variant} className="flex-1" onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}