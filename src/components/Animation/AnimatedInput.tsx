import { useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

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
        animate={{ color: focused ? '#c084fc' : '#ffffff80' }}
        transition={{ duration: 0.2 }}
      >
        {label}
      </motion.label>

      <div
        className={cn(
          'relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-300',
          focused
            ? 'border-purple-400 bg-white/10 shadow-[0_0_0_4px_rgba(168,85,247,0.15)]'
            : 'border-white/10 bg-black/40',
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
              ? 'text-white/50 cursor-default'
              : focused
                ? 'text-purple-400'
                : 'text-white/90',
          )}
        />
        {suffix}
      </div>
    </div>
  );
}
