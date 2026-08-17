import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ children, className = '', padding = true }: CardProps) {
  return (
    <div className={`bg-white rounded-[18px] border border-ink/15 ${padding ? 'p-6' : ''} ${className}`}>
      {children}
    </div>
  );
}