import { useEffect, useRef } from 'react';

const EASING = 0.11;
const SETTLE = 0.0015;

/**
 * Fixed background layers: slow gradient drift, dot grid and a cursor
 * spotlight. Coordinates are written straight to CSS custom properties inside
 * a requestAnimationFrame loop, so moving the mouse never re-renders React.
 * The loop stops as soon as the light catches up with the pointer.
 */
export default function AmbientBackground() {
  const spotRef = useRef(null);

  useEffect(() => {
    const spot = spotRef.current;
    if (!spot) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const precisePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

    let frame = 0;
    let running = false;
    let enabled = false;
    let targetX = 0.5;
    let targetY = 0.35;
    let currentX = targetX;
    let currentY = targetY;

    const paint = () => {
      spot.style.setProperty('--spot-x', `${(currentX * 100).toFixed(2)}%`);
      spot.style.setProperty('--spot-y', `${(currentY * 100).toFixed(2)}%`);
    };

    const step = () => {
      const deltaX = targetX - currentX;
      const deltaY = targetY - currentY;

      if (Math.abs(deltaX) < SETTLE && Math.abs(deltaY) < SETTLE) {
        currentX = targetX;
        currentY = targetY;
        paint();
        running = false;
        frame = 0;
        return;
      }

      currentX += deltaX * EASING;
      currentY += deltaY * EASING;
      paint();
      frame = requestAnimationFrame(step);
    };

    const start = () => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(step);
    };

    const moveLight = (event) => {
      targetX = Math.min(1, Math.max(0, event.clientX / window.innerWidth));
      targetY = Math.min(1, Math.max(0, event.clientY / window.innerHeight));
      spot.style.setProperty('--spot-opacity', '1');
      start();
    };

    const fadeLight = () => spot.style.setProperty('--spot-opacity', '0');

    const handleMouseOut = (event) => {
      if (!event.relatedTarget) fadeLight();
    };

    const handleVisibility = () => {
      if (document.hidden) fadeLight();
    };

    const enable = () => {
      if (enabled) return;
      enabled = true;
      window.addEventListener('pointermove', moveLight, { passive: true });
      document.addEventListener('mouseout', handleMouseOut);
      document.addEventListener('visibilitychange', handleVisibility);
    };

    const disable = () => {
      if (!enabled) return;
      enabled = false;
      window.removeEventListener('pointermove', moveLight);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      running = false;
      fadeLight();
    };

    const sync = () => {
      if (precisePointer.matches && !reduceMotion.matches) enable();
      else disable();
    };

    paint();
    sync();

    precisePointer.addEventListener?.('change', sync);
    reduceMotion.addEventListener?.('change', sync);

    return () => {
      disable();
      precisePointer.removeEventListener?.('change', sync);
      reduceMotion.removeEventListener?.('change', sync);
    };
  }, []);

  return (
    <div className="ambient" aria-hidden="true">
      <div className="ambient__aura" />
      <div className="ambient__shimmer" />
      <div className="ambient__grid" />
      <div ref={spotRef} className="ambient__spot" />
    </div>
  );
}
