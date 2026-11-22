const SCROLL_KEYS = new Set(['Escape', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ']);

export default function createScrollLanding(duration, { onStart, onFinish, onInterrupt }) {
  let timer = 0;
  let frame = 0;

  function cancel() {
    clearTimeout(timer);
    timer = 0;
    if (!frame) return;
    cancelAnimationFrame(frame);
    frame = 0;
    onInterrupt?.();
  }

  function schedule(getTarget) {
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      timer = 0;
      const target = getTarget();
      const from = window.scrollY;
      if (target === null || Math.abs(target - from) <= 1) return;
      const started = performance.now();
      onStart?.();

      function step(now) {
        const progress = Math.min(1, (now - started) / duration);
        const eased = 1 - (1 - progress) ** 3;
        window.scrollTo({ top: from + (target - from) * eased, behavior: 'instant' });
        if (progress < 1) frame = requestAnimationFrame(step);
        else {
          frame = 0;
          onFinish?.();
        }
      }

      frame = requestAnimationFrame(step);
    }, 110);
  }

  function onKey(event) {
    if (SCROLL_KEYS.has(event.key)) cancel();
  }

  window.addEventListener('wheel', cancel, { passive: true });
  window.addEventListener('pointerdown', cancel, { passive: true });
  window.addEventListener('touchmove', cancel, { passive: true });
  window.addEventListener('keydown', onKey);

  return {
    schedule,
    cancel,
    get moving() { return frame !== 0; },
    dispose() {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      window.removeEventListener('wheel', cancel);
      window.removeEventListener('pointerdown', cancel);
      window.removeEventListener('touchmove', cancel);
      window.removeEventListener('keydown', onKey);
    },
  };
}
