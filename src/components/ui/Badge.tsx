import clsx from 'clsx';

type BadgeTone = 'primary' | 'secondary' | 'neutral';

const toneStyles: Record<BadgeTone, string> = {
  primary: 'bg-gradient-to-r from-primary/80 to-white/70 text-text-dark',
  secondary: 'bg-gradient-to-r from-secondary/80 to-white/60 text-text-dark',
  neutral: 'bg-white/30 border border-white/50 text-gray-600 backdrop-blur',
};

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
}

const Badge = ({ label, tone = 'neutral' }: BadgeProps) => (
  <span className={clsx('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide shadow-soft', toneStyles[tone])}>
    {label}
  </span>
);

export default Badge;

