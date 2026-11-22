import { useEffect, useRef } from 'react';
import createScrollLanding from './createScrollLanding';

export default function usePortfolioEntrance(sectionRef) {
  const backgroundRevealRef = useRef({ visible: false, startedAt: null });
  useEffect(() => {
    const section = sectionRef.current;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let previousScroll = window.scrollY;
    function setVisibility(visible, animate = false) {
      section.dataset.portfolioEntrance = visible ? 'complete' : 'waiting';
      backgroundRevealRef.current = {
        visible,
        startedAt: animate && !reduced.matches ? performance.now() : null,
      };
    }
    const landing = createScrollLanding(1000, {
      onStart() { section.dataset.portfolioEntrance = 'snapping'; },
      onFinish() { setVisibility(true, true); },
      onInterrupt() { setVisibility(true, true); },
    });

    function update() {
      frame = 0;
      const top = section.getBoundingClientRect().top;
      const scrollingDown = window.scrollY > previousScroll;
      previousScroll = window.scrollY;
      if (landing.moving) return;
      const { visible } = backgroundRevealRef.current;
      if (visible && top > innerHeight * .65) setVisibility(false);
      if (visible || top > innerHeight * .5) return;
      if (top <= 1 || reduced.matches) {
        landing.cancel();
        setVisibility(true, top > -innerHeight * .25);
      } else if (scrollingDown) {
        landing.schedule(() => {
          const remaining = section.getBoundingClientRect().top;
          return remaining > 1 && remaining <= innerHeight * .5 && !document.querySelector('dialog[open]')
            ? window.scrollY + remaining : null;
        });
      }
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    setVisibility(section.getBoundingClientRect().top <= innerHeight * .5);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    reduced.addEventListener('change', landing.cancel);
    return () => {
      cancelAnimationFrame(frame);
      landing.dispose();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      reduced.removeEventListener('change', landing.cancel);
      delete section.dataset.portfolioEntrance;
    };
  }, [sectionRef]);
  return backgroundRevealRef;
}
