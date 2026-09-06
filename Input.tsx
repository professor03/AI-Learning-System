import type { InputHTMLAttributes } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input = ({ label, className, id, ...props }: InputProps) => {
  const inputId = id ?? `input-${label}`;
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-text-dark" htmlFor={inputId}>
      {label}
      <input
        id={inputId}
        className={clsx(
          'rounded-2xl border border-gray-300 bg-white/80 px-4 py-3 text-text-dark placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-secondary/40 backdrop-blur shadow-inner transition-all',
          className
        )}
        {...props}
      />
    </label>
  );
};

export default Input;

