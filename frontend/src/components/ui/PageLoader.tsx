import { CircleNotch } from '@phosphor-icons/react';

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-3">
        <CircleNotch size={32} className="animate-spin text-royal" />
        <p className="text-sm text-ink-soft">Loading…</p>
      </div>
    </div>
  );
}