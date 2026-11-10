import React, { useEffect, useRef } from 'react';

export default function ElasticDivider() {
  const lineRef = useRef(null);
  const pathRef = useRef(null);

  useEffect(() => {
    const line = lineRef.current;
    const path = pathRef.current;
    const svg = path.ownerSVGElement;
    const pointerMedia = matchMedia('(hover: hover) and (pointer: fine)');
    const motionMedia = matchMedia('(prefers-reduced-motion: reduce)');
    let bounds;
    let width = 1;
    let frame = 0;
    let previousTime = 0;
    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let vx = 0;
    let vy = 0;
    const enabled = () => pointerMedia.matches && !motionMedia.matches && !document.hidden;

    function draw() {
      const spread = Math.min(110, width * 0.18);
      const bell = position => Math.exp(-((position - x) ** 2) / (2 * spread ** 2));
      const left = bell(0);
      const right = bell(width);
      const points = [];
      for (let index = 0; index <= 180; index++) {
        const t = index / 180;
        // Subtract the end values so both anchors stay perfectly fixed.
        const displacement = y * (bell(width * t) - left * (1 - t) - right * t);
        points.push(`${index ? 'L' : 'M'}${(width * t).toFixed(2)},${(120 + displacement).toFixed(3)}`);
      }
      path.setAttribute('d', points.join(' '));
    }

    function tick(time) {
      const dt = Math.min((time - previousTime) / 1000 || 1 / 60, 1 / 30);
      previousTime = time;
      // A light spring tracks the pointer; damping leaves a small, soft rebound.
      vx += ((targetX - x) * 130 - vx * 22) * dt;
      vy += ((targetY - y) * 180 - vy * 18) * dt;
      x += vx * dt;
      y += vy * dt;
      draw();
      if (Math.abs(targetX - x) + Math.abs(targetY - y) + Math.abs(vx) + Math.abs(vy) > 0.025) {
        frame = requestAnimationFrame(tick);
      } else {
        x = targetX;
        y = targetY;
        vx = vy = 0;
        draw();
        frame = 0;
        previousTime = 0;
      }
    }
    function wake() { if (!frame) frame = requestAnimationFrame(tick); }
    function release() {
      targetY = 0;
      if (enabled() && (Math.abs(y) > 0.001 || Math.abs(vy) > 0.001)) wake();
    }
    function measure() {
      // Use the usable page width rather than 100vw, which includes the scrollbar.
      line.style.width = `${document.documentElement.clientWidth}px`;
      line.style.left = `${-line.parentElement.getBoundingClientRect().left}px`;
      bounds = line.getBoundingClientRect();
      width = Math.max(bounds.width, 1);
      svg.setAttribute('viewBox', `0 0 ${width} 240`);
      x = targetX = Math.min(Math.max(x, 0), width);
      targetY = y = vx = vy = 0;
      draw();
    }
    function move(event) {
      if (!enabled() || event.pointerType === 'touch') return;
      const localX = event.clientX - bounds.left;
      const distance = event.clientY - (bounds.top + 0.5);
      if (localX < 0 || localX > width || Math.abs(distance) > 180) { release(); return; }
      if (Math.abs(y) < 0.01 && !frame) x = localX;
      targetX = localX;
      const influence = Math.max(0, 1 - Math.abs(distance) / 180);
      targetY = Math.max(-144, Math.min(144, distance * 3.36)) * influence * influence;
      wake();
    }
    function reset() {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
      targetY = y = vx = vy = 0;
      draw();
    }
    const resize = new ResizeObserver(measure);
    resize.observe(line);
    measure();
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    window.addEventListener('blur', reset);
    document.addEventListener('pointerleave', release);
    document.addEventListener('visibilitychange', reset);
    pointerMedia.addEventListener('change', reset);
    motionMedia.addEventListener('change', reset);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener('pointermove', move);
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
      window.removeEventListener('blur', reset);
      document.removeEventListener('pointerleave', release);
      document.removeEventListener('visibilitychange', reset);
      pointerMedia.removeEventListener('change', reset);
      motionMedia.removeEventListener('change', reset);
    };
  }, []);

  return <div ref={lineRef} className="about-editorial-rule" aria-hidden="true">
    <svg viewBox="0 0 1000 240" preserveAspectRatio="none">
      <path ref={pathRef} d="M0 120H1000" fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
    </svg>
  </div>;
}
