import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeSlash } from '@phosphor-icons/react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, type = 'text', className = '', ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const isPassword = type === 'password';
    const resolvedType = isPassword && visible ? 'text' : type;

    return (
      <div className="flex flex-col gap-1.5">
        {label && <label className="text-sm font-bold text-ink">{label}</label>}
        <div className="relative">
          {icon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-blue">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            type={resolvedType}
            className={`w-full bg-white border border-ink/20 rounded-[12px] px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-royal/30 focus:border-royal ${
              icon ? 'pl-10' : ''
            } ${isPassword ? 'pr-11' : ''} ${error ? 'border-danger focus:ring-danger/30 focus:border-danger' : ''} ${className}`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-blue hover:text-ink transition-colors"
              aria-label={visible ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {visible ? <EyeSlash size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
