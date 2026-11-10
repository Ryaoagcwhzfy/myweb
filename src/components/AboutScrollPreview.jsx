import React from 'react';
import ScrollFloat from './ScrollFloat';

// Absolute page positions keep this short interlude in sync with the hero.
const scrollStart = () => document.getElementById('home').offsetHeight * 0.6;
const scrollEnd = () => document.getElementById('home').offsetHeight * 0.86;
const motion = {
  effect: 'wave', splitBy: 'chars', direction: 'up', order: 'start',
  animationDuration: 1.6, ease: 'none', stagger: 0.11,
  // Keep the slower arrival, with only a small lift and a soft settling motion.
  distance: 35, stretch: 1.06, smoothing: 0.8, scrollStart, scrollEnd,
};

export default function AboutScrollPreview() {
  return (
    <div className="about-scroll-preview wrap" aria-hidden="true">
      <ScrollFloat {...motion} containerClassName="about-scroll-preview-cn">不止于行，创作不息</ScrollFloat>
      <ScrollFloat {...motion} containerClassName="about-scroll-preview-en">ABOUT ME</ScrollFloat>
    </div>
  );
}
