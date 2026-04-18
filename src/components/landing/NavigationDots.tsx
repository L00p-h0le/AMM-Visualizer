import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

const SECTIONS = [
  { id: 'tools', label: 'Explorer' },
  { id: 'simulation', label: 'Simulation' },
  { id: 'how-it-works', label: 'Education' },
];

interface NavigationDotsProps {
  /** Index within SECTIONS (0 = tools, 1 = simulation, 2 = education). -1 = none active (hero). */
  activeIndex: number;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

export const NavigationDots = ({ activeIndex, scrollContainerRef }: NavigationDotsProps) => {
  const handleClick = (sectionIndex: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    // +1 offset because hero is child[0] in the scroll container
    const target = container.children[sectionIndex + 1] as HTMLElement;
    target?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-4">
      {SECTIONS.map((section, i) => (
        <button
          key={section.id}
          onClick={() => handleClick(i)}
          className="group relative flex items-center"
          aria-label={`Go to ${section.label}`}
        >
          {/* Tooltip */}
          <span className={cn(
            "absolute right-8 whitespace-nowrap text-xs font-medium px-2 py-1 rounded-md transition-all duration-200 pointer-events-none",
            "opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0",
            activeIndex === i
              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
              : "bg-white/10 text-white/60 border border-white/10"
          )}>
            {section.label}
          </span>

          {/* Dot */}
          <motion.div
            className={cn(
              "rounded-full transition-colors duration-300 border",
              activeIndex === i
                ? "bg-purple-500 border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                : "bg-white/20 border-white/10 hover:bg-white/40"
            )}
            animate={{
              width: activeIndex === i ? 12 : 8,
              height: activeIndex === i ? 12 : 8,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          />
        </button>
      ))}
    </nav>
  );
};
