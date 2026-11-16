import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Observes every `.reveal` element on the page, including cards that arrive
 * after an API response. Each element animates in once and is then
 * unobserved, so scrolling back up never replays the animation.
 */
export default function ScrollReveal() {
  const { pathname } = useLocation();

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (reduceMotion.matches || typeof IntersectionObserver === 'undefined') {
      document.querySelectorAll('.reveal').forEach((element) => {
        element.classList.add('is-visible');
      });
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0, rootMargin: '0px 0px -6% 0px' }
    );

    const observeNew = () => {
      document.querySelectorAll('.reveal:not(.is-visible)').forEach((element) => {
        observer.observe(element);
      });
    };

    observeNew();

    // Run synchronously: requestAnimationFrame is paused in background tabs,
    // which would leave API-rendered cards hidden until the tab is drawn again.
    const mutation = new MutationObserver(observeNew);
    mutation.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutation.disconnect();
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
