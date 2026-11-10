import { useCallback, useEffect, useRef } from 'react';

// Match foreground elements to the animated canvas at their actual positions.
export default function useBackgroundInk(sectionRef, labelSelector = '.portfolio-icon-label, .portfolio-caption', backgroundSelector = null, overlaySelector = null) {
  const mapRef = useRef(null);
  const apply = useCallback(() => {
    const section = sectionRef.current;
    const map = mapRef.current;
    if (!section || !map) return;
    const background = backgroundSelector ? section.querySelector(backgroundSelector) : section;
    const bounds = background.getBoundingClientRect();
    const opacity = map.opacity * (backgroundSelector ? Number(getComputedStyle(background).opacity) : 1);
    const labels = section.querySelectorAll(labelSelector);
    const headerLabels = document.querySelectorAll('.header .logo, .header .nav > a, .header .menu-toggle');
    const overlay = overlaySelector ? document.querySelectorAll(overlaySelector) : [];
    const characters = [...labels, ...headerLabels, ...overlay].flatMap(label => {
      const glyphs = label.querySelectorAll('[data-ink-character]');
      if (!glyphs.length) return [label];
      label.removeAttribute('data-project-ink');
      label.removeAttribute('data-ink-surface');
      return [...glyphs];
    });
    for (const element of characters) {
      const rect = element.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const isHeader = element.closest('.header');
      if (!isHeader && (centerY < bounds.top || centerY >= bounds.bottom)) {
        element.dataset.projectInk = 'violet';
        continue;
      }
      if (isHeader && (centerY < bounds.top || centerY >= bounds.bottom)) {
        if (element.dataset.inkSurface === section.id) {
          element.removeAttribute('data-project-ink');
          element.removeAttribute('data-ink-surface');
        }
        continue;
      }
      let luminance = 0;
      for (const offset of [0.25, 0.5, 0.75]) {
        const x = Math.max(0, Math.min(map.width - 1, Math.floor((rect.left + rect.width * offset - bounds.left) / bounds.width * map.width)));
        const y = Math.max(0, Math.min(map.height - 1, Math.floor((1 - (centerY - bounds.top) / bounds.height) * map.height)));
        const index = (y * map.width + x) * 4;
        const alpha = map.pixels[index + 3] / 255 * opacity;
        const color = (map.pixels[index] * 0.2126 + map.pixels[index + 1] * 0.7152 + map.pixels[index + 2] * 0.0722) / 255 * opacity;
        luminance += (color + 1 - alpha) / 3;
      }
      const threshold = element.dataset.projectInk === 'white' ? 0.91 : 0.89;
      const ink = luminance < threshold ? 'white' : 'violet';
      if (element.dataset.projectInk !== ink) element.dataset.projectInk = ink;
      if (isHeader) element.dataset.inkSurface = section.id;
    }
  }, [sectionRef, labelSelector, backgroundSelector, overlaySelector]);

  useEffect(() => {
    let frame = 0;
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(() => { frame = 0; apply(); });
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      document.querySelectorAll('.header [data-ink-surface]').forEach(element => {
        if (element.dataset.inkSurface === sectionRef.current?.id) {
          element.removeAttribute('data-project-ink');
          element.removeAttribute('data-ink-surface');
        }
      });
    };
  }, [apply]);

  return useCallback(map => { mapRef.current = map; apply(); }, [apply]);
}
