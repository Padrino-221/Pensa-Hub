import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { CircleNotch } from '@phosphor-icons/react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'warning' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

const VARIANTS = {
  primary: 'bg-royal text-white hover:bg-royal-400',
  secondary: 'bg-white text-ink border border-ink/20 hover:border-ink/40 hover:bg-ink/[0.03]',
  accent: 'bg-accent-cream text-ink hover:bg-accent-cream-hover',
  danger: 'bg-danger text-white hover:bg-red-600',
  warning: 'bg-warning text-white hover:bg-amber-500',
  ghost: 'text-ink-soft hover:bg-ink/5 hover:text-ink',
  outline: 'border-2 border-royal text-royal hover:bg-royal hover:text-white',
};

const SIZES = {
  sm: 'px-3.5 py-1.5 text-xs gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-7 py-3 text-[15px] gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, children, className = '', disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-full font-display font-extrabold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading ? <CircleNotch size={16} className="animate-spin" /> : icon}
      {children}
    </button>
  )
);
Button.displayName = 'Button';