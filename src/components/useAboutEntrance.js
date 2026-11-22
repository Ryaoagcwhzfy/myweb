import { useEffect, useRef, useState } from 'react';
import createScrollLanding from './createScrollLanding';

// The editorial entrance follows the photo placement.
export default function useAboutEntrance(sectionRef) {
  const [visit, setVisit] = useState({ run: 0, playing: false, complete: false });
  const [loadPhotos, setLoadPhotos] = useState(false);
  const decodePhotosRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const hero = document.getElementById('home');
    const photo = section.querySelector('.about-image-slot');
    const line = section.querySelector('.about-editorial-rule');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let ready = false;
    let visible = false;
    let started = false;
    let disposed = false;
    let animations = [];
    let scrollFrame = 0;
    let photosRequested = false;
    let previousScroll = window.scrollY;
    const landing = createScrollLanding(500, {
      onStart() { section.dataset.transition = 'snapping'; },
      onFinish() {
        delete section.dataset.transition;
        start();
      },
      onInterrupt() {
        delete section.dataset.transition;
        start(undefined, landingThreshold());
      },
    });

    function landingThreshold() {
      return location.hash === '#about' ? 112 : hero.offsetHeight * 0.1;
    }

    function requestPhotos(top) {
      if (photosRequested || top > innerHeight * 0.65 || photo.getBoundingClientRect().bottom < -250) return;
      photosRequested = true;
      setLoadPhotos(true);
    }

    function updatePreview(top = section.getBoundingClientRect().top) {
      const remaining = top / hero.offsetHeight;
      const state = !started && remaining <= 0.4 && remaining > 0.1 ? 'visible' : 'hidden';
      if (section.dataset.preview !== state) section.dataset.preview = state;
      if (state === 'visible') {
        section.style.setProperty('--about-preview-opacity', String(Math.min(1, (remaining - 0.1) / 0.04)));
      }
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
    function start(sectionTop = section.getBoundingClientRect().top, threshold = reduced.matches ? landingThreshold() : 1) {
      if (!ready || !visible || started || disposed || landing.moving || sectionTop > threshold) return;
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
      const textDuration = 950;
      animate('.about-editorial-rule svg', [
        { opacity: 0, clipPath: 'inset(0 50% 0 50%)' },
        { opacity: 1, clipPath: 'inset(0 0% 0 0%)' },
      ], 2000, 300);
      for (const [selector, offset] of [['.about-character-zhao', zhaoOffset], ['.about-character-yu', yuOffset]]) {
        animate(selector, [
          { opacity: 0, translate: `0 ${offset}px` },
          { opacity: 1, translate: '0 0' },
        ], 2150, textDuration);
      }
      animate('.about-character-f, .about-character-e, .about-character-i', [{ opacity: 0 }, { opacity: 1 }], 2300, textDuration);
      animate('.about-biography', [
        { opacity: 0, translate: `0 ${biographyOffset}px` },
        { opacity: 1, translate: '0 0' },
      ], 2300, textDuration);
      animate('.about-identity, .about-caption', [
        { opacity: 0, translate: '0 20px' }, { opacity: 1, translate: '0 0' },
      ], 2300, textDuration);
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
    function update(allowAnchor = false) {
      scrollFrame = 0;
      const top = section.getBoundingClientRect().top;
      const scrollingDown = window.scrollY > previousScroll;
      previousScroll = window.scrollY;
      updatePreview(top);
      requestPhotos(top);
      if (landing.moving || started) return;
      start(top);
      const threshold = landingThreshold();
      if (!reduced.matches && !started && top > 1 && top <= threshold &&
        (scrollingDown || (allowAnchor && location.hash === '#about'))) {
        landing.schedule(() => {
          const remaining = section.getBoundingClientRect().top;
          return remaining > 1 && remaining <= landingThreshold() ? window.scrollY + remaining : null;
        });
      }
    }
    function schedule() {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(() => update());
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
    update(true);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    function updateMotion() {
      landing.cancel();
      if (reduced.matches || section.dataset.entrance === 'complete') showComplete();
      else { reset(); start(); }
    }
    reduced.addEventListener('change', updateMotion);
    return () => {
      disposed = true;
      decodePhotosRef.current = null;
      cancelAnimationFrame(scrollFrame);
      landing.dispose();
      delete section.dataset.transition;
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      reduced.removeEventListener('change', updateMotion);
      animations.forEach(animation => animation.cancel());
    };
  }, [sectionRef]);
  useEffect(() => {
    if (loadPhotos) decodePhotosRef.current?.();
  }, [loadPhotos]);
  return { ...visit, loadPhotos };
}
