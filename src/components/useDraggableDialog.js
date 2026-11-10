import { useEffect } from 'react';

// Update only the dialog's translation while dragging; its contents do not rerender.
export default function useDraggableDialog(dialogRef, selection) {
  useEffect(() => {
    if (!selection?.isPortfolioSlot) return;
    const dialog = dialogRef.current;
    const handle = dialog.querySelector('.portfolio-window-bar');
    if (!handle) return;

    let x = 0;
    let y = 0;
    let drag = null;
    const gutter = 12;
    const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

    function moveTo(nextX, nextY) {
      const rect = dialog.getBoundingClientRect();
      const baseLeft = rect.left - x;
      const baseTop = rect.top - y;
      x = clamp(nextX, gutter - baseLeft, Math.max(gutter, window.innerWidth - gutter - rect.width) - baseLeft);
      y = clamp(nextY, gutter - baseTop, Math.max(gutter, window.innerHeight - gutter - rect.height) - baseTop);
      dialog.style.setProperty('--window-drag-x', `${x}px`);
      dialog.style.setProperty('--window-drag-y', `${y}px`);
    }

    function start(event) {
      if (!event.isPrimary || event.button !== 0 || event.target.closest('button, a, input, select, textarea')) return;
      event.preventDefault();
      drag = { pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY, x, y };
      handle.setPointerCapture(event.pointerId);
      handle.dataset.dragging = 'true';
    }

    function move(event) {
      if (!drag || event.pointerId !== drag.pointerId) return;
      moveTo(drag.x + event.clientX - drag.clientX, drag.y + event.clientY - drag.clientY);
    }

    function end(event) {
      if (!drag || event.pointerId !== drag.pointerId) return;
      const pointerId = drag.pointerId;
      drag = null;
      delete handle.dataset.dragging;
      if (handle.hasPointerCapture(pointerId)) handle.releasePointerCapture(pointerId);
    }

    function keepInView() {
      moveTo(x, y);
    }

    handle.addEventListener('pointerdown', start);
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
    handle.addEventListener('lostpointercapture', end);
    window.addEventListener('resize', keepInView);
    const observer = new ResizeObserver(keepInView);
    observer.observe(dialog);

    return () => {
      if (drag && handle.hasPointerCapture(drag.pointerId)) handle.releasePointerCapture(drag.pointerId);
      handle.removeEventListener('pointerdown', start);
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', end);
      handle.removeEventListener('pointercancel', end);
      handle.removeEventListener('lostpointercapture', end);
      window.removeEventListener('resize', keepInView);
      observer.disconnect();
      delete handle.dataset.dragging;
      dialog.style.removeProperty('--window-drag-x');
      dialog.style.removeProperty('--window-drag-y');
    };
  }, [dialogRef, selection]);
}
