import { useEffect, useRef, useState } from 'react';

// Photos take 2s; the remaining editorial entrance takes 1s.
export default function useAboutEntrance(sectionRef) {
  const [visit, setVisit] = useState({ run: 0, playing: false, complete: false });
  const [loadPhotos, setLoadPhotos] = useState(false);
  const decodePhotosRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const photo = section.querySelector('.about-image-slot');
    const line = section.querySelector('.about-editorial-rule');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let ready = false;
    let visible = false;
    let started = false;
    let disposed = false;
    let animations = [];
    let snapFrame = 0;
    let snapping = false;
    let snapArmed = true;
    let photosRequested = false;
    let previousScroll = window.scrollY;

    function requestPhotos(top) {
      if (photosRequested || top > innerHeight * 0.65 || photo.getBoundingClientRect().bottom < -250) return;
      photosRequested = true;
      setLoadPhotos(true);
    }

    function updatePreview() {
      const remaining = section.getBoundingClientRect().top / document.getElementById('home').offsetHeight;
      const shown = !started && !snapping && remaining <= 0.4 && remaining > 0.1;
      section.dataset.preview = shown ? 'visible' : 'hidden';
      section.style.setProperty('--about-preview-opacity', String(Math.min(1, Math.max(0, (remaining - 0.1) / 0.04))));
    }

    function animate(selector, keyframes, delay, duration) {
      for (const element of section.querySelectorAll(selector)) {
        animations.push(element.animate(keyframes, {
          delay: reduced.matches ? 0 : delay,
          duration: reduced.matches ? 0 : duration,
          easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'both',
        }));
      }
    }
    function start() {
      if (!ready || !visible || started || disposed) return;
      // Keep the editorial white until the hero has entirely left the viewport.
      if (snapping) return;
      const sectionTop = section.getBoundingClientRect().top;
      if (sectionTop > 1) {
        if (snapArmed && location.hash === '#about' && sectionTop <= 112) snapToAbout();
        return;
      }
      if (reduced.matches) { showComplete(); return; }
      started = true;
      updatePreview();
      section.dataset.entrance = 'playing';
      setVisit(previous => ({ run: previous.run + 1, playing: true, complete: false }));
      const baseline = line.getBoundingClientRect().top;
      const zhao = section.querySelector('.about-character-zhao');
      const yu = section.querySelector('.about-character-yu');
      const biography = section.querySelector('.about-biography');
      const mobile = matchMedia('(max-width: 700px)').matches;
      const zhaoOffset = mobile ? 90 : baseline - zhao.getBoundingClientRect().top;
      const yuOffset = mobile ? -90 : baseline - yu.getBoundingClientRect().bottom;
      const biographyOffset = mobile ? -60 : baseline - biography.getBoundingClientRect().bottom;
      animate('.about-editorial-rule svg', [
        { opacity: 0, clipPath: 'inset(0 50% 0 50%)' },
        { opacity: 1, clipPath: 'inset(0 0% 0 0%)' },
      ], 2000, 300);
      for (const [selector, offset] of [['.about-character-zhao', zhaoOffset], ['.about-character-yu', yuOffset]]) {
        animate(selector, [
          { opacity: 0, translate: `0 ${offset}px` },
          { opacity: 1, translate: '0 0' },
        ], 2150, 650);
      }
      animate('.about-character-f, .about-character-e, .about-character-i', [{ opacity: 0 }, { opacity: 1 }], 2300, 700);
      animate('.about-biography', [
        { opacity: 0, translate: `0 ${biographyOffset}px` },
        { opacity: 1, translate: '0 0' },
      ], 2300, 700);
      animate('.about-identity, .about-caption', [
        { opacity: 0, translate: '0 20px' }, { opacity: 1, translate: '0 0' },
      ], 2300, 700);
    }
    function reset() {
      animations.forEach(animation => animation.cancel());
      animations = [];
      started = false;
      section.dataset.entrance = 'waiting';
      updatePreview();
      setVisit(previous => ({ ...previous, playing: false, complete: false }));
    }
    function showComplete() {
      animations.forEach(animation => animation.cancel());
      animations = [];
      started = true;
      section.dataset.entrance = 'complete';
      updatePreview();
      setVisit(previous => ({ ...previous, playing: false, complete: true }));
    }
    function cancelSnap() {
      cancelAnimationFrame(snapFrame);
      snapFrame = 0;
      snapping = false;
      delete section.dataset.transition;
    }
    function snapToAbout() {
      snapping = true;
      snapArmed = false;
      section.dataset.transition = 'snapping';
      updatePreview();
      const from = window.scrollY;
      const target = from + section.getBoundingClientRect().top;
      const began = performance.now();
      function step(now) {
        const progress = reduced.matches ? 1 : Math.min(1, (now - began) / 500);
        const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
        window.scrollTo({ top: from + (target - from) * eased, behavior: 'instant' });
        if (progress < 1) snapFrame = requestAnimationFrame(step);
        else {
          cancelSnap();
          previousScroll = window.scrollY;
          // Start only after the final, all-white frame has been painted.
          snapFrame = requestAnimationFrame(() => { snapFrame = 0; start(); });
        }
      }
      snapFrame = requestAnimationFrame(step);
    }
    function onScroll() {
      updatePreview();
      const scrollingDown = window.scrollY > previousScroll;
      previousScroll = window.scrollY;
      if (snapping) return;
      const top = section.getBoundingClientRect().top;
      requestPhotos(top);
      const hero = document.getElementById('home');
      const threshold = hero.offsetHeight * 0.1;
      if (top > threshold + 48) snapArmed = true;
      // Account for the site's anchor padding when navigating directly to About.
      const anchorArrival = location.hash === '#about' && top <= 112;
      if (scrollingDown && snapArmed && top > 1 && (top <= threshold || anchorArrival)) snapToAbout();
      else if (top <= 1) start();
    }
    function onWheel(event) {
      if (!snapping || event.ctrlKey) return;
      if (event.deltaY < 0) cancelSnap();
      else event.preventDefault(); // Absorb only the short snap's downward momentum.
    }
    function onKey(event) {
      if (['Escape', 'ArrowUp', 'PageUp', 'Home'].includes(event.key)) cancelSnap();
    }
    decodePhotosRef.current = () => {
      Promise.all(Array.from(photo.querySelectorAll('img'), img => img.decode().catch(() => {})))
        .then(() => { ready = true; start(); });
    };
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          visible = false;
          // The photo above the viewport means the viewer is in a later module.
          // Returning upward should reveal the finished layout immediately.
          if (entry.boundingClientRect.bottom <= 0) showComplete();
          else reset();
        }
        else if (entry.intersectionRatio >= 0.4) { visible = true; start(); }
      }
    }, { threshold: [0, 0.4] });
    observer.observe(photo);
    updatePreview();
    requestPhotos(section.getBoundingClientRect().top);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    // React creates the anchor after the browser's initial hash lookup.
    if (location.hash === '#about' && section.getBoundingClientRect().top > 1) snapToAbout();
    function updateMotion() {
      if (reduced.matches || section.dataset.entrance === 'complete') showComplete();
      else { reset(); start(); }
    }
    reduced.addEventListener('change', updateMotion);
    return () => {
      disposed = true;
      decodePhotosRef.current = null;
      cancelSnap();
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      reduced.removeEventListener('change', updateMotion);
      animations.forEach(animation => animation.cancel());
    };
  }, [sectionRef]);
  useEffect(() => {
    if (loadPhotos) decodePhotosRef.current?.();
  }, [loadPhotos]);
  return { ...visit, loadPhotos };
}
