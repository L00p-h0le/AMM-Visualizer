import { useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export function AnimatedInput({
  label,
  value,
  onValueChange,
  readOnly = false,
  suffix,
}: {
  label: string;
  value: string | number;
  onValueChange?: (v: number) => void;
  readOnly?: boolean;
  suffix?: ReactNode;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="space-y-1.5">
      <motion.label
        className="text-xs font-medium uppercase block"
        animate={{ color: focused ? '#6366f1' : '#94a3b8' }}
        transition={{ duration: 0.2 }}
      >
        {label}
      </motion.label>

      <div
        className={cn(
          'relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-300',
          focused
            ? 'border-indigo-400 bg-white shadow-[0_0_0_4px_rgba(99,102,241,0.08)]'
            : 'border-slate-200 bg-slate-50',
          readOnly && 'opacity-75',
        )}
      >
        <input
          type="number"
          value={value}
          onChange={onValueChange ? (e) => onValueChange(Number(e.target.value)) : undefined}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          readOnly={readOnly}
          className={cn(
            'bg-transparent text-xl font-bold w-full outline-none transition-colors duration-200',
            readOnly
              ? 'text-slate-400 cursor-default'
              : focused
                ? 'text-indigo-700'
                : 'text-slate-800',
          )}
        />
        {suffix}
      </div>
    </div>
  );
}
