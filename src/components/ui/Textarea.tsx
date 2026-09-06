import type { TextareaHTMLAttributes } from 'react';
import clsx from 'clsx';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

const Textarea = ({ label, className, id, rows = 4, ...props }: TextareaProps) => {
  const inputId = id ?? `textarea-${label}`;
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-text-dark" htmlFor={inputId}>
      {label}
      <textarea
        id={inputId}
        rows={rows}
        className={clsx(
          'rounded-2xl border border-white/50 bg-white/60 px-4 py-3 text-text-dark placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-secondary/40 backdrop-blur shadow-inner transition-all',
          className
        )}
        {...props}
      />
    </label>
  );
};

export default Textarea;

