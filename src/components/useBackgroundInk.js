import { useCallback, useEffect, useRef } from 'react';

// Match foreground elements to the animated canvas at their actual positions.
export default function useBackgroundInk(sectionRef, labelSelector = '.portfolio-icon-label, .portfolio-caption', backgroundSelector = null, overlaySelector = null) {
  const mapRef = useRef(null);
  const frameRef = useRef(0);
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
    const changes = [];
    const characters = [...labels, ...headerLabels, ...overlay].flatMap(label => {
      const rect = label.getBoundingClientRect();
      if (rect.bottom < -32 || rect.top > innerHeight + 32) return [];
      const glyphs = label.querySelectorAll('[data-ink-character]');
      if (!glyphs.length) return [label];
      if (label.dataset.projectInk) changes.push({ element: label, ink: null });
      return [...glyphs];
    });
    for (const element of characters) {
      const rect = element.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const isHeader = element.closest('.header');
      if (!isHeader && (centerY < bounds.top || centerY >= bounds.bottom)) {
        if (element.dataset.projectInk !== 'violet') changes.push({ element, ink: 'violet' });
        continue;
      }
      if (isHeader && (centerY < bounds.top || centerY >= bounds.bottom)) {
        if (element.dataset.inkSurface === section.id) {
          changes.push({ element, ink: null });
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
      const surface = isHeader ? section.id : undefined;
      if (element.dataset.projectInk !== ink || (surface && element.dataset.inkSurface !== surface)) {
        changes.push({ element, ink, surface });
      }
    }
    for (const { element, ink, surface } of changes) {
      if (ink === null) {
        element.removeAttribute('data-project-ink');
        element.removeAttribute('data-ink-surface');
      } else {
        if (element.dataset.projectInk !== ink) element.dataset.projectInk = ink;
        if (surface && element.dataset.inkSurface !== surface) element.dataset.inkSurface = surface;
      }
    }
  }, [sectionRef, labelSelector, backgroundSelector, overlaySelector]);

  const schedule = useCallback(() => {
    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      apply();
    });
  }, [apply]);

  useEffect(() => {
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      document.querySelectorAll('.header [data-ink-surface]').forEach(element => {
        if (element.dataset.inkSurface === sectionRef.current?.id) {
          element.removeAttribute('data-project-ink');
          element.removeAttribute('data-ink-surface');
        }
      });
    };
  }, [schedule, sectionRef]);

  return useCallback(map => { mapRef.current = map; schedule(); }, [schedule]);
}
