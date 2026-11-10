import { useEffect, useRef } from 'react';

export default function usePortfolioEntrance(sectionRef) {
  const backgroundRevealRef = useRef({ visible: false, startedAt: null });
  useEffect(() => {
    const section = sectionRef.current;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let previousY = window.scrollY;
    let previousTop = section.getBoundingClientRect().top;
    let armed = previousTop > innerHeight * .5;
    let frame = 0;
    let snapping = false;
    let touchY = null;
    section.dataset.portfolioEntrance = armed ? 'waiting' : 'complete';
    backgroundRevealRef.current = { visible: !armed, startedAt: null };

    function revealBackground(animate = true) {
      section.dataset.portfolioEntrance = 'complete';
      backgroundRevealRef.current = { visible: true, startedAt: animate && !reduced.matches ? performance.now() : null };
    }

    function cancel() {
      cancelAnimationFrame(frame);
      frame = 0;
      snapping = false;
      if (section.dataset.portfolioEntrance === 'snapping') revealBackground();
    }
    function snap() {
      armed = false;
      snapping = true;
      section.dataset.portfolioEntrance = 'snapping';
      const from = window.scrollY;
      const destination = from + section.getBoundingClientRect().top;
      const began = performance.now();
      function step(now) {
        const progress = reduced.matches ? 1 : Math.min(1, (now - began) / 1500);
        const eased = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
        window.scrollTo({ top: from + (destination - from) * eased, behavior: 'instant' });
        if (progress < 1) frame = requestAnimationFrame(step);
        else {
          snapping = false;
          frame = 0;
          revealBackground();
          previousY = window.scrollY;
          previousTop = section.getBoundingClientRect().top;
        }
      }
      frame = requestAnimationFrame(step);
    }
    function onScroll() {
      const top = section.getBoundingClientRect().top;
      const down = window.scrollY > previousY;
      const crossed = previousTop > innerHeight * .5 && top <= innerHeight * .5;
      previousTop = top;
      previousY = window.scrollY;
      if (snapping) return;
      if (top > innerHeight * .65) {
        armed = true;
        section.dataset.portfolioEntrance = 'waiting';
        backgroundRevealRef.current = { visible: false, startedAt: null };
      }
      if (armed && down && crossed && top > -innerHeight * .25 && !document.querySelector('dialog[open]')) snap();
      else if (top <= 0 && armed) {
        armed = false;
        revealBackground();
      }
    }
    function onWheel(event) {
      if (!snapping || event.ctrlKey) return;
      if (event.deltaY < 0) cancel();
      else event.preventDefault();
    }
    function onKey(event) {
      if (!snapping) return;
      if (['Escape', 'ArrowUp', 'PageUp', 'Home', 'End'].includes(event.key)) cancel();
      else if (['ArrowDown', 'PageDown', ' '].includes(event.key)) event.preventDefault();
    }
    function onTouchStart(event) { touchY = event.touches[0]?.clientY ?? null; }
    function onTouchMove(event) {
      if (!snapping || touchY === null) return;
      if (event.touches[0].clientY > touchY) cancel();
      else event.preventDefault();
    }
    function onResize() { cancel(); onScroll(); }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('resize', onResize);
    reduced.addEventListener('change', cancel);
    return () => {
      cancel();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('resize', onResize);
      reduced.removeEventListener('change', cancel);
      delete section.dataset.portfolioEntrance;
    };
  }, [sectionRef]);
  return backgroundRevealRef;
}
