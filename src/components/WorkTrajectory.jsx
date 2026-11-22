import React, { useEffect, useRef } from 'react';
import './WorkTrajectory.css';

const images = [
  '01-forest',
  '02-sketch-class',
  '03-color-palette',
  '04-art-desk',
  '05-agreement',
  '06-typography',
  '07-film',
  '08-book-design',
  '09-framed-painting',
];

export function TrajectoryPhrase({ children }) {
  return (
    <span className="work-trajectory-phrase">
      {children}
      <svg className="work-trajectory-arrow" viewBox="0 0 100 28" preserveAspectRatio="none"
        fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"
        data-ink-character="" aria-hidden="true" focusable="false">
        <path className="work-trajectory-arrow-curve" pathLength="1" d="M 4 18 C 29 -1, 63 -1, 95 20" />
        <path className="work-trajectory-arrow-tip" pathLength="1" d="M 82 22 L 95 20 L 90 8" />
      </svg>
    </span>
  );
}

export default function WorkTrajectory({ children, entering, backgroundRef }) {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const scene = section.querySelector('.work-trajectory-scene');
    const heading = section.querySelector('h2');
    const background = backgroundRef.current;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let previousProgress;
    let previousScrollOffset;
    let previousOpacity;

    function update() {
      frame = 0;
      const { top, height } = scene.getBoundingClientRect();
      const distance = Math.min(window.innerHeight, height);
      // The sticky scene holds briefly on the fully purple backdrop before releasing.
      const progress = motion.matches ? 0 : Math.max(0, Math.min(1, -top / distance));
      const scrollOffset = progress * distance;
      const { top: headingTop, bottom: headingBottom } = heading.getBoundingClientRect();
      const opacity = motion.matches ? 1 : Math.max(0, Math.min(1, (headingTop - 76) / 70));
      const arrowsVisible = section.hasAttribute('data-trajectory-arrows');
      if (headingBottom <= 0 || headingTop >= innerHeight) {
        if (arrowsVisible) section.removeAttribute('data-trajectory-arrows');
      } else if (!entering) {
        const { top: backgroundTop, bottom: backgroundBottom } = background.getBoundingClientRect();
        if (arrowsVisible && backgroundTop > 32) section.removeAttribute('data-trajectory-arrows');
        if (!arrowsVisible && backgroundTop <= 0 && backgroundBottom >= innerHeight &&
          headingTop >= 0 && headingBottom <= innerHeight && opacity >= .98) {
          section.setAttribute('data-trajectory-arrows', '');
        }
      }
      if (progress === previousProgress && scrollOffset === previousScrollOffset && opacity === previousOpacity) return;
      const exitProgress = Math.min(progress / .85, 1);
      section.style.setProperty('--trajectory-progress', progress ** 1.35);
      section.style.setProperty('--trajectory-upper-progress', exitProgress ** 1.18);
      section.style.setProperty('--trajectory-lower-progress', exitProgress);
      // The closest cards clear the quote before moving into its foreground layer.
      section.style.setProperty('--trajectory-image-layer', progress >= .06 ? '2' : '0');
      section.style.setProperty('--trajectory-scroll-offset', `${scrollOffset}px`);
      section.style.setProperty('--trajectory-heading-opacity', opacity);
      previousProgress = progress;
      previousScrollOffset = scrollOffset;
      previousOpacity = opacity;
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    motion.addEventListener('change', schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      motion.removeEventListener('change', schedule);
    };
  }, [backgroundRef, entering]);

  return (
    <section ref={sectionRef} className="work-trajectory" id="work-trajectory" aria-labelledby="work-trajectory-title">
      <div className="work-trajectory-scene">
        <h2 id="work-trajectory-title">{children}</h2>
        <div className="work-trajectory-images" aria-hidden="true">
          <div className="work-trajectory-image-plane">
            {images.map(image => (
              <div className="work-trajectory-image" key={image}>
                <img src={`/assets/work-trajectory/${image}.webp`} alt="" loading="lazy" decoding="async" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
