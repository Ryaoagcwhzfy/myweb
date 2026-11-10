import { useEffect } from 'react';

// Hold the footer in place while the preceding section uncovers it from the bottom.
export default function useContactReveal(revealRef) {
  useEffect(() => {
    const reveal = revealRef.current;
    const footer = reveal.querySelector('.contact');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const nativeTimeline = CSS.supports('animation-timeline: view()') && CSS.supports('animation-range: entry 0% entry 100%');
    let frame = 0;
    function update() {
      frame = 0;
      const viewport = document.documentElement.clientHeight;
      const height = footer.getBoundingClientRect().height;
      reveal.style.setProperty('--contact-reveal-distance', `${Math.min(viewport, height)}px`);
      // Native scroll timelines stay in sync with compositor scrolling. The
      // script fallback is only needed on browsers without timeline support.
      if (nativeTimeline) return;
      const bounds = reveal.getBoundingClientRect();
      // Short footers must also settle completely at the bottom of the page.
      const endTop = Math.max(0, viewport - height);
      const covered = Math.max(0, Math.min(viewport - endTop, bounds.top - endTop));
      reveal.style.setProperty('--contact-reveal-y', `${reduced.matches ? 0 : -covered}px`);
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    const observer = new ResizeObserver(schedule);
    observer.observe(footer);
    if (!nativeTimeline) window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    reduced.addEventListener('change', schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      reduced.removeEventListener('change', schedule);
      reveal.style.removeProperty('--contact-reveal-y');
      reveal.style.removeProperty('--contact-reveal-distance');
    };
  }, [revealRef]);
}
