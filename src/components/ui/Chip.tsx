import clsx from 'clsx';

type ChipTone = 'success' | 'warning' | 'error';

const toneStyles: Record<ChipTone, string> = {
  success: 'bg-emerald-100/70 text-emerald-800 border border-emerald-200/70',
  warning: 'bg-amber-100/80 text-amber-800 border border-amber-200/70',
  error: 'bg-rose-100/80 text-rose-700 border border-rose-200/70',
};

interface ChipProps {
  label: string;
  tone?: ChipTone;
}

const Chip = ({ label, tone = 'success' }: ChipProps) => (
  <span className={clsx('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold backdrop-blur', toneStyles[tone])}>
    {label}
  </span>
);

export default Chip;

