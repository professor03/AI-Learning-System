import type { HTMLAttributes } from 'react';
import clsx from 'clsx';

type CardVariant = 'default' | 'accent' | 'coaching' | 'outline';

const variantStyles: Record<CardVariant, string> = {
  default: 'glass-panel hover:shadow-glow',
  accent: 'glass-panel bg-gradient-to-br from-white/80 via-secondary/20 to-white/50 border-white/40 shadow-glow',
  coaching: 'bg-gradient-to-br from-amber-100/80 to-amber-50/70 border border-amber-200/60 text-amber-900 shadow-glow backdrop-blur-2xl',
  outline: 'bg-white/20 border border-white/50 backdrop-blur-xl hover:shadow-soft',
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const Card = ({ className, variant = 'default', ...props }: CardProps) => (
  <div
    className={clsx(
      'rounded-3xl p-6 transition-all duration-500',
      variantStyles[variant],
      className
    )}
    {...props}
  />
);

export default Card;

