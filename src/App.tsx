import { useRef, useState, useEffect } from 'react';

import { HeroSection } from './components/landing/HeroSection';
import { NavigationDots } from './components/landing/NavigationDots';
import { useExplorerSections } from './components/ExplorerRoot';

export default function App() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(-1);

  const { ExplorerTools, SimulationSection, EducationSection } = useExplorerSections();

  /* Track which section is in view */
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const sections = Array.from(container.children) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = sections.indexOf(entry.target as HTMLElement);
            if (index !== -1) setActiveSection(index - 1); // -1 offset: hero=-1, tools=0, sim=1, edu=2
          }
        });
      },
      { root: container, threshold: 0.6 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="dark bg-[#030303] text-white/90 selection:bg-purple-500/30">
      {activeSection >= 0 && (
        <NavigationDots activeIndex={activeSection} scrollContainerRef={scrollRef} />
      )}

      <div
        ref={scrollRef}
        className="snap-container"
      >
        {/* 1. Hero */}
        <section className="snap-hero flex items-center justify-center">

          <HeroSection />
        </section>

        {/* 2. Core Tools */}
        <section id="tools" className="snap-section flex items-center bg-[#f8f7ff] border-t border-black/5 text-slate-900">
          <div className="max-w-7xl mx-auto px-6 md:px-10 w-full py-20">
            <div className="light">
              {ExplorerTools}
            </div>
          </div>
        </section>

        {/* 3. Process Simulation */}
        <section id="simulation" className="snap-section flex items-center bg-slate-50 border-t border-black/5 text-slate-900">
          <div className="max-w-7xl mx-auto px-6 md:px-10 w-full py-20">
            <div className="light">
              {SimulationSection}
            </div>
          </div>
        </section>

        {/* 4. Education */}
        <section id="how-it-works" className="snap-section flex items-center bg-[#f1f3f9] border-y border-black/5 text-slate-900">
          <div className="max-w-7xl mx-auto px-6 md:px-10 w-full py-20">
            <div className="light">
              {EducationSection}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="snap-footer text-center py-10 text-white/20 text-sm border-t border-white/5 bg-[#030303]">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="font-heading font-bold text-white/40">AMM Explorer Visualizer</span>
          </div>
          Built for educational purposes &bull; 2026
        </footer>
      </div>
    </div>
  );
}
