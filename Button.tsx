import type { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

const baseStyles =
  'inline-flex items-center justify-center rounded-full text-sm font-semibold tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 shadow-soft';

const variantStyles: Record<string, string> = {
  primary:
    'bg-gradient-to-r from-primary/90 via-white/80 to-secondary/70 text-midnight px-6 py-2.5 hover:-translate-y-0.5',
  secondary:
    'bg-gradient-to-r from-white/70 to-secondary/40 text-text-dark px-6 py-2.5 border border-white/50 backdrop-blur hover:-translate-y-0.5',
  ghost:
    'px-4 py-2 border border-white/40 bg-white/10 text-gray-600 hover:bg-white/30 backdrop-blur',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

const Button = ({ className, variant = 'primary', ...props }: ButtonProps) => {
  return <button className={clsx(baseStyles, variantStyles[variant], className)} {...props} />;
};

export default Button;

