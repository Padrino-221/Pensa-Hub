import { type ReactNode } from 'react';

type BadgeVariant = 'default' | 'success' | 'danger' | 'warning' | 'info' | 'accent';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}

const VARIANTS: Record<BadgeVariant, string> = {
  default: 'bg-ink/[0.06] text-ink-soft',
  success: 'bg-success-bg text-success',
  danger: 'bg-danger-bg text-danger',
  warning: 'bg-warning-bg text-warning',
  info: 'bg-royal/10 text-royal',
  accent: 'bg-accent-cream/40 text-accent',
};

const DOT_COLORS: Record<BadgeVariant, string> = {
  default: 'bg-ink-soft',
  success: 'bg-success',
  danger: 'bg-danger',
  warning: 'bg-warning',
  info: 'bg-royal',
  accent: 'bg-accent',
};

export function Badge({ children, variant = 'default', dot, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full ${VARIANTS[variant]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${DOT_COLORS[variant]}`} />}
      {children}
    </span>
  );
}